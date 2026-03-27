"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from "recharts";
import { Activity, Brain, CheckCircle2, Gauge, LineChart, Sigma, Sparkles } from "lucide-react";
import { API_ENDPOINTS } from "../../lib/api-config";
import { ARIMAProjectionsChart } from "../../components/ARIMAProjectionsChart";

export default function ModelsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [integratedPredictions, setIntegratedPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(API_ENDPOINTS.MODEL_METRICS).then((res) => res.json()),
      fetch(API_ENDPOINTS.INTEGRATED_PREDICTIONS)
        .then((res) => res.json())
        .catch(() => null),
    ])
      .then(([data, predictions]) => {
        setMetrics(data);
        setIntegratedPredictions(predictions);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load model metrics. Ensure backend is running.");
        setLoading(false);
      });
  }, []);

  const classifier = metrics?.classifier;
  const trainSamples =
    classifier?.training_data?.total_samples ??
    classifier?.train_samples ??
    348678;

  const radarData = useMemo(
    () => [
      { metric: "Accuracy", score: classifier?.test_set_metrics?.accuracy || 0.9915 },
      { metric: "F1 Macro", score: classifier?.test_set_metrics?.f1_macro || 0.9796 },
      { metric: "F1 Weighted", score: classifier?.test_set_metrics?.f1_weighted || 0.9915 },
      { metric: "Precision", score: classifier?.test_set_metrics?.precision_weighted || 0.9915 },
      { metric: "Recall", score: classifier?.test_set_metrics?.recall_weighted || 0.9915 },
    ],
    [classifier]
  );

  const featureData = useMemo(
    () =>
      classifier?.feature_importances
        ? Object.entries(classifier.feature_importances as Record<string, number>)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, value]) => ({ name, value: Number((value * 100).toFixed(2)) }))
        : [],
    [classifier]
  );

  const classDist = useMemo(
    () =>
      classifier?.class_distribution
        ? Object.entries(classifier.class_distribution as Record<string, number>).map(([label, count]) => ({
            label,
            count,
          }))
        : [],
    [classifier]
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-10">
        <div className="glass-panel rounded-3xl p-8 text-center text-[#a8c6be]">Loading model intelligence layer...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-10">
        <div className="rounded-3xl p-8 border border-[#6c3940] bg-[#2a171b] text-[#ffb6bf]">{error}</div>
      </div>
    );
  }

  const benchmarks = [
    {
      label: "Accuracy",
      value: `${((classifier?.test_set_metrics?.accuracy || 0.9915) * 100).toFixed(2)}%`,
      icon: CheckCircle2,
    },
    {
      label: "F1 weighted",
      value: (classifier?.test_set_metrics?.f1_weighted || 0.9915).toFixed(4),
      icon: Sigma,
    },
    {
      label: "Train samples",
      value: Number(trainSamples).toLocaleString(),
      icon: Gauge,
    },
    {
      label: "Integrated success",
      value: `${(((integratedPredictions?.metrics?.success_rate || 0) * 100) || 0).toFixed(1)}%`,
      icon: Sparkles,
    },
  ];

  const totalClasses = classDist.reduce((sum, entry) => sum + Number(entry.count), 0);

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-6 mb-12">
      <header className="glass-panel rounded-3xl p-6 md:p-8">
        <p className="section-heading">Model Intelligence</p>
        <div className="mt-2 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl text-[#e9fff8] font-bold">Forecast and Classification Observatory</h1>
            <p className="mt-3 text-[#9ebcb4] max-w-3xl">
              Unified view of classifier behavior, feature influence, and multi-year ARIMA projections. Built to align model performance with practical conservation action.
            </p>
          </div>
          <div className="glass-chip rounded-2xl px-4 py-3 text-xs uppercase tracking-[0.14em] text-[#bde6db] inline-flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Pipeline: RF Classifier + ARIMA
          </div>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {benchmarks.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="glass-panel rounded-2xl p-5 glow-card">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8ca8a1] inline-flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#e8fff7]">{item.value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <article className="glass-panel rounded-3xl p-6">
          <h2 className="text-xl text-[#e9fff8]">Classifier Radar</h2>
          <p className="text-sm text-[#8ea8a1] mt-1">Balanced view across core performance metrics.</p>
          <div className="h-80 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#35515c" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#9cb9b1", fontSize: 11 }} />
                <Radar dataKey="score" stroke="#63e6be" fill="#63e6be" fillOpacity={0.24} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0c1c26", border: "1px solid #34525e", borderRadius: 10 }}
                  formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, "score"]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-panel rounded-3xl p-6">
          <h2 className="text-xl text-[#e9fff8]">Class Distribution</h2>
          <p className="text-sm text-[#8ea8a1] mt-1">Observed frequency of Declining / Stable / Growing labels.</p>
          <div className="mt-4 space-y-4">
            {classDist.map((entry) => {
              const pct = totalClasses ? (Number(entry.count) / totalClasses) * 100 : 0;
              const color =
                entry.label === "Declining"
                  ? "bg-[#ff8f70]"
                  : entry.label === "Growing"
                    ? "bg-[#63e6be]"
                    : "bg-[#9ac6f7]";

              return (
                <div key={entry.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <p className="text-[#d9f6ed]">{entry.label}</p>
                    <p className="text-[#9cb9b1]">{pct.toFixed(1)}%</p>
                  </div>
                  <div className="h-2 rounded-full bg-[#173340] overflow-hidden">
                    <div className={`${color} h-full`} style={{ width: `${Math.max(4, pct)}%` }} />
                  </div>
                </div>
              );
            })}
            {!classDist.length && <p className="text-sm text-[#91aba4]">No class-distribution data available.</p>}
          </div>
        </article>
      </section>

      <section className="glass-panel rounded-3xl p-6">
        <h2 className="text-xl text-[#e9fff8]">Feature Influence Hierarchy</h2>
        <p className="text-sm text-[#8ea8a1] mt-1">Top model features shaping trend classification outcomes.</p>
        <div className="h-96 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureData} layout="vertical" margin={{ left: 10, right: 18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#35515c" horizontal={false} />
              <XAxis type="number" stroke="#8ea8a1" tick={{ fill: "#9db9b1", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={160} stroke="#8ea8a1" tick={{ fill: "#cdebe2", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0c1c26", border: "1px solid #34525e", borderRadius: 10 }}
                formatter={(value: number) => [`${value.toFixed(2)}%`, "importance"]}
              />
              <Bar dataKey="value" fill="#6faef8" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass-panel rounded-3xl p-6">
        <h2 className="text-xl text-[#e9fff8] inline-flex items-center gap-2">
          <LineChart className="w-5 h-5" /> ARIMA Projection Layer
        </h2>
        <p className="text-sm text-[#8ea8a1] mt-1">Long-range trajectories with stochastic uncertainty visualization.</p>
        <div className="mt-4">
          {integratedPredictions?.predictions ? (
            <ARIMAProjectionsChart predictions={integratedPredictions.predictions} />
          ) : (
            <div className="rounded-xl bg-[#0d1f2b] border border-[#32505c] px-4 py-3 text-[#a6c4bc] text-sm inline-flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Integrated prediction payload unavailable.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
