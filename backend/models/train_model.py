"""
train_model.py
Orchestrates training of both ML models:
  1. Random Forest Decline Classifier
  2. ARIMA Time Series Forecaster

Saves combined metrics to data/model_metrics.json
"""
import json
import os
import sys

# Ensure backend root is on path for sub-module imports
_TRAIN_FILE = os.path.abspath(__file__)          # .../backend/models/train_model.py
_BACKEND_DIR = os.path.dirname(os.path.dirname(_TRAIN_FILE))  # .../backend
_PROJECT_DIR = os.path.dirname(_BACKEND_DIR)     # .../wildlife-population-analysis

sys.path.insert(0, _BACKEND_DIR)

from models.decline_classifier import train_classifier
from models.time_series_model import run_time_series_analysis

METRICS_OUTPUT_PATH = os.path.join(_PROJECT_DIR, "data", "model_metrics.json")


def train_all():
    print("=" * 55)
    print("  MISSION: Wildlife Population Dynamics — ML Training")
    print("=" * 55)

    all_metrics = {}

    # ---------- Model 1: Classifier ----------
    print("\n>>> Running Model 1: Random Forest Classifier")
    classifier_metrics = train_classifier()
    all_metrics["classifier"] = classifier_metrics

    # ---------- Model 2: Time Series ----------
    print("\n>>> Running Model 2: ARIMA Time Series Forecaster")
    ts_metrics = run_time_series_analysis()
    all_metrics["time_series"] = ts_metrics

    # ---------- Save ----------
    os.makedirs(os.path.dirname(METRICS_OUTPUT_PATH), exist_ok=True)
    with open(METRICS_OUTPUT_PATH, "w") as f:
        json.dump(all_metrics, f, indent=4)

    print(f"\n✅ All metrics saved → {METRICS_OUTPUT_PATH}")
    print("=" * 55)
    return all_metrics


if __name__ == "__main__":
    train_all()
