import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from "recharts";
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

export interface GrowthData {
  years: number[];
  populations: number[];
  growthRates: number[];
  forecast?: {
    years: number[];
    populations: number[];
    confidenceIntervals?: Record<string, { lower: number; upper: number }>;
  };
}

export interface PredictionMetrics {
  currentTrend: "Declining" | "Stable" | "Growing";
  currentConfidence: number;
  currentGrowthRate: number;
  forecastTrend: "Declining" | "Stable" | "Growing";
  forecastGrowthRate: number;
  aligned: boolean;
  alignmentScore: number;
  modelAccuracy: number;
}

interface GrowthInferenceChartProps {
  data: GrowthData;
  metrics: PredictionMetrics;
  title: string;
  compact?: boolean;
}

export const GrowthInferenceChart: React.FC<GrowthInferenceChartProps> = ({
  data,
  metrics,
  title,
  compact = false,
}) => {
  // Prepare chart data combining historical and forecast
  const chartData = [
    ...data.years.map((year, idx) => ({
      year,
      population: data.populations[idx],
      growthRate: data.growthRates[idx],
      type: "historical",
    })),
    ...(data.forecast?.years.map((year, idx) => ({
      year,
      population: data.forecast!.populations[idx],
      type: "forecast",
      isForecast: true,
    })) || []),
  ];

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "Declining":
        return "#ef4444";
      case "Growing":
        return "#10b981";
      default:
        return "#f59e0b";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "Declining":
        return <TrendingDown className="w-4 h-4" />;
      case "Growing":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-black text-zinc-200">{title}</h3>

        {/* Mini Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <p className="text-[10px] text-zinc-600 uppercase font-bold mb-1">Current</p>
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getTrendColor(metrics.currentTrend) }}
              />
              <span className="text-xs font-black text-zinc-400">
                {metrics.currentTrend}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
            <p className="text-[10px] text-zinc-600 uppercase font-bold mb-1">Forecast</p>
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getTrendColor(metrics.forecastTrend) }}
              />
              <span className="text-xs font-black text-zinc-400">
                {metrics.forecastTrend}
              </span>
            </div>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="h-40 bg-zinc-900 border border-zinc-800 rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#27272a" vertical={false} />
              <XAxis dataKey="year" stroke="#71717a" tick={{ fontSize: 10 }} />
              <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0a0b",
                  border: "1px solid #27272a",
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="population"
                stroke="#06b6d4"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-zinc-200 mb-4">{title}</h3>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <p className="text-[10px] text-zinc-600 font-black uppercase mb-2">
              Current Trend
            </p>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full" style={{ backgroundColor: getTrendColor(metrics.currentTrend) + "20" }}>
                {getTrendIcon(metrics.currentTrend)}
              </div>
              <span className="font-black text-zinc-100" style={{ color: getTrendColor(metrics.currentTrend) }}>
                {metrics.currentTrend}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <p className="text-[10px] text-zinc-600 font-black uppercase mb-2">
              Confidence
            </p>
            <p className="text-lg font-black text-cyan-400">
              {(metrics.currentConfidence * 100).toFixed(0)}%
            </p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <p className="text-[10px] text-zinc-600 font-black uppercase mb-2">
              Forecast Trend
            </p>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full" style={{ backgroundColor: getTrendColor(metrics.forecastTrend) + "20" }}>
                {getTrendIcon(metrics.forecastTrend)}
              </div>
              <span className="font-black text-zinc-100" style={{ color: getTrendColor(metrics.forecastTrend) }}>
                {metrics.forecastTrend}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <p className="text-[10px] text-zinc-600 font-black uppercase mb-2">
              Alignment
            </p>
            <div className="flex items-center gap-2">
              {metrics.aligned ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
              <span className="font-black text-zinc-100">{(metrics.alignmentScore * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#27272a" />
              <XAxis dataKey="year" stroke="#71717a" />
              <YAxis yAxisId="left" stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0a0b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => {
                  if (typeof value === "number" && value > 1000)
                    return [value.toLocaleString(), "Population"];
                  return [value, "Value"];
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="population"
                stroke="#06b6d4"
                name="Population"
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Rate Chart */}
      <div>
        <h4 className="text-sm font-black text-zinc-200 mb-4">Year-over-Year Growth Rate</h4>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#27272a" />
              <XAxis dataKey="year" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0a0a0b",
                  border: "1px solid #27272a",
                }}
                formatter={(value: any) => [`${value?.toFixed(2)}%`, "Growth Rate"]}
              />
              <Area
                type="monotone"
                dataKey="growthRate"
                stroke="#8b5cf6"
                fill="url(#colorGrowth)"
                name="Growth Rate %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
