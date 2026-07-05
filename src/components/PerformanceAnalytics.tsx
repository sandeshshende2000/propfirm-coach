import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TradeJournalEntry } from "../types";
import { ShieldCheck, TrendingUp, Sparkles, Activity, BarChart3, Award } from "lucide-react";

interface PerformanceAnalyticsProps {
  trades: TradeJournalEntry[];
}

export default function PerformanceAnalytics({ trades = [] }: PerformanceAnalyticsProps) {
  const chartPalette = {
    primary: "#3b82f6", // Sleek Blue
    secondary: "#0ea5e9", // Sky Blue
    warning: "#f59e0b", // Amber
    danger: "#f43f5e", // Rose
    lightBg: "#09090b", // Dark Zinc 950
    gridBorder: "rgba(39, 39, 42, 0.4)", // Grid
  };

  const initialCapital = 100000;

  // Real-time dynamic aggregation
  const hasData = trades.length > 0;

  // Empty state rendering
  if (!hasData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
            <Activity className="w-6 h-6 text-blue-500" />
            ANALYTICS SYSTEM
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            SHARPE RATIOS, METRIC COMPLIANCE COEFFICIENTS, AND DRAWDOWN VISUALIZATION
          </p>
        </div>

        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto mt-8">
          <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-500 mb-2">
            <BarChart3 className="w-8 h-8 text-slate-550" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight font-mono">
            No performance data available
          </h3>
          <p className="text-xs text-slate-400 font-sans max-w-sm leading-relaxed">
            There are no trades logged in the system. Log your first trade in the Trade Journal or run an AI chart analysis to begin plotting institutional-grade metric curves.
          </p>
        </div>
      </div>
    );
  }

  // 1. Dynamic Equity Curve Growth
  let cumulProfit = 0;
  const equityCurve = [
    { day: "Start", equity: initialCapital },
    ...trades.slice().reverse().map((t, idx) => {
      cumulProfit += t.profit;
      return {
        day: t.date ? t.date.substring(5) : `Trade ${idx + 1}`,
        equity: initialCapital + cumulProfit,
      };
    })
  ];

  // 2. Dynamic Cumulative Win-Rate Trend Line
  let winsAcc = 0;
  const winRateTrend = trades.slice().reverse().map((t, idx) => {
    if (t.status === "WIN") winsAcc++;
    return {
      name: t.date ? t.date.substring(5) : `T-${idx + 1}`,
      winRate: Math.round((winsAcc / (idx + 1)) * 100),
    };
  });

  // Calculate Average Win Rate
  const totalNetValue = trades.reduce((acc, t) => acc + t.profit, 0);
  const calculatedAvgWinRate = Math.round((trades.filter(t => t.status === "WIN").length / trades.length) * 100);

  // 3. Dynamic Daily Drawdown Logs (Loss percentages relative to capital size)
  const drawdownLogs = trades.slice().reverse().map((t, idx) => {
    const isLoss = t.profit < 0;
    const lossPercent = isLoss ? Math.abs((t.profit / initialCapital) * 100) : 0;
    return {
      day: t.date ? t.date.substring(5) : `T-${idx + 1}`,
      drawdown: parseFloat(lossPercent.toFixed(2)),
    };
  });
  const peakDrawdownLog = Math.max(0.1, ...drawdownLogs.map(l => l.drawdown));

  // 4. Dynamic Profits/Losses grouped by Trading Session Volume
  const sessionsMap: Record<string, number> = {};
  trades.forEach(t => {
    const sName = t.session || "NYC Session";
    sessionsMap[sName] = (sessionsMap[sName] || 0) + t.profit;
  });
  const bestSessions = Object.entries(sessionsMap).map(([session, profit]) => ({
    session,
    profit,
  }));

  // Identify highest profit session
  const topSeshEntry = bestSessions.length > 0 
    ? bestSessions.reduce((max, curr) => curr.profit > max.profit ? curr : max, bestSessions[0]) 
    : { session: "London Open" };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
          <Activity className="w-6 h-6 text-blue-500" />
          INSTITUTIONAL METRICS
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          REACTIVE PERFORMANCE MODEL FOR FUNDING TARGET TRACKING
        </p>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Equity Curve Expansion AreaChart */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="font-bold text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              Equity Growth Curve
            </h3>
            <span className={`text-xs font-black font-mono ${totalNetValue >= 0 ? "text-blue-500" : "text-rose-400"}`}>
              {totalNetValue >= 0 ? "+" : ""}${totalNetValue.toLocaleString()} USD
            </span>
          </div>

          <div className="h-64 cursor-crosshair">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={equityCurve}
                margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="equityGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartPalette.primary} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={chartPalette.primary} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.gridBorder} vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  domain={["dataMin - 1000", "dataMax + 1000"]}
                  tickLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "12px" }}
                  labelStyle={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace" }}
                  itemStyle={{ fontSize: "12px", color: "#fff", fontWeight: "bold" }}
                  formatter={(val: any) => [`$${val.toLocaleString()}`, "Equity"]}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke={chartPalette.primary}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#equityGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Win Rate Trend LineChart */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="font-bold text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-sky-400" />
              Sustained Win Rate Trend
            </h3>
            <span className="text-xs font-black font-mono text-sky-400">Average {calculatedAvgWinRate}%</span>
          </div>

          <div className="h-64 cursor-crosshair">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={winRateTrend}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.gridBorder} vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "12px" }}
                  labelStyle={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace" }}
                  itemStyle={{ fontSize: "12px", color: chartPalette.secondary, fontWeight: "bold" }}
                  formatter={(val: any) => [`${val}%`, "Win Rate"]}
                />
                <Line
                  type="monotone"
                  dataKey="winRate"
                  stroke={chartPalette.secondary}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, stroke: "#0f172a" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Drawdown Logs AreaChart */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="font-bold text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-450" />
              Max Drawdown Exposure
            </h3>
            <span className="text-xs font-black font-mono text-rose-400">Peak {peakDrawdownLog.toFixed(2)}%</span>
          </div>

          <div className="h-64 cursor-crosshair">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={drawdownLogs}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="drawdownGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartPalette.danger} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={chartPalette.danger} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.gridBorder} vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, "auto"]} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "12px" }}
                  labelStyle={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace" }}
                  itemStyle={{ fontSize: "12px", color: chartPalette.danger, fontWeight: "bold" }}
                  formatter={(val: any) => [`${val}%`, "Drawdown"]}
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke={chartPalette.danger}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#drawdownGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Best Session Profits BarChart */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="font-bold text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Profits by Session Volume
            </h3>
            <span className="text-xs font-black font-mono text-amber-400">{topSeshEntry.session} Lead</span>
          </div>

          <div className="h-64 cursor-crosshair">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bestSessions}
                margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.gridBorder} vertical={false} />
                <XAxis dataKey="session" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#090d16", borderColor: "#1e293b", borderRadius: "12px" }}
                  labelStyle={{ fontSize: "10px", color: "#64748b", fontFamily: "monospace" }}
                  itemStyle={{ fontSize: "12px", color: "#fff", fontWeight: "bold" }}
                  formatter={(val: any) => [`$${val.toLocaleString()}`, "Sesh Net"]}
                />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {bestSessions.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.profit >= 0 ? chartPalette.primary : chartPalette.danger}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
