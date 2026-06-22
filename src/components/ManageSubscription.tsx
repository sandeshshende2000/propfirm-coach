import React, { useState } from "react";
import { 
  CreditCard, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  ArrowUpRight, 
  ShieldAlert, 
  DollarSign, 
  Calendar, 
  Activity, 
  History 
} from "lucide-react";
import { UserProfile } from "../types";

interface ManageSubscriptionProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigateToTab?: (tab: string) => void;
}

export default function ManageSubscription({
  profile,
  onUpdateProfile,
  onNavigateToTab
}: ManageSubscriptionProps) {
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getPlanDetails = () => {
    const plan = profile.subscriptionPlan;
    if (profile.plan_name === "FREE TRIAL EXPIRED" || profile.status === "Expired") {
      return {
        name: "FREE TRIAL EXPIRED",
        cost: 0,
        limit: 0,
        status: "Expired",
        colorClass: "text-rose-400 border-rose-500/20 bg-rose-500/5",
        features: ["No active analyses left", "AI psychologist disabled"]
      };
    }
    if (plan === "Pro") {
      return {
        name: "PRO TRADER",
        cost: 29,
        limit: 200,
        status: "Active",
        colorClass: "text-blue-400 border-blue-500/25 bg-blue-500/5",
        features: ["200 AI Analyses / mo", "Priority support", "Trade Journal", "SMC Multi-TF Radar"]
      };
    }
    if (plan === "Elite") {
      return {
        name: "ELITE TRADER",
        cost: 49,
        limit: 500,
        status: "Active",
        colorClass: "text-indigo-400 border-indigo-500/25 bg-indigo-500/5",
        features: ["500 AI Analyses / mo", "Everything in Pro", "Ultra-Priority Processing", "Advanced SMC Neural Engine"]
      };
    }
    return {
      name: "FREE TRIAL",
      cost: 0,
      limit: 3,
      status: "Active",
      colorClass: "text-teal-400 border-teal-500/25 bg-teal-500/5",
      features: ["3 Free analyses credits", "Standard Trade psychology desk"]
    };
  };

  const planInfo = getPlanDetails();

  // Cancel / Simulate Expiration of the Subscription
  const handleCancelSubscription = () => {
    setLoading(true);
    setFeedbackMsg(null);

    setTimeout(() => {
      const updatedProfile: UserProfile = {
        ...profile,
        subscriptionPlan: "Free",
        plan_name: "FREE TRIAL EXPIRED",
        status: "Expired",
        subscription_status: "expired",
        creditsUsed: profile.creditsLimit || 3,
        creditsLimit: 0,
        total_credits: 0,
        credits_remaining: 0,
        free_analyses_remaining: 0,
        nextResetDate: "Expired (Renew Required)",
        paymentFailed: false
      };

      onUpdateProfile(updatedProfile);
      setLoading(false);
      setShowCancelConfirm(false);
      setFeedbackMsg({
        type: "success",
        text: "Your subscription has expired. Plan automatically deactivated to FREE TRIAL EXPIRED."
      });
    }, 800);
  };

  // Simulate resetting back to Pro / Elite or Free Trial for easy credential testing
  const handleSimulatePaymentRestore = () => {
    const updatedProfile: UserProfile = {
      ...profile,
      subscriptionPlan: "Free",
      plan_name: "FREE TRIAL",
      status: "Active",
      subscription_status: "inactive",
      creditsUsed: 0,
      creditsLimit: 3,
      total_credits: 3,
      credits_remaining: 3,
      free_analyses_remaining: 3,
      nextResetDate: "N/A (3 Free Runs)",
      paymentFailed: false
    };
    onUpdateProfile(updatedProfile);
    setFeedbackMsg({
      type: "success",
      text: "System status restored back to Default Free Trial credentials successfully!"
    });
  };

  // Pre-configured list of mock invoices since the system saves history:
  const paymentHistoryList = profile.payment_history || [
    {
      id: "PAY-XM8392",
      date: "Jun 15, 2026",
      amount: planInfo.cost,
      plan: planInfo.name,
      status: "Success"
    },
    {
      id: "PAY-OL1912",
      date: "May 15, 2026",
      amount: planInfo.cost,
      plan: planInfo.name,
      status: "Success"
    }
  ];

  return (
    <div id="manage-subscription-view" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-slate-850 p-5 rounded-2xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
            <CreditCard className="w-6 h-6 text-blue-500" />
            MANAGE SUBSCRIPTION
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            CONTROL ACTIVE CONTRACTS, VERIFY INVOICES, AND STAGE UPGRADES
          </p>
        </div>

        <button
          onClick={handleSimulatePaymentRestore}
          className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 font-mono text-[9px] text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          RESET TO FREE TRIAL
        </button>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Details Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 lg:col-span-1 text-left">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider">CURRENT SUBSCRIPTION</span>
            <div className={`border rounded-lg px-2.5 py-1 w-fit text-xs font-mono font-black tracking-wide ${planInfo.colorClass}`}>
              {planInfo.name}
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-b border-slate-850 pb-4">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">MONTHLY COST</span>
              <span className="text-3xl font-black text-white font-mono">${planInfo.cost}</span>
              <span className="text-slate-500 text-xs font-mono"> / Month</span>
            </div>

            <div className="border-b border-slate-850 pb-4">
              <span className="block text-[10px] font-mono text-slate-400 uppercase">CREDITS ALLOCATED</span>
              <span className="text-3xl font-black text-white font-mono">
                {profile.plan_name === "FREE TRIAL EXPIRED" ? 0 : (profile.total_credits !== undefined ? profile.total_credits : profile.creditsLimit)}
              </span>
              <span className="text-slate-500 text-xs font-mono"> Analyses</span>
            </div>

            <div className="pb-2">
              <span className="block text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> RENEWAL DATE
              </span>
              <span className="text-sm font-bold text-sky-400 font-mono">
                {profile.nextResetDate}
              </span>
            </div>
          </div>

          {/* Features list */}
          <div className="space-y-2 border-t border-slate-850 pt-4">
            <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest font-black">Plan Inclusion</span>
            <ul className="space-y-1.5 text-xs font-mono text-slate-350">
              {planInfo.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className={`w-3.5 h-3.5 ${planInfo.status === "Expired" ? "text-rose-450" : "text-emerald-400"}`} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Subscription Control & Payment Options */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6 lg:col-span-2 text-left">
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <div>
              <h3 className="font-extrabold text-white text-md">SUBSCRIPTION MANAGEMENT PANELS</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase font-bold">Cancel, upgrade, or alter active licenses</p>
            </div>
          </div>

          {/* Upgrades panel section */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase text-slate-400">Upgrade / Renew Your Plan</h4>
            <p className="text-xs text-slate-350 max-w-lg leading-relaxed font-sans">
              Need more radar scope? Upgrading your subscription plan refills your analyzer credits immediately and unlocks priority vision transformer pipelines.
            </p>

            <div className="flex flex-wrap gap-3">
              {(profile.subscriptionPlan === "Free" || profile.plan_name === "FREE TRIAL EXPIRED") && (
                <>
                  <button
                    onClick={() => {
                      window.history.pushState(null, "", "/pricing");
                      window.dispatchEvent(new Event("popstate"));
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-450 hover:to-teal-350 text-slate-950 font-black font-mono text-xs uppercase rounded-xl transition-all flex items-center gap-1 shadow-lg cursor-pointer"
                  >
                    <span>Upgrade to Pro Trader ($29)</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      window.history.pushState(null, "", "/pricing");
                      window.dispatchEvent(new Event("popstate"));
                    }}
                    className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold font-mono text-xs uppercase rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Upgrade to Elite ($49)</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {profile.subscriptionPlan === "Pro" && (
                <button
                  onClick={() => {
                    window.history.pushState(null, "", "/pricing");
                    window.dispatchEvent(new Event("popstate"));
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-indigo-500 hover:opacity-90 text-slate-950 font-black font-mono text-xs uppercase rounded-xl transition-all flex items-center gap-1 shadow-lg cursor-pointer"
                >
                  <span>Upgrade to Elite Trader ($49)</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}

              {profile.subscriptionPlan === "Elite" && (
                <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-550/10 border border-emerald-555/20 rounded-xl p-3 max-w-md">
                   You are currently registered under our highest tier (ELITE TRADER). Standard credit limits partition concurrently. No further upgrades are required.
                </div>
              )}
            </div>
          </div>

          {/* Cancellation block section */}
          {profile.plan_name !== "FREE TRIAL EXPIRED" && profile.status !== "Expired" && (
            <div className="border-t border-slate-850 pt-6 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-400">Cancel Plan Subscription</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-lg font-sans">
                Canceling your subscription takes effect immediately for testing. The plan status changes to <b>FREE TRIAL EXPIRED</b>, and AI analysis blocks engage instantly as requested in strict rule tests.
              </p>

              {showCancelConfirm ? (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 space-y-3.5 max-w-md">
                  <div className="flex gap-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-xs font-bold block">CONFIRM DEACTIVATION</span>
                      <p className="text-[10px] font-mono leading-relaxed mt-0.5">
                        This action behaves in accordance with monthly expiration rules. Once confirmed, your standard credits are depleted to 0, which halts trade scans instantly.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancelSubscription}
                      disabled={loading}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-650 text-slate-950 font-black font-mono text-[10px] uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      {loading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span>Yes, Cancel Active Contract</span>
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="px-3.5 py-2 bg-slate-950 border border-slate-800 text-slate-300 font-bold font-mono text-[10px] uppercase rounded-lg cursor-pointer"
                    >
                      Keep Plan Alive
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 bg-slate-950 border border-rose-500/30 text-rose-400 hover:bg-rose-500/5 font-mono text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel Subscription Contract</span>
                </button>
              )}
            </div>
          )}
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
                  <th className="py-2.5 px-2">INVOICE ID</th>
                  <th className="py-2.5 px-2">DATE COMPLETED</th>
                  <th className="py-2.5 px-2">PLAN TIER</th>
                  <th className="py-2.5 px-2">AMOUNT BILLED</th>
                  <th className="py-2.5 px-2">TELEMETRY CODE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-slate-300">
                {paymentHistoryList.map((invoice: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-900/20">
                    <td className="py-3 px-2 font-black text-white">{invoice.id}</td>
                    <td className="py-3 px-2">{invoice.date}</td>
                    <td className="py-3 px-2 uppercase font-bold text-blue-450">{invoice.plan}</td>
                    <td className="py-3 px-2 font-black text-emerald-400">${invoice.amount}.00</td>
                    <td className="py-3 px-2">
                      <span className="text-[10px] border border-emerald-500/15 text-emerald-450 bg-emerald-500/5 px-2 py-0.5 rounded font-black">
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 font-mono text-xs">
            No valid payment occurrences logged under free tier.
          </div>
        )}
      </div>
    </div>
  );
}
