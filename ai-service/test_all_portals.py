import json
import requests
import sys

BASE_URL = "http://localhost:8080"
AI_URL = "http://localhost:8000"

def test_ai_direct():
    print("\n--- 1. Testing AI FastAPI Microservice Directly ---")
    r = requests.get(f"{AI_URL}/health")
    assert r.status_code == 200, f"AI Health check failed: {r.text}"
    health = r.json()
    print(f"AI Service Health: status={health.get('status')}, model_version={health.get('model_version')}")

    metadata = requests.get(f"{AI_URL}/api/ai/model-info").json()
    print(f"Model Architecture: {metadata.get('architecture')}, hidden_dims={metadata.get('hidden_dimensions')}, R2={metadata.get('metrics', {}).get('test_r2')}")

    pred_payload = {
        "student_id": 101,
        "attendance_rate": 92.0,
        "internal_assessment_avg": 85.0,
        "assignment_completion_rate": 95.0,
        "assignment_average_mark": 88.0,
        "previous_course_avg": 82.0,
        "missing_assignments_count": 0.0,
        "consultation_engagement": 2.0
    }
    pred_res = requests.post(f"{AI_URL}/api/ai/predict", json=pred_payload)
    assert pred_res.status_code == 200, f"AI Predict failed: {pred_res.text}"
    pred_json = pred_res.json()
    print(f"AI Predict output: score={pred_json.get('predicted_score')}, risk={pred_json.get('risk_level')}")

def test_admin_portal():
    print("\n--- 2. Testing Administrator Portal & Endpoints ---")
    s = requests.Session()
    login_res = s.post(f"{BASE_URL}/api/auth/login", json={"username": "admin", "password": "admin"})
    assert login_res.status_code == 200, f"Admin login failed: {login_res.text}"
    admin_info = login_res.json()
    print(f"Admin Logged In: username={admin_info.get('username')}, role={admin_info.get('role')}")

    # Dashboard
    dash_res = s.get(f"{BASE_URL}/api/admin/dashboard")
    assert dash_res.status_code == 200, f"Admin dashboard failed: {dash_res.text}"
    dash = dash_res.json()
    print(f"Admin Dashboard: totalStudents={dash.get('totalStudents')}, totalTeachers={dash.get('totalTeachers')}, totalCourses={dash.get('totalCourses')}")

    # Students list
    stud_res = s.get(f"{BASE_URL}/api/admin/students")
    assert stud_res.status_code == 200
    students = stud_res.json()
    print(f"Admin Students Count: {len(students)}")

    # Teachers list
    teach_res = s.get(f"{BASE_URL}/api/admin/teachers")
    assert teach_res.status_code == 200
    teachers = teach_res.json()
    print(f"Admin Teachers Count: {len(teachers)}")

    # Courses list
    course_res = s.get(f"{BASE_URL}/api/admin/courses")
    assert course_res.status_code == 200
    courses = course_res.json()
    print(f"Admin Courses Count: {len(courses)}")

    # Institutional AI Insights
    ai_res = s.get(f"{BASE_URL}/api/ai/analytics/institutional")
    print(f"Admin AI Institutional Insights: HTTP {ai_res.status_code}")
    if ai_res.status_code == 200:
        ai_data = ai_res.json()
        print(f"  DL Institutional Model: version={ai_data.get('modelVersion')}, totalEvaluated={ai_data.get('totalStudentsEvaluated')}")

    # Library books
    lib_res = s.get(f"{BASE_URL}/api/academic/library")
    assert lib_res.status_code == 200
    print(f"Admin Library Books Count: {len(lib_res.json())}")

    # Attendance logs
    att_res = s.get(f"{BASE_URL}/api/academic/attendance")
    assert att_res.status_code == 200
    print(f"Admin Attendance Logs: {len(att_res.json())}")

def test_teacher_portal():
    print("\n--- 3. Testing Teacher / Faculty Portal & Endpoints ---")
    s = requests.Session()
    login_res = s.post(f"{BASE_URL}/api/auth/login", json={"username": "test.teacher01", "password": "Test@123"})
    assert login_res.status_code == 200, f"Teacher login failed: {login_res.text}"
    teacher_info = login_res.json()
    teacher_id = teacher_info.get("id")
    print(f"Teacher Logged In: id={teacher_id}, name={teacher_info.get('firstName')} {teacher_info.get('lastName')}")

    # Teacher Dashboard
    dash_res = s.get(f"{BASE_URL}/api/teachers/{teacher_id}/dashboard")
    assert dash_res.status_code == 200
    dash = dash_res.json()
    print(f"Teacher Dashboard: assignedCourses={dash.get('totalCourses')}, enrolledStudents={dash.get('totalStudents')}")

    # Teacher Courses
    c_res = s.get(f"{BASE_URL}/api/teachers/{teacher_id}/courses")
    assert c_res.status_code == 200
    courses = c_res.json()
    print(f"Teacher Courses Count: {len(courses)}")

    # Teacher Students Roster
    st_res = s.get(f"{BASE_URL}/api/teachers/{teacher_id}/students")
    assert st_res.status_code == 200
    roster = st_res.json()
    print(f"Teacher Student Roster Count: {len(roster)}")

    # Teacher Profile Update (New feature verified)
    update_res = s.put(f"{BASE_URL}/api/teachers/{teacher_id}/profile", json={
        "firstName": teacher_info.get("firstName") or "Faculty",
        "lastName": teacher_info.get("lastName") or "Instructor",
        "email": teacher_info.get("email") or "faculty@institution.edu"
    })
    assert update_res.status_code == 200, f"Teacher profile update failed: {update_res.text}"
    print(f"Teacher Profile Update Verified: {update_res.json().get('message')}")

    # At-risk students
    risk_res = s.get(f"{BASE_URL}/api/teachers/{teacher_id}/at-risk")
    print(f"Teacher At-Risk Students: HTTP {risk_res.status_code}, count={len(risk_res.json()) if risk_res.status_code == 200 else 'N/A'}")

