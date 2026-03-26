# EcoDynamix Integrated Prediction Engine - Integration Guide

## Overview

The integrated prediction engine coordinates the optimized Decline Classifier with ARIMA time series forecasting to provide comprehensive species population intelligence. This document explains the integration architecture, how to run the system, and how to validate the predictions.

## Architecture

### Components

1. **Decline Classifier Optimized** (`backend/models/decline_classifier_optimized.py`)
   - Random Forest classifier with GridSearchCV hyperparameter tuning
   - Classifies species as: Declining (< -5%), Stable (-5% to +5%), Growing (> +5%)
   - Uses engineered features: growth rates, lag indicators, geographic interactions
   - Output: Trend classification + confidence score

2. **Time Series Enhanced** (`backend/models/time_series_enhanced.py`)
   - ARIMA(2,1,1) model for population forecasting (2026-2031)
   - Calculates MAE, RMSE, and confidence intervals
   - Provides 6-year population projections

3. **Integrated Prediction Engine** (`backend/models/integrated_prediction_engine.py`) - **NEW**
   - Combines classifier predictions with time series forecasts
   - Calculates growth rate inference from forecasted populations
   - Validates classifier-forecast alignment
   - Returns comprehensive per-species predictions with integration metrics

4. **API Endpoints** (`backend/api/routes.py`)
   - `GET /api/v1/integrated-predictions` - All integrated predictions
   - `GET /api/v1/species/{species_name}/prediction` - Single species detailed prediction

5. **Frontend Components**
   - Enhanced Species Page with clickable growth charts
   - Growth Inference Chart component for visualization
   - Models page with integrated metrics dashboard

### Data Flow

```
Raw Data (LPD 2024)
    ↓
Data Cleaning & Feature Engineering
    ↓
    ├─→ Decline Classifier (Current Trend) ──→ Trend Classification
    │                                          + Confidence Score
    ├─→ Time Series ARIMA (Population)  ──→ Forecasted Populations
    │                                         + Confidence Intervals
    ↓
Integrated Prediction Engine
    ├─→ Calculate Forecast Trend (from forecasted growth rate)
    ├─→ Compare with Classifier Trend
    ├─→ Calculate Alignment Score
    └─→ Generate Comprehensive Prediction
    ↓
Output (JSON)
    ├─→ API: /api/v1/integrated-predictions
    └─→ Frontend UI Visualization
```

## Setup & Execution

### Step 1: Train Classifier (if not already trained)

```bash
cd backend
python models/decline_classifier_optimized.py
```

This generates: `data/decline_classifier_optimized.pkl`

### Step 2: Run Integrated Prediction Engine

```bash
cd backend
python models/integrated_prediction_engine.py
```

This generates: `data/integrated_predictions.json`

Output format:
```json
{
  "metrics": {
    "engine_type": "Integrated Prediction Engine (Classifier + ARIMA TimeSeries)",
    "species_evaluated": 15,
    "species_successful": 14,
    "success_rate": 0.9333,
    "forecast_start_year": 2026,
    "forecast_end_year": 2031
  },
  "predictions": {
    "Acanthis_flammea": {
      "species": "Acanthis_flammea",
      "display_name": "Acanthis flammea",
      "current_trend": {
        "trend": "Stable",
        "trend_code": 1,
        "confidence": 0.8234,
        "color": "#f59e0b"
      },
      "forecast_trend": {
        "forecast_growth_rate": -2.45,
        "forecast_trend": "Stable",
        "forecast_trend_code": 1,
        "alignment_with_classifier": true,
        "alignment_score": 0.8234
      },
      "integration": {
        "classifier_confidence": 0.8234,
        "trend_alignment": true,
        "alignment_score": 0.8234,
        "recommendation": "HIGH_CONFIDENCE"
      },
      "time_series_model": {
        "type": "ARIMA(2,1,1)",
        "mae": 1250.45,
        "rmse": 1687.23
      },
      "forecast": {
        "years": [2026, 2027, 2028, 2029, 2030, 2031],
        "populations": [45250, 43180, 41325, 39670, 38195, 36885],
        "confidence_intervals": {...}
      },
      "historical_data": {...}
    },
    ...
  }
}
```

### Step 3: Start Backend Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The integrated predictions will be available at:
- `http://localhost:8000/api/v1/integrated-predictions`
- `http://localhost:8000/api/v1/species/{species_name}/prediction`

### Step 4: Start Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

## UI Features

### Species Page (`/species`)

- **Enhanced Table**: New "Forecast" column showing predicted trend
- **Interactive Rows**: Click any species to open detailed growth chart modal
- **Growth Chart Modal** includes:
  - Current trend classification with classifier confidence
  - Population trajectory visualization (historical + forecast)
  - Forecast growth inference with year-by-year projections
  - Classifier-forecast alignment validation
  - Recommendation status (HIGH_CONFIDENCE / REVIEW_FORECAST)

### Models Page (`/models`)

- **New Integrated Metrics Section**: Shows engine statistics
- **Sample Predictions Grid**: Top 6 species with:
  - Current vs. Forecast trend comparison
  - Classifier confidence scores
  - Alignment status badges
  - Current population display

## Validation & Testing

### 1. Data Consistency Check

Verify the integrated predictions have correct structure:

