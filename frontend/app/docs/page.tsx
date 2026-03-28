import {
  BookOpen,
  Brain,
  Database,
  Layers,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  TrendingDown,
  Zap,
} from "lucide-react";

const sections = [
  {
    id: "overview",
    title: "Platform Overview",
    icon: BookOpen,
    content:
      "EcoDynamix is a full-stack biodiversity intelligence system that combines real-world telemetry from the Living Planet Database 2024, AI-driven predictive models (Random Forest + ARIMA), and retrieval-augmented generation. It analyzes 5,000+ species across 200+ countries to quantify ecosystem decline and forecast population trajectories through 2031.",
  },
  {
    id: "dataset",
    title: "Living Planet Database 2024",
    icon: Database,
    content:
      "Primary source: LPD 2024 (325.46 MB). Covers 5,000+ species, 200+ countries, temporal span 1950–2017, and three ecosystems (Terrestrial, Marine, Freshwater). After cleaning and preprocessing: 2.1M population observations, 348.12 MB processed data. Cleaned CSV includes: species binomial, country, region, ecosystem system, latitude/longitude, year-by-year population counts.",
  },
  {
    id: "preprocessing",
    title: "Data Pipeline",
    icon: Zap,
    content:
      "9-step pipeline: duplicate removal → wide-to-long reshaping → type coercion → geographic filtering → zero/negative removal → time series sorting → growth rate calculation (Δpop/previous pop) → rate clipping [-1.0, 1.0] → NaN removal. Result: normalized growth signals ready for ML with reduced outlier noise.",
  },
  {
    id: "classifier",
    title: "Random Forest Classifier",
    icon: TrendingDown,
    content:
      "3-class classifier (Declining/Stable/Growing) trained on 348,678 samples with 11 engineered features including lagged growth rates and volatility metrics. Accuracy: 99.15%, F1-Score: 0.9915 (weighted). Top feature: 2-year smoothed growth trend (53% importance). Captures species health status with extreme precision.",
  },
  {
    id: "forecasting",
    title: "ARIMA Time Series",
    icon: Sparkles,
    content:
      "ARIMA(2,1,1) model forecasts 2026–2031 trajectories for all species. Training window: 1950–2017 (1st-order differencing removes trends). Auto-ARIMA optimization per species detects optimal parameters; enhanced SARIMA(1,1,1)(1,0,1,3) handles 3-year seasonal cycles. Rolling window CV prevents temporal data leakage.",
  },
  {
    id: "rag",
    title: "RAG & Groq Integration",
    icon: Brain,
    content:
      "ChromaDB vector store retrieves contextual ecological facts; Groq LLM (Llama-3.3-70b-versatile) synthesizes multi-audience explanations. Local species_mapping.json (4,962 entries) provides deterministic common/general name resolution. Fallback to LLM for unmapped species.",
  },
  {
    id: "ops",
    title: "Operations & Deployment",
    icon: Terminal,
    content:
      "Backend: FastAPI + Uvicorn (port 8000). Frontend: Next.js 16.1.6 (port 3000). Validation: Haskell payload checker (optional). Training: unified entrypoint backend/models/train_model.py; metrics persisted to data/model_metrics.json.",
  },
];

