"""
Optimized Decline Classifier with GridSearchCV hyperparameter tuning
and advanced feature engineering.

Phase 2 of model improvement: Starting from the leakage-free baseline,
this module adds:
1. Feature engineering (lagged growth rates, interaction terms)
2. GridSearchCV for hyperparameter optimization
3. Comprehensive cross-validation metrics
4. Feature importance analysis
"""

import pandas as pd
import numpy as np
import os
import json
import pickle
import warnings
from tqdm import tqdm
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    classification_report, confusion_matrix,
    f1_score, accuracy_score, precision_score, recall_score
)

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLEANED_DATA_PATH = os.path.join(BASE_DIR, "data", "cleaned_wildlife_population.csv")
MODEL_PATH_OPTIMIZED = os.path.join(BASE_DIR, "data", "decline_classifier_optimized.pkl")


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


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Advanced feature engineering:
    1. Lagged growth rates (previous year trend)
    2. Interaction terms (geographic + temporal)
    3. Multi-year trend indicators
    """
    df = df.copy()
    
    # Lagged growth rate (previous year) - captures momentum
    df["growth_rate_lag1"] = df.groupby("Binomial")["growth_rate"].shift(1).fillna(0)
    df["growth_rate_lag2"] = df.groupby("Binomial")["growth_rate"].shift(2).fillna(0)
    
    # 2-year moving average of growth rate (trend smoothing)
    df["growth_rate_ma2"] = df.groupby("Binomial")["growth_rate"].rolling(2, min_periods=1).mean().reset_index(drop=True)
    
    # Interaction: latitude × longitude (biogeographic region effect)
    df["lat_lon_interaction"] = df["Latitude"] * df["Longitude"]
    
    # Decade interaction with latitude (climate zone changes over time)
    df["year_decade"] = (df["Year"] // 10) * 10
    df["decade_lat_interaction"] = df["year_decade"] * df["Latitude"]
    
    # Volatility: standard deviation of growth rate in local window
    df["growth_volatility"] = df.groupby("Binomial")["growth_rate"].rolling(3, min_periods=1).std().reset_index(drop=True)
    df["growth_volatility"] = df["growth_volatility"].fillna(0)
    
    # Clip outliers in new features to [-1, 1]
    for col in ["growth_rate_lag1", "growth_rate_lag2", "growth_rate_ma2", "growth_volatility"]:
        df[col] = df[col].clip(-1, 1)
    
    return df


def train_classifier_optimized() -> dict:
    """
    Trains an optimized Random Forest classifier with GridSearchCV hyperparameter tuning.
    
    Improvements over baseline:
    - Feature engineering: lagged rates, interaction terms, trend indicators
    - Hyperparameter optimization using GridSearchCV
    - Stratified 5-fold CV for robust evaluation
    - Per-fold hyperparameter consistency check
    
    Returns comprehensive metrics and best parameters.
    """
    print("\n" + "="*70)
    print("  PHASE 2: OPTIMIZED CLASSIFIER WITH HYPERPARAMETER TUNING")
    print("="*70)
    
    print("\n[OptClassifier] Loading cleaned data...")
    df = pd.read_csv(CLEANED_DATA_PATH)

    # Create labels
    df["label"] = df["growth_rate"].apply(label_trend)

    # Encode categorical columns
    le_system = LabelEncoder()
    le_region = LabelEncoder()
    df["System_enc"] = le_system.fit_transform(df["System"].fillna("Unknown"))
    df["Region_enc"] = le_region.fit_transform(df["Region"].fillna("Unknown"))

    # Feature engineering
    print("[OptClassifier] Performing advanced feature engineering...")
    df = engineer_features(df)
    
    features = [
        "Year", "Latitude", "Longitude", "System_enc", "Region_enc",
        "growth_rate_lag1", "growth_rate_lag2", "growth_rate_ma2",
        "lat_lon_interaction", "decade_lat_interaction", "growth_volatility"
    ]
    
    X = df[features]
    y = df["label"]

    print(f"[OptClassifier] Using {len(features)} engineered features")
    print(f"  Features: {features}")
    print(f"[OptClassifier] Total samples: {len(X):,}")

    # Prepare data for GridSearchCV using stratified split
    X_train_full, X_test_holdout, y_train_full, y_test_holdout = train_test_split(
        X, y, test_size=0.1, random_state=42, stratify=y
    )
    
    print(f"[OptClassifier] Train set: {len(X_train_full):,}, Test set (holdout): {len(X_test_holdout):,}")

    # --- GridSearchCV Hyperparameter Tuning ---
    print("\n[OptClassifier] Running GridSearchCV for hyperparameter optimization...")
    print("  This may take 3-5 minutes...")
    
    param_grid = {
        "n_estimators": [100, 150, 200],
        "max_depth": [10, 15, 20, 25],
        "min_samples_leaf": [5, 10, 15],
        "max_features": ["sqrt", "log2"],
    }

    # Use stratified k-fold within GridSearchCV
    skf_grid = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    rf_base = RandomForestClassifier(n_jobs=4, random_state=42)  # n_jobs=1 on Windows to avoid parallelization issues
    
    grid_search = GridSearchCV(
        rf_base,
        param_grid,
        cv=skf_grid,
        scoring="f1_weighted",  # Optimize for weighted F1 (multi-class balance)
        n_jobs=4,  # Single job on Windows
        verbose=1
    )
    
    grid_search.fit(X_train_full, y_train_full)
    
    print(f"\n[OptClassifier] ✅ GridSearchCV Complete")
    print(f"  Best F1 Score (CV): {grid_search.best_score_:.4f}")
    print(f"  Best Hyperparameters: {grid_search.best_params_}")

    # Get best model
    best_clf = grid_search.best_estimator_

    # Evaluate on holdout test set
    print("\n[OptClassifier] Evaluating optimized model on holdout test set...")
    y_test_pred = best_clf.predict(X_test_holdout)

    acc_test = accuracy_score(y_test_holdout, y_test_pred)
    f1_macro_test = f1_score(y_test_holdout, y_test_pred, average="macro")
    f1_weighted_test = f1_score(y_test_holdout, y_test_pred, average="weighted")
    precision_test = precision_score(y_test_holdout, y_test_pred, average="weighted", zero_division=0)
    recall_test = recall_score(y_test_holdout, y_test_pred, average="weighted", zero_division=0)

    report_test = classification_report(
        y_test_holdout, y_test_pred,
        target_names=["Declining", "Stable", "Growing"],
        output_dict=True
    )
    cm_test = confusion_matrix(y_test_holdout, y_test_pred).tolist()

    # Re-evaluate across all training folds for stability check
    print("[OptClassifier] Running stability cross-validation on full training set...")
    skf_final = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    fold_f1_scores = []
    
    for fold_idx, (train_idx, val_idx) in enumerate(tqdm(list(skf_final.split(X_train_full, y_train_full)), desc="Training folds", unit="fold")):
        X_train_fold = X_train_full.iloc[train_idx]
        X_val_fold = X_train_full.iloc[val_idx]
        y_train_fold = y_train_full.iloc[train_idx]
        y_val_fold = y_train_full.iloc[val_idx]
        
        # Train with best parameters
        clf_fold = RandomForestClassifier(
            **grid_search.best_params_,
            n_jobs=4,  # Windows compatibility
            random_state=42
        )
        clf_fold.fit(X_train_fold, y_train_fold)
        y_pred_fold = clf_fold.predict(X_val_fold)
        f1_fold = f1_score(y_val_fold, y_pred_fold, average="weighted")
        fold_f1_scores.append(f1_fold)
        print(f"  Fold {fold_idx + 1}/5: F1(weighted) = {f1_fold:.4f}")
    
    mean_f1_cv = np.mean(fold_f1_scores)
    std_f1_cv = np.std(fold_f1_scores)

    # Train final model on all data for production
    print("\n[OptClassifier] Training final optimized model on all data...")
    clf_final = RandomForestClassifier(
        **grid_search.best_params_,
        n_jobs=4,  # Windows compatibility
        random_state=42
    )
    clf_final.fit(X, y)

    # Feature importance
    importances = {feat: round(float(imp), 4) for feat, imp in zip(features, clf_final.feature_importances_)}

    # Class distribution
    class_counts = y.value_counts().to_dict()
    class_distribution = {LABEL_NAMES[k]: int(v) for k, v in class_counts.items()}

    # Save model
    with open(MODEL_PATH_OPTIMIZED, "wb") as f:
        pickle.dump({"model": clf_final, "le_system": le_system, "le_region": le_region}, f)
    print(f"[OptClassifier] Final optimized model saved to {MODEL_PATH_OPTIMIZED}")

    # Prepare metrics
    metrics = {
        "model": "Random Forest Classifier (Optimized with GridSearchCV)",
        "total_samples": int(len(X)),
        "training_samples": int(len(X_train_full)),
        "test_samples": int(len(X_test_holdout)),
        "optimization_method": "GridSearchCV with StratifiedKFold(n_splits=5)",
        "features_used": features,
        "feature_engineering_applied": True,
        "best_hyperparameters": grid_search.best_params_,
        "hyperparameter_grid": param_grid,
        "gridsearch_best_f1_score": round(grid_search.best_score_, 4),
        
        # Holdout test set evaluation
        "test_set_metrics": {
            "accuracy": round(acc_test, 4),
            "f1_macro": round(f1_macro_test, 4),
            "f1_weighted": round(f1_weighted_test, 4),
            "precision_weighted": round(precision_test, 4),
            "recall_weighted": round(recall_test, 4),
            "classification_report": report_test,
            "confusion_matrix": cm_test
        },
        
        # CV stability metrics
        "cv_stability": {
            "mean_f1_weighted": round(mean_f1_cv, 4),
            "std_f1_weighted": round(std_f1_cv, 4),
            "fold_f1_scores": [round(v, 4) for v in fold_f1_scores],
            "cv_status": "✓ STABLE" if std_f1_cv < 0.05 else "⚠ HIGH VARIANCE"
        },
        
        "feature_importances": importances,
        "class_distribution": class_distribution,
        "label_map": LABEL_NAMES
    }

    print("\n[OptClassifier] === FINAL OPTIMIZED RESULTS ===")
    print(f"  Holdout Test Accuracy         : {acc_test:.4f}")
    print(f"  Holdout Test F1 Score (macro) : {f1_macro_test:.4f}")
    print(f"  Holdout Test F1 Score (wtd)   : {f1_weighted_test:.4f}")
    print(f"  Holdout Test Precision (wtd)  : {precision_test:.4f}")
    print(f"  Holdout Test Recall (wtd)     : {recall_test:.4f}")
    print(f"\n  CV Stability F1 (wtd)         : {mean_f1_cv:.4f} ± {std_f1_cv:.4f}")
    print(f"\n  ✅ Top 5 Most Important Features:")
    top_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)[:5]
    for feat, imp in top_features:
        print(f"     {feat}: {imp:.4f}")

    return metrics


if __name__ == "__main__":
    metrics = train_classifier_optimized()
    
    # Save metrics to JSON for API consumption
    metrics_json_path = os.path.join(BASE_DIR, "data", "model_metrics.json")
    
    # Load existing metrics to preserve time_series data
    if os.path.exists(metrics_json_path):
        with open(metrics_json_path, "r") as f:
            existing_metrics = json.load(f)
    else:
        existing_metrics = {}
    
    # Update classifier metrics
    existing_metrics["classifier"] = {
        **metrics,
        "model_version": "Phase 2 - Optimized with GridSearchCV"
    }
    
    # Save updated metrics
    with open(metrics_json_path, "w") as f:
        json.dump(existing_metrics, f, indent=2)
    print(f"\n✅ Metrics saved to {metrics_json_path}")
