"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'General' | 'Marine'>('General');

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/dashboard")
      .then(res => res.json())
      .then(data => setDashboardData(data))
      .catch(err => console.error("Error fetching dashboard data:", err));
  }, []);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (selectedCountry) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedCountry]);

  const stats = [
    { label: "Global Decline Rate", value: dashboardData?.summary.global_decline_rate || "Loading...", color: "text-red-400" },
    { label: "Tracked Species", value: dashboardData?.summary.tracked_species?.toLocaleString() || "Loading...", color: "text-emerald-400" },
    { label: "Vulnerable Regions", value: dashboardData?.summary.vulnerable_regions || "Loading...", color: "text-amber-400" },
    { label: "Marine Coverage", value: "88%", color: "text-blue-400" },
  ];

  const trendData = dashboardData?.trend_data || [];

  const getCountryData = (name: string) => {
    if (!dashboardData?.regional_data) return undefined;
    return dashboardData.regional_data[name];
  };

  const getCountryColor = (name: string) => {
    const data = getCountryData(name);
    if (!data) return "#18181b"; 
    
    // Switch between general growth and marine-specific growth
    const growth = viewMode === 'General' ? data.growth_rate : data.marine_growth;
    
    if (growth === null || growth === undefined) return "#18181b";
    
    // Five-tier color mapping
    if (growth < -0.20) return "#b91c1c"; // Severe Decline
    if (growth < -0.05) return "#f87171"; // Mild Decline
    if (Math.abs(growth) <= 0.05) return "#71717a"; // Stable
    if (growth < 0.20) return "#34d399"; // Growth
    return "#059669"; // Strong Growth
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto h-full flex flex-col space-y-8 relative">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Global Wildlife Intelligence
        </h1>
        <p className="text-zinc-400 mt-2">Real-time computational assessment of species decline and population dynamics.</p>
      </header>

      {/* Detailed Modal Overlay */}
      {selectedCountry && (
        <div 
          className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-3xl transition-all duration-300"
          onClick={() => setSelectedCountry(null)}
        >
          <div 
            className="glass-panel w-full max-w-md p-8 rounded-3xl border border-[#27272a] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 ${
              getCountryData(selectedCountry)?.growth_rate < 0 ? 'bg-red-500' : 'bg-emerald-500'
            }`} />
            
            <button 
              onClick={() => setSelectedCountry(null)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-100 transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-3xl font-bold text-zinc-100 mb-2 pr-8">{selectedCountry}</h2>
            
            {getCountryData(selectedCountry) ? (
              <>
                <div className="flex gap-2 mb-8 relative z-10">
                  <div className="px-3 py-1 rounded-full text-[10px] font-bold border bg-[#09090b]/80 border-[#27272a] text-zinc-300 uppercase tracking-wider">
                    {getCountryData(selectedCountry).status}
                  </div>
                  {getCountryData(selectedCountry).marine_growth !== null && (
                    <div className="px-3 py-1 rounded-full text-[10px] font-bold border bg-blue-500/10 border-blue-500/20 text-blue-400 uppercase tracking-wider">
                      Marine: {getCountryData(selectedCountry).marine_status}
                    </div>
                  )}
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="p-5 rounded-2xl bg-[#0a0a0b]/80 border border-[#27272a] shadow-inner">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">General Ecosystem</span>
                      <span className={`text-xl font-bold ${getCountryData(selectedCountry).growth_rate < 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {(getCountryData(selectedCountry).growth_rate * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {getCountryData(selectedCountry).marine_growth !== null && (
                    <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 shadow-inner">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-blue-400 text-xs font-medium uppercase tracking-wider">Marine Ecosystem</span>
                        <span className={`text-xl font-bold ${getCountryData(selectedCountry).marine_growth < 0 ? "text-red-400" : "text-blue-400"}`}>
                          {(getCountryData(selectedCountry).marine_growth * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-5 rounded-2xl bg-[#0a0a0b]/80 border border-[#27272a] shadow-inner">
                    <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Species Tracked</span>
                    <span className="text-xl font-bold text-blue-400">
                      {getCountryData(selectedCountry).species_count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-8 p-6 rounded-2xl bg-[#0a0a0b]/80 border border-[#27272a] text-center space-y-3 relative z-10">
                <p className="text-zinc-400 text-sm">Experimental region detected.</p>
                <p className="text-emerald-400 font-semibold text-lg italic">Data will be added soon.</p>
                <div className="flex justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel p-4 md:p-6 rounded-2xl glow-card flex flex-col justify-center">
            <h3 className="text-[10px] md:text-sm text-zinc-400 font-medium mb-1 leading-tight">{stat.label}</h3>
            <p className={`text-xl md:text-4xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Single Column Layout For Visuals */}
      <div className="flex flex-col gap-8 flex-1">
        {/* Global Map */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-zinc-100 italic">
              Vulnerability Hotspots {viewMode === 'Marine' && "(Oceanic Focus)"}
            </h2>
            
            <div className="flex bg-[#0a0a0b] p-1 rounded-xl border border-[#27272a]">
              <button 
                onClick={() => setViewMode('General')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'General' ? "bg-emerald-500 text-zinc-900 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                GENERAL
              </button>
              <button 
                onClick={() => setViewMode('Marine')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'Marine' ? "bg-blue-500 text-zinc-900 shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                OCEANIC
              </button>
            </div>
          </div>

          <div className="w-full bg-[#0a0a0b] rounded-xl flex items-center justify-center border border-[#27272a] min-h-[220px] md:min-h-[400px]">
             <ComposableMap projection="geoMercator" width={800} height={400} className="w-full h-full">
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getCountryColor(geo.properties.name)}
                      stroke="#3f3f46"
                      strokeWidth={0.5}
                      onClick={() => setSelectedCountry(geo.properties.name)}
                      style={{
                        default: { outline: "none", transition: "all 250ms", cursor: "pointer" },
                        hover: { fill: viewMode === 'Marine' ? "#3b82f6" : "#10b981", outline: "none", transition: "all 250ms", cursor: "pointer" },
                        pressed: { fill: "#059669", outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>
            </ComposableMap>
          </div>

          {/* Map Legend */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 md:gap-6 border-t border-[#27272a] pt-6">
            {[
              { color: "#b91c1c", label: "Severe Decline (< -20%)" },
              { color: "#f87171", label: "Mild Decline" },
              { color: "#71717a", label: "Stable (+/- 5%)" },
              { color: viewMode === 'Marine' ? "#3b82f6" : "#34d399", label: viewMode === 'Marine' ? "Blue Growth" : "Growth" },
              { color: viewMode === 'Marine' ? "#2563eb" : "#059669", label: viewMode === 'Marine' ? "Oceanic Recovery" : "Strong Growth" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] md:text-xs text-zinc-400 font-medium uppercase tracking-tight">{item.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-zinc-700 bg-zinc-900" />
              <span className="text-[10px] md:text-xs text-zinc-500 font-medium uppercase tracking-tight italic">No Data</span>
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2 italic">
            Global Historical Population Trend
          </h2>
          <div className="w-full min-h-[250px] md:min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={viewMode === 'Marine' ? "#3b82f6" : "#10b981"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={viewMode === 'Marine' ? "#3b82f6" : "#10b981"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="year" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                  itemStyle={{ color: viewMode === 'Marine' ? "#3b82f6" : "#10b981" }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
                <Area type="monotone" dataKey="population" stroke={viewMode === 'Marine' ? "#3b82f6" : "#10b981"} strokeWidth={3} fillOpacity={1} fill="url(#colorPop)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
