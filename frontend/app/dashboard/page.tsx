"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { ArrowRight, Waves, Leaf, AlertTriangle, TrendingDown, AlertCircle } from "lucide-react";
import { API_ENDPOINTS } from "../../lib/api-config";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type ViewMode = "General" | "Marine";
type SpeciesCount = 5 | 10 | 15;

const normalizeSpeciesKey = (value: string) =>
  (value || "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .toLowerCase();

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("General");
  const [isMounted, setIsMounted] = useState(false);
  const [speciesCount, setSpeciesCount] = useState<SpeciesCount>(5);
  const [predictionData, setPredictionData] = useState<any>(null);

  useEffect(() => {
    fetch(API_ENDPOINTS.DASHBOARD)
      .then((res) => res.json())
      .then((data) => setDashboardData(data))
      .catch((err) => console.error("Error fetching dashboard data:", err));

    fetch(API_ENDPOINTS.INTEGRATED_PREDICTIONS)
      .then((res) => res.json())
      .then((data) => setPredictionData(data))
      .catch((err) => console.error("Error fetching prediction data:", err));
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedCountry ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCountry]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const trendData = dashboardData?.trend_data || [];

  const predictionIndex = useMemo(() => {
    const raw = predictionData?.predictions || {};
    const index: Record<string, any> = {};

    Object.entries(raw).forEach(([key, value]) => {
      index[normalizeSpeciesKey(key)] = value;
    });

    return index;
  }, [predictionData]);

  const decliningSpecies = useMemo(() => {
    const speciesRows = dashboardData?.species_data || [];
    if (!speciesRows.length) return [];

    const species = speciesRows
      .map((item: any) => {
        const key = normalizeSpeciesKey(item?.binomial || item?.name || "");
        const prediction = predictionIndex[key];

        return {
          name: item?.name || (item?.binomial || "").replace(/_/g, " "),
          binomial: item?.binomial || key,
          trend: item?.status || prediction?.current_trend?.trend || "Unknown",
          confidence: prediction?.current_trend?.confidence || 0,
          growthRate: Number(item?.growth ?? prediction?.forecast_trend?.growth_rate_inference ?? 0),
          currentPopulation: Number(item?.pop ?? prediction?.current_population ?? 0),
          currentTrend: prediction?.current_trend?.classifier_prediction || item?.status || "Unknown",
        };
      })
      .filter((s) => s.growthRate < 0 || s.trend === "Declining" || s.currentTrend === "Declining")
      .sort((a, b) => a.growthRate - b.growthRate)
      .slice(0, speciesCount);

    return species;
  }, [dashboardData, predictionIndex, speciesCount]);

  const continentSegmentation = useMemo(() => {
    const regions = Object.entries(dashboardData?.regional_data || {}) as [string, any][];
    if (!regions.length) return [];

    const buckets = [
      { name: "Africa", aliases: ["Kenya", "South Africa", "Nigeria", "Morocco", "Algeria", "Ghana", "Ethiopia"] },
      { name: "Asia", aliases: ["India", "China", "Japan", "Indonesia", "Vietnam", "Thailand", "Philippines"] },
      { name: "Europe", aliases: ["France", "Germany", "Spain", "Italy", "Sweden", "Norway", "Poland", "Netherlands"] },
      { name: "North America", aliases: ["United States", "Canada", "Mexico", "Cuba", "Guatemala", "Panama"] },
      { name: "South America", aliases: ["Brazil", "Argentina", "Chile", "Peru", "Colombia", "Ecuador"] },
      { name: "Oceania", aliases: ["Australia", "New Zealand", "Fiji", "Papua New Guinea"] },
    ];

    return buckets.map((bucket) => {
      const matched = regions.filter(([country]) => bucket.aliases.some((alias) => country.includes(alias)));
      const values = matched.map(([, item]) => (viewMode === "General" ? item.growth_rate : item.marine_growth)).filter((v) => v !== null && v !== undefined);
      const avg = values.length ? values.reduce((sum, n) => sum + n, 0) / values.length : null;
      return {
        name: bucket.name,
        samples: values.length,
        avg,
      };
    });
  }, [dashboardData, viewMode]);

  const getCountryData = (name: string) => {
    if (!dashboardData?.regional_data) return undefined;
    return dashboardData.regional_data[name];
  };

  const getCountryColor = (name: string) => {
    const data = getCountryData(name);
    if (!data) return "#0d1921";

    const growth = viewMode === "General" ? data.growth_rate : data.marine_growth;
    if (growth === null || growth === undefined) return "#0d1921";

    if (growth < -0.2) return "#ef5350";
    if (growth < -0.05) return "#ff8f70";
    if (Math.abs(growth) <= 0.05) return "#93a7ac";
    if (growth < 0.2) return "#71d6bf";
    return "#34b899";
  };

  const stats = [
    { label: "Global decline rate", value: dashboardData?.summary?.global_decline_rate || "...", hint: "Primary stress index" },
    { label: "Tracked species", value: dashboardData?.summary?.tracked_species?.toLocaleString() || "...", hint: "Across systems" },
    { label: "Vulnerable regions", value: dashboardData?.summary?.vulnerable_regions || "...", hint: "Regions requiring intervention" },
    { label: "Marine coverage", value: "88%", hint: "Ocean telemetry represented" },
  ];

  return (
    <div className="px-5 md:px-10 py-8 md:py-10 max-w-7xl mx-auto space-y-8">
      {isMounted && selectedCountry && createPortal(
        <div
          className="fixed top-0 left-0 w-screen h-dvh z-9999 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedCountry(null)}
        >
          <div
            className="glass-panel rounded-3xl p-6 md:p-7 w-full max-w-xl border border-[#3a5863] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedCountry(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-[#122632] border border-[#385663] text-[#b7d6cd] hover:text-white transition"
              aria-label="Close country details"
            >
              x
            </button>

            <p className="text-xs uppercase tracking-[0.16em] text-[#89aca2]">Focused country</p>
            <h3 className="text-2xl font-semibold mt-2 text-[#e6fff7] pr-10">{selectedCountry}</h3>

            {getCountryData(selectedCountry) ? (
              <div className="mt-5 grid sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl p-3 bg-[#0f2430] border border-[#31505b]">
                  <p className="text-[#8db0a6]">General growth</p>
                  <p className="font-semibold mt-1 text-[#dffbf3]">{(getCountryData(selectedCountry).growth_rate * 100).toFixed(2)}%</p>
                </div>
                <div className="rounded-xl p-3 bg-[#0f2430] border border-[#31505b]">
                  <p className="text-[#8db0a6]">Marine growth</p>
                  <p className="font-semibold mt-1 text-[#dffbf3]">
                    {getCountryData(selectedCountry).marine_growth === null
                      ? "No data"
                      : `${(getCountryData(selectedCountry).marine_growth * 100).toFixed(2)}%`}
                  </p>
                </div>
                <div className="rounded-xl p-3 bg-[#0f2430] border border-[#31505b]">
                  <p className="text-[#8db0a6]">Species tracked</p>
                  <p className="font-semibold mt-1 text-[#dffbf3]">{getCountryData(selectedCountry).species_count.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-[#92ada7]">No detailed record available for this geography yet.</p>
            )}
          </div>
        </div>,
        document.body
      )}

      <header className="glass-panel rounded-3xl p-6 md:p-8">
        <p className="section-heading">Global Pulse</p>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl md:text-5xl text-[#e8fff7] font-bold leading-tight">Biodiversity Risk Observatory</h1>
            <p className="mt-3 text-[#a8c6be] max-w-2xl">
              Explore real-time vulnerability hotspots, trend trajectories, and continent-level imbalances. Toggle across general and marine systems for comparative diagnostics.
            </p>
          </div>
          <Link href="/regions" className="glass-chip rounded-2xl px-4 py-3 inline-flex items-center gap-2 text-[#d1f3e8] hover:text-white transition">
            Continent Segregation View
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <article key={stat.label} className="glass-panel rounded-2xl p-5 glow-card">
            <p className="text-xs uppercase tracking-[0.14em] text-[#8ca8a1]">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#e8fff7]">{stat.value}</p>
            <p className="mt-2 text-xs text-[#7f9b95]">{stat.hint}</p>
          </article>
        ))}
      </section>

      <section className="glass-panel rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <h2 className="text-2xl text-[#ebfff8]">Vulnerability Map</h2>
          <div className="flex bg-[#0b1a24] p-1 rounded-xl border border-[#2f4652]">
            <button
              onClick={() => setViewMode("General")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                viewMode === "General" ? "bg-[#6adfc0] text-primary-foreground" : "text-[#86a79f]"
              }`}
            >
              <Leaf className="w-4 h-4 inline mr-1" /> General
            </button>
            <button
              onClick={() => setViewMode("Marine")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                viewMode === "Marine" ? "bg-[#6faef8] text-[#07213a]" : "text-[#86a79f]"
              }`}
            >
              <Waves className="w-4 h-4 inline mr-1" /> Marine
            </button>
          </div>
        </div>

        <div className="w-full bg-[#081723] rounded-2xl border border-[#2e4954] min-h-55 md:min-h-105">
          <ComposableMap projection="geoMercator" width={800} height={400} className="w-full h-full">
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(geo.properties.name)}
                    stroke="#3f5b66"
                    strokeWidth={0.5}
                    onClick={() => setSelectedCountry(geo.properties.name)}
                    style={{
                      default: { outline: "none", transition: "all 250ms", cursor: "pointer" },
                      hover: { fill: viewMode === "Marine" ? "#6faef8" : "#6adfc0", outline: "none", transition: "all 250ms", cursor: "pointer" },
                      pressed: { fill: "#45b99f", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
          </ComposableMap>
        </div>

      </section>

      <section className="space-y-5">
        <article className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[#ff6b6b]" />
              <h2 className="text-xl text-[#effff9]">Heavily Endangered Species</h2>
            </div>
            <div className="flex bg-[#0b1a24] p-1 rounded-xl border border-[#2f4652] gap-1">
              {[5, 10, 15].map((count) => (
                <button
                  key={count}
                  onClick={() => setSpeciesCount(count as SpeciesCount)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    speciesCount === count ? "bg-[#ef5350] text-white" : "text-[#86a79f] hover:text-[#d0f0ec]"
                  }`}
                >
                  Top {count}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-[#91b0a7] mb-4">Species with the steepest population decline rates.</p>

          <div className="space-y-2">
            {decliningSpecies.length > 0 ? (
              decliningSpecies.map((species, idx) => (
                <div key={species.binomial} className="rounded-2xl p-4 border border-[#32505b] bg-[#0d1f2a] hover:border-[#4a6f7d] transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#ff6b6b] bg-[#4a1a1a] px-2 py-1 rounded">#{idx + 1}</span>
                        <p className="text-[#dcf8ef] font-semibold capitalize">{species.name}</p>
                      </div>
                      <p className="text-xs text-[#7f9b95] mt-1 italic">{species.binomial}</p>
                    </div>
                    <TrendingDown className="w-5 h-5 text-[#ff6b6b] shrink-0" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                    <div className="rounded-lg p-2 bg-[#15303f] border border-[#2d505b]">
                      <p className="text-[#7f9b95] uppercase tracking-wider">Decline Rate</p>
                      <p className="font-bold text-[#ff6b6b] mt-1">{(species.growthRate || 0).toFixed(2)}%</p>
                    </div>
                    {/* <div className="rounded-lg p-2 bg-[#15303f] border border-[#2d505b]">
                      <p className="text-[#7f9b95] uppercase tracking-wider">Confidence</p>
                      <p className="font-bold text-[#6faef8] mt-1">{((species.confidence || 0.9) * 100).toFixed(0)}%</p>
                    </div> */}
                    <div className="rounded-lg p-2 bg-[#15303f] border border-[#2d505b]">
                      <p className="text-[#7f9b95] uppercase tracking-wider">Population</p>
                      <p className="font-bold text-[#c5e8de] mt-1">{(species.currentPopulation || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl p-6 border border-[#32505b] bg-[#0d1f2a] text-center">
                <p className="text-[#7f9b95]">Loading species data...</p>
              </div>
            )}
          </div>

          <Link href="/species" className="mt-4 inline-flex items-center gap-2 text-[#9fe9d3] hover:text-[#d6fff2] text-sm">
            View all species details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </article>

        <article className="glass-panel rounded-3xl p-6">
          <h2 className="text-xl text-[#effff9]">Continent Health Snapshot</h2>
          <p className="text-sm text-[#91b0a7] mt-1">Averages from available country telemetry per continent.</p>
          <div className="mt-4 space-y-3">
            {continentSegmentation.map((item) => (
              <div key={item.name} className="rounded-2xl p-3 border border-[#32505b] bg-[#0d1f2a]">
                <div className="flex items-center justify-between">
                  <p className="text-[#dcf8ef] font-medium">{item.name}</p>
                  <p className="text-xs text-[#87a69e]">{item.samples} samples</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#15303f] overflow-hidden">
                  <div
                    className={`h-full ${item.avg !== null && item.avg >= 0 ? "bg-primary" : "bg-[#ff9f80]"}`}
                    style={{ width: `${Math.min(100, Math.max(6, Math.abs((item.avg || 0) * 240)))}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-[#b8d8cf]">
                  {item.avg === null ? "No data" : `${item.avg >= 0 ? "Recovery" : "Decline"} ${(item.avg * 100).toFixed(2)}%`}
                </p>
              </div>
            ))}
          </div>
          <Link href="/regions" className="mt-4 inline-flex items-center gap-2 text-[#9fe9d3] hover:text-[#d6fff2] text-sm">
            Open full continent analysis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </article>
      </section>

      <section className="glass-panel rounded-3xl p-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#ffd8a6] mt-0.5" />
        <p className="text-sm text-[#9fbcb4]">
          Insight quality depends on regional data availability. Use the continent route to inspect where coverage is sparse and where further research should be prioritized.
        </p>
      </section>
    </div>
  );
}
