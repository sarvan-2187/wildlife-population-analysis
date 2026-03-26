"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  ArrowUpDown, 
  Filter, 
  Bird, 
  Waves, 
  Mountain, 
  Database, 
  ChevronRight,
  ClipboardList,
  Sparkles,
  Globe,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  LineChart as LineChartIcon,
  X
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { API_ENDPOINTS, getSpeciesPredictionUrl } from "../../lib/api-config";

export default function SpeciesPage() {
  const [species, setSpecies] = useState<any[]>([]);
  const [integratedPredictions, setIntegratedPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [systemFilter, setSystemFilter] = useState("All Systems");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(API_ENDPOINTS.DASHBOARD).then(res => res.json()),
      fetch(API_ENDPOINTS.INTEGRATED_PREDICTIONS).then(res => res.json())
    ])
      .then(([dashboardData, predictionsData]) => {
        setSpecies(dashboardData.species_data || []);
        setIntegratedPredictions(predictionsData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const uniqueSystems = ["All Systems", ...Array.from(new Set(species.map(s => s.system)))];
  const uniqueStatuses = ["All Status", "Declining", "Stable", "Growing"];

  const filteredSpecies = species.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.system.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.binomial.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSystem = systemFilter === "All Systems" || s.system === systemFilter;
    const matchesStatus = statusFilter === "All Status" || s.status === statusFilter;
    return matchesSearch && matchesSystem && matchesStatus;
  });

  const sortedSpecies = [...filteredSpecies].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Declining": return "text-red-400 bg-red-400/10 border-red-400/20";
      case "Growing": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      default: return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    }
  };

  const getSystemIcon = (system: string) => {
    if (system.toLowerCase().includes("terrestrial")) return <Mountain className="w-4 h-4" />;
    if (system.toLowerCase().includes("marine")) return <Waves className="w-4 h-4" />;
    return <Bird className="w-4 h-4" />;
  };

  const getPredictionForSpecies = (binomial: string) => {
    if (!integratedPredictions?.predictions) return null;
    return integratedPredictions.predictions[binomial];
  };

  const handleSpeciesClick = (speciesData: any) => {
    const prediction = getPredictionForSpecies(speciesData.binomial);
    setSelectedSpecies({ ...speciesData, prediction });
    setShowDetailModal(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Accessing Species Record Set...</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto flex flex-col space-y-10 mb-20">
      <header className="space-y-6 border-b border-[#27272a] pb-8">
         <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20 border border-white/10">
               <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent tracking-tighter">
                EcoDynamix Species Inventory
              </h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest leading-none pt-0.5">Database Sync: ACTIVE // LPD 2024 + Predictions</p>
              </div>
            </div>
         </div>
         
         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-2xl">
              Comprehensive telemetry with integrated trend classification and population forecasts. Click species for growth charts.
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-2">
                <select 
                  className="bg-[#0a0a0b] border border-[#27272a] rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_0.75rem_center] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%3D%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')]"
                  style={{ backgroundSize: '1rem' }}
                  value={systemFilter}
                  onChange={(e) => setSystemFilter(e.target.value)}
                >
                  {uniqueSystems.map(sys => <option key={sys} value={sys}>{sys}</option>)}
                </select>

                <select 
                   className="bg-[#0a0a0b] border border-[#27272a] rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_0.75rem_center] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%3D%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')]"
                   style={{ backgroundSize: '1rem' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {uniqueStatuses.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div className="relative group w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search species, binomials, or regions..."
                  className="w-full bg-[#0a0a0b] border border-[#27272a] rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
         </div>
      </header>

      {/* ── Desktop Summary Stats ───────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: "Tracked Entities", value: species.length, icon: <Database /> },
           { label: "Global Coverage", value: "208 Regions", icon: <Globe /> },
           { label: "Critically Declining", value: species.filter(s => s.status === "Declining").length, icon: <TrendingDown className="text-red-500" /> },
           { label: "Predictions Available", value: integratedPredictions?.metrics?.species_successful || "0", icon: <LineChartIcon className="text-cyan-500" /> },
         ].map((s, i) => (
           <div key={i} className="glass-panel p-5 rounded-[1.5rem] border border-zinc-900 flex justify-between items-center group">
              <div>
                <p className="text-[10px] text-zinc-600 font-black uppercase mb-1">{s.label}</p>
                <p className="text-xl font-black text-zinc-300 tracking-tighter">{s.value}</p>
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 group-hover:scale-110 transition-transform text-zinc-500">
                {s.icon}
              </div>
           </div>
         ))}
      </div>

      <div className="glass-panel overflow-hidden rounded-[2rem] border border-[#27272a] shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0a0a0b] border-b border-[#27272a]">
              <tr>
                {[
                  { label: "Binomial Designation", key: "name" },
                  { label: "Systems", key: "system" },
                  { label: "Territory", key: "region" },
                  { label: "Momentum", key: "growth" },
                  { label: "Census", key: "pop" },
                  { label: "Health Status", key: "status" },
                  { label: "Forecast", key: "forecast" },
                ].map((col) => (
                  <th 
                    key={col.key}
                    onClick={() => col.key !== "forecast" && handleSort(col.key)}
                    className="px-8 py-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] cursor-pointer hover:text-zinc-100 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                       {col.key !== "forecast" && <ArrowUpDown className="w-3 h-3 text-zinc-700 group-hover:text-emerald-500 transition-colors" />}
                       {col.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {sortedSpecies.map((s, i) => {
                const prediction = getPredictionForSpecies(s.binomial);
                const forecastTrend = prediction?.forecast_trend;
                const alignment = prediction?.integration?.trend_alignment;
                
                return (
                  <tr key={i} className="hover:bg-white/[0.03] transition-colors group cursor-pointer" onClick={() => handleSpeciesClick(s)}>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-base font-black text-zinc-100 italic tracking-tight leading-none mb-1.5">{s.name}</span>
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{s.binomial}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                         <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                            {getSystemIcon(s.system)}
                         </div>
                         {s.system}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs text-zinc-500 font-medium tracking-tight">{s.region}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <div className={`w-1 h-3 rounded-full ${s.growth < 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
                         <span className={`text-sm font-black font-mono ${s.growth < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                           {s.growth > 0 ? '+' : ''}{s.growth}%
                         </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-300 font-black tracking-tighter">
                      {s.pop.toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {prediction && forecastTrend ? (
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${alignment ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-amber-500/20 border border-amber-500/50'}`}>
                            {forecastTrend?.forecast_trend === "Declining" && <TrendingDown className="w-4 h-4 text-red-400" />}
                            {forecastTrend?.forecast_trend === "Growing" && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                            {forecastTrend?.forecast_trend === "Stable" && <LineChartIcon className="w-4 h-4 text-amber-400" />}
                          </div>
                          <span className="text-xs font-black text-zinc-400">{forecastTrend?.forecast_trend}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sortedSpecies.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800">
                          <Search className="w-8 h-8 text-zinc-700" />
                       </div>
                       <p className="text-sm text-zinc-600 font-bold uppercase tracking-widest">No telemetry matching criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest border-t border-zinc-900 pt-8">
        <p className="flex items-center gap-2">
           <Database className="w-3 h-3" /> Showing {sortedSpecies.length} indexed observation points
        </p>
        <p className="text-zinc-500 italic">EcoDynamix Telemetry Feed // {new Date().toLocaleDateString()}</p>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSpecies && (
        <GrowthInferenceModal 
          species={selectedSpecies} 
          onClose={() => setShowDetailModal(false)} 
        />
      )}
    </div>
  );
}

function GrowthInferenceModal({ species, onClose }: { species: any; onClose: () => void }) {
  const prediction = species.prediction;
  if (!prediction) return null;

  const currentTrend = prediction.current_trend;
  const forecastTrend = prediction.forecast_trend;
  const integration = prediction.integration;
  const historicalData = prediction.historical_data;
  const forecastData = prediction.forecast;
  const timeSeriesModel = prediction.time_series_model;

  // Prepare chart data
  const chartDataHistorical = historicalData.years.map((year: number, idx: number) => ({
    year: year,
    population: historicalData.populations[idx],
    type: "historical"
  }));

  const chartDataForecast = forecastData.years.map((year: number, idx: number) => ({
    year: year,
    population: forecastData.populations[idx],
    type: "forecast"
  }));

  const allChartData = [...chartDataHistorical, ...chartDataForecast];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#0a0a0b] border border-[#27272a] rounded-[2rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0b] border-b border-[#27272a] p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-zinc-100 mb-1">{species.name}</h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{species.binomial}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Current Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-zinc-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-cyan-500" /> Current Status Classification
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-xs text-zinc-600 font-black uppercase mb-2">Trend</p>
                <p className={`text-lg font-black ${currentTrend.trend === "Declining" ? "text-red-400" : currentTrend.trend === "Growing" ? "text-emerald-400" : "text-amber-400"}`}>
                  {currentTrend.trend}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-xs text-zinc-600 font-black uppercase mb-2">Classifier Confidence</p>
                <p className="text-lg font-black text-cyan-400">{(currentTrend.confidence * 100).toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-xs text-zinc-600 font-black uppercase mb-2">Growth Rate (Current)</p>
                <p className={`text-lg font-black font-mono ${prediction.current_growth_rate > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {prediction.current_growth_rate > 0 ? "+" : ""}{prediction.current_growth_rate}%
                </p>
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-zinc-200 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-emerald-500" /> Population Trajectory & Forecast
            </h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={allChartData}>
                  <defs>
                    <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#27272a" />
                  <XAxis dataKey="year" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0a0a0b", border: "1px solid #27272a" }}
                    formatter={(value: any) => [value?.toLocaleString() || value, "Population"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="population" 
                    stroke="#06b6d4" 
                    fillOpacity={1} 
                    fill="url(#colorHistorical)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast Inference */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-zinc-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-500" /> Forecast Growth Inference (2026-2031)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-xs text-zinc-600 font-black uppercase mb-2">Forecasted Trend</p>
                <p className={`text-lg font-black ${forecastTrend?.forecast_trend === "Declining" ? "text-red-400" : forecastTrend?.forecast_trend === "Growing" ? "text-emerald-400" : "text-amber-400"}`}>
                  {forecastTrend?.forecast_trend || "—"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-xs text-zinc-600 font-black uppercase mb-2">Forecast Growth Rate</p>
                <p className={`text-lg font-black font-mono ${(forecastTrend?.forecast_growth_rate || 0) > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {(forecastTrend?.forecast_growth_rate || 0) > 0 ? "+" : ""}{forecastTrend?.forecast_growth_rate}%
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-xs text-zinc-600 font-black uppercase mb-2">Model Accuracy (RMSE)</p>
                <p className="text-lg font-black text-blue-400">{timeSeriesModel?.rmse?.toLocaleString() || "—"}</p>
              </div>
            </div>
          </div>

          {/* Integration Validation */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-zinc-200 flex items-center gap-2">
              {integration?.trend_alignment ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
              Classifier-Forecast Alignment
            </h3>
            <div className="p-4 rounded-xl border-l-4"  style={{ borderColor: integration?.trend_alignment ? "#10b981" : "#f59e0b", backgroundColor: integration?.trend_alignment ? "#065f46" : "#92400e" }}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-zinc-300 font-bold uppercase mb-1">Status</p>
                  <p className="text-sm font-black" style={{ color: integration?.trend_alignment ? "#10b981" : "#f59e0b" }}>
                    {integration?.trend_alignment ? "✓ Aligned" : "⚠ Divergent"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-300 font-bold uppercase mb-1">Alignment Score</p>
                  <p className="text-sm font-black text-zinc-100">{(integration?.alignment_score * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-300 font-bold uppercase mb-1">Recommendation</p>
                  <p className="text-sm font-black text-zinc-100">{integration?.recommendation}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-200 mt-3">
                {integration?.trend_alignment 
                  ? "The classifier's current trend prediction aligns with the time series forecast, indicating consistent signal."
                  : "The classifier prediction differs from the time series forecast. Review additional data sources."}
              </p>
            </div>
          </div>

          {/* Forecast Numbers */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-zinc-200 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" /> Population Forecast (2026-2031)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {forecastData.years.map((year: number, idx: number) => (
                <div key={year} className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
                  <p className="text-xs text-zinc-600 font-bold uppercase">{year}</p>
                  <p className="text-sm font-black text-cyan-400 font-mono">{forecastData.populations[idx]?.toLocaleString() || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0a0a0b] border-t border-[#27272a] p-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-emerald-500 text-black font-black text-sm hover:bg-emerald-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
