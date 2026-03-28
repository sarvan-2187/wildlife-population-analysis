import {
  Activity,
  BarChart3,
  BookOpen,
  Brain,
  Database,
  GitBranch,
  Globe,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  TrendingDown,
  Workflow,
  Zap,
} from "lucide-react";

type DocSection = {
  id: string;
  title: string;
  icon: any;
  summary: string;
  bullets: string[];
  metrics?: { label: string; value: string; note?: string }[];
  callout?: { title: string; body: string };
};

const sections = [
  {
    id: "overview",
    title: "Platform Overview",
    icon: BookOpen,
    summary:
      "EcoDynamix combines data engineering, predictive modeling, and AI-assisted explanation in one workflow. It helps teams monitor species decline, compare regional health, and forecast where pressure is likely to increase through 2031.",
    bullets: [
      "Single pipeline from raw telemetry to dashboard and chat answers.",
      "Designed for mixed users: analysts, engineers, policy teams, and conservation operators.",
      "Focuses on practical outputs: decline risk, forecast direction, confidence, and geography-specific insights.",
    ],
    metrics: [
      { label: "Tracked species", value: "5,000+" },
      { label: "Geographies", value: "200+ countries" },
      { label: "Forecast horizon", value: "Through 2031" },
    ],
  },
  {
    id: "dataset",
    title: "Dataset and Coverage",
    icon: Database,
    summary:
      "The core source is Living Planet Database 2024. It provides long-span population records with strong global coverage and enough depth for both classification and time-series forecasting.",
    bullets: [
      "Raw source file: LPD 2024 public release (325.46 MB).",
      "Temporal baseline used in modeling: 1950-2017.",
      "Ecosystems represented: Terrestrial, Marine, Freshwater.",
      "After processing: ~2.1 million observation points in long format.",
      "Species, location, year, and population trajectories are preserved for analysis and forecasting.",
    ],
    metrics: [
      { label: "Raw size", value: "325.46 MB" },
      { label: "Processed size", value: "348.12 MB" },
      { label: "Observation points", value: "~2.1M" },
    ],
  },
  {
    id: "preprocessing",
    title: "Data Pipeline",
    icon: Zap,
    summary:
      "Data quality is enforced through a 9-step preprocessing pipeline before any model training or dashboard aggregation happens.",
    bullets: [
      "Removes duplicates, invalid coordinates, and impossible population values.",
      "Reshapes wide year-columns into model-friendly long format.",
      "Computes year-over-year growth rate for each species path.",
      "Clips extreme growth values to [-1.0, 1.0] to reduce outlier distortion.",
      "Drops records with missing derived values after calculation.",
    ],
    callout: {
      title: "Why this matters",
      body: "Most model errors come from noisy inputs, not weak algorithms. This pipeline is designed to reduce variance early, so downstream metrics remain stable and interpretable.",
    },
  },
  {
    id: "classifier",
    title: "Random Forest Classifier",
    icon: TrendingDown,
    summary:
      "The classifier predicts species status in three categories: Declining, Stable, and Growing. It emphasizes temporal momentum features to capture real trend direction rather than one-off fluctuations.",
    bullets: [
      "Model family: Random Forest with tuned hyperparameters and cross-validation.",
      "Uses engineered features such as lagged growth and volatility, not only raw coordinates.",
      "Most influential signal: 2-year smoothed growth trend.",
      "Built to support risk triage and prioritization workflows.",
    ],
    metrics: [
      { label: "Holdout accuracy", value: "99.15%" },
      { label: "Weighted F1", value: "0.9915" },
      { label: "CV stability", value: "0.9912 ± 0.0005" },
      { label: "Top feature importance", value: "53.05%", note: "2-year smoothed growth" },
    ],
  },
  {
    id: "forecasting",
    title: "ARIMA Time Series",
    icon: Sparkles,
    summary:
      "Forecasting combines baseline ARIMA with optimized variants to project future population paths. The system favors robust short- to mid-horizon interpretation rather than overconfident long-range claims.",
    bullets: [
      "Baseline model: ARIMA(2,1,1) with first differencing for non-stationary series.",
      "Enhanced mode: Auto-ARIMA and seasonal SARIMA for species with cyclical behavior.",
      "Validation uses rolling time windows to avoid temporal leakage.",
      "Forecast confidence is adaptive: near-term values are stronger than far-horizon values.",
    ],
    metrics: [
      { label: "Forecast window", value: "2026-2031" },
      { label: "Expected MAE reduction", value: "~15%" },
      { label: "Expected RMSE reduction", value: "~16%" },
    ],
  },
  {
    id: "rag",
    title: "RAG & Groq Integration",
    icon: Brain,
    summary:
      "The chat assistant is retrieval-grounded. It first fetches relevant ecological facts from a vector database, then generates a response using an LLM, which improves factual consistency.",
    bullets: [
      "Vector store: ChromaDB with persistent local indexing.",
      "Generation engine: Groq Llama-3.3-70b-versatile.",
      "Default retrieval strategy: top-k semantic facts per query.",
      "Name resolution uses local species mapping for deterministic behavior where possible.",
    ],
    metrics: [
      { label: "Indexed knowledge", value: "5,000+ species facts" },
      { label: "Typical retrieval latency", value: "<100ms" },
      { label: "Typical generation latency", value: "~100ms class" },
    ],
  },
  {
    id: "architecture",
    title: "System Architecture",
    icon: Workflow,
    summary:
      "The platform is organized as a modular full-stack system where data processing, model services, and interface layers can evolve independently.",
    bullets: [
      "Backend: FastAPI + Uvicorn for API and model-serving routes.",
      "Frontend: Next.js + React + TypeScript for dashboard and chat UI.",
      "Validation: Pydantic at API boundaries and optional Haskell structural validation.",
      "Data artifacts: dashboard data, integrated predictions, and model metrics served through stable endpoints.",
    ],
    metrics: [
      { label: "Frontend runtime", value: "Next.js 16.1.6" },
      { label: "Backend runtime", value: "FastAPI 0.115.0" },
      { label: "Validation layer", value: "Pydantic + optional Haskell" },
    ],
  },
  {
    id: "api",
    title: "API Surface",
    icon: Globe,
    summary:
      "The core APIs cover dashboard analytics, model metrics, integrated predictions, and chat interaction. Endpoints are scoped for UI composition and external integration.",
    bullets: [
      "GET /api/v1/dashboard: summary, regional metrics, species table source.",
      "GET /api/v1/model-metrics: model performance and saved metrics.",
      "GET /api/v1/integrated-predictions: coordinated classifier + forecast outputs.",
      "GET /api/v1/species/{species_name}/prediction: species-level prediction object.",
      "POST /api/v1/chat: RAG-grounded conversational response.",
    ],
    callout: {
      title: "Integration note",
      body: "Frontend pages intentionally reuse a small set of stable endpoints to keep contracts predictable and reduce integration drift during iteration.",
    },
  },
  {
    id: "ops",
    title: "Operations and Deployment",
    icon: Terminal,
    summary:
      "Local setup is straightforward: run backend and frontend separately, then verify model and chat routes. This supports both development and lightweight demo deployments.",
    bullets: [
      "Backend default port: 8000.",
      "Frontend default port: 3000.",
      "Training entrypoint is centralized for repeatable runs.",
      "Model metrics are persisted for direct UI consumption.",
      "Optional Haskell validation can be added before release checks.",
    ],
    callout: {
      title: "Operational guidance",
      body: "For demos and stakeholder sessions, pre-generate metrics and prediction artifacts first so charts load instantly and remain stable during walkthroughs.",
    },
  },
] as DocSection[];

