import json
import math
import requests
import sys

BASE_URL = "http://localhost:8080"
AI_URL = "http://localhost:8000"

def log_section(title):
    print(f"\n{'='*70}\n[TEST SECTION] {title}\n{'='*70}")

def test_1_ai_prediction_json_schema():
    log_section("1. AI Prediction Response JSON Schema Verification")
    s = requests.Session()
    login_res = s.post(f"{BASE_URL}/api/auth/login", json={"username": "test.student01", "password": "Test@123"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    student_id = login_res.json()["id"]

    pred_res = s.get(f"{BASE_URL}/api/ai/students/{student_id}/prediction")
    assert pred_res.status_code == 200, f"Prediction endpoint failed: {pred_res.text}"
    data = pred_res.json()

    print(f"Backend Prediction JSON for Student {student_id}:\n{json.dumps(data, indent=2)}")

    # Verify critical fields are present, valid numbers, not null, not defaulted to 0
    score = data.get("predicted_score") or data.get("predictedScore")
    assert score is not None and isinstance(score, (int, float)) and 0 < score <= 100, f"Invalid predicted score: {score}"

    risk = data.get("risk_level") or data.get("riskLevel")
    assert risk in ["LOW", "MODERATE", "HIGH", "CRITICAL"], f"Invalid risk level: {risk}"

    conf = data.get("confidence_score") or data.get("confidenceScore")
    assert conf is not None and isinstance(conf, (int, float)) and 0.5 <= conf <= 1.0, f"Invalid confidence: {conf}"

    cat = data.get("performance_category") or data.get("performanceCategory")
    assert cat is not None and isinstance(cat, str) and len(cat) > 0, f"Invalid category: {cat}"

    factors = data.get("key_contributing_factors") or data.get("keyContributingFactors")
    assert isinstance(factors, list) and len(factors) > 0, f"Missing contributing factors: {factors}"

    xai = data.get("feature_contributions") or data.get("featureContributions")
    assert isinstance(xai, list) and len(xai) > 0, f"Missing XAI feature contributions: {xai}"
    for feat in xai:
        c = feat.get("contribution")
        assert c is not None and isinstance(c, (int, float)), f"Invalid feature contribution in: {feat}"
        assert feat.get("feature") is not None, f"Missing feature name: {feat}"

    actions = data.get("recommended_actions") or data.get("recommendedActions")
    assert isinstance(actions, list) and len(actions) > 0, f"Missing recommended actions: {actions}"

    version = data.get("model_version") or data.get("modelVersion")
    assert version is not None and "v1." in version, f"Invalid model version: {version}"

    print(f"PASS: Predicted Score = {score:.1f}%, Risk = {risk}, Confidence = {conf*100:.1f}%, XAI Factors Count = {len(xai)}")

def test_2_what_if_simulator_and_formulas():
    log_section("2. What-If Simulator & Formula Verification (Feasible & Infeasible)")
    s = requests.Session()
    s.post(f"{BASE_URL}/api/auth/login", json={"username": "test.student01", "password": "Test@123"})
    student_id = 90

    # 2A: Deterministic Simulator with normal feasible parameters
    # Baseline 90.7%, target 92%, remaining weight 20%, hypothetical score 95%
    # Projected = 90.7 * 0.8 + 95 * 0.2 = 72.56 + 19 = 91.56 -> 91.6%
    # Required = (92 - 90.7 * 0.8) / 0.2 = (92 - 72.56) / 0.2 = 19.44 / 0.2 = 97.2% <= 100 -> FEASIBLE
    res_feasible = s.post(f"{BASE_URL}/api/academic/simulator", json={
        "targetFinalAverage": 92.0,
        "remainingWeight": 20.0,
        "hypotheticalNextScore": 95.0,
        "additionalAttendanceSessions": 5,
        "additionalAttended": 5
    })
    assert res_feasible.status_code == 200
    df = res_feasible.json()
    print(f"Feasible Case Result: target={df['targetAverage']}%, required={df['requiredScoreOnRemaining']}%, feasible={df['targetFeasibility']}")
    assert df["targetAchievable"] == True
    assert df["targetFeasibility"] == "FEASIBLE"
    assert df["requiredScoreOnRemaining"] == 97.2

    # 2B: Impossible Target Score (> 100% Required)
    # Baseline 90.7%, target 98.0%, remaining weight 20%
    # Required = (98 - 90.7 * 0.8) / 0.2 = (98 - 72.56) / 0.2 = 25.44 / 0.2 = 127.2% > 100 -> MATHEMATICALLY_INFEASIBLE
    res_infeasible = s.post(f"{BASE_URL}/api/academic/simulator", json={
        "targetFinalAverage": 98.0,
        "remainingWeight": 20.0,
        "hypotheticalNextScore": 85.0
    })
    assert res_infeasible.status_code == 200
    di = res_infeasible.json()
    print(f"Infeasible Case Result: target={di['targetAverage']}%, required={di['requiredScoreOnRemaining']}%, feasible={di['targetFeasibility']}")
    assert di["targetAchievable"] == False
    assert di["targetFeasibility"] == "MATHEMATICALLY_INFEASIBLE"
    assert di["requiredScoreOnRemaining"] > 100.0
    assert "exceeds 100% maximum score" in di["feasibilityNote"]

    # 2C: Deep Learning Neural Network Simulation
    dl_sim_res = s.post(f"{BASE_URL}/api/ai/students/{student_id}/simulate", json={
        "hypotheticalAttendanceRate": 98.0,
        "hypotheticalInternalScore": 95.0,
        "hypotheticalAssignmentCompletion": 95.0,
        "hypotheticalAssignmentMarks": 92.0,
        "additionalConsultations": 2.0
    })
    assert dl_sim_res.status_code == 200, f"DL simulate failed: {dl_sim_res.text}"
    dl_data = dl_sim_res.json()
    print(f"DL Simulation Result:\n{json.dumps(dl_data, indent=2)}")

    base_dl = dl_data.get("baseline_predicted_score") or dl_data.get("baselinePredictedScore")
    sim_dl = dl_data.get("simulated_predicted_score") or dl_data.get("simulatedPredictedScore")
    diff_dl = dl_data.get("score_differential") or dl_data.get("scoreDifferential")
    risk_trans = dl_data.get("risk_transition") or dl_data.get("riskTransition")

    assert base_dl is not None and isinstance(base_dl, (int, float)) and base_dl > 0
    assert sim_dl is not None and isinstance(sim_dl, (int, float)) and sim_dl > 0
    assert diff_dl is not None and isinstance(diff_dl, (int, float))
    assert risk_trans is not None and "->" in risk_trans
    # Verify differential is accurate
    expected_diff = round(sim_dl - base_dl, 2)
    assert abs(diff_dl - expected_diff) < 0.2, f"Diff mismatch: {diff_dl} vs {expected_diff}"

    print(f"PASS: Baseline = {base_dl:.1f}%, Simulated = {sim_dl:.1f}%, Net Shift = {diff_dl:+.1f}%, Transition = '{risk_trans}'")

def test_3_id_spoofing_prevention():
    log_section("3. Profile Endpoints ID Spoofing & Authorization Isolation Tests")

    # Session for Student 90
    stud_session = requests.Session()
    s_login = stud_session.post(f"{BASE_URL}/api/auth/login", json={"username": "test.student01", "password": "Test@123"})
    assert s_login.status_code == 200
    student_id = s_login.json()["id"]

    # Session for Teacher 51
    teach_session = requests.Session()
    t_login = teach_session.post(f"{BASE_URL}/api/auth/login", json={"username": "test.teacher01", "password": "Test@123"})
    assert t_login.status_code == 200
    teacher_id = t_login.json()["id"]

    # Test 3.1: Student 90 attempting to update Student 91 (or other student) profile -> Must be 403 Forbidden
    other_stud_id = student_id + 1
    spoof_student = stud_session.put(f"{BASE_URL}/api/students/{other_stud_id}/profile", json={
        "firstName": "Hacked",
        "lastName": "User",
        "email": "hacked@evil.com"
    })
    print(f"Spoof Attempt 1: Student modifying other student {other_stud_id} -> HTTP {spoof_student.status_code}")
    assert spoof_student.status_code == 403, f"Security Breach! Status was {spoof_student.status_code}"

    # Test 3.2: Student attempting to update Teacher profile -> Must be 403 Forbidden
    spoof_teacher = stud_session.put(f"{BASE_URL}/api/teachers/{teacher_id}/profile", json={
        "firstName": "HackedTeacher",
        "email": "hacked@evil.com"
    })
    print(f"Spoof Attempt 2: Student modifying teacher {teacher_id} -> HTTP {spoof_teacher.status_code}")
    assert spoof_teacher.status_code == 403, f"Security Breach! Status was {spoof_teacher.status_code}"

    # Test 3.3: Teacher attempting to update other Teacher profile -> Must be 403 Forbidden
    other_teach_id = teacher_id + 1
    spoof_other_teach = teach_session.put(f"{BASE_URL}/api/teachers/{other_teach_id}/profile", json={
        "firstName": "HackedFaculty",
        "email": "hacked@evil.com"
    })
    print(f"Spoof Attempt 3: Teacher modifying other teacher {other_teach_id} -> HTTP {spoof_other_teach.status_code}")
    assert spoof_other_teach.status_code == 403, f"Security Breach! Status was {spoof_other_teach.status_code}"

    # Test 3.4: Teacher attempting to update Student profile -> Must be 403 Forbidden
    spoof_student_by_teach = teach_session.put(f"{BASE_URL}/api/students/{student_id}/profile", json={
        "firstName": "HackedStudent",
        "email": "hacked@evil.com"
    })
    print(f"Spoof Attempt 4: Teacher modifying student {student_id} -> HTTP {spoof_student_by_teach.status_code}")
    assert spoof_student_by_teach.status_code == 403, f"Security Breach! Status was {spoof_student_by_teach.status_code}"

    # Test 3.5: Legitimate Student updating own profile -> Must be 200 OK
    legit_student = stud_session.put(f"{BASE_URL}/api/students/{student_id}/profile", json={
        "firstName": "Meera",
        "lastName": "Kumar",
        "email": "student@institution.edu"
    })
    print(f"Legitimate Student Profile Update ({student_id}) -> HTTP {legit_student.status_code}")
    assert legit_student.status_code == 200, f"Legitimate student update failed: {legit_student.text}"

    # Test 3.6: Legitimate Teacher updating own profile -> Must be 200 OK
    legit_teacher = teach_session.put(f"{BASE_URL}/api/teachers/{teacher_id}/profile", json={
        "firstName": "Dr. Sarah",
        "lastName": "Jenkins",
        "email": "teacher@institution.edu"
    })
    print(f"Legitimate Teacher Profile Update ({teacher_id}) -> HTTP {legit_teacher.status_code}")
    assert legit_teacher.status_code == 200, f"Legitimate teacher update failed: {legit_teacher.text}"

    print("PASS: All 4 ID spoofing attack vectors blocked with HTTP 403. Legitimate updates succeed with HTTP 200.")

def test_4_full_portal_workflows():
    log_section("4. Multi-Portal Workflows & Interactive Action Tests")

    # Admin actions
    admin_s = requests.Session()
    admin_s.post(f"{BASE_URL}/api/auth/login", json={"username": "admin", "password": "admin"})

    # Admin check notifications and mark read
    notifs = admin_s.get(f"{BASE_URL}/api/academic/notifications").json()
    assert isinstance(notifs, list)
    print(f"Admin Notifications: {len(notifs)} items")
    if len(notifs) > 0:
        nid = notifs[0].get("id")
        if nid:
            read_res = admin_s.put(f"{BASE_URL}/api/academic/notifications/{nid}/read")
            assert read_res.status_code == 200
            print(f"Admin Marked Notification {nid} Read: HTTP 200")

    # Admin create announcement
    ann_res = admin_s.post(f"{BASE_URL}/api/academic/announcements", json={
        "title": "System Audit Complete",
        "message": "Automated verification pass confirmed zero regressions.",
        "recipientRole": "ALL"
    })
    assert ann_res.status_code == 200
    print("Admin Published Announcement: HTTP 200")

    # Admin Institutional Analytics
    inst_res = admin_s.get(f"{BASE_URL}/api/ai/analytics/institutional")
    assert inst_res.status_code == 200
    print(f"Admin Institutional Analytics: HTTP 200, Model={inst_res.json().get('modelVersion')}")

    print("PASS: All portal API workflows operational.")

if __name__ == "__main__":
    try:
        test_1_ai_prediction_json_schema()
        test_2_what_if_simulator_and_formulas()
        test_3_id_spoofing_prevention()
        test_4_full_portal_workflows()
        print("\n" + "="*70)
        print("ALL AUDIT AND SECURITY VERIFICATION TESTS PASSED SUCCESSFULLY (100%)")
        print("="*70)
    except Exception as e:
        print(f"\n[FAIL] Test suite failed with exception: {e}", file=sys.stderr)
        sys.exit(1)
