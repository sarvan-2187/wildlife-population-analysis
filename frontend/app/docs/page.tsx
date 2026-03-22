"use client";

import { 
  BookOpen, 
  Server, 
  Layout, 
  Database, 
  ShieldCheck, 
  Waves, 
  Search, 
  Brain, 
  Terminal,
  ChevronRight
} from "lucide-react";

export default function DocsPage() {
  const sections = [
    {
      id: "architecture",
      title: "System Architecture",
      icon: <Server className="w-5 h-5 text-emerald-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-400 leading-relaxed">
            The project follows a split-tier architecture with a high-performance Python backend and a reactive Next.js frontend.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <h4 className="font-bold text-zinc-100 mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                Backend (FastAPI)
              </h4>
              <ul className="text-sm text-zinc-500 space-y-2 list-disc pl-4">
                <li>Entry Point: main.py initializes CORS and routing</li>
                <li>API Layer: routes.py exposes RESTful endpoints</li>
                <li>RAG Service: ChromaDB + Groq for AI synthesis</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <h4 className="font-bold text-zinc-100 mb-2 flex items-center gap-2">
                <Layout className="w-4 h-4 text-purple-400" />
                Frontend (Next.js)
              </h4>
              <ul className="text-sm text-zinc-500 space-y-2 list-disc pl-4">
                <li>Interactive world maps with Oceanic focus</li>
                <li>Recharts for historical population trends</li>
                <li>Responsive Glassmorphism design system</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "haskell",
      title: "Data Integrity (Haskell)",
      icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
      content: (
        <div className="p-6 rounded-2xl glass-panel border border-blue-500/20">
          <p className="text-zinc-400">
            The project uses a dedicated Haskell script (<code className="text-blue-400">validate.hs</code>) to perform <strong>Structural Data Validation</strong>.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-zinc-300">
              <ChevronRight className="w-4 h-4 text-blue-500" />
              <span>Validates <code className="text-zinc-500">dashboard_data.json</code> structure</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <ChevronRight className="w-4 h-4 text-blue-500" />
              <span>Ensures consistency of global decline rates</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <ChevronRight className="w-4 h-4 text-blue-500" />
              <span>Prevents UI crashes from missing telemetry nodes</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "features",
      title: "Key Features",
      icon: <Waves className="w-5 h-5 text-cyan-400" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-200">Oceanic Focal Mode</h4>
            <p className="text-xs text-zinc-500">Toggle between general and marine ecosystems on the map to highlight maritime recovery vs decline.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-200">AI Name Enrichment</h4>
            <p className="text-xs text-zinc-500">Resolves scientific binomials into readable common names using a local mapping layer.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-200">Portable RAG</h4>
            <p className="text-xs text-zinc-500">Over 5,000 species records indexed locally via ChromaDB for high-precision AI chat responses.</p>
          </div>
        </div>
      )
    },
    {
      id: "dev",
      title: "Local Development",
      icon: <Terminal className="w-5 h-5 text-zinc-400" />,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-black/40 rounded-xl border border-zinc-800 font-mono text-sm overflow-x-auto">
            <p className="text-emerald-400 mb-2"># Start Backend</p>
            <p className="text-zinc-300">cd backend && uvicorn main:app --reload --port 8000</p>
            <p className="text-emerald-400 mt-4 mb-2"># Start Frontend</p>
            <p className="text-zinc-300">cd frontend && npm run dev</p>
          </div>
          <div className="flex gap-4 items-center p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <Brain className="w-8 h-8 text-emerald-500" />
            <div className="text-sm">
              <p className="text-emerald-400 font-bold">Groq Required</p>
              <p className="text-zinc-500">Add GROQ_API_KEY to backend/.env for full AI functionality.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              Project Documentation
            </h1>
          </div>
          <p className="text-zinc-500 max-w-2xl">
            Technical specifications, architecture details, and development guides for the Wildlife Population Intelligence system.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-16">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                {section.icon}
                <h2 className="text-xl font-bold text-zinc-100">{section.title}</h2>
              </div>
              <div className="pl-0 md:pl-8">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="pt-12 pb-8 border-t border-zinc-900 text-center">
          <p className="text-xs text-zinc-600 italic">
            This document is a living artifact and will be updated as new analytical modules are integrated.
          </p>
        </footer>
      </div>
    </div>
  );
}
