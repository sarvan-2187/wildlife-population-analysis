import pandas as pd
import numpy as np
import os
import json
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold
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
    """
    Trains a Random Forest classifier and returns all metric results.
    FIXED: Removed 'growth_rate' from features to eliminate data leakage.
    Uses StratifiedKFold cross-validation for robust metrics.
    
    This is the LEAKAGE-FREE BASELINE model that forms the foundation 
    for subsequent hyperparameter tuning.
    """
    print("[Classifier] Loading cleaned data...")
    df = pd.read_csv(CLEANED_DATA_PATH)

    # --- Feature Engineering ---
    df["label"] = df["growth_rate"].apply(label_trend)

    # Encode categorical columns
    le_system = LabelEncoder()
    le_region = LabelEncoder()
    df["System_enc"] = le_system.fit_transform(df["System"].fillna("Unknown"))
    df["Region_enc"] = le_region.fit_transform(df["Region"].fillna("Unknown"))

    # --- FIXED: Removed 'growth_rate' from features (was causing data leakage) ---
    # Old: features = ["growth_rate", "Year", "Latitude", "Longitude", "System_enc", "Region_enc"]
    # Now growth_rate is ONLY used to create labels, not as a feature
    features = ["Year", "Latitude", "Longitude", "System_enc", "Region_enc"]
    X = df[features]
    y = df["label"]

    print(f"[Classifier] Using {len(features)} features (data leakage FIXED)")
    print(f"  Removed: 'growth_rate' (this was being used as both feature AND label source)")
    print(f"  Features: {features}")
    print(f"[Classifier] Total samples: {len(X):,}")

    # --- Stratified K-Fold Cross-Validation (5 folds) ---
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    fold_metrics = {
        "accuracy": [], "f1_macro": [], "f1_weighted": [],
        "precision_weighted": [], "recall_weighted": []
    }
    
    fold_reports = []
    fold_cms = []
    all_y_true = []
    all_y_pred = []
    feature_importances_by_fold = []

    print(f"\n[Classifier] Running 5-Fold Stratified Cross-Validation...")
    for fold_idx, (train_idx, test_idx) in enumerate(skf.split(X, y)):
        X_train_fold = X.iloc[train_idx]
        X_test_fold = X.iloc[test_idx]
        y_train_fold = y.iloc[train_idx]
        y_test_fold = y.iloc[test_idx]

        print(f"  Fold {fold_idx + 1}/5: train={len(X_train_fold):,}, test={len(X_test_fold):,}")

        # Train RF on this fold
        clf = RandomForestClassifier(
            n_estimators=100,
            max_depth=15,
            min_samples_leaf=10,
            n_jobs=-1,
            random_state=42
        )
        clf.fit(X_train_fold, y_train_fold)

        # Evaluate on test fold
        y_pred = clf.predict(X_test_fold)
        
        acc = accuracy_score(y_test_fold, y_pred)
        f1_macro = f1_score(y_test_fold, y_pred, average="macro")
        f1_weighted = f1_score(y_test_fold, y_pred, average="weighted")
        precision = precision_score(y_test_fold, y_pred, average="weighted", zero_division=0)
        recall = recall_score(y_test_fold, y_pred, average="weighted", zero_division=0)

        fold_metrics["accuracy"].append(acc)
        fold_metrics["f1_macro"].append(f1_macro)
        fold_metrics["f1_weighted"].append(f1_weighted)
        fold_metrics["precision_weighted"].append(precision)
        fold_metrics["recall_weighted"].append(recall)
        
        fold_reports.append(
            classification_report(y_test_fold, y_pred, target_names=["Declining", "Stable", "Growing"], output_dict=True)
        )
        fold_cms.append(confusion_matrix(y_test_fold, y_pred).tolist())
        
        all_y_true.extend(y_test_fold.tolist())
        all_y_pred.extend(y_pred.tolist())
        
        # Store feature importances for averaging
        feature_importances_by_fold.append(clf.feature_importances_)

        print(f"    Accuracy: {acc:.4f}, F1(weighted): {f1_weighted:.4f}")

    # Calculate mean and std across folds
    mean_accuracy = np.mean(fold_metrics["accuracy"])
    std_accuracy = np.std(fold_metrics["accuracy"])
    mean_f1_macro = np.mean(fold_metrics["f1_macro"])
    std_f1_macro = np.std(fold_metrics["f1_macro"])
    mean_f1_weighted = np.mean(fold_metrics["f1_weighted"])
    std_f1_weighted = np.std(fold_metrics["f1_weighted"])
    mean_precision = np.mean(fold_metrics["precision_weighted"])
    std_precision = np.std(fold_metrics["precision_weighted"])
    mean_recall = np.mean(fold_metrics["recall_weighted"])
    std_recall = np.std(fold_metrics["recall_weighted"])

    # Overall metrics across all CV predictions
    overall_report = classification_report(all_y_true, all_y_pred, target_names=["Declining", "Stable", "Growing"], output_dict=True)
    overall_cm = confusion_matrix(all_y_true, all_y_pred).tolist()

    # Train final model on all data for production
    clf_final = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_leaf=10,
        n_jobs=-1,
        random_state=42
    )
    clf_final.fit(X, y)

    # Average feature importance across folds
    avg_feature_importances = np.mean(feature_importances_by_fold, axis=0)
    importances = {feat: round(float(imp), 4) for feat, imp in zip(features, avg_feature_importances)}

    # Class distribution
    class_counts = y.value_counts().to_dict()
    class_distribution = {LABEL_NAMES[k]: int(v) for k, v in class_counts.items()}

    # Save final model
    with open(MODEL_PATH, "wb") as f:
        pickle.dump({"model": clf_final, "le_system": le_system, "le_region": le_region}, f)
    print(f"\n[Classifier] Final model saved to {MODEL_PATH}")

    metrics = {
        "model": "Random Forest Classifier (Leakage-Free Baseline)",
        "total_samples": int(len(X)),
        "cv_folds": 5,
        "cv_strategy": "StratifiedKFold",
        "features_used": features,
        "data_leakage_fixed": True,
        "leakage_note": "Removed 'growth_rate' from features — it was previously used to generate labels (data leakage)",
        "accuracy": {
            "mean": round(mean_accuracy, 4),
            "std": round(std_accuracy, 4),
            "fold_values": [round(v, 4) for v in fold_metrics["accuracy"]]
        },
        "f1_macro": {
            "mean": round(mean_f1_macro, 4),
            "std": round(std_f1_macro, 4),
            "fold_values": [round(v, 4) for v in fold_metrics["f1_macro"]]
        },
        "f1_weighted": {
            "mean": round(mean_f1_weighted, 4),
            "std": round(std_f1_weighted, 4),
            "fold_values": [round(v, 4) for v in fold_metrics["f1_weighted"]]
        },
        "precision_weighted": {
            "mean": round(mean_precision, 4),
            "std": round(std_precision, 4),
            "fold_values": [round(v, 4) for v in fold_metrics["precision_weighted"]]
        },
        "recall_weighted": {
            "mean": round(mean_recall, 4),
            "std": round(std_recall, 4),
            "fold_values": [round(v, 4) for v in fold_metrics["recall_weighted"]]
        },
        "feature_importances": importances,
        "class_distribution": class_distribution,
        "classification_report_cv": overall_report,
        "confusion_matrix_cv": overall_cm,
        "label_map": LABEL_NAMES
    }

    print(f"\n[Classifier] === 5-FOLD CV RESULTS (Leakage-Free Baseline) ===")
    print(f"  Accuracy         : {mean_accuracy:.4f} ± {std_accuracy:.4f}")
    print(f"  F1 Score (macro) : {mean_f1_macro:.4f} ± {std_f1_macro:.4f}")
    print(f"  F1 Score (wtd)   : {mean_f1_weighted:.4f} ± {std_f1_weighted:.4f}")
    print(f"  Precision (wtd)  : {mean_precision:.4f} ± {std_precision:.4f}")
    print(f"  Recall (wtd)     : {mean_recall:.4f} ± {std_recall:.4f}")
    print(f"\n  Fold Accuracies: {[f'{v:.4f}' for v in fold_metrics['accuracy']]}")
    print(f"  Fold F1 (wtd):   {[f'{v:.4f}' for v in fold_metrics['f1_weighted']]}")
    print(f"  CV Stability (std < 5%):  {'✓ GOOD' if std_f1_weighted < 0.05 else '⚠ Check variance'}")

    return metrics


if __name__ == "__main__":
    train_classifier()
