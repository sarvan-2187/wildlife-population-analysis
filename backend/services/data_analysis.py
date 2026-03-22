import pandas as pd
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLEANED_DATA_PATH = os.path.join(BASE_DIR, "data", "cleaned_wildlife_population.csv")
OUTPUT_JSON_PATH = os.path.join(BASE_DIR, "data", "dashboard_data.json")

def generate_dashboard_data():
    print(f"Loading {CLEANED_DATA_PATH}...")
    if not os.path.exists(CLEANED_DATA_PATH):
        raise FileNotFoundError(f"Cleaned data not found at {CLEANED_DATA_PATH}")

    df = pd.read_csv(CLEANED_DATA_PATH)
    
    # 1. Global Yearly Population Trend
    # Summing population across all species by year
    yearly_trend = df.groupby("Year")["Population"].sum().reset_index()
    # Filter for modern years with sufficient data (stop at 2017 to avoid sparse years)
    yearly_trend = yearly_trend[(yearly_trend["Year"] >= 1990) & (yearly_trend["Year"] <= 2017)]
    trend_data = [{"year": str(int(row["Year"])), "population": int(row["Population"])} for _, row in yearly_trend.iterrows()]

    # 2. Regional Vulnerability (by Country & System)
    regional_growth = df.groupby("Country")["growth_rate"].mean().reset_index()
    marine_growth = df[df["System"] == "Marine"].groupby("Country")["growth_rate"].mean().reset_index()
    marine_growth.columns = ["Country", "marine_growth"]
    
    species_count = df.groupby("Country")["Binomial"].nunique().reset_index()
    
    # Merge all regional stats
    regional_details = pd.merge(regional_growth, species_count, on="Country")
    regional_details = pd.merge(regional_details, marine_growth, on="Country", how="left")
    
    def get_status(g):
        if pd.isna(g): return "No Data"
        if g < -0.1: return "Severe Decline"
        if g < 0: return "Mild Decline"
        return "Stable / Growing"

    regional_data = {}
    for _, row in regional_details.iterrows():
        regional_data[row["Country"]] = {
            "growth_rate": float(row["growth_rate"]),
            "marine_growth": float(row["marine_growth"]) if not pd.isna(row["marine_growth"]) else None,
            "species_count": int(row["Binomial"]),
            "status": get_status(row["growth_rate"]),
            "marine_status": get_status(row["marine_growth"])
        }
    
    # Load AI-enriched species mapping
    mapping_path = os.path.join(BASE_DIR, "data", "species_mapping.json")
    species_mapping = {}
    if os.path.exists(mapping_path):
        with open(mapping_path, "r") as f:
            species_mapping = json.load(f)

    # 3. Species-wise Summary
    species_grouped = df.groupby("Binomial").agg({
        "growth_rate": "mean",
        "Population": "last",
        "System": "first",
        "Region": "first"
    }).reset_index()
    
    species_list = []
    for _, row in species_grouped.iterrows():
        b_name = row["Binomial"]
        common_name = species_mapping.get(b_name, b_name.replace("_", " ").title())
        
        g = float(row["growth_rate"])
        status = "Declining" if g < -0.05 else "Growing" if g > 0.05 else "Stable"
        species_list.append({
            "binomial": b_name.replace("_", " "),
            "name": common_name,
            "system": row["System"],
            "region": row["Region"],
            "growth": round(float(g) * 100, 2),
            "pop": int(row["Population"]),
            "status": status
        })

    # Sort species by growth (declining first)
    species_list.sort(key=lambda x: x["growth"])

    # 4. Overall Summary Stats
    total_species = int(df["Binomial"].nunique())
    total_regions = int(df["Country"].nunique())
    vulnerable_count = int((regional_growth["growth_rate"] < 0).sum())

    # Use a robust global metric: the average of all species growth rates
    global_growth_pct = float(df["growth_rate"].mean() * 100)

    dashboard_payload = {
        "summary": {
            "global_decline_rate": f"{global_growth_pct:+.2f}%",
            "tracked_species": total_species,
            "vulnerable_regions": vulnerable_count
        },
        "trend_data": trend_data,
        "regional_data": regional_data,
        "species_data": species_list
    }

    print(f"Analysis complete. Saving to {OUTPUT_JSON_PATH}...")
    with open(OUTPUT_JSON_PATH, "w") as f:
        json.dump(dashboard_payload, f, indent=4)
    print("Saved successfully.")

if __name__ == "__main__":
    generate_dashboard_data()
