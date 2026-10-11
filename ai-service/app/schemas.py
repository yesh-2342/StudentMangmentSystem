from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime

class StudentAcademicFeatures(BaseModel):
    student_id: Optional[int] = None
    course_id: Optional[int] = None
    student_name: Optional[str] = "Student"
    course_name: Optional[str] = "Course"
    
    attendance_rate: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage (0-100)")
    internal_assessment_avg: float = Field(..., ge=0.0, le=100.0, description="Internal test/quiz average (0-100)")
    assignment_completion_rate: float = Field(..., ge=0.0, le=100.0, description="Rate of submitted assignments (0-100)")
    assignment_average_mark: float = Field(..., ge=0.0, le=100.0, description="Average marks on assignments (0-100)")
    previous_course_avg: float = Field(..., ge=0.0, le=100.0, description="Prior grade average or CGPA equivalent (0-100)")
    missing_assignments_count: float = Field(default=0.0, ge=0.0, le=50.0, description="Count of unsubmitted/overdue assignments")
    consultation_engagement: float = Field(default=0.0, ge=0.0, le=50.0, description="Count of academic advising consultations attended")

class FeatureContribution(BaseModel):
    feature: str
    display_name: str
    value: float
    contribution: float  # Positive = adds to score, Negative = subtracts from score
    impact_level: str    # "POSITIVE", "NEGATIVE", "NEUTRAL"
    insight: str

class PredictionResponse(BaseModel):
    student_id: Optional[int] = None
    course_id: Optional[int] = None
    predicted_score: float = Field(..., description="Predicted final exam/course score (0-100)")
    performance_category: str = Field(..., description="Distinction, First Class, Pass, At-Risk")
    risk_level: str = Field(..., description="LOW, MODERATE, HIGH, CRITICAL")
    confidence_score: float = Field(..., description="Model confidence index based on input distance to distribution")
    key_contributing_factors: List[str]
    feature_contributions: List[FeatureContribution]
    recommended_actions: List[str]
    model_version: str
    prediction_timestamp: str
    evaluation_metrics: Dict[str, Any]

class BatchPredictionRequest(BaseModel):
    records: List[StudentAcademicFeatures] = Field(..., max_length=200, description="Batch list up to 200 items")

class BatchPredictionResponse(BaseModel):
    predictions: List[PredictionResponse]
    total_processed: int
    mean_predicted_score: float
    risk_distribution: Dict[str, int]
    timestamp: str

class WhatIfSimulationRequest(BaseModel):
    base_features: StudentAcademicFeatures
    hypothetical_attendance_rate: Optional[float] = Field(None, ge=0.0, le=100.0)
    hypothetical_internal_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    hypothetical_assignment_completion: Optional[float] = Field(None, ge=0.0, le=100.0)
    hypothetical_assignment_marks: Optional[float] = Field(None, ge=0.0, le=100.0)
    additional_consultations: Optional[float] = Field(None, ge=0.0, le=20.0)

class WhatIfSimulationResponse(BaseModel):
    baseline_predicted_score: float
    baseline_risk_level: str
    simulated_predicted_score: float
    simulated_risk_level: str
    score_differential: float
    risk_transition: str
    key_drivers: List[str]
    educational_guidance: str
    model_version: str
    timestamp: str

class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    framework: str
    architecture: str
    input_features: List[str]
    training_dataset_summary: Dict[str, Any]
    evaluation_metrics: Dict[str, Any]
    baseline_comparison: Dict[str, Any]
    trained_at: str
    status: str
