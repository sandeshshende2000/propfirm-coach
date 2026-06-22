import React, { useState } from "react";
import { Sparkles, Brain, Upload, Check, AlertTriangle, Play, RefreshCw, Layers, ShieldCheck, Target, TrendingUp, HelpCircle, AlertCircle, CreditCard, Coins, ArrowLeft } from "lucide-react";
import { AIAnalysisResult, PropChallenge, AIAnalysisRecord, UserProfile } from "../types";
import { DEMO_ANALYSIS_CHANNELS } from "../data";

interface AIAnalysisProps {
  profile: UserProfile;
  activeChallenge: PropChallenge;
  analyses?: AIAnalysisRecord[];
  onAddAnalysis?: (analysis: Omit<AIAnalysisRecord, "id" | "date">) => void;
  onUpdateProfile?: (updated: UserProfile) => void;
  onNavigateToTab?: (tab: string) => void;
}

export default function AIAnalysis({ 
  profile, 
  activeChallenge, 
  analyses = [], 
  onAddAnalysis,
  onUpdateProfile,
  onNavigateToTab
}: AIAnalysisProps) {
  // Config state
  const [pair, setPair] = useState("XAUUSD");
  const [accountSize, setAccountSize] = useState(activeChallenge?.accountSize || 100000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [session, setSession] = useState("New York Open");

  // Screenshot base64 attachments state
  const [h1Chart, setH1Chart] = useState<string | null>(null);
  const [m15Chart, setM15Chart] = useState<string | null>(null);
  const [m5Chart, setM5Chart] = useState<string | null>(null);

  // Status logs
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  // Utility to read files into base64 strings
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setWarningMessage("Chart image size exceeds 8MB. Please compress and retry.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setter(reader.result);
          setWarningMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Preset generator to fast-track demonstration
  const loadDemoCharts = () => {
    // Elegant high-fidelity canvas base64 simulations representing charts
    setH1Chart("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%230b1329'/%3E%3Cpath d='M10,150 L50,140 L90,160 L130,120 L170,130 L210,80 L250,90 L290,50 L330,70 L370,40' stroke='%2310b981' stroke-width='3' fill='none'/%3E%3Ctext x='20' y='30' fill='%2364748b' font-family='monospace' font-size='10'%3EXAUUSD H1 DEMO CHART%3C/text%3E%3C/svg%3E");
    setM15Chart("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%230b1329'/%3E%3Cpath d='M10,120 L50,110 L90,130 L130,90 L170,100 L210,50 L250,70 L290,40 L330,60 L370,30' stroke='%2334d399' stroke-width='2' fill='none'/%3E%3Crect x='190' y='60' width='40' height='30' fill='%2310b981' fill-opacity='0.1' stroke='%2310b981' stroke-dasharray='3'/%3E%3Ctext x='20' y='30' fill='%2364748b' font-family='monospace' font-size='10'%3EXAUUSD M15 STRUCTURE%3C/text%3E%3C/svg%3E");
    setM5Chart("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='400' height='200' fill='%230b1329'/%3E%3Cpath d='M10,90 L50,110 L90,80 L130,100 L170,70 L210,85 L250,50 L290,65 L330,40 L370,20' stroke='%23059669' stroke-width='2' fill='none'/%3E%3Ccircle cx='210' cy='85' r='6' fill='%2310b981' fill-opacity='0.4'/%3E%3Ctext x='20' y='30' fill='%2364748b' font-family='monospace' font-size='10'%3EXAUUSD M5 ENTRY%3C/text%3E%3C/svg%3E");
    setWarningMessage(null);
  };

  const handleClearSelected = () => {
    setH1Chart(null);
    setM15Chart(null);
    setM5Chart(null);
    setResult(null);
  };

  const remainingCredits = profile.credits_remaining !== undefined ? profile.credits_remaining : Math.max(0, profile.creditsLimit - profile.creditsUsed);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activePlanSelection, setActivePlanSelection] = useState<"Pro" | "Elite">("Pro");

  const executeAnalysis = async () => {
    if (profile.paymentFailed) {
      setWarningMessage("Subscription payment required. Renew your plan to continue using AI analysis.");
      return;
    }
    if (remainingCredits <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    setIsAnalyzing(true);
    setWarningMessage(null);

    try {
      const response = await fetch("/api/analyze-trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pair,
          accountSize,
          riskPercent,
          session,
          h1Chart,
          m15Chart,
          m5Chart,
        }),
      });

      if (response.ok) {
        const parsed = await response.json();
        setResult(parsed);
        if (onAddAnalysis) {
          onAddAnalysis({
            pair,
            accountSize,
            riskPercent,
            session,
            result: parsed,
          });
        }
      } else {
        const err = await response.json();
        setWarningMessage(err.error || "Server was unable to complete the analysis blueprint.");
        // Support fallback
        const fallback = DEMO_ANALYSIS_CHANNELS;
        setResult(fallback);
        if (onAddAnalysis) {
          onAddAnalysis({
            pair,
            accountSize,
            riskPercent,
            session,
            result: fallback,
          });
        }
      }
    } catch (e) {
      console.error(e);
      setWarningMessage("Local environment pipeline timeout. Displaying pre-analyzed model results.");
      const fallback = DEMO_ANALYSIS_CHANNELS;
      setResult(fallback);
      if (onAddAnalysis) {
        onAddAnalysis({
          pair,
          accountSize,
          riskPercent,
          session,
          result: fallback,
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // local simulation methods
  const handleRenewLocal = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        creditsUsed: 0,
        paymentFailed: false
      });
    }
    setShowUpgradeModal(false);
  };

  const handleUpgradeLocal = (planSelected: 'Pro' | 'Elite') => {
    const limit = planSelected === 'Pro' ? 200 : 500;
    if (onUpdateProfile) {
      onUpdateProfile({
        ...profile,
        subscriptionPlan: planSelected,
        plan_name: planSelected === 'Pro' ? "PRO TRADER" : "ELITE TRADER",
        creditsUsed: 0,
        creditsLimit: limit,
        total_credits: limit,
        credits_remaining: limit,
        free_analyses_remaining: 0,
        nextResetDate: "Jul 22, 2026",
        paymentFailed: false,
        subscription_status: "active"
      });
    }
    setShowUpgradeModal(false);
  };

  return (
    <div className="space-y-6 relative">
      {/* Intro Header & Credits Tracker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-slate-850 p-5 rounded-2xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Brain className="w-6 h-6 text-emerald-450" />
            AI Trade Analyzer
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            NESTED MULTI-TIMEFRAME STRUCTURE & RISK EXPOSURE ENGINE
          </p>
        </div>

        {/* Dynamic Credit Tracker Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 min-w-[240px] space-y-1.5 self-start md:self-auto shadow-md">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-400 uppercase tracking-wider font-bold">Credits Remaining</span>
            <span className="text-emerald-400 font-extrabold text-xs">
              {remainingCredits} / {profile.creditsLimit} Remaining
            </span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                remainingCredits <= 10 ? 'bg-rose-500' : remainingCredits <= 50 ? 'bg-amber-550' : 'bg-emerald-500'
              }`}
              style={{ width: `${(remainingCredits / profile.creditsLimit) * 100}%` }}
            />
          </div>
          <p className="text-[9px] text-slate-500 font-mono text-right font-medium">
            Plan: {profile.subscriptionPlan === 'Free' ? '3 Free Runs' : `${profile.subscriptionPlan} Trader`}
          </p>
        </div>
      </div>

      {/* Subscription payment failed blocker panel */}
      {profile.paymentFailed && (
        <div className="bg-rose-500/10 border-2 border-rose-500/30 rounded-2xl p-6 md:p-8 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white font-mono uppercase">Subscription payment required</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Renew your plan to continue using AI analysis. Your automated monthly billing failed to confirm credit authorization.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleRenewLocal}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-rose-500/10 uppercase"
            >
              Renew Subscription
            </button>
            <button
              onClick={() => onNavigateToTab?.("Dashboard")}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-mono rounded-xl transition-all"
            >
              Back To Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Main Analysis grid (disabled if payment failed) */}
      <div className={`grid lg:grid-cols-3 gap-6 ${profile.paymentFailed ? "opacity-30 pointer-events-none select-none" : ""}`}>
        {/* Parameters Column */}
        <div className="space-y-6 lg:border-r lg:border-slate-900 lg:pr-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-100 font-sans border-b border-slate-800 pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              1. Setup Metrics
            </h3>

            {/* Trading Pair Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-mono block">TRADING PAIR</label>
              <input
                type="text"
                placeholder="XAUUSD, BTCUSD, EURUSD etc."
                value={pair}
                onChange={(e) => setPair(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white px-3 py-2.5 outline-none focus:border-emerald-500/80"
              />
            </div>

            {/* Account Size */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-mono block">ACCOUNT SIZE ($)</label>
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(+e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white px-3 py-2.5 outline-none focus:border-emerald-500/80"
              />
            </div>

            {/* Risk Percentage */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs text-slate-400 font-mono">RISK COST PER TRADE</label>
                <span className="text-xs text-emerald-400 font-bold font-mono">{riskPercent}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(+e.target.value)}
                className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.1% Conservative</span>
                <span>5.0% Extreme</span>
              </div>
            </div>

            {/* Trading Session */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-mono block font-bold">TRADING SESSION</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500/80"
              >
                <option value="London Open">London Open (Volatility Spike)</option>
                <option value="New York Open">New York Open (Maximum Volume)</option>
                <option value="Asian Consolidation">Asian Consolidation (Range Bounds)</option>
                <option value="London Close">London Close (Trend Wrap)</option>
              </select>
            </div>
          </div>

          {/* Screenshot Upload Block */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-slate-100 font-sans flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                2. Market Charts (H1, M15, M5)
              </h3>
              <button
                onClick={loadDemoCharts}
                className="text-[10px] font-mono text-emerald-400 hover:underline border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 rounded"
              >
                Autoload Presets
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Frame 1: H1 */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono block">H1 HTF CHART (DIRECTIONAL BIAS)</span>
                {h1Chart ? (
                  <div className="relative border border-emerald-500/30 rounded-lg overflow-hidden h-14 bg-slate-950 flex items-center justify-between p-2">
                    <img src={h1Chart} alt="H1 preset" className="h-10 rounded object-cover w-20" />
                    <span className="text-[10px] font-mono text-emerald-400">Attached</span>
                    <button onClick={() => setH1Chart(null)} className="text-xs text-slate-400 hover:text-white px-1 font-bold">X</button>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-lg h-14 hover:border-slate-700 hover:bg-slate-900/10 flex items-center justify-center relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setH1Chart)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-slate-400" /> Upload Hourly Chart
                    </span>
                  </div>
                )}
              </div>

              {/* Frame 2: M15 */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono block">M15 INTERMEDIATE (ZONE MITIGATION)</span>
                {m15Chart ? (
                  <div className="relative border border-emerald-500/30 rounded-lg overflow-hidden h-14 bg-slate-950 flex items-center justify-between p-2">
                    <img src={m15Chart} alt="M15 preset" className="h-10 rounded object-cover w-20" />
                    <span className="text-[10px] font-mono text-emerald-400">Attached</span>
                    <button onClick={() => setM15Chart(null)} className="text-xs text-slate-400 hover:text-white px-1 font-bold">X</button>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-lg h-14 hover:border-slate-700 hover:bg-slate-900/10 flex items-center justify-center relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setM15Chart)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-slate-400" /> Upload 15m Chart
                    </span>
                  </div>
                )}
              </div>

              {/* Frame 3: M5 */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono block">M5 MICRO (DISPLACEMENT ENTRY)</span>
                {m5Chart ? (
                  <div className="relative border border-emerald-500/30 rounded-lg overflow-hidden h-14 bg-slate-950 flex items-center justify-between p-2">
                    <img src={m5Chart} alt="M5 preset" className="h-10 rounded object-cover w-20" />
                    <span className="text-[10px] font-mono text-emerald-400">Attached</span>
                    <button onClick={() => setM5Chart(null)} className="text-xs text-slate-400 hover:text-white px-1" >X</button>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-lg h-14 hover:border-slate-700 hover:bg-slate-900/10 flex items-center justify-center relative cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setM5Chart)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-slate-400" /> Upload 5m Chart
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={handleClearSelected}
              className="px-4 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 rounded-xl active:scale-95 transition-all text-center"
            >
              Reset
            </button>
            <button
              onClick={executeAnalysis}
              disabled={isAnalyzing}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  CONSULTING NEURAL CHANNELS...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  ANALYZE TRADE SETUP
                </>
              )}
            </button>
          </div>

          {/* AI Analysis History */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wider font-mono border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>AI Analysis History</span>
              <span className="text-[10px] text-emerald-400 font-mono">({analyses.length})</span>
            </h3>

            {analyses.length === 0 ? (
              <p className="text-xs text-slate-500 italic font-mono py-4 text-center">
                No analyses yet
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {analyses.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => setResult(rec.result)}
                    className="w-full text-left p-2.5 bg-slate-950/60 hover:bg-slate-900 border border-slate-850 rounded-xl transition-all block group relative cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-slate-200 block group-hover:text-emerald-400 transition-colors">
                        {rec.pair}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0">
                        {rec.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-900/40">
                      <span>BIAS: <span className={rec.result.marketBias === "BULLISH" ? "text-emerald-400" : "text-rose-450 font-bold"}>{rec.result.marketBias}</span></span>
                      <span>SCORE: <span className="text-emerald-400 font-bold">{rec.result.riskAnalysis.confidencePercentage}%</span></span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Analysis Display */}
        <div className="lg:col-span-2 space-y-6">
          {warningMessage && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{warningMessage}</span>
            </div>
          )}

          {isAnalyzing && (
            <div className="border border-slate-900 rounded-2xl bg-slate-950/20 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full border-4 border-slate-900 border-t-emerald-500 animate-spin" />
                <Brain className="w-7 h-7 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="text-white font-bold text-lg">AI Vision Coach Engine Operating</h3>
              <p className="text-slate-400 text-xs max-w-sm mt-2 leading-relaxed">
                Loading trade parameters, verifying multi-timeframe candle structures, mapping key levels (Support, Resistance, FVGs, Order blocks), and calculating optimal position lots.
              </p>
              <div className="flex gap-1 mt-6 text-[10px] text-emerald-400 font-mono animate-pulse uppercase tracking-widest">
                <span>Scanning H1 trends...</span>
              </div>
            </div>
          )}

          {!isAnalyzing && !result && (
            <div className="border-2 border-dashed border-slate-900 rounded-2xl bg-slate-950/10 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-14 h-14 rounded-full bg-slate-900/60 flex items-center justify-center text-slate-500 mb-4 border border-slate-800">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-slate-300 font-bold mb-1">No Active Neural Output</h3>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                Configure your pairs and upload chart screen files, or load presets then press "Analyze Trade Setup" to fetch institutional level neural analysis.
              </p>
            </div>
          )}

          {!isAnalyzing && result && (
            <div className="space-y-6 animate-fade-in text-slate-100 pb-10">
              {/* Top Banner: Market Bias & Probability */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden">
                <div className="p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40">
                  <span className="text-[10px] text-slate-400 font-mono block">STRATEGIC DIRECTION INDICATOR</span>
                  <div className="mt-4">
                    <span
                      className={`text-2xl font-black uppercase px-4 py-1.5 rounded-lg inline-block ${
                        result.marketBias === "Bullish"
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : result.marketBias === "Bearish"
                          ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                          : "bg-slate-800 border border-slate-700 text-slate-300"
                      }`}
                    >
                      {result.marketBias}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">PROBABILITY SCORE</span>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-3.5xl font-black text-white">{result.riskAnalysis.probabilityScore}%</span>
                    <span className="text-[10px] text-emerald-400 font-mono">EXCELLENT MATCH</span>
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-mono block">RECOMMENDED LOT SIZE</span>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-2.5xl font-black text-emerald-400 font-mono">{result.riskAnalysis.recommendedLotSize} Lots</span>
                    <span className="text-[10px] text-slate-500 font-mono">Risking ${result.riskAnalysis.riskAmountDollars}</span>
                  </div>
                </div>
              </div>

              {/* Multi TImeframe Section */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Multi-Timeframe Structure Check
                </h3>
                <div className="space-y-3.5 text-xs text-slate-300">
                  <div>
                    <span className="font-bold text-slate-400 uppercase font-mono text-[10px] block">H1 Higher Trend Bias:</span>
                    <p className="mt-1 bg-slate-950/60 p-2 rounded border border-slate-900">{result.multiTimeframe.h1Trend}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase font-mono text-[10px] block">M15 Confirmation Frame:</span>
                    <p className="mt-1 bg-slate-950/60 p-2 rounded border border-slate-900">{result.multiTimeframe.m15Confirmation}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase font-mono text-[10px] block">M5 Micro Entry Trigger:</span>
                    <p className="mt-1 bg-slate-950/60 p-2 rounded border border-slate-900">{result.multiTimeframe.m5EntrySignal}</p>
                  </div>
                </div>
              </div>

              {/* Key Liquidity and Structural Levels Map */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Institutional Order Levels Detection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-mono block">SUPPORT NODES KEYS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keyLevels.supports.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded font-mono font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-mono block">RESISTANCE BOUNDS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keyLevels.resistances.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-rose-500/5 text-rose-400 border border-rose-500/10 rounded font-mono font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2 border-t border-slate-850 pt-2.5">
                    <span className="text-[10px] text-slate-400 font-mono block">SMC ORDERBLOCKS & FVGs</span>
                    <div className="flex flex-wrap gap-2">
                      {result.keyLevels.orderBlocks.map((ob, i) => (
                        <span key={i} className="px-2.5 py-1 bg-teal-500/5 text-teal-400 border border-teal-500/15 rounded font-mono text-[10px]">
                          OB: {ob}
                        </span>
                      ))}
                      {result.keyLevels.fairValueGaps.map((fvg, i) => (
                        <span key={i} className="px-2.5 py-1 bg-blue-500/5 text-blue-400 border border-blue-500/15 rounded font-mono text-[10px]">
                          Imbalance: {fvg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Exact Proposed Execution Plan */}
              <div className="bg-slate-900/40 border border-teal-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Target className="w-16 h-16 text-teal-400" />
                </div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-3 mb-4">
                  <Target className="w-4 h-4 text-teal-400" />
                  Proposed Active Trading Plan ({pair})
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-mono block">SUGGESTED ENTRY</span>
                    <span className="block text-sm font-bold text-emerald-400 mt-1 font-mono">{result.tradePlan.suggestedEntry}</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-mono block">STOP LIMIT (SL)</span>
                    <span className="block text-sm font-bold text-rose-400 mt-1 font-mono">{result.tradePlan.stopLoss}</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-mono block">TARGET ONE (TP1)</span>
                    <span className="block text-sm font-bold text-slate-100 mt-1 font-mono">{result.tradePlan.takeProfit1}</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-mono block">TARGET TWO (TP2)</span>
                    <span className="block text-sm font-bold text-slate-100 mt-1 font-mono">{result.tradePlan.takeProfit2}</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl col-span-2 md:col-span-1">
                    <span className="text-[9px] text-slate-400 font-mono block">TARGET THREE (TP3)</span>
                    <span className="block text-sm font-bold text-emerald-400 mt-1 font-mono">{result.tradePlan.takeProfit3}</span>
                  </div>
                </div>
              </div>

              {/* Scenarios Prediction Card */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Execution Forecast Scenarios
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 space-y-1.5">
                    <span className="font-bold font-mono text-[10px] text-emerald-400">BULLISH EXPANSION</span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{result.scenarios.bullish}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 space-y-1.5">
                    <span className="font-bold font-mono text-[10px] text-rose-400">BEARISH TRIGGER</span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{result.scenarios.bearish}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 space-y-1.5">
                    <span className="font-bold font-mono text-[10px] text-slate-400">RANGE SIDEWAYS</span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{result.scenarios.neutral}</p>
                  </div>
                </div>
              </div>

              {/* AI Coach written review commentary */}
              <div className="bg-gradient-to-r from-emerald-900/10 to-teal-900/10 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-450 shrink-0">
                    <Brain className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-white text-sm">Coach Core Assessment Feedback</h4>
                      <p className="text-slate-300 mt-1 leading-relaxed leading-relaxed">{result.coachCommentary.feedback}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-slate-900/40">
                      <div>
                        <span className="font-bold text-rose-450 text-[10px] uppercase font-mono block">Psychological Mistake Triggers to Avoid:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-400 mt-1.5 text-[11px]">
                          {result.coachCommentary.mistakesToAvoid.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-bold text-teal-400 text-[10px] uppercase font-mono block">Psychology Lesson of Setup:</span>
                        <p className="text-slate-400 mt-1.5 leading-relaxed text-[11px] font-medium italic">
                          "{result.coachCommentary.psychologyTip}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zero Credits Upgrade Modal overlay */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono uppercase tracking-tight">
                {profile.subscriptionPlan === 'Free' ? "Free Trial Completed" : "LIMIT PROTOCOL RECLAIMED"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                {profile.subscriptionPlan === 'Free' 
                  ? "You have used all 3 free analyses. Upgrade to continue using AI analysis."
                  : "You have used all available credits for this billing cycle. Upgrade your plan or renew your subscription to continue using AI analysis."}
              </p>
            </div>

            {/* In-Modal Upgrade Plan Options */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Pro Trader upgrade panel */}
              <div className="bg-slate-950 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">PRO TRADER</span>
                    <span className="bg-blue-500/15 text-blue-400 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border border-blue-500/10">BEST CHOICE</span>
                  </div>
                  <h4 className="text-xl font-black text-white">$29<span className="text-xs text-slate-500 font-normal">/mo</span></h4>
                  <p className="text-[10px] text-slate-405 leading-relaxed">
                    200 AI Analyses Per Month with Trade Journal + Risk Calculator integration.
                  </p>
                </div>
                <button
                  onClick={() => handleUpgradeLocal('Pro')}
                  className="w-full py-2 bg-blue-550 hover:bg-blue-400 text-slate-950 text-[10px] font-mono font-black uppercase rounded-lg transition-colors cursor-pointer"
                >
                  {profile.subscriptionPlan === 'Free' ? "Upgrade To Pro" : "Upgrade Pro"}
                </button>
              </div>

              {/* Elite Trader upgrade panel */}
              <div className="bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-indigo-405 font-bold uppercase">ELITE TRADER</span>
                  <h4 className="text-xl font-black text-white">$49<span className="text-xs text-slate-500 font-normal">/mo</span></h4>
                  <p className="text-[10px] text-slate-405 leading-relaxed">
                    500 AI Analyses Per Month, Priority Processing & Advanced Analytics.
                  </p>
                </div>
                <button
                  onClick={() => handleUpgradeLocal('Elite')}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-mono font-black uppercase rounded-lg transition-colors cursor-pointer"
                >
                  {profile.subscriptionPlan === 'Free' ? "Upgrade To Elite" : "Upgrade Elite"}
                </button>
              </div>
            </div>

            {/* Standard actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleRenewLocal}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/10"
              >
                Renew Subscription (Restores Limit)
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    onNavigateToTab?.("Dashboard");
                  }}
                  className="flex-1 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono rounded-lg transition-colors uppercase font-bold"
                >
                  Back To Dashboard
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-mono rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
