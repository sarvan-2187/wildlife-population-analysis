# EcoDynamix: Global Species Intelligence

## Problem statement: Modelling global wildlife population dynamics: A higher order computational assessment of species decline (EcoDynamix Engine)

### TechStack
[![My Skills](https://skillicons.dev/icons?i=haskell,py,pytorch,fastapi,react,tailwind)](https://skillicons.dev)

Welcome to the technical documentation for the **EcoDynamix Intelligence Dashboard**. This system is a full-stack computational engine designed to analyze, visualize, and forecast global species population trends using historical data, machine learning, and RAG-powered AI.

## Latest ARIMA Update (March 2026)

- Forecast execution now uses an integrated flow: classifier trend inference + ARIMA(2,1,1) time-series projection + explicit fallback forecasts when full ARIMA output is unavailable.
- Integrated metrics now expose `species_full_predictions`, `species_fallback_predictions`, and `forecast_coverage` for transparent coverage tracking.
- Per-species predictions now include:
- `time_series_model` diagnostics (`type`, `mae`, `rmse`, `residual_std`)
- `forecast.confidence_intervals` for each forecast year (2026-2031)
- Alignment-aware forecast metadata (`forecast_growth_rate`, `forecast_trend_code`, recommendation flags)

## System Architecture

The project follows a split-tier architecture with a high-performance Python backend and a reactive Next.js frontend.

### 1. Backend (FastAPI / Python)
Located in `/backend`, the server handles data orchestration and heavy computation.
- **Entry Point**: `main.py` initializes the FastAPI app with CORS middleware and global routing.
- **API Layer**: `api/routes.py` exposes RESTful endpoints for the dashboard, chat interactions, and model metrics.
- **Analytics Engine**: `services/data_analysis.py` processes raw LPD CSV data into structured JSON, calculating regional growth rates and species-level metrics.
- **RAG Service**: `services/rag_service.py` integrates **ChromaDB** for vector retrieval and **Groq (Llama-3.3)** for intelligent conversational synthesis of species facts.

### 2. Data Integrity Layer (Haskell)
The project uses a dedicated Haskell script (`validate.hs`) to perform **Structural Data Validation**.
- **Role**: Validates the `dashboard_data.json` payload before it is consumed by the frontend.
- **Checks**: Ensures the presence of critical statistical nodes such as `global_decline_rate`, `vulnerable_regions`, and `trend_data`.
- **Purpose**: Provides a type-safe verification layer to prevent runtime failures in the UI due to missing telemetry data.

### 3. Frontend (Next.js / TypeScript)
Located in `/frontend`, the dashboard provides a premium, interactive user experience.
- **Dashboard (`/`)**: Features a 5-tier global vulnerability map (differentiating between Severe Decline and Growth) and historical population trend charts using Recharts.
- **Species Inventory (`/species`)**: A searchable, sortable table listing 5,000+ species with common names, scientific binomials, and ecosystem statuses.
- **RAG Chat (`/chat`)**: A conversational interface for querying the wildlife database semantically.
- **ML Insights (`/models`)**: Visualizes ARIMA forecasts (2026–2031) and Random Forest classifier metrics.

### 3. ML & Data Pipeline
Located in `/backend/models` and `/data`.
- **Classification**: A Random Forest model (`decline_classifier.py`) categorizes species health based on historical momentum.
- **Forecasting**: The integrated prediction engine (`integrated_prediction_engine.py`) coordinates ARIMA(2,1,1) forecasts with classifier outputs and fallback generation for full forecast coverage.
- **Normalization**: A dedicated pipeline ensures all growth rates are clipped to a realistic [-99%, +100%] range for data integrity.

## Key Features

### Oceanic Focal Mode
A first-of-its-kind toggle on the world map that allows researchers to switch between **General Ecosystems** and **Oceanic Focus**. This mode dynamically updates map hex-colors to highlight maritime recovery vs. decline.

### AI Name Enrichment
Uses a specialized mapping layer to resolve scientific binomials (e.g., *Gadus morhua*) into readable common names (e.g., *Atlantic Cod*), significantly improving accessibility for non-expert users.

### Portable RAG Knowledge Base
The system indexes over 5,000 species records locally, enabling the AI to answer extremely specific questions about species biomes and regional health without external database dependency.

### Haskell-Powered Telemetry Guard
A unique addition to our pipeline, the **Haskell Verification Engine** acts as a structural guardrail. It guarantees that the dashboard's telemetry data is consistent and valid before every deployment, leveraging Haskell's reliability for critical data checks.


## Local Development

### Prerequisites
- Python 3.9+
- Node.js 18+
- Groq API Key (for RAG features)

### Running the System
1. **Backend**: `uvicorn main:app --reload --port 8000` inside `/backend`
2. **Frontend**: `npm run dev` inside `/frontend`
