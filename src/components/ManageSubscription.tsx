import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  ArrowUpRight, 
  History,
  Calendar,
  Activity,
  Check,
  Sparkles,
  Zap
} from "lucide-react";
import { UserProfile } from "../types";
import { useSubscription } from "../context/SubscriptionContext";

interface ManageSubscriptionProps {
  profile?: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
  onNavigateToTab?: (tab: string) => void;
  navigate?: (path: string) => void;
}

export default function ManageSubscription({
  onNavigateToTab,
  navigate
}: ManageSubscriptionProps) {
  const {
    profile,
    isVerifying,
    isPaypalProcessing,
    feedbackMsg,
    setFeedbackMsg,
    initiatePayPalCheckout,
    selectedPlanId
  } = useSubscription();

  const [dbPlans, setDbPlans] = useState<any[]>([]);

  // Fetch plans on mount
  useEffect(() => {
    fetch("/api/plans")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbPlans(data);
        }
      })
      .catch(err => console.error("Error loading plans:", err));
  }, []);

  const handlePaypalInitiate = async (plan: "pro" | "elite") => {
    await initiatePayPalCheckout(plan);
  };

  const paymentHistoryList = profile?.payment_history || [];

  return (
    <div id="manage-subscription-view" className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-slate-800 p-6 rounded-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5 font-mono">
            <CreditCard className="w-7 h-7 text-emerald-450 animate-pulse" />
            SUBSCRIPTION PORTAL
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-wider">
            Monitor credits, view payment history, and upgrade to premium nodes
          </p>
        </div>
      </div>

      {/* Feedback Messages */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border font-mono text-xs text-left ${
          feedbackMsg.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-450"
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span className="font-bold">{feedbackMsg.text}</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Subscription Details Panel (Current Plan, Status, Credits, Dates) */}
        <div className="lg:col-span-5 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-850">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-white text-base tracking-tight font-mono">CURRENT LICENSE</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Current Plan */}
              <div className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-3 text-left">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Current Plan</span>
                <span className="text-sm font-black text-white tracking-tight font-mono block uppercase">
                  {profile?.plan_name || "FREE TRIAL"}
                </span>
              </div>

              {/* Plan Status */}
              <div className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-3 text-left">
                <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Plan Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase border ${
                  profile?.subscription_status === "active" || profile?.plan_name === "FREE_TRIAL" || (profile?.plan_name === "FREE TRIAL" && (profile?.credits_remaining || 0) > 0)
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-450"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    profile?.subscription_status === "active" || profile?.plan_name === "FREE_TRIAL" || (profile?.plan_name === "FREE TRIAL" && (profile?.credits_remaining || 0) > 0)
                      ? "bg-emerald-400 animate-pulse" 
                      : "bg-rose-400"
                  }`} />
                  {profile?.subscription_status === "active" || profile?.plan_name === "FREE_TRIAL" || (profile?.plan_name === "FREE TRIAL" && (profile?.credits_remaining || 0) > 0) ? "Active" : "Expired"}
                </span>
              </div>
            </div>

            {/* Credits Section */}
            <div className="bg-slate-950/40 border border-slate-850/60 rounded-xl p-4 text-left space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Credits Analytics</span>
                <span className="text-[10px] font-mono text-slate-450 uppercase">TradeModeAI Scanner</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="border-r border-slate-850">
                  <span className="block text-[9px] font-mono text-slate-500 uppercase">Remaining</span>
                  <span className="text-xl font-black text-emerald-450 font-mono block mt-1">
                    {profile?.credits_remaining !== undefined ? profile.credits_remaining : 3}
                  </span>
                </div>
                <div className="border-r border-slate-850">
                  <span className="block text-[9px] font-mono text-slate-500 uppercase">Used</span>
                  <span className="text-xl font-black text-rose-400 font-mono block mt-1">
                    {profile?.creditsUsed !== undefined ? profile.creditsUsed : 0}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-slate-500 uppercase">Total Limit</span>
                  <span className="text-xl font-black text-slate-300 font-mono block mt-1">
                    {profile?.total_credits !== undefined ? profile.total_credits : (profile?.creditsLimit !== undefined ? profile.creditsLimit : 3)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-850">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, Math.max(0, ((profile?.credits_remaining !== undefined ? profile.credits_remaining : 3) / (profile?.total_credits || 3)) * 100))}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>0 Credits</span>
                  <span>{profile?.total_credits || 3} Limit</span>
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div className="space-y-3 bg-slate-950/40 border border-slate-850/60 rounded-xl p-4 text-left">
              <div className="flex justify-between items-center text-xs font-mono border-b border-slate-900 pb-2.5">
                <span className="text-slate-450 uppercase text-[10px]">Activation Date</span>
                <span className="text-slate-200 font-bold font-mono">
                  {profile?.activation_date || profile?.joinDate || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-450 uppercase text-[10px]">Expiration Date</span>
                <span className="text-amber-400 font-bold font-mono">
                  {profile?.expiry_date || "Never (One-time Access)"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-850/50 text-[10px] font-mono text-slate-500 text-left leading-relaxed">
            * Note: TradeModeAI plans grant durable lifetime or credit-based one-time blocks. There are no recurring billings or cancellation penalties.
          </div>
        </div>

        {/* Right Side: Premium Upgrade Options */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-4 border-b border-slate-850 mb-6 text-left">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-base tracking-tight font-mono uppercase">PREMIUM UPGRADE OPTIONS</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* PRO TRADER CARD */}
                <div className="bg-slate-950/40 border border-slate-850/65 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xl hover:border-emerald-500/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 font-extrabold tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                        PRO TIER
                      </span>
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>

                    <div>
                      <span className="text-3xl font-black text-white font-mono">$29</span>
                      <span className="text-slate-400 font-mono text-xs"> / flat</span>
                      <p className="text-[10px] font-mono text-slate-500 uppercase font-black mt-1">ONE-TIME DEPOSIT</p>
                    </div>

                    <div className="border-t border-slate-900/80 pt-3">
                      <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black mb-2">FEATURES INCLUDED</span>
                      <ul className="space-y-2 text-xs font-mono text-slate-350">
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>200 AI Scan Credits</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Standard SMC Multi-TF Radar</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Interactive Trade Journal</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Priority support desk</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900">
                    <button
                      onClick={() => handlePaypalInitiate("pro")}
                      disabled={isVerifying || isPaypalProcessing}
                      className="w-full h-12 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black font-mono text-xs uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-98 disabled:pointer-events-none cursor-pointer border-none shadow-emerald-500/20 hover:shadow-emerald-500/35"
                    >
                      {(isPaypalProcessing || isVerifying) && selectedPlanId === "plan-pro" ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Buy PRO ($29)</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ELITE TRADER CARD */}
                <div className="bg-slate-950/40 border border-slate-850/65 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-xl hover:border-purple-500/20 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-400 font-extrabold tracking-widest bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded uppercase">
                        ELITE TIER
                      </span>
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>

                    <div>
                      <span className="text-3xl font-black text-white font-mono">$49</span>
                      <span className="text-slate-400 font-mono text-xs"> / flat</span>
                      <p className="text-[10px] font-mono text-slate-500 uppercase font-black mt-1">ONE-TIME DEPOSIT</p>
                    </div>

                    <div className="border-t border-slate-900/80 pt-3">
                      <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black mb-2">FEATURES INCLUDED</span>
                      <ul className="space-y-2 text-xs font-mono text-slate-350">
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>500 AI Scan Credits</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>Everything in PRO plan</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>Advanced SMC Neural Engine</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>Ultra-Priority Processing</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-900">
                    <button
                      onClick={() => handlePaypalInitiate("elite")}
                      disabled={isVerifying || isPaypalProcessing}
                      className="w-full h-12 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-black font-mono text-xs uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-98 disabled:pointer-events-none cursor-pointer border-none shadow-purple-500/20 hover:shadow-purple-500/35"
                    >
                      {(isPaypalProcessing || isVerifying) && selectedPlanId === "plan-elite" ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Buy ELITE ($49)</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Invoice & Payment History Log Section */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-left">
        <div className="flex items-center gap-2 border-b border-slate-850 pb-4 mb-4">
          <History className="w-4 h-4 text-emerald-450" />
          <div>
            <h3 className="font-bold text-white text-md">PAYMENT AND INVOICE HISTORY</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase font-black">Valid invoice listings compiled concurrently</p>
          </div>
        </div>

        {paymentHistoryList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] border-b border-slate-850">
                  <th className="py-2.5 px-2">Invoice ID</th>
                  <th className="py-2.5 px-2">Plan</th>
                  <th className="py-2.5 px-2">Amount</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2">Payment Date</th>
                  <th className="py-2.5 px-2">Transaction ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-slate-300">
                {paymentHistoryList.map((invoice: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-900/20">
                    <td className="py-3 px-2 font-black text-white">{invoice.id}</td>
                    <td className="py-3 px-2 uppercase font-bold text-blue-450">{invoice.plan}</td>
                    <td className="py-3 px-2 font-black text-emerald-400">${invoice.amount}.00</td>
                    <td className="py-3 px-2">
                      <span className="text-[10px] border border-emerald-500/15 text-emerald-450 bg-emerald-500/5 px-2 py-0.5 rounded font-black">
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2">{invoice.date}</td>
                    <td className="py-3 px-2 text-slate-400 font-mono text-xs">{invoice.transaction_id || invoice.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 font-mono text-xs">
            {profile?.plan === "FREE_TRIAL" ? "No payment history available yet." : "No payment history available."}
          </div>
        )}
      </div>
    </div>
  );
}
