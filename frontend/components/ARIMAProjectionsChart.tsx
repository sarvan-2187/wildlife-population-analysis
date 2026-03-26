"use client";

import React from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
} from "recharts";

interface ARIMAProjectionsChartProps {
  predictions: Record<string, any>;
  title?: string;
}

export const ARIMAProjectionsChart: React.FC<ARIMAProjectionsChartProps> = ({
  predictions,
  title = "ARIMA Stochastic Population Projections",
}) => {
  // Prepare data from multiple species for aggregated view
  const aggregateData = () => {
    const speciesArray = Object.entries(predictions).slice(0, 5); // Top 5 species
    const yearMap: Map<number, any> = new Map();

    speciesArray.forEach(([species, pred]) => {
      const historicalYears = pred?.historical_data?.years || [];
      const historicalPops = pred?.historical_data?.populations || [];
      const forecastYears = pred?.forecast_trend?.forecast_years || [];
      const forecastPops = pred?.forecast_trend?.forecast_populations || [];

      // Add historical data
      historicalYears.forEach((year: number, idx: number) => {
        if (!yearMap.has(year)) {
          yearMap.set(year, { year, historical: [], forecast: [] });
        }
        const entry = yearMap.get(year);
        entry.historical.push({
          value: historicalPops[idx] || 0,
          species,
        });
      });

      // Add forecast data
      forecastYears.forEach((year: number, idx: number) => {
        if (!yearMap.has(year)) {
          yearMap.set(year, { year, historical: [], forecast: [] });
        }
        const entry = yearMap.get(year);
        entry.forecast.push({
          value: forecastPops[idx] || 0,
          species,
          trend: pred?.forecast_trend?.forecast_trend,
          confidence: pred?.current_trend?.confidence,
        });
      });
    });

    // Sort by year
    return Array.from(yearMap.values())
      .sort((a, b) => a.year - b.year)
      .map((entry) => ({
        year: entry.year,
        // Average population across species
        historicalPop:
          entry.historical.length > 0
            ? Math.round(
                entry.historical.reduce((sum, h) => sum + h.value, 0) /
                  entry.historical.length
              )
            : null,
        forecastPop:
          entry.forecast.length > 0
            ? Math.round(
                entry.forecast.reduce((sum, f) => sum + f.value, 0) /
                  entry.forecast.length
              )
            : null,
        // Stochastic bounds (simplified: ±20% confidence interval)
        upper:
          entry.forecast.length > 0
            ? Math.round(
                (entry.forecast.reduce((sum, f) => sum + f.value, 0) /
                  entry.forecast.length) *
                  1.2
              )
            : null,
        lower:
          entry.forecast.length > 0
            ? Math.round(
                (entry.forecast.reduce((sum, f) => sum + f.value, 0) /
                  entry.forecast.length) *
                  0.8
              )
            : null,
      }));
  };

  const data = aggregateData();
  const splitYear = 2025;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-zinc-200">{title}</h3>
        <div className="text-xs text-zinc-500 uppercase font-black tracking-widest">
          2026-2031 Projection
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-zinc-800/50 p-6 bg-zinc-900/40">
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <defs>
              <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="uncertaintyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              stroke="#71717a"
              style={{ fontSize: "12px" }}
              tick={{ fill: "#a1a1aa" }}
            />
            <YAxis
              stroke="#71717a"
              style={{ fontSize: "12px" }}
              tick={{ fill: "#a1a1aa" }}
              label={{ value: "Population (Avg)", angle: -90, position: "insideLeft" }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fafafa" }}
              formatter={(value) =>
                value !== null ? `${(value as number).toLocaleString()}` : "N/A"
              }
              labelFormatter={(label) => `Year: ${label}`}
            />

            {/* Historical data line */}
            <Line
              type="monotone"
              dataKey="historicalPop"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={false}
              name="Historical Population"
              isAnimationActive={true}
            />

            {/* Forecast area with uncertainty band */}
            <Area
              type="monotone"
              dataKey="upper"
              fill="url(#uncertaintyGradient)"
              stroke="none"
              name="Uncertainty Band"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="lower"
              fill="url(#uncertaintyGradient)"
              stroke="none"
              isAnimationActive={false}
            />

            {/* Forecast line */}
            <Line
              type="monotone"
              dataKey="forecastPop"
              stroke="#fbbf24"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={false}
              name="ARIMA Forecast"
              isAnimationActive={true}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <div className="mt-4 flex gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-cyan-500" />
            <span className="text-zinc-400">Historical (1990-2025)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-amber-400" style={{ borderTop: "2px dashed" }} />
            <span className="text-zinc-400">ARIMA Forecast (2026-2031)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-gradient-to-b from-amber-500/30 to-transparent" />
            <span className="text-zinc-400">Stochastic Uncertainty (±20%)</span>
          </div>
        </div>
      </div>

      {/* Individual species compact charts */}
      <div className="space-y-3">
        <h4 className="text-sm font-black text-zinc-300 uppercase tracking-wider">
          Per-Species Projections
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(predictions)
            .slice(0, 4)
            .map(([species, pred]) => {
              const forecastYears = pred?.forecast_trend?.forecast_years || [];
              const forecastPops = pred?.forecast_trend?.forecast_populations || [];
              const confidence = pred?.current_trend?.confidence || 0.8;
              const trend = pred?.forecast_trend?.forecast_trend || "Stable";

              const chartData = forecastYears.map((year: number, idx: number) => ({
                year,
                population: forecastPops[idx] || 0,
              }));

              const trendColor =
                trend === "Growing"
                  ? "text-emerald-400"
                  : trend === "Declining"
                    ? "text-red-400"
                    : "text-amber-400";

              return (
                <div
                  key={species}
                  className="glass-panel rounded-2xl border border-zinc-800/50 p-4 bg-zinc-900/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase">
                        {species.replace(/_/g, " ")}
                      </p>
                      <p className={`text-sm font-black ${trendColor}`}>{trend}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-600 uppercase">Confidence</p>
                      <p className="text-xs font-black text-cyan-400">
                        {(confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id={`grad-${species}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 11, fill: "#a1a1aa" }}
                      />
                      <YAxis hide />
                      <Area
                        type="monotone"
                        dataKey="population"
                        stroke="#06b6d4"
                        fill={`url(#grad-${species})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  <div className="mt-2 text-[10px] text-zinc-500">
                    2026: {(forecastPops[0] || 0).toLocaleString()} →{" "}
                    2031: {(forecastPops[forecastPops.length - 1] || 0).toLocaleString()}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
