import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW_DATA_PATH = os.path.join(BASE_DIR, "data", "LPD_2024_public.csv")
CLEANED_DATA_PATH = os.path.join(BASE_DIR, "data", "cleaned_wildlife_population.csv")

def clean_and_save_data():
    """Reads the raw CSV, cleans it, calculates growth rate, and saves it."""
    if not os.path.exists(RAW_DATA_PATH):
        raise FileNotFoundError(f"Raw data file not found at {RAW_DATA_PATH}")

    df = pd.read_csv(RAW_DATA_PATH)
    df = df.drop(columns=["Unnamed: 102"], errors="ignore")
    df = df.drop_duplicates()
    
    year_cols = [col for col in df.columns if col.isdigit()]
    
    df_long = df.melt(
        id_vars=["ID", "Binomial", "Country", "Region", "System", "Latitude", "Longitude"],
        value_vars=year_cols,
        var_name="Year",
        value_name="Population"
    )
    
    df_long = df_long.dropna(subset=["Population"])
    df_long["Year"] = df_long["Year"].astype(int)
    df_long["Population"] = pd.to_numeric(df_long["Population"], errors="coerce")
    
    df_long = df_long[(df_long["Latitude"].notnull()) & (df_long["Longitude"].notnull())]
    df_long = df_long[df_long["Population"] > 0]
    df_long = df_long.sort_values(["Binomial", "Year"])
    
    df_long["growth_rate"] = df_long.groupby(["Binomial", "Country"])["Population"].pct_change()
    df_long["growth_rate"] = df_long["growth_rate"].clip(lower=-1.0, upper=1.0)
    df_long = df_long.dropna(subset=["growth_rate"])
    
    os.makedirs(os.path.dirname(CLEANED_DATA_PATH), exist_ok=True)
    df_long.to_csv(CLEANED_DATA_PATH, index=False)
    return df_long

from functools import lru_cache

@lru_cache(maxsize=1)
def _get_cached_summary():
    """Reads the CSV once and caches the summary metrics in memory."""
    if not os.path.exists(CLEANED_DATA_PATH):
        return None
        
    df = pd.read_csv(CLEANED_DATA_PATH)
    
    total_species = df["Binomial"].nunique()
    total_regions = df["Country"].nunique()
    avg_growth = df["growth_rate"].mean() * 100
    
    return {
        "global_decline_rate": f"{avg_growth:.2f}%",
        "tracked_species": int(total_species),
        "vulnerable_regions": int(total_regions)
    }

async def get_data_summary():
    """Async wrapper returning the cached data immediately."""
    return _get_cached_summary()