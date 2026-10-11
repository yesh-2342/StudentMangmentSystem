from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from .schemas import (
    StudentAcademicFeatures, PredictionResponse,
    BatchPredictionRequest, BatchPredictionResponse,
    WhatIfSimulationRequest, WhatIfSimulationResponse,
    ModelInfoResponse
)
from .service import ModelManager

app = FastAPI(
    title="Project 577 - Academic Intelligence Deep Learning Service",
    description="Deep Learning microservice for student performance prediction, explainability, and what-if simulation.",
    version="1.2.0"
)

# Enable CORS for local Spring Boot backend and Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check() -> Dict[str, Any]:
    manager = ModelManager.get_instance()
    return {
        "status": "UP" if manager.is_loaded else "DEGRADED",
        "service": "Deep Learning Academic Intelligence Microservice",
        "model_loaded": manager.is_loaded,
        "model_version": manager.metadata.get("model_version", "unknown") if manager.metadata else None,
        "framework": "PyTorch 2.x MLP",
        "error": manager.load_error
    }

@app.get("/api/ai/model-info", response_model=ModelInfoResponse)
def get_model_information():
    manager = ModelManager.get_instance()
    try:
        return manager.get_model_info()
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model artifacts unavailable: {str(e)}"
        )

@app.post("/api/ai/predict", response_model=PredictionResponse)
def predict_student_performance(features: StudentAcademicFeatures):
    manager = ModelManager.get_instance()
    try:
        return manager.predict_single(features)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Prediction engine not ready: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error computing prediction: {str(e)}"
        )

@app.post("/api/ai/predict/batch", response_model=BatchPredictionResponse)
def predict_batch_performance(request: BatchPredictionRequest):
    if len(request.records) > 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batch limit exceeded. Maximum 200 records allowed per batch request."
        )
    manager = ModelManager.get_instance()
    try:
        return manager.predict_batch(request)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Prediction engine not ready: {str(e)}"
        )

@app.post("/api/ai/simulate", response_model=WhatIfSimulationResponse)
def simulate_academic_scenario(request: WhatIfSimulationRequest):
    manager = ModelManager.get_instance()
    try:
        return manager.simulate_what_if(request)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Prediction engine not ready: {str(e)}"
        )
