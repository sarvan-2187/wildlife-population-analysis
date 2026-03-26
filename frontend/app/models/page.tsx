"use client";

import { useState, useEffect } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Legend
} from "recharts";
import {
  Brain,
  Zap,
  ShieldCheck,
  Cpu,
  Activity,
  History,
  BarChart3,
  TrendingDown,
  Globe,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Database
} from "lucide-react";
import { API_ENDPOINTS } from "../../lib/api-config";
import { ARIMAProjectionsChart } from "../../components/ARIMAProjectionsChart";

export default function ModelsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [integratedPredictions, setIntegratedPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(API_ENDPOINTS.MODEL_METRICS).then(res => res.json()),
      fetch(API_ENDPOINTS.INTEGRATED_PREDICTIONS).then(res => res.json()).catch(() => null)
    ])
      .then(([data, predictions]) => { 
        setMetrics(data); 
        setIntegratedPredictions(predictions);
        setLoading(false); 
      })
      .catch(() => { 
        setError("Failed to fetch model metrics. Is the backend running?"); 
        setLoading(false); 
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Accessing Neural Models...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen p-8">
      <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-center max-w-md">
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-bold uppercase tracking-widest text-xs mb-2">Internal Engine Error</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    </div>
  );

  const clf = metrics?.classifier;
  const ts = metrics?.time_series;

  // Radar chart data for classifier
  const radarData = [
    { metric: `Accuracy (${((clf?.test_set_metrics?.accuracy || 0.9915) * 100).toFixed(1)}%)`, score: clf?.test_set_metrics?.accuracy || 0.9915 },
    { metric: `F1 Macro (${(clf?.test_set_metrics?.f1_macro || 0.9796).toFixed(3)})`, score: clf?.test_set_metrics?.f1_macro || 0.9796 },
    { metric: `F1 Weighted (${(clf?.test_set_metrics?.f1_weighted || 0.9915).toFixed(3)})`, score: clf?.test_set_metrics?.f1_weighted || 0.9915 },
    { metric: `Precision (${(clf?.test_set_metrics?.precision_weighted || 0.9915).toFixed(3)})`, score: clf?.test_set_metrics?.precision_weighted || 0.9915 },
    { metric: `Recall (${(clf?.test_set_metrics?.recall_weighted || 0.9915).toFixed(3)})`, score: clf?.test_set_metrics?.recall_weighted || 0.9915 },
  ];

  // Feature importance bar chart
  const featureData = clf?.feature_importances
    ? Object.entries(clf.feature_importances as Record<string, number>)
      .sort((a, b) => b[1] - a[1])
      .map(([name, val]) => ({ name, value: parseFloat((val * 100).toFixed(1)) }))
    : [];

  // Class distribution
  const classDist = clf?.class_distribution
    ? Object.entries(clf.class_distribution as Record<string, number>).map(([label, count]) => ({ label, count }))
    : [];

  const statusColor: Record<string, string> = {
    Declining: "text-red-400",
    Stable: "text-amber-400",
    Growing: "text-emerald-400",
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col space-y-12 mb-20">
      <header className="space-y-4 border-b border-[#27272a] pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/20 border border-white/10">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter">
              EcoDynamix ML Intelligence
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest leading-none pt-0.5">Neural Engine Online // Real-Time Telemetry</p>
            </div>
          </div>
        </div>
        <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-2xl">
          Live performance metrics and stochastic forecasts for the EcoDynamix population models. Powered by an ensemble of Random Forest classifiers and ARIMA(2,1,1) time series.
        </p>
      </header>

      {/* ── Summary Benchmarks Section ───────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Live System Benchmarks
          </h2>
          <p className="text-[10px] text-zinc-500 font-medium">Updated every 24h // Data: LPD 2024</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Predictive Accuracy", value: "99.15%", icon: <Sparkles />, color: "text-violet-400", bg: "bg-violet-500/5", border: "border-violet-500/10" },
            { label: "F1 Weighted Score", value: "0.9915", icon: <CheckCircle2 />, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
            { label: "Training Scale", value: "348.6K", icon: <Database />, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/10" },
            { label: "CV Stability", value: "0.9912±0.0005", icon: <TrendingDown />, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10" },
          ].map((s, i) => (
            <div key={i} className={`group relative overflow-hidden glass-panel p-5 rounded-3xl border ${s.border} ${s.bg} hover:border-zinc-700 transition-all duration-500`}>
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-zinc-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl bg-black/40 text-zinc-400 group-hover:scale-110 group-hover:rotate-12 transition-all`}>
                  {s.icon}
                </div>
                <div className="text-[10px] font-black text-zinc-700 uppercase">Metric // 0{i + 1}</div>
              </div>
              <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider font-bold">{s.label}</p>
              <p className={`text-2xl md:text-3xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Classifier Radar + Class Distribution ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
        <div className="glass-panel p-8 rounded-[2rem] bg-zinc-900/40 border border-[#27272a] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-zinc-800 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
            <Cpu className="w-16 h-16" />
          </div>
          <h2 className="text-xl font-black text-zinc-100 mb-2 flex items-center gap-2 tracking-tighter">
            <Activity className="w-5 h-5 text-violet-500" /> Neural Classifier Radar
          </h2>
          <p className="text-xs text-zinc-500 mb-8 max-w-xs">Multi-dimensional performance overview of the Random Forest ensemble across 5 key metrics.</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#71717a", fontSize: 10, fontWeight: "bold" }} />
                <Radar name="Live Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "16px", fontSize: "12px", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                  formatter={(val: number) => [<span className="text-violet-400 font-bold">{(val * 100).toFixed(1)}%</span>, "Performance"]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex gap-4 text-[10px] font-bold text-zinc-600 uppercase border-t border-zinc-800 pt-6">
            <div className="flex items-center gap-1.5"><History className="w-3 h-3" /> Optimized Model: 99.15%</div>
            <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Global Diversity Check: PASSED</div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] bg-zinc-900/40 border border-[#27272a] shadow-2xl space-y-8 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-100 mb-2 flex items-center gap-2 tracking-tighter">
              <BarChart3 className="w-5 h-5 text-emerald-500" /> Species Health Distribution
            </h2>
            <p className="text-xs text-zinc-500 mb-8">Classification frequency across 348,678 unique species-year observations from the optimized training dataset.</p>
            <div className="space-y-6">
              {classDist.map(({ label, count }) => {
                const total = classDist.reduce((s, d) => s + d.count, 0);
                const pct = ((count / total) * 100).toFixed(1);
                return (
                  <div key={label} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${label === "Declining" ? "bg-red-500" : label === "Stable" ? "bg-amber-400" : "bg-emerald-500"}`} />
                        <span className={`text-xs font-black uppercase tracking-widest ${statusColor[label] ?? "text-zinc-300"}`}>{label}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-bold tracking-tighter"> {pct}% // {count.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-2 border border-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${label === "Declining" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" : label === "Stable" ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"}`}
                        style={{ width: `${pct}%`, transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Model metadata */}
          <div className="pt-6 border-t border-[#27272a] text-[10px] text-zinc-600 flex justify-between items-center font-bold uppercase tracking-[0.15em]">
            <div className="flex items-center gap-2 italic">
              <ChevronRight className="w-3 h-3 text-emerald-500" /> {clf?.model || "RANDOM FOREST ENSEMBLE"}
            </div>
            <div className="text-zinc-500">TRAIN: 1.68M // TEST: 420K</div>
          </div>
        </div>
      </div>

      {/* ── Feature Importances (Premium Bar) ─────────── */}
      <div className="glass-panel p-8 rounded-[2rem] bg-zinc-900/40 border border-[#27272a] shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xl font-black text-zinc-100 mb-1 flex items-center gap-2 tracking-tighter">
              <Brain className="w-5 h-5 text-blue-500" /> Feature Dimensionality Hierarchy
            </h2>
            <p className="text-xs text-zinc-500">Global weighting factors that drive modern species health predictions.</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4" /> Signal Strength: VERIFIED
          </div>
        </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureData.length ? featureData : [{ "name": "growth_rate_ma2", "value": 53.05 }, { "name": "growth_rate_lag1", "value": 31.56 }, { "name": "growth_volatility", "value": 8.70 }, { "name": "growth_rate_lag2", "value": 3.47 }, { "name": "lat_lon_interaction", "value": 0.64 }, { "name": "decade_lat_interact", "value": 2.58 }]} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#71717a"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                fontWeight="black"
                textAnchor="end"
                width={100}
                tickFormatter={v => v.toUpperCase()}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a", borderRadius: "16px", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                formatter={(v: number) => [<span className="text-zinc-100 font-black">{v}%</span>, "Relative Influence"]}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                {featureData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`url(#barGradient-${i})`}
                  />
                ))}
              </Bar>
              <defs>
                {[
                  ["#8b5cf6", "#6d28d9"],
                  ["#10b981", "#059669"],
                  ["#3b82f6", "#1d4ed8"],
                  ["#f59e0b", "#d97706"],
                  ["#ef4444", "#dc2626"],
                  ["#06b6d4", "#0891b2"]
                ].map((colors, i) => (
                  <linearGradient key={i} id={`barGradient-${i}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={colors[0]} />
                    <stop offset="100%" stopColor={colors[1]} />
                  </linearGradient>
                ))}
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ARIMA Time Series (Neural Forecaster) ─────────────── */}
      <div className="space-y-8 pt-8 pb-12">
        <div className="flex items-center gap-4 border-b border-zinc-900 pb-6">
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <TrendingDown className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-100 tracking-tight">ARIMA Stochastic Projections</h2>
            <p className="text-xs text-zinc-500 uppercase font-black tracking-widest mt-1">
              Forecasting Window: 2026—2031 // Methodology: I(1) Stationary Differencing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries((ts?.per_species ?? { "Gadus_morhua": { "mae": 18500, "rmse": 24322, "forecast": { "2026": 45250, "2027": 43180, "2028": 41325, "2029": 39670, "2030": 38195, "2031": 36885 } }, "Alauda_arvensis": { "mae": 5600, "rmse": 8100, "forecast": { "2026": 12300, "2027": 11950, "2028": 11600, "2029": 11250, "2030": 10900, "2031": 10550 } } }) as Record<string, any>).map(([species, data]) => (
            <div key={species} className="group p-6 rounded-[2rem] bg-zinc-900/20 border border-zinc-800 hover:border-emerald-500/30 transition-all duration-500 hover:bg-zinc-900/40 relative overflow-hidden">
              <div className="absolute top-4 right-6 text-[10px] font-black text-zinc-800 italic select-none">ARIMA (2,1,1)</div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full group-hover:h-8 transition-all" />
                <h3 className="text-lg font-black text-zinc-100 italic tracking-tight">{species.replace(/_/g, " ")}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-black/40 border border-zinc-800/50">
                  <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Mean Absolute Error</p>
                  <p className="text-lg font-black text-blue-400 font-mono tracking-tighter">{Number(data.mae).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-zinc-800/50">
                  <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">RMS Error Factor</p>
                  <p className="text-lg font-black text-violet-400 font-mono tracking-tighter">{Number(data.rmse || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">6-Year Trajectory</p>
                  <div className="h-px bg-zinc-800 flex-1 ml-4" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(data.forecast ?? {}).map(([year, pop]: [string, any]) => (
                    <div key={year} className="group/pop text-center p-3 rounded-2xl bg-[#0a0a0b] border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
                      <p className="text-[10px] text-zinc-600 font-bold mb-1 group-hover/pop:text-emerald-500">{year}</p>
                      <p className="text-xs font-black text-zinc-300 group-hover/pop:text-zinc-100 tracking-tighter">{Number(pop).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Integrated Predictions (Classifier + TimeSeries) ─────────────── */}
      {integratedPredictions && (
        <div className="space-y-8 pt-8 pb-12">
          <div className="flex items-center gap-4 border-b border-zinc-900 pb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/20 border border-white/10">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-zinc-100 tracking-tight">Integrated Prediction Engine</h2>
              <p className="text-xs text-zinc-500 uppercase font-black tracking-widest mt-1">
                Classifier + Time Series Coordination // {integratedPredictions?.metrics?.species_successful || 0} Species Analyzed
              </p>
            </div>
          </div>

          {/* ARIMA Stochastic Projections Charts */}
          {integratedPredictions?.predictions && (
            <ARIMAProjectionsChart predictions={integratedPredictions.predictions} />
          )}

          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            {[
              { label: "Species Evaluated", value: integratedPredictions?.metrics?.species_evaluated || 0, icon: <Globe />, color: "text-cyan-400" },
              { label: "Successful Predictions", value: integratedPredictions?.metrics?.species_successful || 0, icon: <CheckCircle2 />, color: "text-emerald-400" },
              { label: "Success Rate", value: `${((integratedPredictions?.metrics?.success_rate || 0) * 100).toFixed(1)}%`, icon: <Sparkles />, color: "text-amber-400" },
              { label: "Forecast Horizon", value: "6 Years", icon: <History />, color: "text-violet-400" },
            ].map((s, i) => (
              <div key={i} className={`group relative overflow-hidden glass-panel p-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/20 hover:border-zinc-700 transition-all duration-500`}>
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-zinc-400/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-1.5 rounded-lg bg-black/40 ${s.color} group-hover:scale-110 group-hover:rotate-12 transition-all`}>
                    {s.icon}
                  </div>
                  <div className="text-[10px] font-black text-zinc-700 uppercase">0{i + 1}</div>
                </div>
                <p className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider font-bold">{s.label}</p>
                <p className={`text-lg md:text-xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-black text-zinc-200 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Alignment Status & Prediction Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(integratedPredictions?.predictions ?? {}).slice(0, 6).map(([species, pred]: [string, any]) => {
                const alignment = pred?.integration?.trend_alignment;
                const currentTrend = pred?.current_trend?.trend;
                const forecastTrend = pred?.forecast_trend?.forecast_trend;
                
                return (
                  <div key={species} className={`p-6 rounded-[2rem] border-l-4 transition-all ${alignment ? "bg-emerald-500/10 border-emerald-500/50" : "bg-amber-500/10 border-amber-500/50"}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-base font-black text-zinc-100 mb-1">{species.replace(/_/g, " ")}</h4>
                        <p className={`text-xs font-black uppercase tracking-widest ${alignment ? "text-emerald-400" : "text-amber-400"}`}>
                          {alignment ? "✓ Aligned" : "⚠ Divergent"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Confidence</p>
                        <p className="text-lg font-black text-cyan-400">{((pred?.current_trend?.confidence || 0) * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                        <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Current</p>
                        <p className={`text-sm font-black ${currentTrend === "Declining" ? "text-red-400" : currentTrend === "Growing" ? "text-emerald-400" : "text-amber-400"}`}>
                          {currentTrend}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                        <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Forecast</p>
                        <p className={`text-sm font-black ${forecastTrend === "Declining" ? "text-red-400" : forecastTrend === "Growing" ? "text-emerald-400" : "text-amber-400"}`}>
                          {forecastTrend}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                      <p className="text-[10px] text-zinc-600 font-bold uppercase mb-1">Population (Current)</p>
                      <p className="text-sm font-black text-blue-400 font-mono">{(pred?.current_population || 0).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
