import torch
import torch.nn as nn
from typing import Dict, Any

class AcademicMLP(nn.Module):
    """
    Genuine Deep Learning Multi-Layer Perceptron (MLP) for Academic Performance Prediction.
    
    Architecture:
      Input (7 features) 
      -> Linear(7, 64) -> BatchNorm1d(64) -> ReLU() 
      -> Dropout(0.2)
      -> Linear(64, 32) -> BatchNorm1d(32) -> ReLU()
      -> Dropout(0.1)
      -> Linear(32, 16) -> ReLU()
      -> Linear(16, 1) -> Sigmoid() * 100
    """
    def __init__(self, input_dim: int = 7):
        super(AcademicMLP, self).__init__()
        self.fc1 = nn.Linear(input_dim, 64)
        self.bn1 = nn.BatchNorm1d(64)
        self.relu1 = nn.ReLU()
        self.drop1 = nn.Dropout(0.2)

        self.fc2 = nn.Linear(64, 32)
        self.bn2 = nn.BatchNorm1d(32)
        self.relu2 = nn.ReLU()
        self.drop2 = nn.Dropout(0.1)

        self.fc3 = nn.Linear(32, 16)
        self.relu3 = nn.ReLU()

        self.out = nn.Linear(16, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        out = self.fc1(x)
        out = self.bn1(out)
        out = self.relu1(out)
        out = self.drop1(out)

        out = self.fc2(out)
        out = self.bn2(out)
        out = self.relu2(out)
        out = self.drop2(out)

        out = self.fc3(out)
        out = self.relu3(out)

        out = self.out(out)
        # Scale to 0-100 score distribution smoothly
        out = self.sigmoid(out) * 100.0
        return out

def get_model_summary(model: nn.Module) -> Dict[str, Any]:
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    return {
        "architecture_name": "Deep Learning Multi-Layer Perceptron (MLP)",
        "layers": [
            "Linear(7 -> 64) + BatchNorm1d + ReLU + Dropout(0.2)",
            "Linear(64 -> 32) + BatchNorm1d + ReLU + Dropout(0.1)",
            "Linear(32 -> 16) + ReLU",
            "Linear(16 -> 1) + Sigmoid(scaled x100)"
        ],
        "total_parameters": total_params,
        "trainable_parameters": trainable_params,
        "activation_functions": ["ReLU", "Sigmoid"],
        "regularization": ["Batch Normalization", "Dropout (0.2, 0.1)"]
    }
