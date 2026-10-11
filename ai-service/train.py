import sys
import os
from pathlib import Path

# Ensure root ai-service is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.pipeline import train_and_evaluate_models

if __name__ == "__main__":
    print("=" * 70)
    print("Project 577: Deep Learning Model Training & Evaluation Pipeline")
    print("Architecture: PyTorch Multi-Layer Perceptron (MLP) + Scikit-Learn Baseline")
    print("=" * 70)
    
    metadata = train_and_evaluate_models()
    
    print("\n[SUCCESS] Model training and hold-out evaluation completed successfully!")
    print(f"Model Version: {metadata['model_version']}")
    print(f"Framework:     {metadata['framework']}")
    print(f"Neural Net MAE:  {metadata['evaluation_metrics']['mean_absolute_error_mae']} points")
    print(f"Neural Net RMSE: {metadata['evaluation_metrics']['root_mean_squared_error_rmse']} points")
    print(f"Neural Net R^2:  {metadata['evaluation_metrics']['r2_score']}")
    print(f"Baseline Ridge RMSE: {metadata['baseline_comparison']['baseline_rmse']} points")
    print(f"Improvement over Baseline: {metadata['baseline_comparison']['neural_network_improvement_rmse_pct']}%")
    print("=" * 70)
