"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { API_ENDPOINTS } from "../../lib/api-config";

const continentRules: Record<string, string[]> = {
  Africa: ["Kenya", "South Africa", "Nigeria", "Morocco", "Algeria", "Ghana", "Ethiopia", "Egypt", "Tanzania"],
  Asia: ["India", "China", "Japan", "Indonesia", "Vietnam", "Thailand", "Philippines", "Pakistan"],
  Europe: ["France", "Germany", "Spain", "Italy", "Sweden", "Norway", "Poland", "Netherlands", "United Kingdom"],
  "North America": ["United States", "Canada", "Mexico", "Guatemala", "Panama", "Cuba"],
  "South America": ["Brazil", "Argentina", "Chile", "Peru", "Colombia", "Ecuador", "Bolivia"],
  Oceania: ["Australia", "New Zealand", "Fiji", "Papua New Guinea"],
};

export default function RegionsPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeContinentIndex, setActiveContinentIndex] = useState(0);

  useEffect(() => {
    fetch(API_ENDPOINTS.DASHBOARD)
      .then((res) => res.json())
      .then((data) => setDashboardData(data))
      .catch((err) => console.error("Failed to load region data", err));
  }, []);

  const continentData = useMemo(() => {
    const entries = Object.entries(dashboardData?.regional_data || {}) as [string, any][];

    return Object.entries(continentRules).map(([continent, aliases]) => {
      const matched = entries.filter(([country]) => aliases.some((alias) => country.includes(alias)));

      const general = matched.map(([, item]) => item.growth_rate).filter((v) => v !== null && v !== undefined);
      const marine = matched.map(([, item]) => item.marine_growth).filter((v) => v !== null && v !== undefined);
      const species = matched.reduce((sum, [, item]) => sum + (item.species_count || 0), 0);

      const avgGeneral = general.length ? general.reduce((a, b) => a + b, 0) / general.length : null;
      const avgMarine = marine.length ? marine.reduce((a, b) => a + b, 0) / marine.length : null;

      const countriesWithGrowth = matched
        .map(([country, item]) => ({
          country,
          growth: item.growth_rate,
        }))
        .filter((item) => item.growth !== null && item.growth !== undefined);

      const sortedByGrowthDesc = [...countriesWithGrowth].sort((a, b) => b.growth - a.growth);
      const sortedByGrowthAsc = [...countriesWithGrowth].sort((a, b) => a.growth - b.growth);

      const bestGrowingCountry = sortedByGrowthDesc[0] || null;
      const worstGrowingCountry = sortedByGrowthAsc[0] || null;

      return {
        continent,
        countries: matched.length,
        species,
        avgGeneral,
        avgMarine,
        countriesWithGrowth,
        sortedByGrowthDesc,
        bestGrowingCountry,
        worstGrowingCountry,
      };
    });
  }, [dashboardData]);

  useEffect(() => {
    if (activeContinentIndex >= continentData.length) {
      setActiveContinentIndex(0);
    }
  }, [activeContinentIndex, continentData.length]);

  const activeContinent = continentData[activeContinentIndex] || null;

  const visibleCountries = useMemo(() => {
    if (!activeContinent) return [];
    return activeContinent.sortedByGrowthDesc;
  }, [activeContinent]);

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10 space-y-7">
      <header className="glass-panel rounded-3xl p-6 md:p-8">
        <p className="section-heading">Research Gap Resolution</p>
        <h1 className="mt-2 text-3xl md:text-5xl text-[#ebfff8] font-bold">Continent-Based Visualization Segregation</h1>
        <p className="mt-4 max-w-3xl text-[#a7c6be] leading-relaxed">
          This view resolves the previous lack of geographic stratification by grouping telemetry into continents and exposing separate general and marine trajectories.
          It helps identify where coverage is rich, where trends diverge, and where targeted data collection is still needed.
        </p>
      </header>

      <section className="glass-panel rounded-3xl p-5 md:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveContinentIndex((prev) => (prev - 1 + continentData.length) % continentData.length)}
              disabled={!continentData.length}
              className="w-9 h-9 rounded-lg border border-[#355360] bg-[#102531] text-[#d9f8ef] inline-flex items-center justify-center disabled:opacity-40"
              aria-label="Previous continent"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveContinentIndex((prev) => (prev + 1) % continentData.length)}
              disabled={!continentData.length}
              className="w-9 h-9 rounded-lg border border-[#355360] bg-[#102531] text-[#d9f8ef] inline-flex items-center justify-center disabled:opacity-40"
              aria-label="Next continent"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-[#8ea8a1] uppercase tracking-[0.12em]">
              {continentData.length ? `${activeContinentIndex + 1} of ${continentData.length}` : "0 of 0"}
            </p>
          </div>
        </div>

        {!activeContinent ? (
          <div className="rounded-2xl p-6 border border-[#32505b] bg-[#0d1f2a] text-center text-[#8ea8a1]">
            No continent data available.
          </div>
        ) : (
          <article className="rounded-3xl p-6 border border-[#32505b] bg-[#0d1f2a]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl text-[#e9fff8]">{activeContinent.continent}</h2>
              <p className="text-xs text-[#8ea8a1] uppercase tracking-[0.12em]">
                {activeContinent.countries} countries
              </p>
            </div>

            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl p-3 bg-[#102531] border border-[#355360]">
                <p className="text-xs text-[#8ea9a1] uppercase tracking-[0.12em]">Species tracked count</p>
                <p className="text-xl text-[#e6faf4] font-semibold mt-1">{activeContinent.species.toLocaleString()}</p>
              </div>
              <div className="rounded-xl p-3 bg-[#102531] border border-[#355360]">
                <p className="text-xs text-[#8ea9a1] uppercase tracking-[0.12em]">General avg</p>
                <p className={`text-xl font-semibold mt-1 ${activeContinent.avgGeneral !== null && activeContinent.avgGeneral >= 0 ? "text-[#74e8c4]" : "text-[#ffad92]"}`}>
                  {activeContinent.avgGeneral === null ? "No data" : `${(activeContinent.avgGeneral * 100).toFixed(2)}%`}
                </p>
              </div>
              <div className="rounded-xl p-3 bg-[#102531] border border-[#355360]">
                <p className="text-xs text-[#8ea9a1] uppercase tracking-[0.12em]">Marine avg</p>
                <p className={`text-xl font-semibold mt-1 ${activeContinent.avgMarine !== null && activeContinent.avgMarine >= 0 ? "text-[#7ab8ff]" : "text-[#ffad92]"}`}>
                  {activeContinent.avgMarine === null ? "No data" : `${(activeContinent.avgMarine * 100).toFixed(2)}%`}
                </p>
              </div>
            </div>

            <div className="mt-5 grid lg:grid-cols-2 gap-4">
              <div className="rounded-xl p-4 bg-[#102531] border border-[#355360]">
                <p className="text-xs uppercase tracking-[0.12em] text-[#87a79f]">Country list with general growth rate</p>
                <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
                  {visibleCountries.length ? (
                    visibleCountries.map((country) => (
                      <div key={country.country} className="rounded-lg px-3 py-2 bg-[#0d1d27] border border-[#2f4f5a] flex items-center justify-between text-sm">
                        <span className="text-[#d5f3ea]">{country.country}</span>
                        <span className={country.growth >= 0 ? "text-[#75e9c5]" : "text-[#ffb49e]"}>
                          {(country.growth * 100).toFixed(2)}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#8ea8a1]">No countries mapped for this continent in current data.</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl p-4 bg-[#102531] border border-[#355360]">
                <p className="text-xs uppercase tracking-[0.12em] text-[#87a79f]">Line plot: all countries growth rate</p>
                <div className="h-80 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={activeContinent.countriesWithGrowth.map((item: any, idx: number) => ({
                        index: idx + 1,
                        country: item.country,
                        growthPercent: item.growth * 100,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#35515c" vertical={false} />
                      <XAxis dataKey="index" stroke="#91ada6" tickLine={false} axisLine={false} />
                      <YAxis stroke="#91ada6" tickLine={false} axisLine={false} tickFormatter={(value) => `${value.toFixed(0)}%`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0d1f2b", border: "1px solid #33515d", borderRadius: 10 }}
                        formatter={(value: any) => [`${Number(value).toFixed(2)}%`, "General growth"]}
                        labelFormatter={(label: any, payload: any) => {
                          const country = payload?.[0]?.payload?.country;
                          return country ? `${country} (#${label})` : `Country #${label}`;
                        }}
                      />
                      <Line type="monotone" dataKey="growthPercent" stroke="#63e6be" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl p-3 bg-[#102531] border border-[#355360]">
                <p className="text-xs text-[#8ea9a1] uppercase tracking-[0.12em] inline-flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#74e8c4]" />
                  Best growing country
                </p>
                <p className="text-[#e6faf4] font-semibold mt-1">
                  {activeContinent.bestGrowingCountry
                    ? `${activeContinent.bestGrowingCountry.country} (${(activeContinent.bestGrowingCountry.growth * 100).toFixed(2)}%)`
                    : "No data"}
                </p>
              </div>
              <div className="rounded-xl p-3 bg-[#102531] border border-[#355360]">
                <p className="text-xs text-[#8ea9a1] uppercase tracking-[0.12em] inline-flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-[#ffad92]" />
                  Worst growing country
                </p>
                <p className="text-[#e6faf4] font-semibold mt-1">
                  {activeContinent.worstGrowingCountry
                    ? `${activeContinent.worstGrowingCountry.country} (${(activeContinent.worstGrowingCountry.growth * 100).toFixed(2)}%)`
                    : "No data"}
                </p>
              </div>
            </div>
          </article>
        )}
      </section>
    </div>
  );
}
