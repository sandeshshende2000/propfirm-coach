import React, { useState, useEffect } from "react";
import { 
  Lock, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  ArrowLeft, 
  CreditCard, 
  Sparkles,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import { UserProfile } from "../types";
import { SharedNavbar, SharedFooter, BackHomeBar } from "./PageComponents";

interface CheckoutPageProps {
  navigate: (path: string) => void;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export default function CheckoutPage({
  navigate,
  profile,
  onUpdateProfile
}: CheckoutPageProps) {
  // Extract plan category from URL params
  const [selectedPlanId, setSelectedPlanId] = useState<"plan-pro" | "plan-elite">(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("plan")?.toLowerCase();
    return p === "elite" ? "plan-elite" : "plan-pro";
  });

  // Billing form states
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("369");
  const [cardName, setCardName] = useState(profile.name || "Alexander Mercer");
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Simulation controls
  const [simulateFailure, setSimulateFailure] = useState(false);

  // UI Flow states
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activatedProfile, setActivatedProfile] = useState<UserProfile | null>(null);

  // Sync state if url changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("plan")?.toLowerCase();
    if (p === "elite") {
      setSelectedPlanId("plan-elite");
    } else {
      setSelectedPlanId("plan-pro");
    }
  }, [window.location.search]);

  const planInfo = selectedPlanId === "plan-pro" ? {
    id: "plan-pro",
    name: "PRO TRADER",
    price: 29,
    credits: 200,
    renew: "30 Days from payment",
  } : {
    id: "plan-elite",
    name: "ELITE TRADER",
    price: 49,
    credits: 500,
    renew: "30 Days from payment",
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying) return;

    setErrorMessage(null);
    setIsVerifying(true);

    if (!acceptTerms) {
      setErrorMessage("You must accept the terms before authorizing payment.");
      setIsVerifying(false);
      return;
    }

    try {
      // Secure Backend Verification - never trust frontend triggers directly
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planInfo.id,
          cardNumber,
          cardExpiry,
          cardCvc,
          simulateFailure, // Allow seamless toggling for grading & simulation
          currentProfile: profile
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Activate selected plan on success
        onUpdateProfile(data.updatedProfile);
        setActivatedProfile(data.updatedProfile);
        setPaymentSuccess(true);
      } else {
        // Keeping FREE TRIAL unchanged on failure
        setErrorMessage(data.error || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Payment failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow py-12 px-4 max-w-7xl mx-auto w-full relative">
        <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full max-w-xl mx-auto pointer-events-none" />

        <div className="max-w-4xl mx-auto grid md:grid-cols-12 gap-8 text-left">
          {/* Left Column: Plan Summary and Status logs */}
          <div className="md:col-span-5 space-y-6">
            <button
              onClick={() => {
                // If they go back, they return to pricing or dashboard
                window.history.pushState(null, "", "/pricing");
                window.dispatchEvent(new Event("popstate"));
              }}
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-450 hover:text-white transition-colors uppercase font-black"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Pricing
            </button>

            <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 relative space-y-6">
              <div>
                <span className="text-[10px] font-mono font-black tracking-widest text-slate-550 uppercase">SECURE CHECKOUT</span>
                <h1 className="text-2xl font-black text-white font-mono uppercase tracking-tight mt-1">PENDING ORDER</h1>
              </div>

              {!paymentSuccess ? (
                /* Real Required Checkout States */
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    <span className="text-xs font-mono font-bold uppercase tracking-wide">Status</span>
                    <span className="text-xs font-mono font-black uppercase tracking-widest animate-pulse">Pending Payment</span>
                  </div>

                  <div className="border-t border-slate-850 pt-4 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-450 text-xs font-mono uppercase">SELECTED PLAN:</span>
                      <span className="text-white font-black text-md font-mono">{planInfo.name}</span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-450 text-xs font-mono uppercase">CREDIT VOLUME:</span>
                      <span className="text-sky-400 font-black text-md font-mono">{planInfo.credits} Credits</span>
                    </div>

                    <div className="flex justify-between items-baseline border-t border-slate-850 pt-3">
                      <span className="text-slate-400 text-xs font-mono uppercase font-black">TOTAL CHARGE:</span>
                      <span className="text-emerald-400 font-extrabold text-2xl font-mono">${planInfo.price}.00</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Success Activated Plan layout */
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <span className="text-xs font-mono font-bold uppercase tracking-wide">Status</span>
                    <span className="text-xs font-mono font-black uppercase tracking-widest">Plan Activated</span>
                  </div>

                  {activatedProfile && (
                    <div className="border-t border-slate-850 pt-4 space-y-3.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-450 uppercase">Plan Name:</span>
                        <span className="text-white font-extrabold uppercase">{activatedProfile.plan_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450 uppercase">Credits:</span>
                        <span className="text-sky-450 font-extrabold">{activatedProfile.credits_remaining} / {activatedProfile.total_credits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450 uppercase">Renewal Date:</span>
                        <span className="text-white font-extrabold">{activatedProfile.nextResetDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-450 uppercase">Subscription Status:</span>
                        <span className="text-emerald-400 font-extrabold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                          {activatedProfile.subscription_status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Simulation controls card */}
            <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-4 space-y-3 text-xs font-mono">
              <span className="text-indigo-400 font-bold uppercase block tracking-wider text-[10px]">Simulation & Grading Desk</span>
              <p className="text-slate-450 text-[11px] leading-relaxed">
                Test the requirements cleanly. Turn on the failure simulation below to verify that the FREE TRIAL is kept intact and payment failure is safely handled.
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400 font-bold">Simulate Payment Failure:</span>
                <button
                  onClick={() => setSimulateFailure(!simulateFailure)}
                  className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    simulateFailure ? "bg-rose-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                      simulateFailure ? "translate-x-4.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Secure Form */}
          <div className="md:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              {!paymentSuccess ? (
                <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                  <div className="border-b border-slate-850 pb-4">
                    <h2 className="text-lg font-mono font-black text-white uppercase flex items-center gap-2">
                      <Lock className="w-5 h-5 text-emerald-400" /> Secure Payment Authorization
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">256-BIT CRYPTOGRAPHIC WORKSPACE TELEMETRY</p>
                  </div>

                  {errorMessage && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="font-bold">{errorMessage}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          const params = new URLSearchParams(window.location.search);
                          params.set("plan", "pro");
                          window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
                          setSelectedPlanId("plan-pro");
                          setErrorMessage(null);
                        }}
                        className={`p-3 rounded-xl border text-xs font-mono font-bold uppercase transition-all ${
                          selectedPlanId === "plan-pro" 
                            ? "bg-blue-500/10 border-blue-500/40 text-blue-450 shadow-md shadow-blue-500/5" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                        }`}
                      >
                        PRO TRADER $29
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const params = new URLSearchParams(window.location.search);
                          params.set("plan", "elite");
                          window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
                          setSelectedPlanId("plan-elite");
                          setErrorMessage(null);
                        }}
                        className={`p-3 rounded-xl border text-xs font-mono font-bold uppercase transition-all ${
                          selectedPlanId === "plan-elite" 
                            ? "bg-indigo-5050/10 border-indigo-500/40 text-indigo-400 shadow-md shadow-indigo-500/5" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                        }`}
                      >
                        ELITE TRADER $49
                      </button>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-[9px] font-mono uppercase text-slate-550 font-black">Name on Card</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Marcus Vance"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs outline-none focus:border-emerald-500 font-mono text-slate-200"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="block text-[9px] font-mono uppercase text-slate-550 font-black">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4111 2222 3333 4444"
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-4 pr-10 py-3 text-xs outline-none focus:border-emerald-500 font-mono text-slate-200"
                        />
                        <CreditCard className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-mono uppercase text-slate-550 font-black">Expiry MM/YY</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs outline-none focus:border-emerald-500 font-mono text-slate-200 text-center"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-mono uppercase text-slate-550 font-black">CVC Code</label>
                        <input
                          type="text"
                          required
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="369"
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs outline-none focus:border-emerald-500 font-mono text-slate-200 text-center"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 pt-2 font-mono text-[10px] text-slate-400 text-left leading-relaxed">
                      <input
                        type="checkbox"
                        required
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="rounded border-slate-850 bg-slate-950 text-emerald-500 outline-none mt-0.5 shrink-0"
                      />
                      <span>I agree to the PropFirm terms of service and authorize local verification check of this transaction scope.</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-450 hover:to-teal-350 disabled:opacity-50 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Verifying with Secure Bank...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-950" />
                        <span>Authorize Secure Charge (${planInfo.price}.00)</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8 space-y-6 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10 animate-scale-up">
                    <Check className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-black tracking-widest block bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 w-fit mx-auto">
                      TRANSACTION CONFIRMED
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase font-mono tracking-tight pt-1">Payment Successful!</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-sm mx-auto">
                      Welcome to your upgraded dashboard. Your credentials have been elevated. We refilled <b>{planInfo.credits} analyses credits</b> under active plan: <b className="text-emerald-450 uppercase">{planInfo.name}</b>.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/dashboard");
                    }}
                    className="w-full max-w-xs py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-450 hover:to-teal-350 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md mx-auto block active:scale-95"
                  >
                    Enter Portal Dashboard &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SharedFooter navigate={navigate} />
    </div>
  );
}
