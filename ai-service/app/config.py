import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

MODEL_FILE = MODELS_DIR / "academic_mlp.pt"
SCALER_FILE = MODELS_DIR / "scaler.joblib"
METADATA_FILE = MODELS_DIR / "model_metadata.json"

MODEL_VERSION = "v1.2.0-dl-mlp"
MODEL_NAME = "AcademicDeepIntelligenceMLP"
FRAMEWORK = "PyTorch 2.x Deep Learning (Multi-Layer Perceptron)"

# Feature definitions and ranges
FEATURE_NAMES = [
    "attendance_rate",
    "internal_assessment_avg",
    "assignment_completion_rate",
    "assignment_average_mark",
    "previous_course_avg",
    "missing_assignments_count",
    "consultation_engagement"
]

FEATURE_BOUNDS = {
    "attendance_rate": (0.0, 100.0),
    "internal_assessment_avg": (0.0, 100.0),
    "assignment_completion_rate": (0.0, 100.0),
    "assignment_average_mark": (0.0, 100.0),
    "previous_course_avg": (0.0, 100.0),
    "missing_assignments_count": (0.0, 20.0),
    "consultation_engagement": (0.0, 10.0),
}
