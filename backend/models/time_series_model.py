import pandas as pd
import numpy as np
import os
import warnings
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_absolute_error, mean_squared_error

warnings.filterwarnings("ignore")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLEANED_DATA_PATH = os.path.join(BASE_DIR, "data", "cleaned_wildlife_population.csv")

# Sample with species that have known stronger trends and more recent data
SAMPLE_SPECIES = [
    "Acanthis_flammea", 
    "Aegithalos_caudatus",
    "Gadus_morhua",
    "Alauda_arvensis"
]

TARGET_END_YEAR = 2031
DISPLAY_START_YEAR = 2026


def fit_arima_for_species(series: pd.Series, order=(2, 1, 1)):
    """Fit ARIMA on a population time series and return MAE, RMSE, and forecast."""
    if len(series) < 12:
        return None  # more data needed for (2,1,1)

    split = int(len(series) * 0.8)
    train, test = series.iloc[:split], series.iloc[split:]

    try:
        # ARIMA(2,1,1) helps capture momentum and prevents collapsing to a flat line too early
        model = ARIMA(train, order=order)
        result = model.fit()

        # In-sample forecast for test window
        forecast_test = result.forecast(steps=len(test))
        mae = mean_absolute_error(test, forecast_test)
        rmse = np.sqrt(mean_squared_error(test, forecast_test))

        # Future forecast (until TARGET_END_YEAR)
        last_year = int(series.index[-1])
        needed_steps = TARGET_END_YEAR - last_year
        if needed_steps <= 0:
            return None

        # Fit on full data for real forecast
        future_forecast_model = ARIMA(series, order=order).fit()
        future_vals = future_forecast_model.forecast(steps=needed_steps).tolist()

        all_future_years = [last_year + i + 1 for i in range(needed_steps)]
        
        # Filter for only 2026 and beyond
        forecast_dict = {}
        for y, v in zip(all_future_years, future_vals):
            if y >= DISPLAY_START_YEAR:
                forecast_dict[str(y)] = round(v, 2)

        return {
            "mae": round(float(mae), 4),
            "rmse": round(float(rmse), 4),
            "forecast": forecast_dict,
        }
    except Exception:
        return None


def run_time_series_analysis() -> dict:
    """Runs ARIMA on a sample of species, returns aggregate metrics and per-species forecasts."""
    print("[TimeSeries] Loading data...")
    df = pd.read_csv(CLEANED_DATA_PATH)

    # Aggregate population per species per year (global sum)
    species_results = {}
    mae_list, rmse_list = [], []

    for species in SAMPLE_SPECIES:
        subset = df[df["Binomial"] == species].groupby("Year")["Population"].sum().sort_index()
        result = fit_arima_for_species(subset)
        if result:
            species_results[species] = result
            mae_list.append(result["mae"])
            rmse_list.append(result["rmse"])
            print(f"  [{species}] MAE={result['mae']:.2f}  RMSE={result['rmse']:.2f}")
        else:
            print(f"  [{species}] Skipped (insufficient data or error)")

    avg_mae = round(float(np.mean(mae_list)), 4) if mae_list else None
    avg_rmse = round(float(np.mean(rmse_list)), 4) if rmse_list else None

    metrics = {
        "model": "ARIMA(2,1,1) Time Series Forecaster",
        "arima_order": [2, 1, 1],
        "species_evaluated": len(species_results),
        "forecast_horizon_years": 6,  # 2026 to 2031
        "avg_mae": avg_mae,
        "avg_rmse": avg_rmse,
        "per_species": species_results,
    }

    print(f"\n[TimeSeries] === RESULTS ===")
    print(f"  Avg MAE  : {avg_mae}")
    print(f"  Avg RMSE : {avg_rmse}")
    return metrics


if __name__ == "__main__":
    run_time_series_analysis()
