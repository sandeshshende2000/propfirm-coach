import React from "react";
import { Award, ShieldAlert } from "lucide-react";
import { PropChallenge } from "../types";

interface ChallengeTrackerProps {
  challenges: PropChallenge[];
  activeChallengeId: string;
  onAddChallenge: (challenge: Omit<PropChallenge, "id" | "daysTraded" | "startDate" | "status">) => void;
  onSelectChallenge: (id: string) => void;
}

export default function ChallengeTracker({}: ChallengeTrackerProps) {
  return (
    <div className="space-y-6">
      {/* Tracker Headers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500 animate-pulse" />
            TradeModeAI Challenge Hub
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            EVALUATION INTEGRATION STATUS: <span className="text-rose-400 font-bold">DEACTIVATED</span>
          </p>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center max-w-2xl mx-auto my-12 space-y-6 shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/20">
          <ShieldAlert className="w-8 h-8 text-amber-500 animate-pulse" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-lg font-mono font-bold text-slate-100 tracking-tight">CHALLENGE TRACKING OFFLINE</h2>
          <p className="text-xs text-slate-400 font-mono leading-relaxed max-w-md mx-auto">
            The database table <code className="text-amber-400 bg-slate-950 px-2 py-0.5 rounded font-bold">challenges</code> has not been provisioned in the backend database. To prevent database synchronization errors, the Challenge Tracker module has been gracefully offline-shielded.
          </p>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl max-w-md mx-auto">
          <p className="text-[11px] font-mono text-slate-400 leading-normal">
            No actions are required. All other core capabilities (including <span className="text-blue-400 font-bold">AI Market Analysis</span>, <span className="text-teal-400 font-bold">Trade Journaling</span>, and <span className="text-purple-400 font-bold">Risk Management Calculators</span>) remain fully available and connected.
          </p>
        </div>

        <p className="text-[10px] text-slate-500 font-mono">
          TradeModeAI Pilot Engine continues running under standard fallback rules.
        </p>
      </div>
    </div>
  );
}
