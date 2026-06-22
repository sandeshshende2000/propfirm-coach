import React, { useState } from "react";
import { Activity, ShieldCheck, DollarSign, UserCheck, Inbox, Brain, Layers, Filter, CheckCircle2, X } from "lucide-react";

export default function AdminPanel() {
  // Mock administrative logs
  const [users, setUsers] = useState([
    { id: "u-1", name: "Gabriel Soto", email: "g.soto@fxcapital.com", plan: "VIP", status: "Active", jointLimit: "$200,000" },
    { id: "u-2", name: "Sarah Jenkins", email: "s.jenkins@goldhunter.ca", plan: "Pro", status: "Active", jointLimit: "$100,000" },
    { id: "u-3", name: "Hiroshi Sato", email: "sato.trader@londonopen.jp", plan: "Starter", status: "Active", jointLimit: "$50,000" },
    { id: "u-4", name: "Amara Okeke", email: "a.okeke@fundprop.ng", plan: "Pro", status: "Active", jointLimit: "$100,000" },
    { id: "u-5", name: "Sven Borg", email: "swedefx@scalpnordic.se", plan: "VIP", status: "Inactive", jointLimit: "$500,000" },
  ]);

  const [tickets, setTickets] = useState([
    { id: "t-1", creator: "Gabriel Soto", msg: "FundingPips daily drawdown clock alignment issues on 1-minute gold ticks.", priority: "HIGH" },
    { id: "t-2", creator: "Hiroshi Sato", msg: "Visions upload failing for image formats greater than 10MB.", priority: "MED" },
    { id: "t-3", creator: "Sarah Jenkins", msg: "Request to configure a custom firm option with a 4.5% daily trailing rule.", priority: "LOW" },
  ]);

  const [analysisLogs] = useState([
    { id: "l-1", time: "04:31:12", pair: "XAUUSD", type: "H1+M15 Scan", outcome: "Bullish (Bias Map)" },
    { id: "l-2", time: "04:28:40", pair: "EURUSD", type: "M5 Scaling", outcome: "Bearish (BOS confirmed)" },
    { id: "l-3", time: "04:22:15", pair: "BTCUSD", type: "Triple Frame Vision", outcome: "Neutral (Chop bounds)" },
    { id: "l-4", time: "04:15:58", pair: "GBPUSD", type: "M15 Breaker Block", outcome: "Bullish (Accumulation)" },
  ]);

  const handleSolveTicket = (id: string) => {
    setTickets(tickets.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          Administrative Control Center
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          PLATFORM SUBSCRIPTION MATRIX, REAL-TIME LOG FEED, AND TICKETING DIAGNOSTICS
        </p>
      </div>

      {/* Admin KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Monthly Recurring Revenue */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden">
          <span className="text-[10px] font-mono text-slate-400 uppercase">MONTHLY REVENUE (MRR)</span>
          <span className="block text-xl sm:text-2xl font-black text-emerald-400 mt-1">$14,840 USD</span>
          <p className="text-[9px] text-slate-500 font-mono mt-1">+12% MRR expansion this week</p>
        </div>

        {/* KPI 2: Verified Active Users */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden">
          <span className="text-[10px] font-mono text-slate-400 uppercase">SUBSCRIBED TRADERS</span>
          <span className="block text-xl sm:text-2xl font-black text-white mt-1">1,248 Users</span>
          <p className="text-[9px] text-slate-500 font-mono mt-1">Active global accounts</p>
        </div>

        {/* KPI 3: Live AI Inferences */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden">
          <span className="text-[10px] font-mono text-slate-400 uppercase">AI SCANS PROCESSED</span>
          <span className="block text-xl sm:text-2xl font-black text-white mt-1">18,520 Scans</span>
          <p className="text-[9px] text-slate-500 font-mono mt-1">H1/M15/M5 structural vision maps</p>
        </div>

        {/* KPI 4: Pending Support Tickets */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden">
          <span className="text-[10px] font-mono text-slate-400 uppercase">PENDING TICKETS</span>
          <span className="block text-xl sm:text-2xl font-black text-rose-450 mt-1">{tickets.length} Alerts</span>
          <p className="text-[9px] text-slate-500 font-mono mt-1">SLA target: &lt; 15 mins</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Base list spreadsheet */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Registered Trader Database
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse text-slate-300">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 font-mono text-[10px] uppercase font-bold">
                  <th className="pb-3">NAME</th>
                  <th className="pb-3">SUGGESTION PLAN</th>
                  <th className="pb-3">MAPPED ACCOUNT</th>
                  <th className="pb-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-[11px]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/10">
                    <td className="py-3 font-semibold text-white">
                      {u.name}
                      <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{u.email}</span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded font-bold font-mono text-[9px] ${
                          u.plan === "VIP"
                            ? "bg-purple-500/10 text-purple-400"
                            : u.plan === "Pro"
                            ? "bg-teal-500/10 text-teal-400"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-400">{u.jointLimit} Account</td>
                    <td className="py-3 text-right">
                      <span
                        className={`text-[9.5px] font-bold ${
                          u.status === "Active" ? "text-emerald-400" : "text-slate-500"
                        }`}
                      >
                        ● {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live support tickets diagnostics */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Inbox className="w-4 h-4 text-emerald-400" />
            Active Help Tickets ({tickets.length})
          </h3>

          <div className="space-y-3.5">
            {tickets.length === 0 ? (
              <p className="text-slate-500 text-xs py-8 text-center">All client queries solved!</p>
            ) : (
              tickets.map((t) => (
                <div key={t.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2 relative group">
                  <button
                    onClick={() => handleSolveTicket(t.id)}
                    className="absolute top-2 right-2 text-slate-550 hover:text-emerald-400 font-bold transition-colors text-xs"
                    title="Mark solved"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded ${
                        t.priority === "HIGH"
                          ? "bg-rose-500/20 text-rose-450"
                          : t.priority === "MED"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-slate-800 text-slate-450"
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{t.creator}</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed pr-6">"{t.msg}"</p>
                </div>
              ))
            )}
          </div>

          {/* AI Scans stream monitor */}
          <div className="border-t border-slate-900 pt-4 space-y-2">
            <span className="text-[9px] font-mono text-slate-450 block uppercase tracking-wider">
              REAL-TIME NEURAL FEED LOGS
            </span>

            <div className="space-y-1.5">
              {analysisLogs.map((l) => (
                <div key={l.id} className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-550">{l.time}</span>
                    <span className="text-slate-200 font-bold">{l.pair}</span>
                    <span className="text-[9px] text-teal-400">[{l.type}]</span>
                  </div>
                  <span className="text-[9px] text-slate-550">{l.outcome}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
