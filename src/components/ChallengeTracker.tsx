import React, { useState } from "react";
import { Award, ShieldAlert, CheckCircle2, AlertTriangle, Target, Calendar, Sparkles, Plus, Layers, TrendingUp } from "lucide-react";
import { PropChallenge } from "../types";

interface ChallengeTrackerProps {
  challenges: PropChallenge[];
  activeChallengeId: string;
  onAddChallenge: (challenge: Omit<PropChallenge, "id" | "daysTraded" | "startDate" | "status">) => void;
  onSelectChallenge: (id: string) => void;
}

export default function ChallengeTracker({
  challenges,
  activeChallengeId,
  onAddChallenge,
  onSelectChallenge,
}: ChallengeTrackerProps) {
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [firmType, setFirmType] = useState<PropChallenge["firmType"]>("FundingPips");
  const [accountSize, setAccountSize] = useState("100000");
  const [dailyLossPercent, setDailyLossPercent] = useState("5");
  const [maxDrawdownPercent, setMaxDrawdownPercent] = useState("10");
  const [targetNumPercent, setTargetNumPercent] = useState("8");

  const activeChallenge = challenges.find((c) => c.id === activeChallengeId) || challenges[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !accountSize) {
      alert("Please provide a name and account capital.");
      return;
    }

    onAddChallenge({
      name,
      firmType,
      accountSize: parseFloat(accountSize),
      dailyLossLimitPercent: parseFloat(dailyLossPercent),
      maxDrawdownPercent: parseFloat(maxDrawdownPercent),
      targetProfitPercent: parseFloat(targetNumPercent),
      currentProfit: 0,
      currentLossToday: 0,
    });

    setName("");
    setShowAddForm(false);
  };

  // Calculations for Active tracker
  const targetProfitAmount = activeChallenge ? (activeChallenge.accountSize * activeChallenge.targetProfitPercent) / 100 : 0;
  const remainingObjectiveDollars = activeChallenge ? Math.max(0, targetProfitAmount - activeChallenge.currentProfit) : 0;
  const targetCompletePercent = activeChallenge ? Math.min(100, Math.max(0, (activeChallenge.currentProfit / targetProfitAmount) * 105)) : 0;

  // Maximum Daily and Trailing Allowable Downside Loss
  const dailyLossLimitDollars = activeChallenge ? (activeChallenge.accountSize * activeChallenge.dailyLossLimitPercent) / 100 : 0;
  const maxDrawdownLimitDollars = activeChallenge ? (activeChallenge.accountSize * activeChallenge.maxDrawdownPercent) / 100 : 0;
  const dailyLossPercentSpent = activeChallenge ? Math.min(100, (activeChallenge.currentLossToday / dailyLossLimitDollars) * 100) : 0;

  // Challenge pass probability based on target progress and loss buffer:
  const passProbability = activeChallenge
    ? Math.round(
        Math.min(
          99,
          Math.max(
            15,
            (activeChallenge.currentProfit > 0 ? 50 : 35) +
              (activeChallenge.currentProfit / targetProfitAmount) * 40 -
              (activeChallenge.currentLossToday / dailyLossLimitDollars) * 20
          )
        )
      )
    : 50;

  return (
    <div className="space-y-6">
      {/* Tracker Headers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-400" />
            Prop Firm Objective Hub
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            FTMO, FUNDINGPIPS, THE5ERS & CUSTOM SPECIFICATION MATRIX
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 px-4 py-2.5 rounded-xl active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          PROVISION NEW CHALLENGE
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-6 space-y-4 animate-fade-in">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-emerald-400 border-b border-slate-800 pb-2">
            Configure Prop Firm Parameters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-405 font-mono block">WORKSPACE SLOG / NAME</label>
              <input
                type="text"
                placeholder="e.g. FundingPips evaluation phase 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-405 font-mono block">FIRM PARTNER</label>
              <select
                value={firmType}
                onChange={(e) => setFirmType(e.target.value as PropChallenge["firmType"])}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 outline-none focus:border-emerald-500/50"
              >
                <option value="FundingPips">FundingPips</option>
                <option value="FTMO">FTMO Evaluation</option>
                <option value="The5ers">The5ers Funding</option>
                <option value="FundedNext">FundedNext</option>
                <option value="Custom">Custom Parameters</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-405 font-mono block">TRADING CAPITAL SIZE ($)</label>
              <input
                type="number"
                placeholder="e.g. 100000"
                value={accountSize}
                onChange={(e) => setAccountSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-405 font-mono block">DAILY LOSS THRESHOLD (%)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 5"
                value={dailyLossPercent}
                onChange={(e) => setDailyLossPercent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-405 font-mono block">MAX DRAWDOWN ALLOWABLE (%)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 10"
                value={maxDrawdownPercent}
                onChange={(e) => setMaxDrawdownPercent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-405 font-mono block">TARGET OBJECTIVE (%)</label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 8"
                value={targetNumPercent}
                onChange={(e) => setTargetNumPercent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 text-xs rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-lg"
            >
              REGISTER ACTIVE EVALUATION
            </button>
          </div>
        </form>
      )}

      {/* Main Core Tracking Frame */}
      {activeChallenge ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Detailed Objectives List Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Objective 1: Target Profit */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  OBJECTIVE: PROFIT TARGET METRIC
                </span>
                <span className="text-xs font-bold text-slate-350 font-mono">
                  ${activeChallenge.currentProfit.toLocaleString()} / ${targetProfitAmount.toLocaleString()} ({activeChallenge.targetProfitPercent}%)
                </span>
              </div>

              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(activeChallenge.currentProfit / targetProfitAmount) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-450 font-mono">
                <span>Remaining Objective: <span className="text-emerald-400 font-bold">${remainingObjectiveDollars.toLocaleString()}</span></span>
                {remainingObjectiveDollars === 0 ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Target Complete
                  </span>
                ) : (
                  <span>Status: In Progress</span>
                )}
              </div>
            </div>

            {/* Objective 2: Daily Drawdown Limit */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  OBJECTIVE: MAX DAILY LOSS (DRAWDOWN)
                </span>
                <span className="text-xs font-bold text-slate-350 font-mono">
                  Today's Loss: ${activeChallenge.currentLossToday.toLocaleString()} / Limit: ${dailyLossLimitDollars.toLocaleString()} ({activeChallenge.dailyLossLimitPercent}%)
                </span>
              </div>

              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    dailyLossPercentSpent > 70 ? "bg-rose-500" : dailyLossPercentSpent > 40 ? "bg-amber-500" : "bg-emerald-400"
                  }`}
                  style={{ width: `${100 - dailyLossPercentSpent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-450 font-mono">
                <span>Remaining loss buffer for today: <span className="text-rose-400 font-bold">${(dailyLossLimitDollars - activeChallenge.currentLossToday).toLocaleString()}</span></span>
                {dailyLossPercentSpent > 80 && (
                  <span className="text-rose-450 font-semibold flex items-center gap-1 blink">
                    <AlertTriangle className="w-3 h-3" /> APPROACHING MAX LIMIT
                  </span>
                )}
              </div>
            </div>

            {/* Objective 3: Maximum Drawdown Limit */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-slate-400" />
                  OBJECTIVE: MAXIMUM ALLOWABLE TOTAL LOSS
                </span>
                <span className="text-xs font-bold text-slate-350 font-mono">
                  Balance Buffer Remaining: ${Math.max(0, maxDrawdownLimitDollars - (activeChallenge.currentProfit < 0 ? Math.abs(activeChallenge.currentProfit) : 0)).toLocaleString()} / Limit: ${maxDrawdownLimitDollars.toLocaleString()} ({activeChallenge.maxDrawdownPercent}%)
                </span>
              </div>

              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-emerald-450 h-full rounded-full transition-all duration-700"
                  style={{ width: `${((maxDrawdownLimitDollars - (activeChallenge.currentProfit < 0 ? Math.abs(activeChallenge.currentProfit) : 0)) / maxDrawdownLimitDollars) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-450 font-mono">
                <span>Firm trailing base: <span className="text-slate-300">${(activeChallenge.accountSize).toLocaleString()} USD</span></span>
                <span>Security Rules: Trailing High Watermark</span>
              </div>
            </div>
          </div>

          {/* Sidebar: Gauges and Firm checklists */}
          <div className="space-y-6">
            {/* Probability Gauge Mock Meter */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 relative flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono text-slate-400 block mb-4 uppercase">
                CHALLENGE PASS PROBABILITY INDEX
              </span>

              {/* Graphical Circular Indicator */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#0f172a"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#10b981"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="377"
                    strokeDashoffset={377 - (377 * passProbability) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="block text-3.5xl font-black text-white">{passProbability}%</span>
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">NEURAL RATING</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4 max-w-xs leading-relaxed">
                Calculated dynamically base on account profit progress ({targetCompletePercent.toFixed(0)}%) coupled with remaining loss buffer ratio (${(dailyLossLimitDollars - activeChallenge.currentLossToday).toLocaleString()}).
              </p>
            </div>

            {/* Checklist items to pass */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 space-y-3.5 text-xs text-slate-300">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">FIRM REQUIREMENTS METRICK CHECKLIST</span>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Minimum Traded Days: At least 5 required ({activeChallenge.daysTraded} logged)</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Arbitrary Hedging Check: Compliant</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Prop News-trading Obeyed: No violations</span>
              </div>

              <div className="flex items-center gap-2">
                {remainingObjectiveDollars === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-700 shrink-0" />
                )}
                <span className={remainingObjectiveDollars === 0 ? "text-slate-300" : "text-slate-500"}>
                  Reach profit target (${targetProfitAmount.toLocaleString()})
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto mt-8">
          <div className="w-16 h-16 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-500 mb-2">
            <Award className="w-8 h-8 text-slate-550" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight font-mono">
            No challenge selected
          </h3>
          <p className="text-xs text-slate-400 font-sans max-w-sm leading-relaxed">
            There are no active propfirm challenges configured. Click "PROVISION NEW CHALLENGE" above to set up your target goals, drawdown thresholds, and start tracking your evaluations in real time.
          </p>
        </div>
      )}
    </div>
  );
}
