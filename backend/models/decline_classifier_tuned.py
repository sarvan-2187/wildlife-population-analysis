"""
Phase 2 Simplified: Manual Hyperparameter Optimization
Strategy: Test 5 promising parameter combinations on hold-out test set to find improvements
This avoids GridSearchCV parallelization issues on Windows while still finding better parameters.
"""

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
MODEL_PATH_TUNED = os.path.join(BASE_DIR, "data", "decline_classifier_tuned.pkl")


def label_trend(growth_rate: float) -> int:
    """Convert growth_rate to a class label."""
    if growth_rate < -0.05:
        return 0
    elif growth_rate <= 0.05:
        return 1
    else:
        return 2


LABEL_NAMES = {0: "Declining", 1: "Stable", 2: "Growing"}


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Basic feature engineering."""
    df = df.copy()
    
    # Lagged growth rate - captures momentum
    df["growth_rate_lag1"] = df.groupby("Binomial")["growth_rate"].shift(1).fillna(0)
    df["growth_rate_lag2"] = df.groupby("Binomial")["growth_rate"].shift(2).fillna(0)
    
    # Interaction term: latitude × longitude
    df["lat_lon_interaction"] = df["Latitude"] * df["Longitude"]
    
    # Clip outliers
    for col in ["growth_rate_lag1", "growth_rate_lag2"]:
        df[col] = df[col].clip(-1, 1)
    
    return df


def train_classifier_tuned() -> dict:
    """
    Phase 2: Train classifier with optimized hyperparameters.
    Tests 5 parameter combinations manually to find the best performer.
    """
    print("\n" + "="*70)
    print("  PHASE 2: TUNED CLASSIFIER WITH MANUAL PARAMETER OPTIMIZATION")
    print("="*70)
    
    print("\n[TunedClassifier] Loading and preparing data...")
    df = pd.read_csv(CLEANED_DATA_PATH)
    df["label"] = df["growth_rate"].apply(label_trend)

    # Encode categorical columns
    le_system = LabelEncoder()
    le_region = LabelEncoder()
    df["System_enc"] = le_system.fit_transform(df["System"].fillna("Unknown"))
    df["Region_enc"] = le_region.fit_transform(df["Region"].fillna("Unknown"))

    # Feature engineering
    df = engineer_features(df)
    
    features = [
        "Year", "Latitude", "Longitude", "System_enc", "Region_enc",
        "growth_rate_lag1", "growth_rate_lag2", "lat_lon_interaction"
    ]
    
    X = df[features]
    y = df["label"]

    # Split: 70% train, 15% val, 15% test
    X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.15, random_state=42, stratify=y)
    X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.176, random_state=42, stratify=y_temp)

    print(f"[TunedClassifier] Train: {len(X_train):,}, Val: {len(X_val):,}, Test: {len(X_test):,}")
    print(f"[TunedClassifier] Features: {features}")

    # Define 5 parameter combinations to test
    # Baseline: n_estimators=100, max_depth=15, min_samples_leaf=10
    param_combinations = [
        {"n_estimators": 100, "max_depth": 15, "min_samples_leaf": 10, "name": "Baseline (from Phase 1)"},
        {"n_estimators": 150, "max_depth": 12, "min_samples_leaf": 8, "name": "Combo 1: More trees, shallower"},
        {"n_estimators": 200, "max_depth": 10, "min_samples_leaf": 5, "name": "Combo 2: Many trees, deeper learn"},
        {"n_estimators": 120, "max_depth": 18, "min_samples_leaf": 12, "name": "Combo 3: Fewer, better split"},
        {"n_estimators": 180, "max_depth": 14, "min_samples_leaf": 7, "name": "Combo 4: Optimized balance"},
    ]

    results_by_combo = []
    best_params = None
    best_f1 = 0

    print("\n[TunedClassifier] Testing parameter combinations on validation set...")
    for combo_idx, params in enumerate(param_combinations):
        combo_name = params.pop("name")
        print(f"\n  [{combo_idx + 1}/5] {combo_name}")
        print(f"    Parameters: {params}")

        # Train on train set
        clf = RandomForestClassifier(**params, n_jobs=1, random_state=42)
        clf.fit(X_train, y_train)

        # Evaluate on val set
        y_val_pred = clf.predict(X_val)
        f1_val = f1_score(y_val, y_val_pred, average="weighted")
        acc_val = accuracy_score(y_val, y_val_pred)

        print(f"    Val Accuracy: {acc_val:.4f}, Val F1: {f1_val:.4f}")

        results_by_combo.append({
            "params": params,
            "name": combo_name,
            "val_f1": f1_val,
            "val_accuracy": acc_val
        })

        if f1_val > best_f1:
            best_f1 = f1_val
            best_params = params.copy()

    # Train final model with best parameters on train+val combined
    print(f"\n[TunedClassifier] Best parameters found: {best_params}")
    print(f"[TunedClassifier] Training final model on train+val set with best params...")

    X_combined = pd.concat([X_train, X_val])
    y_combined = pd.concat([y_train, y_val])

    clf_final = RandomForestClassifier(**best_params, n_jobs=1, random_state=42)
    clf_final.fit(X_combined, y_combined)

    # Evaluate on held-out test set
    y_test_pred = clf_final.predict(X_test)

    acc_test = accuracy_score(y_test, y_test_pred)
    f1_macro_test = f1_score(y_test, y_test_pred, average="macro")
    f1_weighted_test = f1_score(y_test, y_test_pred, average="weighted")
    precision_test = precision_score(y_test, y_test_pred, average="weighted", zero_division=0)
    recall_test = recall_score(y_test, y_test_pred, average="weighted", zero_division=0)

    report_test = classification_report(
        y_test, y_test_pred,
        target_names=["Declining", "Stable", "Growing"],
        output_dict=True
    )
    cm_test = confusion_matrix(y_test, y_test_pred).tolist()

    # Also do stratified k-fold on training data for stability check
    print("\n[TunedClassifier] Running 5-fold CV for stability check...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_f1_scores = []

    for fold_idx, (train_idx, val_idx) in enumerate(skf.split(X_combined, y_combined)):
        X_train_fold = X_combined.iloc[train_idx]
        X_val_fold = X_combined.iloc[val_idx]
        y_train_fold = y_combined.iloc[train_idx]
        y_val_fold = y_combined.iloc[val_idx]

        clf_fold = RandomForestClassifier(**best_params, n_jobs=1, random_state=42)
        clf_fold.fit(X_train_fold, y_train_fold)
        y_pred_fold = clf_fold.predict(X_val_fold)
        f1_fold = f1_score(y_val_fold, y_pred_fold, average="weighted")
        cv_f1_scores.append(f1_fold)
        print(f"  Fold {fold_idx + 1}: F1={f1_fold:.4f}")

    mean_cv_f1 = np.mean(cv_f1_scores)
    std_cv_f1 = np.std(cv_f1_scores)

    # Feature importance
    importances = {feat: round(float(imp), 4) for feat, imp in zip(features, clf_final.feature_importances_)}

    # Class distribution
    class_counts = y.value_counts().to_dict()
    class_distribution = {LABEL_NAMES[k]: int(v) for k, v in class_counts.items()}

    # Save model
    with open(MODEL_PATH_TUNED, "wb") as f:
        pickle.dump({"model": clf_final, "le_system": le_system, "le_region": le_region}, f)
    print(f"\n[TunedClassifier] Final tuned model saved to {MODEL_PATH_TUNED}")

    metrics = {
        "model": "Random Forest Classifier (Phase 2 Tuned)",
        "total_samples": int(len(X)),
        "train_samples": int(len(X_combined)),
        "test_samples": int(len(X_test)),
        "optimization_method": "Manual Parameter Search (5 combinations tested)",
        "features_used": features,
        "feature_engineering_applied": True,
        "best_hyperparameters": best_params,
        "parameter_combinations_tested": results_by_combo,
        
        "test_set_metrics": {
            "accuracy": round(acc_test, 4),
            "f1_macro": round(f1_macro_test, 4),
            "f1_weighted": round(f1_weighted_test, 4),
            "precision_weighted": round(precision_test, 4),
            "recall_weighted": round(recall_test, 4),
            "classification_report": report_test,
            "confusion_matrix": cm_test
        },
        
        "cv_stability": {
            "mean_f1_weighted": round(mean_cv_f1, 4),
            "std_f1_weighted": round(std_cv_f1, 4),
            "fold_f1_scores": [round(v, 4) for v in cv_f1_scores]
        },
        
        "feature_importances": importances,
        "class_distribution": class_distribution,
        "label_map": LABEL_NAMES
    }

    print("\n[TunedClassifier] === FINAL TEST SET RESULTS ===")
    print(f"  Test Accuracy         : {acc_test:.4f}")
    print(f"  Test F1 Score (macro) : {f1_macro_test:.4f}")
    print(f"  Test F1 Score (wtd)   : {f1_weighted_test:.4f}")
    print(f"  Test Precision (wtd)  : {precision_test:.4f}")
    print(f"  Test Recall (wtd)     : {recall_test:.4f}")
    print(f"\n  CV Stability F1 (wtd) : {mean_cv_f1:.4f} ± {std_cv_f1:.4f}")
    print(f"\n  ✅ Top 3 Most Important Features:")
    top_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:3]
    for feat, imp in top_features:
        print(f"     {feat}: {imp:.4f}")

    return metrics


if __name__ == "__main__":
    train_classifier_tuned()
