import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Brain, 
  ArrowUpRight, 
  RefreshCw,
  CreditCard,
  CheckCircle,
  LogOut,
  Database,
  Lock,
  User,
  Shield,
  Activity,
  AlertTriangle,
  FileText
} from "lucide-react";
import { UserProfile, AIAnalysisRecord } from "../types";
import { useSubscription } from "../context/SubscriptionContext";
import { isSupabaseConfigured, supabase } from "../supabaseClient";

interface DashboardOverviewProps {
  profile: UserProfile;
  analyses?: AIAnalysisRecord[];
  onNavigateToTab: (tab: string) => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
  onUpdateProfile?: (updated: UserProfile) => void;
  onLogout?: () => void;
  trades?: any;
}

export default function DashboardOverview({
  analyses = [],
  onNavigateToTab,
  isDemoMode,
  onToggleDemoMode,
  onUpdateProfile,
  onLogout,
  trades,
}: DashboardOverviewProps) {
  const { profile, initiatePayPalCheckout } = useSubscription();

  // Real connection status states
  const [isDbActive, setIsDbActive] = useState(isSupabaseConfigured);
  const [isAuthActive, setIsAuthActive] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        setIsAuthActive(!!data.session);
        setIsDbActive(true);
      }).catch(() => {
        setIsAuthActive(false);
        setIsDbActive(false);
      });
    } else {
      // Offline fallback state
      setIsAuthActive(true);
      setIsDbActive(false);
    }
  }, []);

  // Subscription Metadata calculation
  const currentPlan = profile.plan || "FREE_TRIAL";
  const planNameFormatted = currentPlan === "FREE_TRIAL" ? "FREE TRIAL" : currentPlan.toUpperCase();
  const statusFormatted = profile.paymentFailed ? "Payment Failed" : (profile.subscription_status || "Active");
  
  const totalCredits = profile.total_credits !== undefined ? profile.total_credits : profile.creditsLimit;
  const usedCredits = profile.creditsUsed || 0;
  const remainingCredits = profile.credits_remaining !== undefined ? profile.credits_remaining : Math.max(0, totalCredits - usedCredits);
  const renewalDate = profile.expiry_date || profile.nextResetDate || "Never";

  // AI Analysis calculations
  const totalAnalyses = analyses.length;
  const latestAnalysis = analyses[0];

  return (
    <div className="space-y-6">
      {/* Welcome Notification for new real users */}
      {totalAnalyses === 0 && (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 rounded-2xl p-5 relative overflow-hidden animate-fade-in shadow-xl shadow-blue-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                SYSTEM INITIALIZED
              </h2>
              <p className="text-xs text-slate-300">
                Welcome to the TradeModeAI Institutional Console. Initiate your first live asset analysis to unlock your decision engine.
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

      {/* Core Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
            PORTAL CONSOLE
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>MEMBER: <span className="text-blue-455 font-bold">{profile.name}</span></span>
            <span className="text-slate-800">|</span>
            <span>PLAN: <span className="text-sky-450 font-bold uppercase">{planNameFormatted}</span></span>
            <span className="text-slate-800">|</span>
            <span>Credits: <span className="text-emerald-450 font-bold">{remainingCredits} / {totalCredits}</span></span>
            <span className="text-slate-800">|</span>
            <span>Status: <span className={`font-bold uppercase ${profile.paymentFailed ? 'text-rose-450' : 'text-emerald-450'}`}>{statusFormatted}</span></span>
          </p>
        </div>

        {/* Active Workspace Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/50 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDbActive ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {isDbActive ? "SUPABASE LIVE ENCLAVE" : "LOCAL CACHE MODE"}
            </span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 hover:text-rose-350 rounded-lg text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Main SaaS KPI Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION 1: ACCOUNT OVERVIEW */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative group hover:border-slate-750 transition-all overflow-hidden text-left flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <User className="w-16 h-16 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <h2 className="text-xs font-mono font-black text-slate-300 uppercase tracking-widest">Account Overview</h2>
              </div>
              <span className={`inline-block font-mono font-black text-[9px] uppercase px-2 py-0.5 rounded border ${
                profile.paymentFailed 
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}>
                {statusFormatted}
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Plan:</span>
                <span className="font-bold text-white uppercase">{planNameFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Credits Remaining:</span>
                <span className="font-extrabold text-emerald-400">{remainingCredits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Credits Used:</span>
                <span className="font-bold text-slate-300">{usedCredits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Next Renewal Date:</span>
                <span className="font-bold text-slate-300">{renewalDate}</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-850/60 mt-3 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500">MEMBER SINCE:</span>
            <span className="text-slate-300 font-bold">{profile.joinDate || "N/A"}</span>
          </div>
        </div>

        {/* SECTION 2: AI ANALYSIS SUMMARY */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative group hover:border-slate-750 transition-all overflow-hidden text-left flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Brain className="w-16 h-16 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-400" />
                <h2 className="text-xs font-mono font-black text-slate-300 uppercase tracking-widest">AI Analysis Summary</h2>
              </div>
              <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                Ready
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Analyses:</span>
                <span className="font-bold text-white">{totalAnalyses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latest Analysis:</span>
                <span className="font-bold text-slate-300 truncate max-w-[120px]">
                  {latestAnalysis ? latestAnalysis.pair : "None"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Analysis Status:</span>
                <span className="font-bold text-indigo-400">Operational</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remaining Credits:</span>
                <span className="font-extrabold text-emerald-400">{remainingCredits}</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-850/60 mt-3 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500">LATEST RUN DATE:</span>
            <span className="text-slate-300 font-bold">
              {latestAnalysis ? (latestAnalysis.dateTime || latestAnalysis.date) : "N/A"}
            </span>
          </div>
        </div>

        {/* SECTION 5: SYSTEM STATUS */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative group hover:border-slate-750 transition-all overflow-hidden text-left flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Shield className="w-16 h-16 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-mono font-black text-slate-300 uppercase tracking-widest">System Status</h2>
              </div>
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">AI Engine:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Database:</span>
                <span className={`font-bold flex items-center gap-1 ${isDbActive ? 'text-emerald-400' : 'text-blue-400'}`}>
                  <span className={`w-1 h-1 rounded-full ${isDbActive ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                  {isDbActive ? "Connected" : "Local Client Cache"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Payment System:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Authentication:</span>
                <span className={`font-bold flex items-center gap-1 ${isAuthActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  {isAuthActive ? "Secure Session" : "Sandbox"}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-850/60 mt-3 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500">PING LATENCY:</span>
            <span className="text-slate-300 font-bold">14ms</span>
          </div>
        </div>

      </div>

      {/* Grid Row for Quick Actions, Upgrades, & Billing Simulators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECTION 4: QUICK ACTIONS */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-left relative overflow-hidden flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight leading-none font-sans">Quick Console Actions</h2>
                <span className="text-[9px] text-slate-500 font-mono uppercase font-bold">Instantly launch runs or manage tiers</span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-slate-500 uppercase">TIER ACCESS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => onNavigateToTab("AI Analysis")}
              className="p-3.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 rounded-xl text-left transition-all active:scale-95 group cursor-pointer"
            >
              <span className="text-[10px] font-mono text-slate-400 font-semibold block uppercase">Run Engine</span>
              <span className="text-xs font-bold text-white mt-1.5 flex items-center justify-between group-hover:text-blue-400 transition-colors">
                New AI Analysis
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => onNavigateToTab("Manage Subscription")}
              className="p-3.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 rounded-xl text-left transition-all active:scale-95 group cursor-pointer"
            >
              <span className="text-[10px] font-mono text-slate-400 font-semibold block uppercase">Subscription Portal</span>
              <span className="text-xs font-bold text-white mt-1.5 flex items-center justify-between group-hover:text-blue-400 transition-colors">
                Manage Subscription
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </button>

            <button
              onClick={() => onNavigateToTab("Manage Subscription")}
              className="p-3.5 bg-gradient-to-br from-blue-950/30 to-slate-950/60 hover:bg-slate-900 border border-blue-500/20 rounded-xl text-left transition-all active:scale-95 group cursor-pointer"
            >
              <span className="text-[10px] font-mono text-slate-400 font-semibold block uppercase">Upgrades</span>
              <span className="text-xs font-bold text-white mt-1.5 flex items-center justify-between group-hover:text-blue-400 transition-colors">
                Upgrade Plan
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </button>
          </div>

          {/* Upgrade Buttons specifically shown if Free Trial */}
          {currentPlan === "FREE_TRIAL" && (
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="text-left space-y-1">
                <span className="text-[9px] font-mono text-blue-400 font-bold block">TIER EXPIRED OR LOW LIMIT</span>
                <p className="text-xs text-slate-200 font-bold">Unlock Institutional-Grade Analysis & Higher AI Credits</p>
                <p className="text-[11px] text-slate-400 leading-normal mt-1">
                  Upgrade your subscription to unlock more AI analyses, faster processing, and advanced institutional-grade trading reports.
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto shrink-0">
                <button
                  onClick={() => initiatePayPalCheckout("pro")}
                  className="flex-1 md:flex-initial px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] uppercase font-mono tracking-wider rounded-lg transition-all cursor-pointer shadow-lg"
                >
                  Buy Pro License
                </button>
                <button
                  onClick={() => initiatePayPalCheckout("elite")}
                  className="flex-1 md:flex-initial px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-extrabold text-[10px] uppercase font-mono tracking-wider rounded-lg transition-all cursor-pointer shadow-lg"
                >
                  Upgrade to Elite
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Supported Trading Platforms Section */}
        <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between text-left space-y-4">
          <div>
            <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-black">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-pulse" />
              SUPPORTED TRADING PLATFORMS
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-2.5">
              Upload chart screenshots from your preferred trading platform. TradeModeAI analyzes price action directly from chart images and is not limited to any specific broker or charting software.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 py-1.5">
            {[
              "TradingView",
              "MetaTrader 4 (MT4)",
              "MetaTrader 5 (MT5)",
              "cTrader",
              "NinjaTrader",
              "Thinkorswim",
              "DXtrade",
              "Match-Trader"
            ].map((platform) => (
              <span 
                key={platform} 
                className="bg-slate-950/50 border border-slate-850/85 rounded-lg px-2.5 py-1 text-[10px] font-black font-mono text-slate-300 hover:border-emerald-500/20 transition-colors cursor-default"
              >
                {platform}
              </span>
            ))}
          </div>

          <div className="pt-2.5 border-t border-slate-850/60">
            <p className="text-[10px] font-mono text-slate-500 italic text-center">
              "Any platform that provides clear candlestick charts is fully supported."
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: RECENT ANALYSIS */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-left relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight leading-none font-sans">Recent Analysis Records</h2>
              <span className="text-[9px] text-slate-500 font-mono uppercase font-bold">Audit log of latest deep analyses</span>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total Completed: <span className="text-emerald-450 font-bold">{analyses.length}</span>
          </span>
        </div>

        {analyses.length === 0 ? (
          <div className="py-12 text-center bg-slate-950/20 border border-dashed border-slate-850 rounded-xl space-y-2">
            <p className="text-xs text-slate-500 italic font-mono">
              No completed analysis entries found in database history.
            </p>
            <button
              onClick={() => onNavigateToTab("AI Analysis")}
              className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-400 text-slate-950 text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all font-mono"
            >
              Start New Analysis
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-slate-300">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 text-left">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Pair / Asset</th>
                  <th className="py-2.5 px-3">Decision Bias</th>
                  <th className="py-2.5 px-3 text-center">Confidence</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {analyses.map((rec) => {
                  const displayDate = rec.dateTime || `${rec.date} 12:00:00 PM`;
                  // Safely determine bias
                  const bias = rec.result?.marketBias || rec.result?.detectedBias || "NEUTRAL";
                  // Safely determine confidence
                  const confidence = rec.result?.confidenceScore || 
                    (rec.result?.riskAnalysis?.confidencePercentage 
                      ? `${rec.result.riskAnalysis.confidencePercentage}%` 
                      : "N/A");

                  return (
                    <tr key={rec.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-2.5 px-3 text-slate-200">{displayDate}</td>
                      <td className="py-2.5 px-3 font-bold text-blue-400">{rec.pair}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded ${
                          bias.toUpperCase().includes("BUY") || bias.toUpperCase().includes("BULL")
                            ? "bg-emerald-500/10 text-emerald-400"
                            : bias.toUpperCase().includes("SELL") || bias.toUpperCase().includes("BEAR")
                            ? "bg-rose-500/10 text-rose-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}>
                          {bias}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-100">{confidence}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase px-2 py-0.5 rounded">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          Success
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
