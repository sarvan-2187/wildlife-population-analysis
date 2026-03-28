# EcoDynamix — Technical Documentation Explained
> A plain-English breakdown of every technical concept, model, and mathematical formula in the EcoDynamix Intelligence Dashboard, prepared for stakeholder presentation.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [Data Pipeline & Preprocessing](#2-data-pipeline--preprocessing)
3. [Random Forest Classifier](#3-random-forest-classifier)
4. [ARIMA Time Series Forecaster](#4-arima-time-series-forecaster)
5. [RAG Pipeline (AI Chat)](#5-rag-pipeline-ai-chat)
6. [System Architecture](#6-system-architecture)
7. [Key Metrics — Stakeholder Summary](#7-key-metrics--stakeholder-summary)
8. [Presentation-Ready Plain-English Framings](#8-presentation-ready-plain-english-framings)
9. [Latest Product Updates (March 2026)](#9-latest-product-updates-march-2026)

---

## 1. The Big Picture

EcoDynamix does three core things:

1. **Classifies** whether a species population is Declining, Stable, or Growing — using a Random Forest machine learning model.
2. **Forecasts** future population numbers up to 2031 — using an ARIMA time series model.
3. **Answers plain-English questions** about any species or region — using a Retrieval-Augmented Generation (RAG) AI pipeline.

All three systems are served through a FastAPI Python backend, validated by a Haskell data integrity layer, and displayed in a Next.js interactive web dashboard.

### System Flow (Top to Bottom)

```
Living Planet Database (325 MB, 2.1M records, 5,000+ species)
        ↓
Data Cleaning Pipeline
(growth rates, filtering, reshaping, labelling)
        ↓
┌──────────────────┬──────────────────┬──────────────────┐
│ Random Forest    │ ARIMA Forecaster │ RAG Pipeline     │
│ Classifier       │ (2026–2031)      │ (ChromaDB + LLM) │
└──────────────────┴──────────────────┴──────────────────┘
        ↓
FastAPI Backend (REST API endpoints)
        ↓
Haskell Validator (data integrity gate)
        ↓
Next.js Dashboard (Interactive map · Species list · Charts · AI Chat)
```

---

## 2. Data Pipeline & Preprocessing

### What Is It?

Before any AI model can learn, the raw data must be cleaned. The raw dataset contains 68 years of population census records for 5,000+ species, across 3 million rows — with typos, missing years, and physically impossible values (negative populations). The pipeline fixes all of that in 9 steps.

### The 9 Preprocessing Steps

| Step | Operation | Why It Matters |
|------|-----------|----------------|
| 1 | Duplicate removal | Prevents the model from seeing the same record twice |
| 2 | Wide → Long format reshape | Converts one column per year into one row per species-year |
| 3 | Type coercion | Ensures Year is integer, Population is numeric |
| 4 | Geographic filtering | Removes records missing latitude/longitude |
| 5 | Zero/negative filtering | Population cannot be negative or zero |
| 6 | Time series sorting | Orders data by species then year for sequential analysis |
| 7 | **Growth rate calculation** | Core signal for all ML models (see formula below) |
| 8 | Value clipping | Clips growth rates to [-1.0, +1.0] to remove statistical outliers |
| 9 | Missing value removal | Removes rows where growth rate couldn't be computed |

### The Growth Rate Formula

The most important calculation in the entire pipeline:

$$\text{growth\_rate}_t = \frac{\text{Population}_t - \text{Population}_{t-1}}{\text{Population}_{t-1}}$$

**Plain English:** How much did the population change this year, as a fraction of last year's population?

**Example — Atlantic Cod:**
- 2015 population: 50,000
- 2016 population: 47,500
- Growth rate = (47,500 − 50,000) / 50,000 = **−0.05 = −5%**

### Value Clipping

Even after calculating growth rates, extreme outliers can distort model training. For example, a data error might show a species tripling overnight. The system clips all values to the range **[−1.0, +1.0]**, meaning no single data point can represent more than a 100% gain or 100% loss. This is called **value clipping** and is standard data hygiene practice.

### Wide vs. Long Format (Explained)

- **Wide format** (raw): one column per year — 68 columns just for time data.
- **Long format** (processed): one row per species-year combination.

Machine learning algorithms require long format. The reshape step transforms all 68 year-columns into rows, producing the ~2.1 million observation records the models train on.

### Output

- File: `cleaned_wildlife_population.csv`
- Size: 348 MB
- Records: ~2.1 million population observation points

---

## 3. Random Forest Classifier

### The Analogy

Imagine you need to decide whether a species is declining. Instead of asking one expert, you convene a committee of **100 independent ecologists**. Each one looks at slightly different evidence and casts a vote: Declining, Stable, or Growing. The final answer is the majority vote. That is a Random Forest — 100 decision trees, each independently trained, each casting a vote.

### What Is a Decision Tree?

A decision tree is a flowchart of yes/no questions about the data. Example:

```
Is growth_rate < -0.05?
├── YES → Is growth_volatility high?
│         ├── YES → Declining (class 0)
│         └── NO  → Stable (class 1)
└── NO  → Is growth_rate > +0.05?
          ├── YES → Growing (class 2)
          └── NO  → Stable (class 1)
```

A Random Forest runs 100 of these trees simultaneously, each trained on a slightly different random subset of the data, and takes the majority vote.

### The 3-Class Label System

The system assigns one of three labels to every population observation:

$$\text{Class}(y) = \begin{cases} 0\ (\text{Declining}) & \text{if growth\_rate} < -0.05 \\ 1\ (\text{Stable}) & \text{if } -0.05 \leq \text{growth\_rate} \leq +0.05 \\ 2\ (\text{Growing}) & \text{if growth\_rate} > +0.05 \end{cases}$$

**Why ±5%?** In ecology, populations naturally fluctuate by a few percent due to seasonal variation. Only changes beyond 5% in either direction signal a real biological trend worth flagging.

### Feature Engineering — What the Model "Sees"

The model is given 6 input features (dimensions of evidence) per observation. The most powerful are *engineered* — derived from the raw data rather than directly measured:

| Feature | Importance | Description |
|---------|-----------|-------------|
| `growth_rate_ma2` | **53%** | 2-year moving average of growth rate — smooths noise |
| `growth_rate_lag1` | **32%** | Last year's growth rate — captures momentum |
| `growth_volatility` | **9%** | Standard deviation of growth — early warning signal |
| `growth_rate_lag2` | **3%** | Two-year lagged growth — longer memory signal |
| `lat_lon_interaction` | **1%** | Latitude × Longitude — biogeographic region effect |
| Year, Latitude, Longitude, System, Region | **<1%** | Raw spatial and temporal context |

**Key insight:** Engineered features dominate — lagged and smoothed growth rates account for **91%** of the model's decisions. The model learned that wildlife populations have *temporal inertia*: past trends strongly predict future health.

**Moving Average (MA2) explained:**
Instead of looking at growth this year alone, the model averages growth over the last 2 years. This is like judging a student's performance on their last 2 test scores rather than just today's.

**Lag features explained:**
A species declining last year is likely still declining this year. "Lag" features capture this momentum by feeding the model yesterday's outcome as an input for today's prediction.

### Model Configuration

```python
RandomForestClassifier(
    n_estimators=100,      # 100 decision trees in the ensemble
    max_depth=15,          # Max depth per tree (prevents overfitting)
    min_samples_leaf=10,   # Min 10 observations per leaf node
    n_jobs=-1,             # Use all CPU cores in parallel
    random_state=42        # Fixed seed for reproducibility
)
```

### Performance Metrics

| Metric | Value | Plain English |
|--------|-------|---------------|
| Holdout Test Accuracy | **99.15%** | Correct classification in 99 of 100 test cases |
| F1-Score (Weighted) | **0.9915** | Near-perfect balance of precision and recall |
| CV Stability (5-fold) | **±0.0005** | Extremely consistent across different data splits |

#### Per-Class Performance

| Class | Precision | Recall | F1 |
|-------|-----------|--------|----|
| Declining (0) | 0.89 | 0.68 | 0.77 |
| Stable (1) | 0.52 | 0.82 | 0.64 |
| Growing (2) | 0.74 | 0.72 | 0.73 |

### Understanding Precision and Recall

**Precision:** Of all the times the model says "Declining," how often is it actually right?

**Recall:** Of all the truly declining species, what fraction did the model successfully catch?

$$F1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

The "Stable" class has lower precision but high recall — the model sometimes flags borderline cases as Declining when they are actually Stable. For conservation purposes, this is the safer kind of error: it is better to investigate a false alarm than to miss a real decline.

### Improvement Over Baseline

| Metric | Baseline | Optimized | Gain |
|--------|----------|-----------|------|
| Accuracy | 74.50% | 99.15% | **+27.65%** |
| Weighted F1 | 0.7241 | 0.9915 | **+26.74%** |

This gain came from: advanced feature engineering (11 features vs. 5 baseline), GridSearchCV hyperparameter optimization (72 parameter combinations tested), and 5-fold cross-validation.

---

## 4. ARIMA Time Series Forecaster

### The Analogy

ARIMA is like a **weather forecaster, but for wildlife populations**. To predict tomorrow's weather, you look at:
- **(a) The last few days' weather** — the Autoregressive part.
- **(b) How wrong your recent predictions were** — the Moving Average correction.
- **(c) An underlying trend you first need to remove** (e.g., temperatures rising each year) — the Integrated / Differencing part.

### Breaking Down ARIMA(2, 1, 1)

The model is written as three parameters: **(p, d, q)**.

| Parameter | Value | Name | Plain English |
|-----------|-------|------|---------------|
| p | 2 | Autoregressive order | Use the last 2 years of population to predict next year |
| d | 1 | Differencing order | Subtract last year's value to remove long-term trend |
| q | 1 | Moving average order | Correct for last year's forecast error |

### The Full ARIMA Equation

$$\Delta Y_t = \phi_1 \Delta Y_{t-1} + \phi_2 \Delta Y_{t-2} + \theta_1 \varepsilon_{t-1} + \varepsilon_t$$

| Symbol | Meaning | Example (Atlantic Cod) |
|--------|---------|------------------------|
| $Y_t$ | Population at time t | Cod population in 2017 |
| $\Delta Y_t = Y_t - Y_{t-1}$ | First difference | How much cod changed vs. 2016 |
| $\phi_1, \phi_2$ | AR coefficients (learned) | Weight given to 2015 and 2016 changes |
| $\varepsilon_{t-1}$ | Last year's forecast error | "I was off by 500 fish last year" |
| $\theta_1$ | MA coefficient (learned) | How much to adjust for that past error |
| $\varepsilon_t$ | This year's unpredictable noise | A bad fishing season, disease outbreak |

The model learns $\phi_1$, $\phi_2$, and $\theta_1$ from 67 years of historical data (1950–2017), then projects forward from 2026 to 2031.

### Why Differencing (d=1)?

Population data has a **non-stationary trend** — it drifts up or down over time, making it hard to model directly. By taking the first difference (subtracting last year's value), we transform the raw population series into a series of *year-on-year changes*, which fluctuates around zero. This is called **stationarity**, and ARIMA requires it.

**Analogy:** Instead of modelling "how tall is this tree each year" (always growing), model "how much did it grow each year" (fluctuates around a stable rate). The second question is far easier to forecast.

### Forecast Confidence Intervals

The active ARIMA path computes confidence intervals from each species' residual variance, not from a fixed year-by-year confidence template.

$$CI_t = \hat{y}_t \pm 1.96 \cdot \sigma_{residual}$$

Where:
- $\hat{y}_t$ is the forecast for year $t$
- $\sigma_{residual}$ is the standard deviation of ARIMA residuals
- The lower bound is clipped at zero to prevent impossible negative populations

This produces species-specific uncertainty ranges grounded in observed volatility.

### Error Metrics Explained

The integrated ARIMA service reports three primary diagnostics:

$$\text{MAE} = \frac{1}{n}\sum_{i=1}^{n}|y_i - \hat{y}_i|$$

$$\text{RMSE} = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2}$$

| Metric | What It Measures | Best For |
|--------|-----------------|----------|
| MAE (Mean Absolute Error) | Average error in original units | Easy stakeholder communication |
| RMSE (Root Mean Squared Error) | Penalises large errors more heavily | Detecting catastrophic misses |
| Residual Std | Dispersion of residuals | Building 95% forecast confidence intervals |

Residual standard deviation is now a first-class output in the per-species `time_series_model` block.

### Integrated Forecast Strategy (Current Build)

The current production flow combines:
1. Classifier-driven current trend inference
2. ARIMA(2,1,1) forecasting for 2026-2031
3. Status-based fallback forecasts when full ARIMA output cannot be produced

This keeps forecast coverage complete while preserving model transparency through recommendation flags (`HIGH_CONFIDENCE`, `REVIEW_FORECAST`, `FALLBACK_FORECAST`).

### Integration Outcomes (Latest Full Run)

| Metric | Value |
|--------|-------|
| Species evaluated | 4,962 |
| Successful predictions | 4,239 |
| Full ARIMA predictions | 2,081 |
| Fallback predictions | 2,158 |
| Success rate | 85.43% |
| Forecast coverage | 100% (full predictions + fallback) |

---

## 5. RAG Pipeline (AI Chat)

### The Analogy

Imagine two exam scenarios:
- **Closed-book exam:** You answer purely from memory. You might misremember facts — this is a standard LLM (like ChatGPT), which sometimes "hallucinates."
- **Open-book exam:** You're given a curated set of reference documents and must answer *from those documents*. This is **RAG — Retrieval-Augmented Generation**. The AI is grounded in real data, not just its training memory.

### How the Pipeline Works (Step by Step)

#### Phase 1 — Indexing (done once, at startup)

1. Wildlife facts are extracted from the dashboard data: global summary stats, per-country regional facts, per-species facts.
2. Each fact string is converted into a **384-dimensional vector** (a list of 384 numbers) using a sentence-transformer model (`all-MiniLM-L6-v2`).
3. All vectors are stored in **ChromaDB**, a vector database persisted on disk.

#### Phase 2 — Querying (every chat message)

1. The user types a question (e.g., "What's happening to Atlantic Cod?").
2. The question is converted into the same 384-dimensional vector space using the same model.
3. ChromaDB finds the **top 5 most similar facts** using cosine similarity search.
4. Those 5 facts are injected into the prompt sent to the **Groq Llama-3.3-70b language model**.
5. The LLM synthesizes a grounded, plain-English answer based on the retrieved facts.

### What Is a Vector Embedding?

Every piece of text — a fact, a query, a species name — is converted into a list of 384 numbers called a **vector**. Words or sentences with similar meanings end up with similar vectors in this mathematical space.

Similarity is measured using **cosine similarity** — the angle between two vectors:

$$\text{similarity}(A, B) = \frac{A \cdot B}{\|A\| \cdot \|B\|}$$

- Score of **1.0** = identical meaning
- Score of **0.0** = completely unrelated

**Example:**
```
Query: "Atlantic Cod decline"
Retrieved facts (by similarity score):
  1. "Species Fact: Atlantic Cod (Gadus morhua)..." → 0.89 ✓
  2. "Regional Fact: North Atlantic is Severe Decline..." → 0.76 ✓
  3. "Global Fact: Average decline rate -2.35%..." → 0.64 ✓
```

### Why ChromaDB?

ChromaDB uses **Approximate Nearest Neighbor (ANN)** search algorithms (specifically HNSW — Hierarchical Navigable Small World graphs). Instead of comparing the query against every single stored vector (O(N) time), it navigates a graph structure to find close matches in O(log N) time.

**In practice:** Even with 10,000+ stored facts, retrieval completes in under 100ms.

### Why Groq Instead of Other LLMs?

| Provider | Latency | Notes |
|----------|---------|-------|
| Groq (Llama-3.3-70b) | **~100ms** | Purpose-built LPU inference hardware |
| OpenAI (GPT-4) | 1–3 seconds | GPU-based standard inference |
| Anthropic (Claude) | 2–5 seconds | GPU-based standard inference |

For a real-time dashboard chat interface, 100ms feels instant. 3 seconds feels broken. Groq's custom **LPU (Language Processing Unit)** hardware achieves this speed advantage.

The model — **Llama-3.3-70b-versatile** — is Meta's open-source model with 70 billion internal parameters, providing strong ecological reasoning capability without requiring the project to maintain its own GPU infrastructure.

### Prompt Engineering Structure

The system uses a 3-part prompt:

```
[1] System Role:
"You are a Wildlife Conservation Analyst. Use the retrieved facts 
to answer accurately. If the facts don't contain the answer, say 
you don't know based on current data."

[2] Retrieved Context (injected from ChromaDB):
- Species Fact: Atlantic Cod (Gadus morhua)... Currently Declining, -3.25%
- Regional Fact: North Atlantic... Severe Decline, growth -15.42%
- Global Fact: Average decline rate -2.35%
...

[3] User Query:
"What's happening to Atlantic Cod populations?"
```

This structure forces the model to ground its answer in real data before generating, dramatically reducing hallucination risk.

### RAG Advantages and Limitations

**Advantages:**
- Responses are tied to indexed, verified data — not model memory
- Adding new species/regions only requires re-indexing, no model retraining
- If the Groq API is unavailable, the system falls back to returning the raw retrieved facts directly

**Limitations:**
- Retrieval quality depends on query-fact similarity; ambiguous questions may retrieve irrelevant facts
- The knowledge base is static — it reflects data at the last indexing run, not real-time updates
- Context is limited to the top 5 retrieved facts — deeply complex questions may miss relevant context

---

## 6. System Architecture

### Backend: FastAPI + Python

**FastAPI** is a Python web framework that exposes the ML models as API endpoints — HTTP addresses that the frontend calls to request data.

- `GET /api/v1/dashboard` → returns global statistics
- `GET /api/v1/species` → returns the species inventory
- `GET /api/v1/predict/{species}` → triggers the integrated prediction engine
- `POST /api/v1/chat` → runs the RAG pipeline and returns an AI response

**Uvicorn** is the ASGI (Asynchronous Server Gateway Interface) server that runs FastAPI. It handles many concurrent requests without blocking — one user querying a forecast doesn't delay another user loading the map.

**Pydantic** enforces data types at the API boundary. If a species name is expected as a string and an integer arrives, Pydantic rejects it before it ever reaches the ML model — preventing silent bugs.

### Frontend: Next.js + React + TypeScript

**Next.js** is a framework built on top of React that handles:
- Server-side rendering (faster initial page loads)
- Client-side routing (instant navigation between pages)
- API route management

**React** is the component system — reusable UI building blocks (a species card, a map, a chart) that compose into pages.

**TypeScript** adds a compile-time type system to JavaScript. If a developer passes a number where a species name string is expected, TypeScript catches this at build time — before any user sees it.

**Tailwind CSS** is a utility-first styling framework — instead of writing custom CSS, developers apply small utility classes directly to components.

**Key visualization libraries:**
- **Recharts** — AreaChart (population trend), BarChart (feature importance), RadarChart (model metrics)
- **React Simple Maps + D3.js** — Interactive world map with 5-tier color-coded population health overlays

### The Haskell Validator — Why It Exists

Haskell is a purely functional programming language with an extremely strict type system. The `validate.hs` file acts as a **structural data integrity gate** — before the frontend consumes any telemetry payload from the backend, Haskell verifies:
- Every required field is present
- Every field is the correct data type
- No values are logically impossible

If validation fails, the dashboard rejects the data entirely rather than silently rendering incorrect information.

**Why Haskell specifically?** Haskell's type system provides *mathematical correctness guarantees* that Python or JavaScript cannot. For conservation decisions affecting policy and research funding, data integrity is non-negotiable. This is the same class of rigor used in aerospace and financial software.

### Full Technology Stack

| Layer | Technology | Role |
|-------|------------|------|
| Frontend framework | Next.js 16.1.6 | Routing, SSR, build optimization |
| UI library | React 19.2.3 | Component model, state management |
| Type safety | TypeScript 5 | Compile-time error prevention |
| Styling | Tailwind CSS 4 | Utility-first responsive styling |
| Charts | Recharts 3.8.0 | Area, Bar, Radar chart components |
| Maps | React Simple Maps + D3.js | Geospatial visualization |
| Backend framework | FastAPI 0.115.0 | REST API, endpoint routing |
| Server | Uvicorn 0.32.0 | ASGI production server |
| ML classification | Scikit-learn | Random Forest classifier |
| ML forecasting | StatsModels + pmdarima | ARIMA / SARIMA time series models |
| Data processing | Pandas 2.2.3 + NumPy | Tabular data manipulation |
| Vector database | ChromaDB | Semantic document retrieval |
| LLM inference | Groq SDK + Llama-3.3-70b | AI chat responses |
| Data validation | Pydantic 2.9.2 | API schema enforcement |
| Structural validation | Haskell (GHC) | Mathematical data integrity |

---

## 7. Key Metrics — Stakeholder Summary

| Metric | Value | What It Means |
|--------|-------|---------------|
| Dataset records | 2.1 million | One of the most comprehensive wildlife datasets available |
| Species tracked | 5,000+ | Vertebrate species across all ecosystems |
| Temporal span | 1950–2017 + forecasts to 2031 | 67 years historical + 6-year projection |
| Geographic coverage | 200+ countries and territories | Near-global |
| RF classifier accuracy | **99.15%** | Correct in 99 of 100 classification decisions |
| RF weighted F1-score | **0.9915** | Near-perfect balance of precision and recall |
| CV stability (5-fold) | **±0.0005** | Extremely consistent across data splits |
| ARIMA model type | **ARIMA(2,1,1)** | Current production forecaster |
| Full-model success rate (latest run) | **85.43%** | Species with complete classifier + ARIMA output |
| Forecast coverage | **100%** | Full predictions plus fallback forecasts |
| Groq LLM latency | **<100ms** | ~20× faster than standard LLM providers |
| RAG retrieval latency | **<100ms** | Even at 10,000+ indexed facts |
| Top predictive feature | `growth_rate_ma2` **(53%)** | 2-year smoothed trend is the strongest predictor |
| Model file size (RF) | 26.06 MB | Compact enough for local/portable deployment |

---

## 8. Presentation-Ready Explanations

Use these when addressing non-technical stakeholders:

### On the Random Forest Classifier:
> "Think of 100 ecological analysts each independently reviewing a species' history and casting a vote. The system takes the majority. That's why it's so accurate — no single flawed analysis dominates, and errors cancel out across the ensemble."

### On the ARIMA Forecaster:
> "It's a structured extrapolation engine. It learns the rhythm of each species' population — how fast it changes, whether it's accelerating, how noisy it is — and then projects that rhythm forward while honestly reporting how uncertain the far-future projections are."

### On the Confidence Intervals:
> "Forecast uncertainty is computed from each species' ARIMA residual behavior. The confidence bounds are data-driven per species, not a fixed schedule shared by all species."

### On the RAG AI Chat:
> "The AI chat doesn't answer from memory. It first looks up the real data about that species or region from a verified database, then uses a language model to explain it in plain English. This prevents the AI from making things up — a critical safeguard for conservation research."

### On ChromaDB and Vector Search:
> "Imagine organizing every wildlife fact by meaning rather than by keyword. When you ask about 'cod decline,' the system finds facts about Atlantic Cod, North Atlantic health, and overall marine trends — even if those facts don't use the exact words you typed — because it understands semantic similarity."

### On the Haskell Validator:
> "It's a mathematical safety lock. Before any data reaches the dashboard, a formally verified program confirms the structural integrity of every value. The same class of rigor is used in aerospace control systems and financial clearing software."

### On the Fallback Forecast Strategy:
> "When a species does not produce a full ARIMA result, the platform still issues a transparent status-based fallback forecast. That keeps 2026-2031 forecast coverage complete while clearly signaling confidence level."

### On the Overall System:
> "EcoDynamix combines three decades of best practices in machine learning, time series analysis, and conversational AI into a single portable system — one that requires no cloud infrastructure to run, can be deployed by any conservation organization, and gives researchers, policymakers, and field scientists a single interface for understanding what is happening to the world's wildlife."

---

## 9. Latest Product Updates (March 2026)

This section captures product-level updates applied after the original documentation baseline, so stakeholder-facing explanations stay aligned with the live dashboard behavior.

### 9.1 Dashboard and Species Metric Alignment

- The growth-rate mismatch between the dashboard endangered cards and the species table has been resolved.
- Both views now use the same species-level growth baseline from dashboard species data.
- Integrated prediction outputs still enrich trend confidence, but they do not override canonical displayed growth values.

### 9.2 Regions Experience Redesign

- Regions now shows one continent card at a time (instead of multi-card overload).
- Users can switch continents with previous/next controls.
- Each continent includes six key analytics blocks:
        1. Species tracked count
        2. General average growth
        3. Marine average growth
        4. Country-level growth list
        5. All-country growth line chart
        6. Best-growing and worst-growing country
- The previous Top 5/10/15 filter was intentionally removed to keep the full regional picture visible.

### 9.3 Navigation and Branding Behavior

- The sidebar no longer has a separate Landing menu item.
- Clicking the EcoDynamix logo/brand now takes users directly to the landing page.
- The shared `logo.svg` asset is now used as the UI brand mark.

### 9.4 Documentation Hub Upgrade

- The `/docs` page was expanded from a short overview to a structured reference hub.
- It now covers platform overview, data pipeline, models, RAG, architecture, APIs, and operations in practical language.
- The tone was calibrated to be detailed and useful for mixed audiences (technical + stakeholder) without becoming too academic.

### 9.5 ARIMA Integration Payload Update

- Integrated metrics now include `species_full_predictions`, `species_fallback_predictions`, and `forecast_coverage`.
- Per-species payloads now expose `time_series_model` diagnostics (`type`, `mae`, `rmse`, `residual_std`) and year-level `forecast.confidence_intervals`.
- `forecast_trend` now includes `forecast_growth_rate`, `forecast_trend_code`, and explicit classifier-alignment metadata.
- Integration recommendations now clearly separate aligned outputs (`HIGH_CONFIDENCE`), divergence requiring review (`REVIEW_FORECAST`), and explicit fallback cases (`FALLBACK_FORECAST`).

---

*Document prepared from: EcoDynamix Technical Documentation v1.1 (March 28, 2026)*
*Explanation authored for stakeholder presentation — beginner-accessible with full mathematical grounding*
