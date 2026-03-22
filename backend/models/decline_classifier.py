import pandas as pd
import numpy as np
import os
import json
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    classification_report, confusion_matrix,
    f1_score, accuracy_score, precision_score, recall_score
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLEANED_DATA_PATH = os.path.join(BASE_DIR, "data", "cleaned_wildlife_population.csv")
MODEL_PATH = os.path.join(BASE_DIR, "data", "decline_classifier.pkl")


def label_trend(growth_rate: float) -> int:
    """Convert growth_rate to a class label.
    0 = Declining  (growth_rate < -0.05)
    1 = Stable     (-0.05 <= growth_rate <= 0.05)
    2 = Growing    (growth_rate > 0.05)
    """
    if growth_rate < -0.05:
        return 0
    elif growth_rate <= 0.05:
        return 1
    else:
        return 2


LABEL_NAMES = {0: "Declining", 1: "Stable", 2: "Growing"}


def train_classifier() -> dict:
    """Trains a Random Forest classifier and returns all metric results."""
    print("[Classifier] Loading cleaned data...")
    df = pd.read_csv(CLEANED_DATA_PATH)

    # --- Feature Engineering ---
    df["label"] = df["growth_rate"].apply(label_trend)

    # Encode categorical columns
    le_system = LabelEncoder()
    le_region = LabelEncoder()
    df["System_enc"] = le_system.fit_transform(df["System"].fillna("Unknown"))
    df["Region_enc"] = le_region.fit_transform(df["Region"].fillna("Unknown"))

    features = ["growth_rate", "Year", "Latitude", "Longitude", "System_enc", "Region_enc"]
    X = df[features]
    y = df["label"]

    # --- Train/Test Split (80/20) ---
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"[Classifier] Training on {len(X_train):,} samples, testing on {len(X_test):,}...")

    # --- Random Forest Training ---
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_leaf=10,
        n_jobs=-1,
        random_state=42
    )
    clf.fit(X_train, y_train)

    # --- Evaluation ---
    y_pred = clf.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    f1_macro = f1_score(y_test, y_pred, average="macro")
    f1_weighted = f1_score(y_test, y_pred, average="weighted")
    precision = precision_score(y_test, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)

    report = classification_report(y_test, y_pred, target_names=["Declining", "Stable", "Growing"], output_dict=True)
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Feature importance
    importances = {feat: round(float(imp), 4) for feat, imp in zip(features, clf.feature_importances_)}

    # Class distribution
    class_counts = df["label"].value_counts().to_dict()
    class_distribution = {LABEL_NAMES[k]: int(v) for k, v in class_counts.items()}

    # --- Save model ---
    with open(MODEL_PATH, "wb") as f:
        pickle.dump({"model": clf, "le_system": le_system, "le_region": le_region}, f)
    print(f"[Classifier] Model saved to {MODEL_PATH}")

    metrics = {
        "model": "Random Forest Classifier",
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "accuracy": round(acc, 4),
        "f1_macro": round(f1_macro, 4),
        "f1_weighted": round(f1_weighted, 4),
        "precision_weighted": round(precision, 4),
        "recall_weighted": round(recall, 4),
        "feature_importances": importances,
        "class_distribution": class_distribution,
        "classification_report": report,
        "confusion_matrix": cm,
        "label_map": LABEL_NAMES
    }

    print(f"\n[Classifier] === RESULTS ===")
    print(f"  Accuracy         : {acc:.4f}")
    print(f"  F1 Score (macro) : {f1_macro:.4f}")
    print(f"  F1 Score (weighted): {f1_weighted:.4f}")
    print(f"  Precision (wtd)  : {precision:.4f}")
    print(f"  Recall (wtd)     : {recall:.4f}")

    return metrics


if __name__ == "__main__":
    train_classifier()
