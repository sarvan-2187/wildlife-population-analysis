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
} from "lucide-react";

const sections = [
  {
    id: "overview",
    title: "Platform Overview",
    icon: BookOpen,
    content:
      "EcoDynamix is a full-stack biodiversity intelligence system that combines real-world telemetry, predictive models, and retrieval-augmented reasoning. It is designed to transform ecosystem data into actionable understanding.",
  },
  {
    id: "stack",
    title: "Technical Stack",
    icon: Layers,
    content:
      "Frontend uses Next.js and Recharts for high-fidelity visual analysis. Backend uses FastAPI and Pandas for scalable data processing. Intelligence modules include Random Forest classification, ARIMA forecasting, and RAG over ChromaDB.",
  },
  {
    id: "data",
    title: "Data and Methodology",
    icon: Database,
    content:
      "Primary source is the Living Planet Database 2024. Population growth signals are normalized to reduce outlier noise. Trends are inferred by combining historical movement, classifier confidence, and forecast trajectories.",
  },
  {
    id: "ai",
    title: "RAG and AI Layer",
    icon: Brain,
    content:
      "The assistant retrieves relevant ecological facts from vector memory and synthesizes them through LLM reasoning. This enables contextual answers for mixed audiences without losing scientific grounding.",
  },
  {
    id: "ops",
    title: "Runbook",
    icon: Terminal,
    content:
      "Run backend and frontend separately, then verify inference with a chat query and dashboard load. Use validate.hs for structural checks before deployment when required.",
  },
];

const stackCards = [
  {
    title: "Backend Engine",
    icon: Server,
    points: ["FastAPI REST endpoints", "Pandas-based data cleaning", "Integrated prediction services"],
  },
  {
    title: "Frontend Interface",
    icon: Sparkles,
    points: ["Next.js app router", "Recharts and map visualizations", "Glassmorphism-aligned UI system"],
  },
  {
    title: "Quality and Validation",
    icon: ShieldCheck,
    points: ["Deterministic data prep", "Metric traceability", "Haskell validation workflow"],
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

                {section.id === "ops" && (
                  <div className="mt-4 rounded-2xl bg-[#0d1f2b] border border-[#33515d] p-4">
                    <p className="text-[#d6f4eb] font-medium">Quick start commands</p>
                    <pre className="mt-2 text-sm text-[#9cc0b6] whitespace-pre-wrap">
{`cd backend && pip install -r requirements.txt && uvicorn main:app --port 8000
cd frontend && npm i && npm run dev
# optional validation
ghc validate.hs -o validate && ./validate`}
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
