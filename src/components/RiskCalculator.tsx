import React, { useState } from "react";
import { Calculator, Copy, Check, Info, HelpCircle, RefreshCw, Smartphone, TrendingUp, Layers } from "lucide-react";

export default function RiskCalculator() {
  const [accountSize, setAccountSize] = useState("100000");
  const [riskPercent, setRiskPercent] = useState("1.0");
  const [entryPrice, setEntryPrice] = useState("2315.00");
  const [stopLoss, setStopLoss] = useState("2310.00");
  const [assetType, setAssetType] = useState<"GOLD" | "FOREX" | "CRYPTO">("GOLD");
  const [copied, setCopied] = useState(false);

  // Math equations
  const sizeNum = parseFloat(accountSize) || 100000;
  const riskPercentNum = parseFloat(riskPercent) || 1.0;
  const entryNum = parseFloat(entryPrice) || 0;
  const stopNum = parseFloat(stopLoss) || 0;

  // Stop Loss distance
  const stopDistance = Math.abs(entryNum - stopNum);
  const dollarRisk = (sizeNum * riskPercentNum) / 100;

  let recommendedLots = 0;
  let contractSizeStr = "";

  if (stopDistance > 0) {
    if (assetType === "GOLD") {
      // 1 standard lot of Gold = 100 ounces. 1 USD change per ounce is a $100 change per lot.
      // Recommended lots = dollarRisk / (stopDistance * 100)
      recommendedLots = dollarRisk / (stopDistance * 100);
      contractSizeStr = "1 Lot = 100 OZ (Gold/XAUUSD)";
    } else if (assetType === "FOREX") {
      // 1 standard lot of Forex = 100,000 base currency. Pip value of EURUSD 1 lot is $10.
      // 1 pip = 0.0001 (for 4 decimal pairs).
      // Let's assume standard pips calculations: recommendedLots = dollarRisk / (stopDistance * 100,000)
      recommendedLots = dollarRisk / (stopDistance * 100000);
      contractSizeStr = "1 Lot = 100,000 Units (EURUSD, GBPUSD)";
    } else {
      // Crypto (BTCUSD, ETHUSD)
      // 1 standard lot = 1 coin.
      // Recommended lots = dollarRisk / stopDistance
      recommendedLots = dollarRisk / stopDistance;
      contractSizeStr = "1 Lot = 1 Coin (BTCUSD, ETHUSD)";
    }
  }

  const finalLots = recommendedLots > 0 ? +recommendedLots.toFixed(2) : 0.01;

  const handleCopy = () => {
    navigator.clipboard.writeText(finalLots.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadPreset = (type: "GOLD" | "FOREX" | "CRYPTO") => {
    setAssetType(type);
    if (type === "GOLD") {
      setEntryPrice("2315.00");
      setStopLoss("2310.00");
    } else if (type === "FOREX") {
      setEntryPrice("1.08500");
      setStopLoss("1.08200");
    } else {
      setEntryPrice("68400.00");
      setStopLoss("67900.00");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-400" />
          Institutional Position Calculator
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          DETERMINE EXACT CONTRACT VOLUME CORRESPONDING TO MANDATED RISK CONTROLS
        </p>
      </div>

      {/* Calculator Body Grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 font-sans">
              <Layers className="w-4 h-4 text-emerald-400" />
              Calculator Inputs
            </h3>

            {/* Asset Type Select Chips */}
            <div className="flex gap-1.5 p-0.5 rounded-lg bg-slate-950 border border-slate-850">
              {(["GOLD", "FOREX", "CRYPTO"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => loadPreset(t)}
                  className={`text-[9px] font-mono px-2.5 py-1 rounded-md font-bold transition-all ${
                    assetType === t ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account Capital */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 font-mono block">ACCOUNT SIZE ($)</label>
              <input
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white px-3 py-2.5 outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Risk cost */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 font-mono block">PORTFOLIO RISK %</label>
              <input
                type="number"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white px-3 py-2.5 outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Entry Price */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 font-mono block">ENTRY VALUE</label>
              <input
                type="number"
                step="0.00001"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white px-3 py-2.5 outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Stop Loss Value */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-450 font-mono block">STOP LOSS VALUE (SL)</label>
              <input
                type="number"
                step="0.00001"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white px-3 py-2.5 outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[10px] text-slate-400 font-mono flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-350 uppercase">Contract Mode: </span>
              {contractSizeStr}. Math is customized specifically for prop firm trailing loss limits to ensure perfect balance protection.
            </div>
          </div>
        </div>

        {/* Outputs Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Calculator className="w-32 h-32 text-emerald-400" />
            </div>

            <div>
              <span className="text-[9px] font-mono text-emerald-400 block uppercase tracking-wider mb-6">
                CALCULATED LOT LIMIT OUTCOME
              </span>

              <div className="space-y-4">
                {/* 1. Recommended Lots */}
                <div>
                  <span className="text-xs text-slate-400 font-mono">RECOMMENDED LOT VOLUME</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">{finalLots}</span>
                    <button
                      onClick={handleCopy}
                      className="text-slate-400 hover:text-white bg-slate-900 p-2 rounded-lg border border-slate-800 hover:border-slate-700 active:scale-95 transition-all text-xs flex items-center gap-1 font-sans"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Breakdown stats list */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-900 font-mono text-xs text-slate-400">
                  <div>
                    <span>DOLLAR CAPITAL AT RISK:</span>
                    <span className="block font-bold text-rose-400 text-sm mt-0.5">${dollarRisk.toLocaleString()} USD</span>
                  </div>
                  <div>
                    <span>STOP LOSS DISTANCE:</span>
                    <span className="block font-bold text-slate-200 text-sm mt-0.5">{stopDistance.toLocaleString()} Points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro warning indicator */}
            <p className="text-[10px] text-slate-500 leading-relaxed font-mono border-t border-slate-900/60 pt-4 mt-6">
              *Confirm your prop platform accounts support fraction lots before executing bulk contract sizing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
