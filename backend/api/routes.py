from fastapi import APIRouter, HTTPException
import asyncio
import json
import os
from services.data_cleaning import get_data_summary
from services.rag_service import get_rag_response

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DASHBOARD_DATA_PATH = os.path.join(BASE_DIR, "data", "dashboard_data.json")
MODEL_METRICS_PATH = os.path.join(BASE_DIR, "data", "model_metrics.json")
INTEGRATED_PREDICTIONS_PATH = os.path.join(BASE_DIR, "data", "integrated_predictions.json")

@router.get("/dashboard", tags=["Data"])
async def get_dashboard_data():
    if not os.path.exists(DASHBOARD_DATA_PATH):
        raise HTTPException(status_code=404, detail="Dashboard data not found.")
    with open(DASHBOARD_DATA_PATH, "r") as f:
        return json.load(f)

@router.get("/summary", tags=["Data"])
async def fetch_data_summary():
    summary = await get_data_summary()
    if summary is None:
        raise HTTPException(status_code=404, detail="Cleaned data not found. Please trigger data cleaning.")
    return summary

@router.get("/model-metrics", tags=["ML"])
async def get_model_metrics():
    if not os.path.exists(MODEL_METRICS_PATH):
        raise HTTPException(
            status_code=404,
            detail="Model metrics not found. Run `python models/train_model.py` in the backend directory first."
        )
    with open(MODEL_METRICS_PATH, "r") as f:
        return json.load(f)

@router.get("/integrated-predictions", tags=["ML"])
async def get_integrated_predictions():
    """
    Get integrated predictions coordinating decline classifier + time series forecasts.
    Provides comprehensive species population intelligence with growth inference.
    """
    if not os.path.exists(INTEGRATED_PREDICTIONS_PATH):
        raise HTTPException(
            status_code=404,
            detail="Integrated predictions not found. Run the integrated prediction engine first."
        )
    with open(INTEGRATED_PREDICTIONS_PATH, "r") as f:
        return json.load(f)

@router.get("/species/{species_name}/prediction", tags=["ML"])
async def get_species_prediction(species_name: str):
    """
    Get detailed integrated prediction for a specific species.
    Includes current trend, forecast, and growth inference.
    """
    if not os.path.exists(INTEGRATED_PREDICTIONS_PATH):
        raise HTTPException(
            status_code=404,
            detail="Integrated predictions not found."
        )
    
    with open(INTEGRATED_PREDICTIONS_PATH, "r") as f:
        all_predictions = json.load(f)
    
    # Species name in predictions file uses underscores (e.g., "Acanthis_flammea")
    species_underscore = species_name.replace("-", "_")
    
    if species_underscore not in all_predictions.get("predictions", {}):
        raise HTTPException(
            status_code=404,
            detail=f"Prediction not found for species: {species_name}"
        )
    
    return {
        "species": species_underscore,
        "prediction": all_predictions["predictions"][species_underscore]
    }

@router.post("/chat", tags=["RAG"])
async def rag_chat(message: str):
    reply = get_rag_response(message)
    return {"reply": reply}
