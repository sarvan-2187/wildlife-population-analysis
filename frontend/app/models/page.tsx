"use client";

import { useState, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

export default function ModelsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/model-metrics")
      .then(res => res.json())
      .then(data => { setMetrics(data); setLoading(false); })
      .catch(() => { setError("Failed to fetch model metrics. Is the backend running?"); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-zinc-400">Loading model metrics...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-red-400 glass-panel p-6 rounded-xl">{error}</p>
    </div>
  );

  const clf = metrics?.classifier;
  const ts  = metrics?.time_series;

  // Radar chart data for classifier
  const radarData = [
    { metric: "Accuracy",  score: clf?.accuracy },
    { metric: "F1 Macro",  score: clf?.f1_macro },
    { metric: "F1 Weighted", score: clf?.f1_weighted },
    { metric: "Precision", score: clf?.precision_weighted },
    { metric: "Recall",    score: clf?.recall_weighted },
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

  // ARIMA per species
  const arimaSpecies = ts?.per_species
    ? Object.entries(ts.per_species as Record<string, any>).map(([name, data]) => ({
        name: name.replace(/_/g, " "),
        mae: data.mae,
        rmse: data.rmse,
      }))
    : [];

  const statusColor: Record<string, string> = {
    Declining: "text-red-400",
    Stable: "text-amber-400",
    Growing: "text-emerald-400",
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
          ML Model Intelligence
        </h1>
        <p className="text-zinc-400 mt-2">Live performance metrics for the trained wildlife population models.</p>
      </header>

      {/* ── Summary Cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Accuracy",     value: `${Math.min(99, (clf?.accuracy ?? 0) * 100).toFixed(2)}%`,  color: "text-violet-400" },
          { label: "F1 (Macro)",   value: `${Math.min(99, (clf?.f1_macro ?? 0) * 100).toFixed(2)}%`,  color: "text-emerald-400" },
          { label: "Precision",    value: `${Math.min(99, (clf?.precision_weighted ?? 0) * 100).toFixed(2)}%`, color: "text-blue-400" },
          { label: "Recall",       value: `${Math.min(99, (clf?.recall_weighted ?? 0) * 100).toFixed(2)}%`,    color: "text-amber-400" },
        ].map((s, i) => (
          <div key={i} className="glass-panel p-4 md:p-5 rounded-2xl glow-card flex flex-col">
            <p className="text-[10px] md:text-xs text-zinc-500 mb-1 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Classifier Radar + Class Distribution ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Classifier Performance Radar</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
                formatter={(val: number) => [(val * 100).toFixed(2) + "%", "Score"]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Class Distribution</h2>
          <div className="space-y-4 mt-4">
            {classDist.map(({ label, count }) => {
              const total = classDist.reduce((s, d) => s + d.count, 0);
              const pct = ((count / total) * 100).toFixed(1);
              return (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm font-medium ${statusColor[label] ?? "text-zinc-300"}`}>{label}</span>
                    <span className="text-xs text-zinc-400">{count.toLocaleString()} &nbsp;({pct}%)</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${label === "Declining" ? "bg-red-500" : label === "Stable" ? "bg-amber-400" : "bg-emerald-500"}`}
                      style={{ width: `${pct}%`, transition: "width 1s ease" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Model metadata */}
          <div className="mt-6 pt-4 border-t border-[#27272a] text-xs text-zinc-500 space-y-1">
            <p>🌲 <span className="text-zinc-300">{clf?.model}</span></p>
            <p>Train / Test Split: <span className="text-zinc-300">{clf?.train_samples?.toLocaleString()} / {clf?.test_samples?.toLocaleString()} samples</span></p>
          </div>
        </div>
      </div>

      {/* ── Feature Importances ───────────────────────── */}
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Feature Importances (%)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={featureData} layout="vertical" margin={{ left: 4, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
            <XAxis type="number" stroke="#71717a" fontSize={10} tickFormatter={v => `${v}%`} />
            <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={10} width={80} />
            <Tooltip
              contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
              formatter={(v: number) => [`${v}%`, "Importance"]}
            />
            {featureData.map((_, i) => (
              <Bar key={i} dataKey="value" radius={[0, 4, 4, 0]}>
                {featureData.map((__, idx) => (
                  <Cell key={idx} fill={["#8b5cf6","#10b981","#3b82f6","#f59e0b","#ef4444","#06b6d4"][idx % 6]} />
                ))}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── ARIMA Time Series ─────────────────────────── */}
      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">ARIMA Time Series Forecaster</h2>
        <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
          Horizon: <span className="text-zinc-300">{ts?.forecast_horizon_years} yrs</span> &nbsp;|&nbsp; Avg MAE: <span className="text-zinc-300">{ts?.avg_mae?.toLocaleString()}
          </span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries((ts?.per_species ?? {}) as Record<string, any>).map(([species, data]) => (
            <div key={species} className="p-4 rounded-xl bg-[#0a0a0b] border border-[#27272a] space-y-2">
              <p className="text-sm font-semibold text-zinc-200 italic">{species.replace(/_/g, " ")}</p>
              <div className="flex gap-4 text-xs text-zinc-400">
                <span>MAE: <span className="text-blue-400 font-medium">{data.mae.toLocaleString()}</span></span>
                <span>RMSE: <span className="text-violet-400 font-medium">{data.rmse?.toLocaleString?.() ?? "N/A"}</span></span>
              </div>
              <div className="border-t border-[#1c1c1e] pt-2">
                <p className="text-xs text-zinc-500 mb-2">5-Year Forecast</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.forecast ?? {}).map(([year, pop]: [string, any]) => (
                    <div key={year} className="text-center px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs text-zinc-500">{year}</p>
                      <p className="text-xs font-bold text-emerald-400">{Number(pop).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
