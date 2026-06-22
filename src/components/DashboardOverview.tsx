import React, { useState, useEffect } from "react";
import { 
  Award, 
  ShieldAlert, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Sparkles, 
  Brain, 
  ArrowUpRight, 
  Target, 
  RefreshCw,
  Plus,
  CreditCard,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { PropChallenge, TradeJournalEntry, UserProfile, AIAnalysisRecord } from "../types";

interface DashboardOverviewProps {
  profile: UserProfile;
  challenges: PropChallenge[];
  trades: TradeJournalEntry[];
  analyses?: AIAnalysisRecord[];
  activeChallengeId: string;
  onSelectChallenge: (id: string) => void;
  onNavigateToTab: (tab: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onUpdateProfile?: (updated: UserProfile) => void;
}

export default function DashboardOverview({
  profile,
  challenges,
  trades,
  analyses = [],
  activeChallengeId,
  onSelectChallenge,
  onNavigateToTab,
  isDemoMode,
  onToggleDemoMode,
  onUpdateProfile,
}: DashboardOverviewProps) {
  const activeChallenge = challenges.find((c) => c.id === activeChallengeId) || challenges[0] || null;

  // Live price simulator for real-time TradingView feel
  const [prices, setPrices] = useState<Record<string, { val: number; change: number }>>({
    XAUUSD: { val: 2314.15, change: -0.22 },
    BTCUSD: { val: 68420.50, change: 1.45 },
    EURUSD: { val: 1.08542, change: 0.08 },
    GBPUSD: { val: 1.26740, change: -0.15 },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setPrices((prev) => {
        const randXAU = (Math.random() - 0.5) * 0.8;
        const randBTC = (Math.random() - 0.5) * 45;
        const randEUR = (Math.random() - 0.5) * 0.0003;
        const randGBP = (Math.random() - 0.5) * 0.0004;

        return {
          XAUUSD: { val: +(prev.XAUUSD.val + randXAU).toFixed(2), change: prev.XAUUSD.change },
          BTCUSD: { val: +(prev.BTCUSD.val + randBTC).toFixed(2), change: prev.BTCUSD.change },
          EURUSD: { val: +(prev.EURUSD.val + randEUR).toFixed(5), change: prev.EURUSD.change },
          GBPUSD: { val: +(prev.GBPUSD.val + randGBP).toFixed(5), change: prev.GBPUSD.change },
        };
      });
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Real-time calculated statistics based strictly on active user journal:
  const totalTrades = trades.length;
  const winsCount = trades.filter((t) => t.status === "WIN").length;
  const winRate = totalTrades > 0 ? Math.round((winsCount / totalTrades) * 100) : 0;
  const totalNetProfit = trades.reduce((acc, t) => acc + t.profit, 0);

  // Challenge objectives variables
  const hasChallenge = !!activeChallenge;
  const accountSize = hasChallenge ? activeChallenge.accountSize : 0;
  const currentProfit = hasChallenge ? activeChallenge.currentProfit : 0;

  const dailyLossLimitDollars = hasChallenge ? (accountSize * activeChallenge.dailyLossLimitPercent) / 100 : 0;
  const maxDrawdownLimitDollars = hasChallenge ? (accountSize * activeChallenge.maxDrawdownPercent) / 100 : 0;
  const targetProfitPercent = hasChallenge ? activeChallenge.targetProfitPercent : 0;
  const targetProfitDollars = hasChallenge ? (accountSize * targetProfitPercent) / 100 : 0;

  const dailyDrawdownRemaining = hasChallenge 
    ? Math.max(0, dailyLossLimitDollars - activeChallenge.currentLossToday) 
    : 0;

  const maxDrawdownRemaining = hasChallenge 
    ? Math.max(0, maxDrawdownLimitDollars - (currentProfit < 0 ? Math.abs(currentProfit) : 0)) 
    : 0;

  const targetProgressPercent = (hasChallenge && targetProfitDollars > 0)
    ? Math.min(100, Math.max(0, (currentProfit / targetProfitDollars) * 100)) 
    : 0;

  // AI Cognitive insights discipline meter
  const aiAnalysesCount = analyses.length;
  const disciplineScore = totalTrades > 0 
    ? Math.min(100, Math.max(0, Math.round(70 + (winRate * 0.3) - (trades.filter(t => t.emotions.includes("FOMO")).length * 5))))
    : 0;

  return (
    <div className="space-y-6">
      {/* Mini Ticker Ribbon */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-3 flex items-center justify-between overflow-x-auto gap-6 shrink-0 scrollbar-hide">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono shrink-0">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-300">LIVE FEED:</span>
        </div>
        <div className="flex items-center gap-6 text-xs font-mono shrink-0">
          {(Object.entries(prices) as Array<[string, { val: number; change: number }]>).map(([pair, detail]) => (
            <div key={pair} className="flex items-center gap-2 shrink-0">
              <span className="text-slate-300 font-bold">{pair}</span>
              <span className="text-slate-50 font-medium tracking-tight bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/80">
                {detail.val}
              </span>
              <span className={detail.change >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {detail.change >= 0 ? "+" : ""}
                {detail.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome Notification for new real users */}
      {!isDemoMode && totalTrades === 0 && aiAnalysesCount === 0 && (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 rounded-2xl p-5 relative overflow-hidden animate-fade-in shadow-xl shadow-blue-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                SYSTEM INITIALIZED
              </h2>
              <p className="text-xs text-slate-300">
                Welcome to PropFirm AI Coach. Start your first analysis to begin tracking your trading performance.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab("AI Analysis")}
              className="px-3.5 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold font-mono text-[10px] rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer uppercase"
            >
              <span>First Analysis</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Core Top Bar: Selector & Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
            PORTAL CONSOLE
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>MEMBER: <span className="text-blue-450 font-bold">{profile.name}</span></span>
            <span className="text-slate-800">|</span>
            <span>PLAN: <span className="text-sky-450 font-bold uppercase">{profile.subscriptionPlan === 'Free' ? 'FREE TRIAL' : (profile.plan_name ? profile.plan_name.toUpperCase() : `${profile.subscriptionPlan.toUpperCase()} TRADER`)}</span></span>
            <span className="text-slate-800">|</span>
            <span>Credits Remaining: <span className="text-emerald-450 font-bold">{(profile.total_credits !== undefined && profile.credits_remaining !== undefined) ? `${profile.credits_remaining} / ${profile.total_credits}` : `${Math.max(0, profile.creditsLimit - profile.creditsUsed)} / ${profile.creditsLimit}`}</span></span>
            <span className="text-slate-800">|</span>
            <span>Subscription Status: <span className={`font-bold uppercase ${profile.subscriptionPlan === 'Free' ? 'text-rose-400' : 'text-emerald-450'}`}>{profile.subscriptionPlan === 'Free' ? 'Inactive' : 'Active'}</span></span>
          </p>
        </div>

        {/* Active Workspace / Challenge Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/50 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {isDemoMode ? "DEMO PLAYGROUND" : "LIVE TELEMETRY"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">WORKSPACE:</span>
            {challenges.length > 0 ? (
              <select
                value={activeChallengeId}
                onChange={(e) => onSelectChallenge(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-200 px-3 py-2 outline-none focus:border-blue-500/60"
              >
                {challenges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (${c.accountSize.toLocaleString()})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-amber-500 font-mono font-bold bg-amber-500/10 border border-amber-500/25 rounded-md px-2.5 py-1">
                No challenge selected
              </span>
            )}
            <button
              onClick={() => onNavigateToTab("Challenge Tracker")}
              className="p-2 bg-slate-900 hover:bg-slate-850 hover:text-white rounded-lg border border-slate-800 transition-colors"
              title="Add Challenge"
            >
              <Plus className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Dedicated Current Plan Card */}
        <div id="dashboard-current-plan-card" className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 border-2 border-blue-500/30 rounded-xl p-4 relative group hover:border-blue-500/60 transition-all overflow-hidden col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-3 opacity-15 pointer-events-none">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-wider font-bold">Current Plan</span>
              <span className="text-sm font-black font-mono text-blue-450 uppercase tracking-tight block mt-0.5">
                {profile.subscriptionPlan === 'Free' ? 'FREE TRIAL' : (profile.plan_name ? profile.plan_name.toUpperCase() : `${profile.subscriptionPlan.toUpperCase()} TRADER`)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-wider font-bold">Credits Remaining</span>
              <span className="text-lg font-black font-mono text-white block mt-0.5">
                {(profile.total_credits !== undefined && profile.credits_remaining !== undefined) ? `${profile.credits_remaining} / ${profile.total_credits}` : `${Math.max(0, profile.creditsLimit - profile.creditsUsed)} / ${profile.creditsLimit}`}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-wider font-bold">Status</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 uppercase mt-0.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>

        {/* KPI 1: Account Size / Capital */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 relative group hover:border-slate-700/60 transition-all overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs font-mono text-slate-400">TOTAL CAPITAL</span>
              <span className="block text-xl sm:text-2xl font-black text-white mt-1">
                ${(accountSize + currentProfit).toLocaleString()}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Initial Size: <span className="text-slate-300 font-semibold">${accountSize.toLocaleString()}</span>
          </p>
        </div>

        {/* KPI 2: Daily Drawdown Remaining */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 relative group hover:border-slate-700/60 transition-all overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs font-mono text-slate-400">DAILY LIMIT REMAINING</span>
              <span className="block text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                ${dailyDrawdownRemaining.toLocaleString()}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full"
              style={{ width: `${dailyLossLimitDollars > 0 ? (dailyDrawdownRemaining / dailyLossLimitDollars) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1.5 flex justify-between">
            <span>Loss today: ${hasChallenge ? activeChallenge.currentLossToday.toLocaleString() : "0"}</span>
            <span>Limit: {hasChallenge ? activeChallenge.dailyLossLimitPercent : "0"}%</span>
          </p>
        </div>

        {/* KPI 3: Max Drawdown Remaining */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 relative group hover:border-slate-700/60 transition-all overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs font-mono text-slate-400">MAX LIMIT REMAINING</span>
              <span className="block text-xl sm:text-2xl font-black text-rose-400 mt-1">
                ${maxDrawdownRemaining.toLocaleString()}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
            <div
              className={`bg-rose-500 h-full`}
              style={{ width: `${maxDrawdownLimitDollars > 0 ? (maxDrawdownRemaining / maxDrawdownLimitDollars) * 100 : 0}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1.5 flex justify-between">
            <span>Max drawdown: ${maxDrawdownLimitDollars.toLocaleString()}</span>
            <span>Limit: {hasChallenge ? activeChallenge.maxDrawdownPercent : "0"}%</span>
          </p>
        </div>

        {/* KPI 4: Win Rate Distribution */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 relative group hover:border-slate-700/60 transition-all overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-xs font-mono text-slate-400">EDGE WIN FACTOR</span>
              <span className="block text-xl sm:text-2xl font-black text-white mt-1">
                {winRate}%
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            Out of <span className="text-blue-400 font-bold">{totalTrades}</span> journaled trades
          </p>
        </div>
      </div>

      {/* Remaining Credits & Billing Simulator Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-md font-bold text-white tracking-tight leading-none font-sans">Remaining Credits</h2>
              <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">BILLING & AI LIMIT CONSOLE</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono leading-none">
                {Math.max(0, profile.creditsLimit - profile.creditsUsed)}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                / {profile.creditsLimit} Credits Left
              </span>
            </div>

            {/* Credit Progress bar */}
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  (profile.creditsLimit - profile.creditsUsed) <= 10 ? 'bg-rose-500' : (profile.creditsLimit - profile.creditsUsed) <= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(Math.max(0, profile.creditsLimit - profile.creditsUsed) / profile.creditsLimit) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Active Status Badge */}
          {profile.paymentFailed ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-450 text-[10px] font-mono font-bold rounded-lg uppercase">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Payment Failure Block Active</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded-lg uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span>Subscription Secure & Active</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-4 border-t lg:border-t-0 lg:border-x border-slate-800/80 pt-4 lg:pt-0 lg:px-6">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-bold">Subscription Summary</h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Selected Tier:</span>
              <span className="font-mono font-bold text-white uppercase bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {profile.subscriptionPlan === 'Free' ? 'Free Trial' : `${profile.subscriptionPlan} Trader`}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Next Reset Date:</span>
              <span className="text-sky-400 font-mono font-bold">{profile.nextResetDate}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Credit Allocation:</span>
              <span className="text-emerald-400 font-mono font-bold">{profile.creditsLimit} Analyses / mo</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4 pt-4 lg:pt-0">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
            <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            Billing Simulation Engine
          </h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                if (onUpdateProfile) {
                  onUpdateProfile({
                    ...profile,
                    creditsUsed: 0,
                    paymentFailed: false
                  });
                }
              }}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-[10px] font-black uppercase rounded-lg active:scale-95 transition-all text-center cursor-pointer shadow-md shadow-emerald-500/5"
            >
              Simulate Monthly Renewal
            </button>
            <button
              onClick={() => {
                if (onUpdateProfile) {
                  onUpdateProfile({
                    ...profile,
                    paymentFailed: !profile.paymentFailed
                  });
                }
              }}
              className={`w-full py-2 font-mono text-[10px] font-bold uppercase rounded-lg active:scale-95 transition-all text-center border cursor-pointer ${
                profile.paymentFailed 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-450 hover:bg-rose-500/20'
              }`}
            >
              {profile.paymentFailed ? "Simulate Payment Restored" : "Simulate Payment Failure"}
            </button>
          </div>
        </div>
      </div>

      {/* Target & AI Coach Dialogue Split Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profit Target Progression Card */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Profit Target Objective
              </h2>
              <p className="text-xs text-slate-400 font-mono">OBJECTIVE METRIC REPORT</p>
            </div>
            <span className="text-xs font-black font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded bg-slate-950 border border-blue-500/20">
              {hasChallenge ? `${targetProgressPercent.toFixed(1)}% Completed` : "No challenge selected"}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-400 font-mono">CURRENT PROFIT</span>
              <span className="text-xl font-extrabold text-white">
                ${currentProfit.toLocaleString()}
                <span className="text-xs text-slate-400 font-normal"> / ${targetProfitDollars.toLocaleString()}</span>
              </span>
            </div>

            {/* Progress Track */}
            <div className="relative">
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${targetProgressPercent}%` }}
                />
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-px bg-blue-400/80 h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-900 text-xs font-mono">
              <div>
                <span className="text-slate-400">REMAINING TARGET BALANCE:</span>
                <span className="block font-bold text-slate-200 mt-1">
                  ${Math.max(0, targetProfitDollars - currentProfit).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400">ACTIVE TRADING DAYS:</span>
                <span className="block font-bold text-slate-200 mt-1">
                  {hasChallenge ? `${activeChallenge.daysTraded} Target logged` : "0 Days logged"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Confidence Meter & Daily Word */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 relative flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Brain className="w-32 h-32 text-indigo-500" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-white text-sm font-sans">AI Coach Daily Focus</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">METRIC SCORE</span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-white">{disciplineScore}%</span>
              <span className="text-xs text-blue-400 font-mono font-bold uppercase tracking-wide">
                DISCIPLINE
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-900 font-medium">
              {totalTrades === 0 ? (
                <span className="text-slate-450 italic font-mono block text-center py-2">
                  No analyses yet
                </span>
              ) : currentProfit > 0 ? (
                "Your NY Session scaling is performing highly consistently. You have a solid buffer remaining before daily drawdown limits engage. Do not overtrade high-risk currency pairs before London market displacement."
              ) : (
                "Your trailing stop executions are slightly loose on Bitcoin setups. We recommend keeping stop offsets strictly within 1.5 ATR ranges and restricting initial trade risks to 0.5%."
              )}
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab("AI Analysis")}
            className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-200 py-2.5 rounded-lg mt-4 transition-all flex items-center justify-center gap-2 active:scale-95 group"
          >
            <span>Analyze Live Charts</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Shortcuts/Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <button
          onClick={() => onNavigateToTab("Risk Calculator")}
          className="p-4 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-800/80 rounded-xl text-left transition-all active:scale-95 flex items-center justify-between group cursor-pointer"
        >
          <div>
            <span className="text-xs font-mono text-slate-400">RISK METRIC</span>
            <span className="block text-sm font-bold text-white mt-1 group-hover:text-blue-500 transition-colors">Risk Calculator &arrow;</span>
          </div>
        </button>
        <button
          onClick={() => onNavigateToTab("Trade Journal")}
          className="p-4 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-800/80 rounded-xl text-left transition-all active:scale-95 flex items-center justify-between group cursor-pointer"
        >
          <div>
            <span className="text-xs font-mono text-slate-400">TRADE JOURNAL</span>
            <span className="block text-sm font-bold text-white mt-1 group-hover:text-blue-500 transition-colors">
              {totalTrades === 0 ? "No trades yet" : `Active Logs (${totalTrades}) \u2192`}
            </span>
          </div>
        </button>
        <button
          onClick={() => onNavigateToTab("Challenge Tracker")}
          className="p-4 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-800/80 rounded-xl text-left transition-all active:scale-95 flex items-center justify-between group cursor-pointer"
        >
          <div>
            <span className="text-xs font-mono text-slate-400">CHALLENGE PROGRESS</span>
            <span className="block text-sm font-bold text-white mt-1 group-hover:text-blue-500 transition-colors">
              {!hasChallenge ? "No challenge selected" : "Prop Objectives \u2192"}
            </span>
          </div>
        </button>
        <button
          onClick={() => onNavigateToTab("Performance Analytics")}
          className="p-4 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-800/80 rounded-xl text-left transition-all active:scale-95 flex items-center justify-between group relative cursor-pointer"
        >
          <div>
            <span className="text-xs font-mono text-slate-400 font-semibold">PERFORMANCE ANALYTICS</span>
            <span className="block text-sm font-bold text-white mt-1 group-hover:text-blue-500 transition-colors">
              {totalTrades === 0 ? "No performance data available" : "Curves & Trend \u2192"}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