```bash
cd backend
python -c "
import json
with open('data/integrated_predictions.json') as f:
    data = json.load(f)
    
print(f'Species evaluated: {data[\"metrics\"][\"species_evaluated\"]}')
print(f'Success rate: {data[\"metrics\"][\"success_rate\"]}')

# Check first species
species = list(data['predictions'].keys())[0]
pred = data['predictions'][species]

print(f'\\nSample species: {species}')
print(f'Current trend: {pred[\"current_trend\"][\"trend\"]}')
print(f'Forecast trend: {pred[\"forecast_trend\"][\"forecast_trend\"]}')
print(f'Alignment: {pred[\"integration\"][\"trend_alignment\"]}')
"
```

### 2. API Validation

Test endpoints:

```bash
# Get all integrated predictions
curl http://localhost:8000/api/v1/integrated-predictions | jq '.metrics'

# Get specific species prediction
curl http://localhost:8000/api/v1/species/Acanthis_flammea/prediction | jq '.prediction.integration'
```

### 3. Trend Alignment Validation

Check alignment between classifier and forecast:

```bash
cd backend
python -c "
import json
with open('data/integrated_predictions.json') as f:
    data = json.load(f)

aligned_count = 0
misaligned_count = 0

for species, pred in data['predictions'].items():
    if pred['integration']['trend_alignment']:
        aligned_count += 1
    else:
        misaligned_count += 1
        print(f'{species}:')
        print(f'  Current: {pred[\"current_trend\"][\"trend\"]}')
        print(f'  Forecast: {pred[\"forecast_trend\"][\"forecast_trend\"]}')

print(f'\\nAlignment Summary:')
print(f'Aligned: {aligned_count}')
print(f'Misaligned: {misaligned_count}')
print(f'Alignment Rate: {aligned_count / (aligned_count + misaligned_count) * 100:.1f}%')
"
```

### 4. Frontend Integration Testing

#### Species Page
1. Navigate to `/species`
2. Verify table shows "Forecast" column with trend icons
3. Click on a species row
4. Modal should appear with:
   - Current Status Classification section
   - Population Trajectory chart
   - Forecast Growth Inference metrics
   - Classifier-Forecast Alignment validation
   - Population Forecast table

#### Models Page
1. Navigate to `/models`
2. Scroll to "Integrated Prediction Engine" section
3. Verify metrics display:
   - Species Evaluated
   - Successful Predictions
   - Success Rate
   - Forecast Horizon
4. Check "Sample Predictions with Trend Alignment" grid shows 6 species

## Troubleshooting

### Issue: `integrated_predictions.json` not found

**Solution**: Run the integrated prediction engine first:
```bash
python backend/models/integrated_prediction_engine.py
```

### Issue: API returns 404 for integrated endpoints

**Solution**: Ensure the backend is using the updated `api/routes.py` with new endpoints

### Issue: Frontend shows incomplete data

**Solution**: 
1. Clear browser cache
2. Check browser console for API errors
3. Verify backend is running and accessible

### Issue: Misaligned trends are high

**Possible causes**:
- Insufficient historical data for species
- Recent environmental changes not captured by training data
- Recommend reviewing individual species with "REVIEW_FORECAST" status

## Model Performance Expectations

### Classifier Performance (from training)
- Accuracy: ~99.15%
- F1 Score (weighted): ~0.9915
- Confidence intervals: Generally 80-95%

### Time Series Performance
- Average MAE: ~1,500-5,000 depending on species volatility
- Average RMSE: ~2,000-8,000
- Forecast horizon: 2026-2031 (6 years)

### Alignment Rate
- Expected: ~80-90% of species should have aligned classifier-forecast predictions
- High misalignment may indicate:
  - Recent population changes not in historical trend
  - Species with high volatility
  - Environmental shifts

## Next Steps & Enhancements

1. **Confidence Interval Widening**: Currently fixed; can be made dynamic based on series volatility
2. **Seasonal Decomposition**: Add SARIMA for species with clear seasonal patterns
3. **Multi-Model Ensemble**: Combine ARIMA with Prophet for improved forecasts
4. **Real-time Updates**: Integrate streaming data for live predictions
5. **Anomaly Detection**: Flag species with unexpected trend changes

## File Locations

```
backend/
├── models/
│   ├── decline_classifier_optimized.py    (Classifier training)
│   ├── integrated_prediction_engine.py    (NEW - Main integration)
│   ├── time_series_enhanced.py            (Time series models)
│   └── predict_species.py                 (Single predictions)
├── api/
│   └── routes.py                          (UPDATED - New endpoints)
├── data/
│   ├── decline_classifier_optimized.pkl   (Trained classifier)
│   ├── integrated_predictions.json        (NEW - Output)
│   └── model_metrics.json                 (Combined metrics)

frontend/
├── components/
│   └── GrowthInferenceChart.tsx          (NEW - Chart component)
├── app/
│   ├── species/page.tsx                   (UPDATED - Enhanced UI)
│   ├── models/page.tsx                    (UPDATED - New metrics)
└── lib/
    └── api-config.ts                      (UPDATED - New endpoints)
```

---

**Last Updated**: March 2026
**Version**: 1.0.0 - Integrated Prediction Engine