const stackCards = [
  {
    title: "Backend Stack",
    icon: Server,
    points: [
      "FastAPI 0.115.0 + Uvicorn 0.32.0",
      "Pandas 2.2.3 + NumPy (data processing)",
      "Scikit-learn (Random Forest)",
      "StatsModels + pmdarima (ARIMA/SARIMA)",
      "ChromaDB (vector search)",
      "Groq SDK (Llama-3.3-70b-versatile LLM)",
    ],
  },
  {
    title: "Frontend Stack",
    icon: Sparkles,
    points: [
      "Next.js 16.1.6 + React 19.2.3",
      "TypeScript 5 + Tailwind CSS 4",
      "Recharts 3.8.0 (charts: Area, Bar, Line)",
      "React Simple Maps 3.0.0 (geospatial)",
      "Lucide React 0.577.0 (icons)",
      "Glass-morphism UI patterns",
    ],
  },
  {
    title: "Data & Quality",
    icon: ShieldCheck,
    points: [
      "Living Planet Database 2024 (5,000+ species)",
      "2.1M population observations after cleaning",
      "9-step preprocessing pipeline",
      "11 engineered ML features",
      "99.15% classifier accuracy",
      "Haskell validation engine (validate.hs)",
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-6 mb-12">
      <header className="glass-panel rounded-3xl p-6 md:p-8">
        <p className="section-heading">Documentation Hub</p>
        <div className="mt-2 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl text-[#e9fff8] font-bold">EcoDynamix Technical Reference</h1>
            <p className="mt-3 text-[#9ebcb4] max-w-3xl">
              A concise technical map of architecture, data methodology, model behavior, and operational runbook.
              Structured for engineers, analysts, and policy stakeholders working together.
            </p>
          </div>
          <div className="glass-chip rounded-2xl px-4 py-3 text-xs uppercase tracking-[0.14em] text-[#bde6db] inline-flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            Version: March 2026
          </div>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        {stackCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="glass-panel rounded-2xl p-5">
              <h2 className="text-lg text-[#e9fff8] inline-flex items-center gap-2">
                <Icon className="w-5 h-5" />
                {card.title}
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-[#a1c1b8]">
                {card.points.map((point) => (
                  <li key={point} className="rounded-lg px-3 py-2 bg-[#0d1f2b] border border-[#33515d]">
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section className="grid lg:grid-cols-[1fr_2.4fr] gap-5">
        <nav className="glass-panel rounded-3xl p-5 h-fit lg:sticky lg:top-8">
          <h2 className="text-lg text-[#e9fff8]">On this page</h2>
          <div className="mt-4 space-y-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block rounded-xl px-3 py-2 bg-[#0d1f2b] border border-[#33515d] text-[#d2efe6] hover:bg-[#112a38] transition"
              >
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-5">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <article key={section.id} id={section.id} className="glass-panel rounded-3xl p-6 scroll-mt-8">
                <h3 className="text-2xl text-[#e9fff8] inline-flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {section.title}
                </h3>
                <p className="mt-3 text-[#a1c1b8] leading-relaxed">{section.content}</p>

                {section.id === "classifier" && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-[#0d1f2b] border border-[#33515d] p-4">
                      <p className="text-[#d6f4eb] font-medium text-sm">Model Performance</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#a1c1b8]">
                        <div>Accuracy: <span className="text-[#6faef8] font-bold">99.15%</span></div>
                        <div>F1-Score: <span className="text-[#6faef8] font-bold">0.9915</span></div>
                        <div>Precision: <span className="text-[#6faef8] font-bold">0.9915</span></div>
                        <div>Recall: <span className="text-[#6faef8] font-bold">0.9915</span></div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#0d1f2b] border border-[#33515d] p-4">
                      <p className="text-[#d6f4eb] font-medium text-sm">Top Features</p>
                      <ul className="mt-2 text-xs text-[#a1c1b8] space-y-1">
                        <li>• 2-year smoothed growth (53.05%)</li>
                        <li>• Previous year momentum (31.56%)</li>
                        <li>• Population volatility (8.70%)</li>
                      </ul>
                    </div>
                  </div>
                )}

                {section.id === "forecasting" && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-[#0d1f2b] border border-[#33515d] p-4">
                      <p className="text-[#d6f4eb] font-medium text-sm">Model Configuration</p>
                      <div className="mt-2 space-y-1 text-xs text-[#a1c1b8]">
                        <div><span className="font-semibold">ARIMA(2,1,1)</span> baseline parameters</div>
                        <div><span className="font-semibold">Auto-ARIMA</span> optimizes per-species</div>
                        <div><span className="font-semibold">SARIMA(1,1,1)(1,0,1,3)</span> seasonal variant</div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#0d1f2b] border border-[#33515d] p-4">
                      <p className="text-[#d6f4eb] font-medium text-sm">Forecast Horizon</p>
                      <ul className="mt-2 text-xs text-[#a1c1b8] space-y-1">
                        <li>Historical: 1950–2017</li>
                        <li>Forecast: 2026–2031 (6 years)</li>
                        <li>Validation: Rolling window CV (3 folds)</li>
                      </ul>
                    </div>
                  </div>
                )}

                {section.id === "ops" && (
                  <div className="mt-4 rounded-2xl bg-[#0d1f2b] border border-[#33515d] p-4">
                    <p className="text-[#d6f4eb] font-medium">Quick start commands</p>
                    <pre className="mt-2 text-xs text-[#9cc0b6] whitespace-pre-wrap font-mono">
{`# Backend setup
cd backend && pip install -r requirements.txt
uvicorn main:app --port 8000

# Frontend setup
cd frontend && npm i && npm run dev

# Training models
python backend/models/train_model.py

# Generate species names
python backend/models/generate_species_common_names.py`}
                    </pre>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
