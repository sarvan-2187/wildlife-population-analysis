"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpDown,
  Bird,
  Database,
  Globe,
  LineChart as LineChartIcon,
  Mountain,
  Search,
  TrendingDown,
  TrendingUp,
  Waves,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { API_ENDPOINTS, getSpeciesCommonNameUrl } from "../../lib/api-config";

type SortDirection = "asc" | "desc";

export default function SpeciesPage() {
  const [species, setSpecies] = useState<any[]>([]);
  const [integratedPredictions, setIntegratedPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [systemFilter, setSystemFilter] = useState("All Systems");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSpecies, setSelectedSpecies] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const rowsPerPage = 12;

  useEffect(() => {
    Promise.all([
      fetch(API_ENDPOINTS.DASHBOARD).then((res) => res.json()),
      fetch(API_ENDPOINTS.INTEGRATED_PREDICTIONS)
        .then((res) => res.json())
        .catch(() => null),
    ])
      .then(([dashboardData, predictionsData]) => {
        setSpecies(dashboardData.species_data || []);
        setIntegratedPredictions(predictionsData);
      })
      .catch((err) => console.error("Error fetching species data:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showDetailModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDetailModal]);

  const handleSort = (key: string) => {
    let direction: SortDirection = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const uniqueSystems = useMemo(
    () => ["All Systems", ...Array.from(new Set(species.map((s) => s.system)))],
    [species]
  );

  const uniqueStatuses = ["All Status", "Declining", "Stable", "Growing"];

  const normalizeSpeciesKey = (value: string) =>
    (value || "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/-+/g, "_")
      .toLowerCase();

  const predictionIndex = useMemo(() => {
    const raw = integratedPredictions?.predictions || {};
    const index: Record<string, any> = {};

    Object.entries(raw).forEach(([key, value]) => {
      index[normalizeSpeciesKey(key)] = value;
    });

    return index;
  }, [integratedPredictions]);

  const filteredSpecies = useMemo(
    () =>
      species.filter((s) => {
        const text = searchTerm.toLowerCase();
        const matchesSearch =
          s.name.toLowerCase().includes(text) ||
          s.system.toLowerCase().includes(text) ||
          s.region.toLowerCase().includes(text) ||
          s.binomial.toLowerCase().includes(text);

        const matchesSystem = systemFilter === "All Systems" || s.system === systemFilter;
        const matchesStatus = statusFilter === "All Status" || s.status === statusFilter;

        return matchesSearch && matchesSystem && matchesStatus;
      }),
    [species, searchTerm, systemFilter, statusFilter]
  );

  const sortedSpecies = useMemo(() => {
    const list = [...filteredSpecies];
    if (!sortConfig) return list;

    const { key, direction } = sortConfig;
    return list.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredSpecies, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedSpecies.length / rowsPerPage));
  const paginatedSpecies = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedSpecies.slice(start, start + rowsPerPage);
  }, [sortedSpecies, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, systemFilter, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getStatusChip = (status: string) => {
    if (status === "Declining") return "text-[#ffb29f] bg-[#3b2024] border-[#6a3239]";
    if (status === "Growing") return "text-[#8ff0d1] bg-[#16392f] border-[#2a6f5a]";
    return "text-[#b6d7ff] bg-[#1a2f45] border-[#385b82]";
  };

  const getSystemIcon = (system: string) => {
    if (system.toLowerCase().includes("terrestrial")) return <Mountain className="w-4 h-4" />;
    if (system.toLowerCase().includes("marine")) return <Waves className="w-4 h-4" />;
    return <Bird className="w-4 h-4" />;
  };

  const getPredictionForSpecies = (binomial: string) => {
    if (!predictionIndex) return null;
    return predictionIndex[normalizeSpeciesKey(binomial)] || null;
  };

  const openSpeciesDetail = (speciesData: any) => {
    setSelectedSpecies({
      ...speciesData,
      prediction: getPredictionForSpecies(speciesData.binomial),
    });
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-10">
        <div className="glass-panel rounded-3xl p-8 text-center text-[#a8c6be]">Loading species intelligence feed...</div>
      </div>
    );
  }

  const trackedDeclining = species.filter((s) => s.status === "Declining").length;

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-6 mb-12">
      <header className="glass-panel rounded-3xl p-6 md:p-8">
        <p className="section-heading">Species Intelligence</p>
        <div className="mt-2 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl text-[#e9fff8] font-bold">Global Species Inventory and Forecasts</h1>
            <p className="mt-3 text-[#9ebcb4] max-w-3xl">
              Filter telemetry across systems and regions, then inspect model-assisted trajectory and forecast patterns for each species.
            </p>
          </div>
          <div className="glass-chip rounded-2xl px-4 py-3 text-xs uppercase tracking-[0.14em] text-[#bde6db] inline-flex items-center gap-2">
            <Database className="w-4 h-4" />
            Source: LPD 2024 + Integrated Predictions
          </div>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tracked species", value: species.length.toLocaleString(), icon: Database },
          { label: "Declining", value: trackedDeclining.toLocaleString(), icon: TrendingDown },
          { label: "Forecast coverage", value: String(integratedPredictions?.metrics?.species_successful || 0), icon: LineChartIcon },
          { label: "Global footprint", value: "208 regions", icon: Globe },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="glass-panel rounded-2xl p-5 glow-card">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8ca8a1] inline-flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#e8fff7]">{card.value}</p>
            </article>
          );
        })}
      </section>

      <section className="glass-panel rounded-3xl p-5 md:p-6 space-y-4">
        <div className="grid lg:grid-cols-[1fr_1fr_1.2fr] gap-3">
          <select
            value={systemFilter}
            onChange={(e) => setSystemFilter(e.target.value)}
            className="bg-[#0d1f2b] border border-[#31505d] rounded-xl px-4 py-3 text-sm text-[#d2f0e6] outline-none"
          >
            {uniqueSystems.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d1f2b] border border-[#31505d] rounded-xl px-4 py-3 text-sm text-[#d2f0e6] outline-none"
          >
            {uniqueStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="relative">
            <Search className="w-4 h-4 text-[#8faea6] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, binomial, region, system"
              className="w-full bg-[#0d1f2b] border border-[#31505d] rounded-xl pl-10 pr-4 py-3 text-sm text-[#d2f0e6] placeholder:text-[#79958f] outline-none"
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#31505d] bg-[#0b1a24]">
          <table className="w-full min-w-245 text-left">
            <thead className="bg-[#0f2230] border-b border-[#2e4a57]">
              <tr>
                {[
                  { label: "Species", key: "name" },
                  { label: "System", key: "system" },
                  { label: "Region", key: "region" },
                  { label: "Growth", key: "growth" },
                  { label: "Population", key: "pop" },
                  { label: "Status", key: "status" },
                  { label: "Forecast", key: "forecast" },
                ].map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.key !== "forecast" && handleSort(column.key)}
                    className="px-5 py-4 text-xs uppercase tracking-[0.12em] text-[#8ba9a1] font-semibold"
                  >
                    <span className="inline-flex items-center gap-2">
                      {column.key !== "forecast" && <ArrowUpDown className="w-3 h-3" />}
                      {column.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedSpecies.map((item, idx) => {
                const prediction = getPredictionForSpecies(item.binomial);
                const forecastTrend = prediction?.forecast_trend?.forecast_trend || null;
                const forecastColor =
                  forecastTrend === "Declining"
                    ? "text-[#ffb29f]"
                    : forecastTrend === "Growing"
                      ? "text-[#8ff0d1]"
                      : "text-[#b6d7ff]";

                return (
                  <tr
                    key={`${item.binomial}-${idx}`}
                    className="border-b border-[#213844] hover:bg-[#112737] transition cursor-pointer"
                    onClick={() => openSpeciesDetail(item)}
                  >
                    <td className="px-5 py-4">
                      <p className="text-[#e5fff6] font-semibold">{item.name}</p>
                      <p className="text-xs text-[#8ca8a1] uppercase tracking-widest mt-1">{item.binomial}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#cbe8df]">
                      <span className="inline-flex items-center gap-2">{getSystemIcon(item.system)} {item.system}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#b7d4cc]">{item.region}</td>
                    <td className="px-5 py-4 text-sm font-semibold">
                      <span className={item.growth >= 0 ? "text-[#86efcc]" : "text-[#ffb29f]"}>
                        {item.growth > 0 ? "+" : ""}
                        {item.growth}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#d4f2e8]">{Number(item.pop).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`px-3 py-1 rounded-full border text-xs uppercase tracking-[0.08em] ${getStatusChip(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {forecastTrend ? (
                        <span className={forecastColor}>{forecastTrend}</span>
                      ) : (
                        <span className="text-[#7f9a93]">No forecast</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!sortedSpecies.length && (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-[#88a59e]">
                    No species match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <p className="text-sm text-[#8aa79f]">
            Showing {sortedSpecies.length ? (currentPage - 1) * rowsPerPage + 1 : 0}
            {" "}-{" "}
            {Math.min(currentPage * rowsPerPage, sortedSpecies.length)} of {sortedSpecies.length}
          </p>
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-[#35515d] bg-[#0e1f2b] text-[#cdebe2] disabled:opacity-45"
            >
              Previous
            </button>
            <span className="text-sm text-[#cdebe2] px-2">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-[#35515d] bg-[#0e1f2b] text-[#cdebe2] disabled:opacity-45"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {isMounted && showDetailModal && selectedSpecies && createPortal(
        <SpeciesDetailModal species={selectedSpecies} onClose={() => setShowDetailModal(false)} />,
        document.body
      )}
    </div>
  );
}

function SpeciesDetailModal({ species, onClose }: { species: any; onClose: () => void }) {
  const prediction = species.prediction;
  const normalizeScientificName = (value: string) =>
    value
      .replace(/_/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const defaultDisplayName =
    (species?.name && species.name.trim()) ||
    (species?.binomial && normalizeScientificName(species.binomial)) ||
    "Unknown Species";

  const [commonName, setCommonName] = useState<string>(defaultDisplayName);
  const [resolvingCommonName, setResolvingCommonName] = useState(false);

  useEffect(() => {
    let isActive = true;
    const speciesBinomial = species?.binomial || species?.name;

    if (!speciesBinomial) return;

    setCommonName(defaultDisplayName);
    setResolvingCommonName(true);

    fetch(getSpeciesCommonNameUrl(encodeURIComponent(speciesBinomial.replace(/\s+/g, "_"))))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isActive) return;
        const resolved = data?.common_name?.trim?.();
        if (resolved && resolved.toLowerCase() !== "unknown") {
          setCommonName(resolved);
        } else {
          setCommonName(defaultDisplayName);
        }
      })
      .catch(() => {
        // Keep dashboard-provided name as fallback.
        if (isActive) setCommonName(defaultDisplayName);
      })
      .finally(() => {
        if (isActive) setResolvingCommonName(false);
      });

    return () => {
      isActive = false;
    };
  }, [species?.binomial, species?.name, defaultDisplayName]);

  if (!prediction) {
    return (
      <div className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
        <div className="glass-panel rounded-3xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center">
            <h3 className="text-xl text-[#e8fff7] font-semibold">{commonName}</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-[#122632] border border-[#385663] text-[#b7d6cd]">
              <X className="w-4 h-4 mx-auto" />
            </button>
          </div>
          {resolvingCommonName && <p className="mt-2 text-xs text-[#8fb0a7]">Resolving general name...</p>}
          <p className="mt-4 text-[#9cbab2]">No integrated forecast currently available for this species.</p>
        </div>
      </div>
    );
  }

  const currentTrend = prediction.current_trend;
  const forecastTrend = prediction.forecast_trend;
  const historicalData = prediction.historical_data;
  const forecastData = prediction.forecast;

  const historicalYears = historicalData?.years || [];
  const historicalPops = historicalData?.populations || [];
  const historicalGrowthRates = historicalData?.growth_rates || [];
  const forecastYears = forecastData?.years || forecastTrend?.forecast_years || [];
  const forecastPops = forecastData?.populations || forecastTrend?.forecast_populations || [];

  const classifyGrowth = (growth: number) => {
    if (growth <= -2) return "Declining";
    if (growth >= 2) return "Growing";
    return "Stable";
  };

  const trendScore = (label: string) => {
    if (label === "Declining") return -1;
    if (label === "Growing") return 1;
    return 0;
  };

  const chartData = [
    ...historicalYears.map((year: number, idx: number) => ({
      year,
      population: historicalPops[idx],
      phase: "historical",
    })),
    ...forecastYears.map((year: number, idx: number) => ({
      year,
      population: forecastPops[idx],
      phase: "forecast",
    })),
  ];

  const trendData = [
    ...historicalGrowthRates.map((growth: number, idx: number) => {
      const year = historicalYears[idx + 1] ?? historicalYears[idx] ?? `H-${idx + 1}`;
      const label = classifyGrowth(growth);
      return {
        year,
        growth,
        trendLabel: label,
        trendScore: trendScore(label),
        phase: "historical",
      };
    }),
    ...forecastYears.map((year: number) => {
      const growth = Number(forecastTrend?.growth_rate_inference ?? 0);
      const label = forecastTrend?.forecast_trend || classifyGrowth(growth);
      return {
        year,
        growth,
        trendLabel: label,
        trendScore: trendScore(label),
        phase: "forecast",
      };
    }),
  ];

  return (
    <div className="fixed inset-0 z-9999 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-panel rounded-3xl p-5 md:p-6 w-full max-w-5xl max-h-[92dvh] overflow-y-auto border border-[#345260]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#89aca2]">Species profile</p>
            <h3 className="text-2xl text-[#e8fff7] font-semibold mt-1">{commonName}</h3>
            {resolvingCommonName && <p className="text-[#98b5ad] text-xs mt-1">Resolving general name...</p>}
            <p className="text-[#98b5ad] text-sm mt-1">
              Current: {currentTrend?.trend || "-"} | Forecast: {forecastTrend?.forecast_trend || "-"}
            </p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg bg-[#122632] border border-[#385663] text-[#b7d6cd]">
            <X className="w-4 h-4 mx-auto" />
          </button>
        </div>

        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Current trend" value={currentTrend?.trend || "-"} />
          <StatCard label="Confidence" value={`${((currentTrend?.confidence || 0) * 100).toFixed(1)}%`} />
          <StatCard label="Forecast trend" value={forecastTrend?.forecast_trend || "-"} />
          <StatCard label="Forecast horizon" value={`${forecastYears.length} years`} />
        </div>

        <div className="mt-5 rounded-2xl p-4 bg-[#0b1b26] border border-[#31505d]">
          <h4 className="text-lg text-[#e9fff8] inline-flex items-center gap-2">
            <LineChartIcon className="w-5 h-5" />
            Population trajectory and forecast
          </h4>
          <div className="h-80 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="speciesTrajectory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6faef8" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#6faef8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#35515c" />
                <XAxis dataKey="year" stroke="#91ada6" />
                <YAxis stroke="#91ada6" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0d1f2b", border: "1px solid #33515d", borderRadius: 10 }}
                  formatter={(value: any) => [Number(value).toLocaleString(), "population"]}
                />
                <Area type="monotone" dataKey="population" stroke="#6faef8" fill="url(#speciesTrajectory)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-5 rounded-2xl p-4 bg-[#0b1b26] border border-[#31505d]">
          <h4 className="text-lg text-[#e9fff8] inline-flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trend signal (Declining / Stable / Growing)
          </h4>
          <p className="mt-1 text-sm text-[#9ab7af]">
            Derived from historical year-over-year growth and integrated forecast inference.
          </p>
          <div className="h-64 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#35515c" />
                <XAxis dataKey="year" stroke="#91ada6" />
                <YAxis
                  stroke="#91ada6"
                  domain={[-1, 1]}
                  ticks={[-1, 0, 1]}
                  tickFormatter={(value: number) => {
                    if (value === -1) return "Declining";
                    if (value === 0) return "Stable";
                    return "Growing";
                  }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0d1f2b", border: "1px solid #33515d", borderRadius: 10 }}
                  formatter={(_value: any, _name: any, item: any) => [item?.payload?.trendLabel || "-", "trend"]}
                  labelFormatter={(label: any) => `Year ${label}`}
                />
                <Line type="monotone" dataKey="trendScore" stroke="#63e6be" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {forecastYears.map((year: number, idx: number) => (
            <div key={year} className="rounded-xl p-3 bg-[#0f2430] border border-[#31505b] text-center">
              <p className="text-xs text-[#90aea6] uppercase tracking-[0.12em]">{year}</p>
              <p className="text-[#defaf1] font-semibold mt-1">{Number(forecastPops[idx] || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3 bg-[#0f2430] border border-[#31505b]">
      <p className="text-xs text-[#8ca9a2] uppercase tracking-widest">{label}</p>
      <p className="text-[#e8fff7] font-semibold mt-1">{value}</p>
    </div>
  );
}