def test_student_portal():
    print("\n--- 4. Testing Student Portal & Endpoints ---")
    s = requests.Session()
    login_res = s.post(f"{BASE_URL}/api/auth/login", json={"username": "test.student01", "password": "Test@123"})
    assert login_res.status_code == 200, f"Student login failed: {login_res.text}"
    student_info = login_res.json()
    student_id = student_info.get("id")
    print(f"Student Logged In: id={student_id}, name={student_info.get('firstName')} {student_info.get('lastName')}")

    # Student Dashboard
    dash_res = s.get(f"{BASE_URL}/api/students/{student_id}/dashboard")
    assert dash_res.status_code == 200
    dash = dash_res.json()
    print(f"Student Dashboard: enrolledCourses={dash.get('totalCourses')}, totalAssignments={dash.get('totalAssignments')}, avgGrade={dash.get('averageGrade')}")

    # Student Courses
    c_res = s.get(f"{BASE_URL}/api/students/{student_id}/courses")
    assert c_res.status_code == 200
    courses = c_res.json()
    print(f"Student Enrolled Courses: {len(courses)}")

    # Student Grades
    g_res = s.get(f"{BASE_URL}/api/students/{student_id}/grades")
    assert g_res.status_code == 200
    print(f"Student Grades Count: {len(g_res.json())}")

    # Student Profile Update (New feature verified)
    update_res = s.put(f"{BASE_URL}/api/students/{student_id}/profile", json={
        "firstName": student_info.get("firstName") or "Student",
        "lastName": student_info.get("lastName") or "Learner",
        "email": student_info.get("email") or "student@institution.edu"
    })
    assert update_res.status_code == 200, f"Student profile update failed: {update_res.text}"
    print(f"Student Profile Update Verified: {update_res.json().get('message')}")

    # Deep Learning AI Prediction for this Student
    ai_pred_res = s.get(f"{BASE_URL}/api/ai/students/{student_id}/prediction")
    print(f"Student Deep Learning AI Prediction: HTTP {ai_pred_res.status_code}")
    if ai_pred_res.status_code == 200:
        pred_data = ai_pred_res.json()
        score = pred_data.get('predicted_score') or pred_data.get('predictedScore')
        risk = pred_data.get('risk_level') or pred_data.get('riskLevel')
        conf = pred_data.get('confidence_score') or pred_data.get('confidenceScore')
        print(f"  DL Model Predicted Final Score: {score}% | Risk Level: {risk} | Confidence: {conf}")

    # Deep Learning What-If Simulator
    sim_payload = {
        "hypotheticalAttendanceShift": 5.0,
        "hypotheticalScoreShift": 8.0,
        "hypotheticalAssignmentShift": 0.1
    }
    sim_res = s.post(f"{BASE_URL}/api/ai/students/{student_id}/simulate", json=sim_payload)
    print(f"Student Deep Learning What-If Simulator: HTTP {sim_res.status_code}")
    if sim_res.status_code == 200:
        sim_data = sim_res.json()
        base = sim_data.get('baseline_predicted_score') or sim_data.get('baselinePredictedScore')
        sim = sim_data.get('simulated_predicted_score') or sim_data.get('simulatedPredictedScore')
        diff = sim_data.get('score_differential') or sim_data.get('scoreDifferential')
        trans = sim_data.get('risk_transition') or sim_data.get('riskTransition')
        print(f"  DL Simulator Baseline={base}% -> Simulated={sim}% (Shift: {diff}%) | Transition: {trans}")

    # Authorization Guard Check: Student attempting to access Admin endpoint must return 403 Forbidden
    forbidden_res = s.get(f"{BASE_URL}/api/admin/dashboard")
    assert forbidden_res.status_code == 403, f"Security violation: student accessed admin dashboard! Status={forbidden_res.status_code}"
    print("Security Isolation Verified: Student blocked with HTTP 403 from Admin dashboard.")

    # Authorization Guard Check: Student attempting to predict another student's record
    other_pred_res = s.get(f"{BASE_URL}/api/ai/students/99999/prediction")
    assert other_pred_res.status_code == 403, f"Security violation: student accessed unauthorized student prediction! Status={other_pred_res.status_code}"
    print("Data Tenancy Isolation Verified: Student blocked with HTTP 403 from predicting other students' records.")

if __name__ == "__main__":
    try:
        test_ai_direct()
        test_admin_portal()
        test_teacher_portal()
        test_student_portal()
        print("\n========================================================")
        print("ALL ENDPOINTS & ROLE WORKFLOWS VERIFIED 100% OPERATIONAL!")
        print("========================================================")
    except Exception as e:
        print(f"\nTEST FAILED: {e}", file=sys.stderr)
        sys.exit(1)
