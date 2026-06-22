import React, { useState } from "react";
import { Plus, Check, Calendar, Activity, TrendingUp, TrendingDown, Clipboard, AlertTriangle, PenTool, Sparkles, Filter, Smile, Trash2 } from "lucide-react";
import { TradeJournalEntry } from "../types";

interface TradeJournalProps {
  trades: TradeJournalEntry[];
  onAddTrade: (entry: Omit<TradeJournalEntry, "id">) => void;
  onDeleteTrade: (id: string) => void;
}

export default function TradeJournal({ trades, onAddTrade, onDeleteTrade }: TradeJournalProps) {
  // UI states
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterPair, setFilterPair] = useState("ALL");

  // New trade state Form
  const [pair, setPair] = useState("XAUUSD");
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [size, setSize] = useState(""); // lots
  const [profit, setProfit] = useState("");
  const [session, setSession] = useState("NY Open");
  const [notes, setNotes] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);

  // List of standard helpers
  const emotionOptions = ["FOMO", "Patient", "Confident", "Anxious", "Greedy", "Indecisive"];
  const mistakeOptions = ["None", "Overleveraged", "Early Exit", "Chase Trade", "No Stop Loss", "Too Wide SL"];

  const handleToggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter((e) => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };

  const handleToggleMistake = (mistake: string) => {
    if (mistake === "None") {
      setSelectedMistakes(["None"]);
      return;
    }
    const filtered = selectedMistakes.filter((m) => m !== "None");
    if (filtered.includes(mistake)) {
      setSelectedMistakes(filtered.filter((m) => m !== mistake));
    } else {
      setSelectedMistakes([...filtered, mistake]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pair || !entryPrice || !exitPrice || !size) {
      alert("Please complete core price, type, and lot parameters.");
      return;
    }

    // Auto calculate simulated profit if not explicitly entered
    let calcProfit = parseFloat(profit);
    if (isNaN(calcProfit)) {
      const entryNum = parseFloat(entryPrice);
      const exitNum = parseFloat(exitPrice);
      const lotNum = parseFloat(size);

      const isGold = pair.toUpperCase().includes("XAU");
      const isBtc = pair.toUpperCase().includes("BTC");
      const isForex = pair.toUpperCase().includes("EUR") || pair.toUpperCase().includes("GBP");

      const directionMultiplier = type === "BUY" ? 1 : -1;
      let tickDifference = (exitNum - entryNum) * directionMultiplier;

      if (isGold) {
        // Gold 1 lot = 100oz. 1 point move is $100.
        calcProfit = tickDifference * lotNum * 100;
      } else if (isBtc) {
        // BTC 1 lot = 1 coin. 1 point move is $1, or custom ratio.
        calcProfit = tickDifference * lotNum * 1;
      } else if (isForex) {
        // Forex standard 1 lot = 100,000 units. Price moves in pips (0.0001).
        // 1 pip move = $10.
        calcProfit = tickDifference * 10000 * lotNum * 10;
      } else {
        calcProfit = tickDifference * lotNum * 10;
      }
    }

    onAddTrade({
      pair: pair.toUpperCase(),
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      size: parseFloat(size),
      type,
      status: calcProfit >= 0 ? "WIN" : "LOSS",
      profit: Math.round(calcProfit),
      session,
      date: new Date().toISOString().split("T")[0],
      notes,
      emotions: selectedEmotions.length > 0 ? selectedEmotions : ["Neutral"],
      mistakes: selectedMistakes.length > 0 ? selectedMistakes : ["None"],
    });

    // Reset Form
    setPair("XAUUSD");
    setType("BUY");
    setEntryPrice("");
    setExitPrice("");
    setSize("");
    setProfit("");
    setNotes("");
    setSelectedEmotions([]);
    setSelectedMistakes([]);
    setShowAddForm(false);
  };

  // Unique list of pairs for filtering
  const distinctPairs = ["ALL", ...Array.from(new Set(trades.map((t) => t.pair.split(" ")[0].toUpperCase())))];
  const filteredTrades = filterPair === "ALL" ? trades : trades.filter((t) => t.pair.toUpperCase().includes(filterPair));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Clipboard className="w-6 h-6 text-emerald-400" />
            Trade Journal Node
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            STRATEGY METRICS, MENTAL STATE LOGS, AND FAILURE ANALYTICS
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 text-slate-950 font-bold" />
          JOURNAL NEW TRADE
        </button>
      </div>

      {/* Slide or Expand Add Form Panel */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-emerald-500/20 rounded-2xl p-6 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Establish New Trade Record
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Pair */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-450 font-mono block">ASSET TICKER</label>
              <input
                type="text"
                placeholder="XAUUSD, EURUSD etc."
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 outline-none focus:border-emerald-500/50 uppercase"
              />
            </div>

            {/* Direction */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-450 font-mono block">DIRECTION</label>
              <div className="flex rounded-lg overflow-hidden border border-slate-800 p-0.5 bg-slate-950">
                <button
                  type="button"
                  onClick={() => setType("BUY")}
                  className={`flex-1 py-1 text-center rounded text-xs font-bold transition-all ${
                    type === "BUY" ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/10" : "text-slate-400"
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() => setType("SELL")}
                  className={`flex-1 py-1 text-center rounded text-xs font-bold transition-all ${
                    type === "SELL" ? "bg-rose-500/25 text-rose-400 border border-rose-500/10" : "text-slate-400"
                  }`}
                >
                  SELL
                </button>
              </div>
            </div>

            {/* Lot Size lots */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-450 font-mono block">LOT CONTRACT SIZE</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 5.0"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Session Choose */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-450 font-mono block">MARKET SESSION</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 outline-none focus:border-emerald-500/50"
              >
                <option value="London Open">London Open</option>
                <option value="NY Open">New York Open</option>
                <option value="London Close">London Close</option>
                <option value="Asian Session">Asian Session</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Entry Price */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-450 font-mono block">ENTRY VALUE</label>
              <input
                type="number"
                step="0.00001"
                placeholder="e.g. 2315.40"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Exit Price */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-450 font-mono block">EXIT VALUE</label>
              <input
                type="number"
                step="0.00001"
                placeholder="e.g. 2328.60"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Force Custom profit */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-450 font-mono block">DETERMINABLE PROFIT ($) [OPTIONAL]</label>
              <input
                type="number"
                placeholder="Leave blank for auto-pips"
                value={profit}
                onChange={(e) => setProfit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Emotional tags */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-mono block">PSYCHOLOGICAL EMOTIONS FELT IN TRADE</span>
            <div className="flex flex-wrap gap-1.5">
              {emotionOptions.map((emo) => (
                <button
                  type="button"
                  key={emo}
                  onClick={() => handleToggleEmotion(emo)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    selectedEmotions.includes(emo)
                      ? "bg-teal-500/15 text-teal-400 border-teal-500/30 font-bold"
                      : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-750"
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          {/* Mistake tracker */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-400 font-mono block">TECHNICAL OR PSYCHOLOGICAL ERRORS TO TRACK</span>
            <div className="flex flex-wrap gap-1.5">
              {mistakeOptions.map((mis) => (
                <button
                  type="button"
                  key={mis}
                  onClick={() => handleToggleMistake(mis)}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                    selectedMistakes.includes(mis)
                      ? "bg-rose-500/15 text-rose-450 border-rose-500/30 font-bold"
                      : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-750"
                  }`}
                >
                  {mis}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-450 font-mono block">SETUP CONTEXT / JOURNAL MEMORANDUMS</label>
            <textarea
              rows={2}
              placeholder="Detail reasons for entry/exit, key news event or personal rules obeyed/violated."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 p-2.5 outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex justify-end gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-lg shadow-lg shadow-emerald-500/10"
            >
              LOG TO JOURNAL DATABASE
            </button>
          </div>
        </form>
      )}

      {/* Filters Hub */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-emerald-400" />
          FILTER JOURNAL HISTORY:
        </span>

        <div className="flex flex-wrap gap-1.5">
          {distinctPairs.map((pairOpt) => (
            <button
              key={pairOpt}
              onClick={() => setFilterPair(pairOpt)}
              className={`text-[10px] font-mono px-3 py-1 rounded-lg border transition-all ${
                filterPair === pairOpt
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold"
                  : "bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-800"
              }`}
            >
              {pairOpt}
            </button>
          ))}
        </div>
      </div>

      {/* Trade Log List Table */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden">
        {filteredTrades.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm font-mono">
            {trades.length === 0 ? "No trades yet" : "No entries found in this folder filter."}
            <span className="block text-xs text-slate-400 mt-2 font-sans">
              Tap "Journal New Trade" above to log a setup.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-mono font-medium">
                  <th className="p-4">DATES</th>
                  <th className="p-4">PAIR STATUS</th>
                  <th className="p-4 text-center">TYPE</th>
                  <th className="p-4">LOT SIZE</th>
                  <th className="p-4">PRICE LIMITS</th>
                  <th className="p-4">EMOTIONS / ERRORS</th>
                  <th className="p-4 text-right">NET PROFIT</th>
                  <th className="p-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-250">
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-slate-900/20 transition-all group">
                    <td className="p-4 font-mono whitespace-nowrap text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {trade.date}
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-1 uppercase">
                        {trade.session}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-white block">{trade.pair}</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded inline-block mt-1 ${
                          trade.status === "WIN"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-450"
                        }`}
                      >
                        {trade.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`font-black tracking-widest text-[10px] px-2 py-0.5 rounded leading-none ${
                          trade.type === "BUY" ? "text-emerald-400 bg-emerald-500/5 border border-emerald-500/10" : "text-rose-450 bg-rose-500/5 border border-rose-500/10"
                        }`}
                      >
                        {trade.type}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-300 font-medium">
                      {trade.size} Lots
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      <div>IN: <span className="text-slate-200">{trade.entryPrice}</span></div>
                      <div className="mt-0.5">OUT: <span className="text-slate-200">{trade.exitPrice}</span></div>
                    </td>
                    <td className="p-4 max-w-xs space-y-1">
                      {/* Emotions tags list */}
                      <div className="flex flex-wrap gap-1 leading-none">
                        {trade.emotions.map((emo, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-teal-400 font-mono">
                            {emo}
                          </span>
                        ))}
                      </div>
                      {/* Mistakes list */}
                      <div className="flex flex-wrap gap-1 leading-none">
                        {trade.mistakes.map((mis, i) => (
                          <span
                            key={i}
                            className={`text-[9px] px-1.5 py-0.5 rounded ${
                              mis === "None" ? "bg-slate-950 text-slate-500" : "bg-rose-950/20 text-rose-450 font-mono"
                            }`}
                          >
                            {mis}
                          </span>
                        ))}
                      </div>
                      {trade.notes && (
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]" title={trade.notes}>
                          "{trade.notes}"
                        </p>
                      )}
                    </td>
                    <td
                      className={`p-4 text-right font-mono font-bold leading-none text-sm whitespace-nowrap ${
                        trade.profit >= 0 ? "text-emerald-450" : "text-rose-450"
                      }`}
                    >
                      {trade.profit >= 0 ? "+" : ""}
                      ${trade.profit.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onDeleteTrade(trade.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