const stackCards = [
  {
    title: "Platform At A Glance",
    icon: Activity,
    points: [
      "One pipeline for telemetry, modeling, and explanation",
      "Built for both analytical depth and practical decision support",
      "Combines deterministic stats with ML and retrieval-grounded AI",
      "Designed to remain usable by mixed technical and policy audiences",
    ],
  },
  {
    title: "Core Components",
    icon: GitBranch,
    points: [
      "FastAPI + Uvicorn for backend services",
      "Next.js + React + TypeScript for user interface",
      "Recharts + map visualizations for geospatial and trend views",
      "ChromaDB + Groq for retrieval-grounded chat responses",
    ],
  },
  {
    title: "Model and Quality Snapshot",
    icon: ShieldCheck,
    points: [
      "Living Planet Database 2024 (5,000+ species)",
      "2.1M population observations after cleaning",
      "Random Forest classifier (99.15% accuracy)",
      "ARIMA/SARIMA forecasting through 2031",
      "RAG chat for grounded natural-language answers",
    ],
  },
  {
    title: "Data Scale",
    icon: BarChart3,
    points: [
      "Raw source size: 325.46 MB",
      "Processed analytical data: 348.12 MB",
      "Global coverage: 200+ countries and territories",
      "Three systems: terrestrial, marine, freshwater",
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
              A practical system guide covering architecture, data methodology, model behavior, APIs, and operations.
              Detailed enough for implementation and review, but written for cross-functional teams.
            </p>
          </div>
          <div className="glass-chip rounded-2xl px-4 py-3 text-xs uppercase tracking-[0.14em] text-[#bde6db] inline-flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            Version: March 2026
          </div>
        </div>
      </header>

      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
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
                <p className="mt-3 text-[#a1c1b8] leading-relaxed">{section.summary}</p>

                <ul className="mt-4 space-y-2 text-sm text-[#b1cfc6]">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="rounded-xl px-3 py-2 bg-[#0d1f2b] border border-[#33515d]">
                      {bullet}
                    </li>
                  ))}
                </ul>

                {section.metrics && (
                  <div className="mt-4 grid sm:grid-cols-2 gap-3">
                    {section.metrics.map((metric) => (
                      <div key={`${metric.label}-${metric.value}`} className="rounded-2xl bg-[#102531] border border-[#355360] p-4">
                        <p className="text-xs text-[#8ea9a1] uppercase tracking-[0.12em]">{metric.label}</p>
                        <p className="text-lg text-[#e6faf4] font-semibold mt-1">{metric.value}</p>
                        {metric.note && <p className="text-xs text-[#9bbab2] mt-1">{metric.note}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {section.callout && (
                  <div className="mt-4 rounded-2xl bg-[#0d1f2b] border border-[#33515d] p-4">
                    <p className="text-[#d6f4eb] font-medium text-sm">{section.callout.title}</p>
                    <p className="mt-2 text-xs text-[#a1c1b8] leading-relaxed">{section.callout.body}</p>
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
