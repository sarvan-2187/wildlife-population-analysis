"""
predict_species.py
Loads the trained decline_classifier.pkl and runs inference
for a given species' features.
"""
import pickle
import os
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "data", "decline_classifier.pkl")

LABEL_MAP = {0: "Declining", 1: "Stable", 2: "Growing"}


def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            "Trained model not found. Please run `python backend/models/train_model.py` first."
        )
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


def predict(growth_rate: float, year: int, latitude: float, longitude: float,
            system: str = "Terrestrial", region: str = "Europe") -> dict:
    """
    Predict decline status for a species given its features.

    Returns:
        dict with 'label' (str) and 'confidence' (float)
    """
    bundle = load_model()
    clf = bundle["model"]
    le_system = bundle["le_system"]
    le_region = bundle["le_region"]

    # Encode categoricals — handle unseen labels gracefully
    try:
        sys_enc = le_system.transform([system])[0]
    except ValueError:
        sys_enc = 0

    try:
        reg_enc = le_region.transform([region])[0]
    except ValueError:
        reg_enc = 0

    features = np.array([[growth_rate, year, latitude, longitude, sys_enc, reg_enc]])
    pred_class = int(clf.predict(features)[0])
    confidence = float(clf.predict_proba(features)[0][pred_class])

    return {
        "label": LABEL_MAP[pred_class],
        "confidence": round(confidence, 4),
        "input": {
            "growth_rate": growth_rate,
            "year": year,
            "latitude": latitude,
            "longitude": longitude,
            "system": system,
            "region": region,
        }
    }


if __name__ == "__main__":
    # Quick smoke test
    result = predict(growth_rate=-0.25, year=2020, latitude=51.5, longitude=-0.1,
                     system="Terrestrial", region="Europe")
    print(result)
