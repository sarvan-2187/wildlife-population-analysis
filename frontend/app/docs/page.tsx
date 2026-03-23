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
  ChevronRight,
  Zap,
  Cpu,
  Globe,
  BarChart3,
  GitBranch,
  Shield,
  Layers,
  Code2,
  TableProperties,
  ArrowRight
} from "lucide-react";

export default function DocsPage() {
  const sections = [
    {
      id: "summary",
      title: "Executive Summary",
      icon: <Globe className="w-5 h-5 text-emerald-400" />,
      content: (
        <div className="space-y-4">
          <p className="text-zinc-400 leading-relaxed text-lg">
            <strong>EcoDynamix Intelligence Dashboard</strong> is a high-performance, full-stack computational engine designed to analyze, visualize, and forecast global species population trends.
          </p>
          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-zinc-300">
             The system replaces generic ecological reporting with real-time, RAG-augmented intelligence, integrating historical data from the <strong>Living Planet Database 2024</strong> with advanced Machine Learning (Random Forest) and Time Series (ARIMA) models.
          </div>
        </div>
      )
    },
    {
      id: "architecture",
      title: "Technology Stack",
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition-colors group">
            <h4 className="font-bold text-zinc-100 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              Engine (Backend)
            </h4>
            <ul className="text-xs text-zinc-500 space-y-3">
              <li className="flex gap-2">
                <span className="text-emerald-400">●</span>
                <span><strong>FastAPI 0.115.0</strong>: High-speed ASGI REST API</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">●</span>
                <span><strong>Pandas 2.2.3</strong>: Large-scale data processing</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">●</span>
                <span><strong>Groq SDK</strong>: LLM Inference via Llama-3.3-70b</span>
              </li>
            </ul>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-cyan-500/30 transition-colors group">
            <h4 className="font-bold text-zinc-100 mb-3 flex items-center gap-2">
              <Layout className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              Interface (Frontend)
            </h4>
            <ul className="text-xs text-zinc-500 space-y-3">
              <li className="flex gap-2">
                <span className="text-cyan-400">●</span>
                <span><strong>Next.js 16</strong>: Meta-framework with SSR/Static ops</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">●</span>
                <span><strong>Recharts 3.8.0</strong>: Complex data visualization</span>
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">●</span>
                <span><strong>Tailwind CSS 4</strong>: Atomic styling & Glassmorphism</span>
              </li>
            </ul>
          </div>
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 transition-colors group">
            <h4 className="font-bold text-zinc-100 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              Validation Engine
            </h4>
            <ul className="text-xs text-zinc-500 space-y-3">
              <li className="flex gap-2">
                <span className="text-blue-400">●</span>
                <span><strong>Haskell (GHC)</strong>: Type-safe structural analysis</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">●</span>
                <span><strong>validate.hs</strong>: Pre-deployment telemetry check</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400">●</span>
                <span><strong>ChromaDB</strong>: Persistent vector storage</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "ml-pipeline",
      title: "Machine Learning Intelligence",
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      content: (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-purple-500/10 bg-purple-500/5">
            <h4 className="text-zinc-100 font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Model 1: Random Forest Classifier
            </h4>
            <p className="text-sm text-zinc-400 mb-4 h-12 overflow-hidden">
               Categorizes populations into <strong>Declining</strong>, <strong>Stable</strong>, or <strong>Growing</strong> status based on year-over-year momentum.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-xl bg-black/30 border border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Accuracy</p>
                <p className="text-xl font-black text-emerald-400">74.5%</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-black/30 border border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">F1 Score</p>
                <p className="text-xl font-black text-cyan-400">0.72</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-black/30 border border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Estimators</p>
                <p className="text-xl font-black text-blue-400">100</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-black/30 border border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Max Depth</p>
                <p className="text-xl font-black text-violet-400">15</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-blue-500/10 bg-blue-500/5">
            <h4 className="text-zinc-100 font-bold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              Model 2: ARIMA Time Series
            </h4>
            <p className="text-sm text-zinc-400 mb-4 h-12 overflow-hidden">
               Autoregressive (2,1,1) model for species trajectory projection up to 2031. Captures non-stationary biological trends with first-order differencing.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold border border-zinc-700">AR(2)</span>
              <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold border border-zinc-700">I(1)</span>
              <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold border border-zinc-700">MA(1)</span>
              <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold border border-zinc-700">STOCHASTIC SHOCK SMOOTHING</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "rag-logic",
      title: "RAG Pipeline (Neural AI)",
      icon: <Cpu className="w-5 h-5 text-orange-400" />,
      content: (
        <div className="space-y-6">
          <p className="text-zinc-400 text-sm leading-relaxed">
            The EcoDynamix RAG (Retrieval-Augmented Generation) system merges low-latency vector search (ChromaDB) with high-reasoning LLM synthesis (Groq).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                    <Database className="w-4 h-4 text-orange-500" />
                  </div>
                  <h4 className="font-bold text-zinc-200">Semantic Retrieval</h4>
                </div>
                <ul className="text-xs text-zinc-500 space-y-2 list-disc pl-4">
                  <li>Indexes 5,500+ species & regional facts</li>
                  <li>384-dimensional vector embeddings</li>
                  <li>K-Nearest Neighbor (Top-5) Fact Injection</li>
                </ul>
             </div>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <MessageSquare className="w-4 h-4 text-cyan-500" />
                  </div>
                  <h4 className="font-bold text-zinc-200">Generative Synthesis</h4>
                </div>
                <ul className="text-xs text-zinc-500 space-y-2 list-disc pl-4">
                  <li>API Model: <strong>Llama-3.3-70b-versatile</strong></li>
                  <li>LLM Inference Latency: <strong>&lt;100ms (via Groq)</strong></li>
                  <li>System Role: Verified Eco-Analyst</li>
                </ul>
             </div>
          </div>
        </div>
      )
    },
    {
      id: "dataset",
      title: "Data Characteristics",
      icon: <TableProperties className="w-5 h-5 text-amber-400" />,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-300">
            <span className="text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">Source: LPD 2024</span>
            <span className="text-zinc-500">325 MB Raw</span>
            <span className="text-zinc-500">2.1M Observations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
               <h5 className="text-zinc-300 font-bold mb-2 text-xs uppercase tracking-widest">Growth Rate Logic</h5>
               <p className="text-xs text-zinc-500 leading-relaxed font-mono">
                 growth_at_t = (Pop_t - Pop_t-1) / Pop_t-1
                 lipped to [-1.0, 1.0] for outlier removal.
               </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
               <h5 className="text-zinc-300 font-bold mb-2 text-xs uppercase tracking-widest">Ecosystem Filter</h5>
               <ul className="text-xs text-zinc-500 space-y-1">
                 <li>• Terrestrial (Global Vertegrates)</li>
                 <li>• Marine (88% Regional Coverage)</li>
                 <li>• Freshwater (Inland Telemetry)</li>
               </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "dev",
      title: "Local Development Setup",
      icon: <Code2 className="w-5 h-5 text-zinc-400" />,
      content: (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-black/60 border border-zinc-800 font-mono text-xs md:text-sm overflow-x-auto relative group">
            <div className="absolute top-4 right-4 text-[10px] text-zinc-600 font-bold uppercase select-none">Shell Script</div>
            <p className="text-emerald-500 mb-2 invisible group-hover:visible transition-all"># 1. Initialize Engine (Backend)</p>
            <p className="text-zinc-400 bg-zinc-900/50 p-2 rounded mb-4">cd backend && pip install -r requirements.txt && uvicorn main:app --port 8000</p>
            
            <p className="text-cyan-500 mb-2 invisible group-hover:visible transition-all"># 2. Initialize Interface (Frontend)</p>
            <p className="text-zinc-400 bg-zinc-900/50 p-2 rounded mb-4">cd frontend && npm i && npm run dev</p>
            
            <p className="text-blue-500 mb-2 invisible group-hover:visible transition-all"># 3. Structural Validation (Haskell)</p>
            <p className="text-zinc-400 bg-zinc-900/50 p-2 rounded">ghc validate.hs -o validate && ./validate</p>
          </div>
          <div className="flex gap-4 items-center p-5 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
            <Cpu className="w-10 h-10 text-orange-500 animate-pulse" />
            <div className="text-sm">
              <p className="text-orange-400 font-bold">Inference Key Required</p>
              <p className="text-zinc-500">Populate <code className="text-zinc-400">GROQ_API_KEY</code> in your environment to enable EcoDynamix RAG.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-12 mb-20">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Modern Header */}
        <div className="space-y-6 border-b border-[#27272a] pb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 shadow-xl shadow-emerald-500/20 flex items-center justify-center border border-white/10">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-white to-zinc-600 bg-clip-text text-transparent tracking-tighter">
                EcoDynamix Technical Repository
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">v1.2 // CORE INFRA</div>
                <div className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest border border-zinc-700">MARCH 2026</div>
              </div>
            </div>
          </div>
          <p className="text-zinc-500 max-w-3xl text-sm md:text-base leading-relaxed">
            A comprehensive architectural breakdown of the EcoDynamix Intelligence system — from 2.1 million LPD observations to low-latency neural synthesis.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 pt-8">
          {/* Internal Sidebar Navigation */}
          <nav className="lg:sticky lg:top-32 h-fit space-y-1 hidden lg:block">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6 pl-3">Library Sections</h3>
            {sections.map(section => (
              <a 
                key={section.id} 
                href={`#${section.id}`}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-800"
              >
                <div className="hidden group-hover:block w-1 h-3 bg-emerald-500 rounded-full animate-in slide-in-from-left-2 duration-300" />
                {section.title}
              </a>
            ))}
          </nav>

          {/* Detailed Content Panels */}
          <div className="lg:col-span-3 space-y-24">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-32 space-y-8 group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-zinc-100 tracking-tight">{section.title}</h2>
                </div>
                <div className="pl-0 md:pl-4">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Technical Footer */}
        <footer className="pt-24 pb-12 border-t border-zinc-900 flex flex-col items-center gap-6">
           <div className="flex items-center gap-8 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              <span className="text-[10px] font-black tracking-widest text-zinc-400">IEEE COMPLIANT</span>
              <span className="text-[10px] font-black tracking-widest text-zinc-400">LPD 2024 CERTIFIED</span>
              <span className="text-[10px] font-black tracking-widest text-zinc-400">NEURAL ENGINE v2</span>
           </div>
           <p className="text-[10px] text-zinc-500 text-center font-medium max-w-md italic leading-relaxed">
             &copy; 2026 EcoDynamix Intelligence Portfolio. This document describes proprietary architectural implementations for global ecological forecasting.
           </p>
        </footer>
      </div>
    </div>
  );
}

// Custom MessageSquare icon since it's not in the main imports
function MessageSquare({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
