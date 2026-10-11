import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.schemas import StudentAcademicFeatures, WhatIfSimulationRequest, BatchPredictionRequest
from app.service import ModelManager

class TestAcademicIntelligenceAiService(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.manager = ModelManager.get_instance()

    def test_model_loaded(self):
        self.assertTrue(self.manager.is_loaded, "Model artifacts should be loaded into memory")
        self.assertIsNotNone(self.manager.model)
        self.assertIsNotNone(self.manager.scaler)

    def test_single_prediction_high_performer(self):
        features = StudentAcademicFeatures(
            student_id=1,
            course_id=1,
            attendance_rate=95.0,
            internal_assessment_avg=90.0,
            assignment_completion_rate=100.0,
            assignment_average_mark=92.0,
            previous_course_avg=88.0,
            missing_assignments_count=0.0,
            consultation_engagement=2.0
        )
        res = self.manager.predict_single(features)
        self.assertGreater(res.predicted_score, 80.0)
        self.assertEqual(res.performance_category, "Distinction")
        self.assertEqual(res.risk_level, "LOW")
        self.assertGreater(len(res.feature_contributions), 0)
        self.assertGreater(len(res.key_contributing_factors), 0)

    def test_single_prediction_at_risk(self):
        features = StudentAcademicFeatures(
            student_id=2,
            course_id=1,
            attendance_rate=45.0,
            internal_assessment_avg=35.0,
            assignment_completion_rate=40.0,
            assignment_average_mark=38.0,
            previous_course_avg=42.0,
            missing_assignments_count=5.0,
            consultation_engagement=0.0
        )
        res = self.manager.predict_single(features)
        self.assertLess(res.predicted_score, 50.0)
        self.assertIn(res.risk_level, ["HIGH", "CRITICAL"])
        self.assertIn(res.performance_category, ["Pass", "At-Risk"])
        self.assertTrue(any("missing" in a.lower() or "attendance" in a.lower() for a in res.recommended_actions))

    def test_what_if_simulation(self):
        base = StudentAcademicFeatures(
            student_id=3,
            attendance_rate=65.0,
            internal_assessment_avg=60.0,
            assignment_completion_rate=70.0,
            assignment_average_mark=62.0,
            previous_course_avg=60.0,
            missing_assignments_count=2.0,
            consultation_engagement=0.0
        )
        req = WhatIfSimulationRequest(
            base_features=base,
            hypothetical_attendance_rate=90.0,
            hypothetical_internal_score=85.0
        )
        sim_res = self.manager.simulate_what_if(req)
        self.assertGreater(sim_res.simulated_predicted_score, sim_res.baseline_predicted_score)
        self.assertGreater(sim_res.score_differential, 0.0)
        self.assertGreater(len(sim_res.key_drivers), 0)

    def test_batch_prediction(self):
        f1 = StudentAcademicFeatures(
            student_id=10, attendance_rate=80.0, internal_assessment_avg=75.0,
            assignment_completion_rate=85.0, assignment_average_mark=78.0,
            previous_course_avg=72.0, missing_assignments_count=1.0, consultation_engagement=1.0
        )
        f2 = StudentAcademicFeatures(
            student_id=11, attendance_rate=50.0, internal_assessment_avg=45.0,
            assignment_completion_rate=50.0, assignment_average_mark=48.0,
            previous_course_avg=52.0, missing_assignments_count=3.0, consultation_engagement=0.0
        )
        batch_req = BatchPredictionRequest(records=[f1, f2])
        resp = self.manager.predict_batch(batch_req)
        self.assertEqual(resp.total_processed, 2)
        self.assertEqual(len(resp.predictions), 2)
        self.assertIn("LOW", resp.risk_distribution)

if __name__ == "__main__":
    unittest.main()
