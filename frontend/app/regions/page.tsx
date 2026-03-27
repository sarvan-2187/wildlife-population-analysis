"use client";

import { useEffect, useMemo, useState } from "react";
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

      return {
        continent,
        countries: matched.length,
        species,
        avgGeneral,
        avgMarine,
        topCountries: matched
          .slice(0, 4)
          .map(([country, item]) => ({ country, growth: item.growth_rate }))
          .sort((a, b) => (b.growth || 0) - (a.growth || 0)),
      };
    });
  }, [dashboardData]);

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

      <section className="grid lg:grid-cols-2 gap-5">
        {continentData.map((continent) => (
          <article key={continent.continent} className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-[#e9fff8]">{continent.continent}</h2>
              <p className="text-xs text-[#8ea8a1] uppercase tracking-[0.12em]">{continent.countries} countries</p>
            </div>

            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl p-3 bg-[#102531] border border-[#355360]">
                <p className="text-xs text-[#8ea9a1]">Species count</p>
                <p className="text-xl text-[#e6faf4] font-semibold mt-1">{continent.species.toLocaleString()}</p>
              </div>
              <div className="rounded-xl p-3 bg-[#102531] border border-[#355360]">
                <p className="text-xs text-[#8ea9a1]">General avg</p>
                <p className={`text-xl font-semibold mt-1 ${continent.avgGeneral !== null && continent.avgGeneral >= 0 ? "text-[#74e8c4]" : "text-[#ffad92]"}`}>
                  {continent.avgGeneral === null ? "No data" : `${(continent.avgGeneral * 100).toFixed(2)}%`}
                </p>
              </div>
              <div className="rounded-xl p-3 bg-[#102531] border border-[#355360]">
                <p className="text-xs text-[#8ea9a1]">Marine avg</p>
                <p className={`text-xl font-semibold mt-1 ${continent.avgMarine !== null && continent.avgMarine >= 0 ? "text-[#7ab8ff]" : "text-[#ffad92]"}`}>
                  {continent.avgMarine === null ? "No data" : `${(continent.avgMarine * 100).toFixed(2)}%`}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.12em] text-[#87a79f]">Observed countries (sample)</p>
              <div className="mt-3 space-y-2">
                {continent.topCountries.length ? (
                  continent.topCountries.map((country) => (
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
          </article>
        ))}
      </section>
    </div>
  );
}
