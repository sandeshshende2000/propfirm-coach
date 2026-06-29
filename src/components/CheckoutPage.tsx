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
  RefreshCw,
  Wallet,
  Play
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

  // Billing form states for Card checkout
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("369");
  const [cardName, setCardName] = useState(profile.name || "Alexander Mercer");
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Payment Method Tab
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "card">("paypal");

  // PayPal Flow States
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [isPaypalProcessing, setIsPaypalProcessing] = useState(false);
  const [paypalTxId, setPaypalTxId] = useState("");
  
  // Custom Tester/Simulation States
  const [testAmountOverride, setTestAmountOverride] = useState<string>("");
  const [testCurrencyOverride, setTestCurrencyOverride] = useState<string>("");
  const [testStatusOverride, setTestStatusOverride] = useState<string>("");
  const [testTxIdOverride, setTestTxIdOverride] = useState<string>("");

  // Card simulation controls
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

  useEffect(() => {
    // Generate a default valid TX ID
    setPaypalTxId("TX-PAY-" + Math.floor(Math.random() * 1000000000));
  }, [showPaypalModal]);

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

  // Traditional Card Checkout Submit
  const handleCardCheckoutSubmit = async (e: React.FormEvent) => {
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
      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planInfo.id,
          cardNumber,
          cardExpiry,
          cardCvc,
          simulateFailure,
          currentProfile: profile
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onUpdateProfile(data.updatedProfile);
        setActivatedProfile(data.updatedProfile);
        setPaymentSuccess(true);
      } else {
        setErrorMessage(data.error || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Payment failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 1. PayPal Checkout - Initiate Order
  const handlePaypalInitiate = async () => {
    if (isPaypalProcessing) return;
    setErrorMessage(null);
    setIsPaypalProcessing(true);

    if (!acceptTerms) {
      setErrorMessage("You must accept the terms before authorizing payment.");
      setIsPaypalProcessing(false);
      return;
    }

    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: planInfo.id,
          userId: profile.id || "guest",
          currentProfile: profile
        })
      });

      const data = await response.json();

      if (response.ok && data.orderId) {
        setPaypalOrderId(data.orderId);
        // Open the beautiful Sandbox Checkout interface
        setShowPaypalModal(true);
      } else {
        setErrorMessage(data.error || "Failed to create PayPal order.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to connect to subscription servers. Please check your network.");
    } finally {
      setIsPaypalProcessing(false);
    }
  };

  // 2. PayPal Checkout - Capture Payment and Verify on Backend
  const handlePaypalCapture = async (options?: {
    overrideAmount?: string;
    overrideCurrency?: string;
    overrideStatus?: string;
    overrideTxId?: string;
  }) => {
    setIsVerifying(true);
    setErrorMessage(null);
    setShowPaypalModal(false);

    const finalTxId = options?.overrideTxId !== undefined ? options.overrideTxId : paypalTxId;
    const finalStatus = options?.overrideStatus || "COMPLETED";

    try {
      // Backend server-side verification
      const response = await fetch("/api/paypal/capture-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: paypalOrderId,
          transactionId: finalTxId || undefined,
          status: finalStatus,
          currentProfile: profile,
          // Overrides passed specifically to test server security limits
          ...(options?.overrideAmount ? { testAmount: options.overrideAmount } : {}),
          ...(options?.overrideCurrency ? { testCurrency: options.overrideCurrency } : {})
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onUpdateProfile(data.updatedProfile);
        setActivatedProfile(data.updatedProfile);
        setPaymentSuccess(true);
      } else {
        setErrorMessage(data.error || "PayPal verification rejected. Plan remains inactive.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Server verification error. Connection to PayPal timed out.");
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
                Test and verify security parameters. Toggle failure mode for cards or choose simulated anomalies inside the PayPal checkout modal.
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-850">
                <span className="text-slate-400 font-bold">Simulate Card Failure:</span>
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

          {/* Right Column: Interactive Secure Form / Checkout Panel */}
          <div className="md:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              {!paymentSuccess ? (
                <div className="space-y-6">
                  {/* Tab Selector */}
                  <div className="flex border-b border-slate-800">
                    <button
                      onClick={() => {
                        setPaymentMethod("paypal");
                        setErrorMessage(null);
                      }}
                      className={`flex-1 pb-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
                        paymentMethod === "paypal"
                          ? "text-amber-400 border-amber-400"
                          : "text-slate-450 border-transparent hover:text-slate-200"
                      }`}
                    >
                      <Wallet className="w-4 h-4" />
                      PayPal Checkout
                    </button>
                    <button
                      onClick={() => {
                        setPaymentMethod("card");
                        setErrorMessage(null);
                      }}
                      className={`flex-1 pb-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center justify-center gap-2 ${
                        paymentMethod === "card"
                          ? "text-emerald-400 border-emerald-400"
                          : "text-slate-450 border-transparent hover:text-slate-200"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Credit Card
                    </button>
                  </div>

                  {errorMessage && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="font-bold">{errorMessage}</span>
                    </div>
                  )}

                  {isVerifying && (
                    <div className="p-6 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                      <p className="text-xs font-mono text-slate-300 uppercase tracking-widest animate-pulse">
                        Verifying Transaction with Bank...
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        Running secure server-side validations
                      </p>
                    </div>
                  )}

                  {!isVerifying && paymentMethod === "paypal" && (
                    <div className="space-y-6">
                      <div className="space-y-2 text-left">
                        <h2 className="text-md font-mono font-bold text-white uppercase flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-amber-400" /> PayPal Smart Checkout
                        </h2>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Pay securely using your PayPal account balance, bank checking account, or credit cards. The checkout process is managed using cryptographic tokens.
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4 text-xs font-mono">
                        <div className="flex justify-between items-center text-left">
                          <span className="text-slate-450 font-bold uppercase">Plan Selected:</span>
                          <span className="text-white font-extrabold uppercase">{planInfo.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-left">
                          <span className="text-slate-450 font-bold uppercase">Analyses Refill:</span>
                          <span className="text-sky-400 font-extrabold uppercase">+{planInfo.credits} Credits</span>
                        </div>
                        <div className="flex justify-between items-center text-left border-t border-slate-850 pt-3">
                          <span className="text-slate-400 font-extrabold uppercase">Price amount:</span>
                          <span className="text-amber-400 font-black text-lg">${planInfo.price}.00 USD</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 font-mono text-[10px] text-slate-400 text-left leading-relaxed">
                        <input
                          type="checkbox"
                          required
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="rounded border-slate-850 bg-slate-950 text-amber-500 outline-none mt-0.5 shrink-0"
                        />
                        <span>I agree to the terms of service and authorize a secure server-to-server PayPal invoice generation.</span>
                      </div>

                      {/* Official PayPal Golden Button design */}
                      <button
                        onClick={handlePaypalInitiate}
                        disabled={isPaypalProcessing}
                        className="w-full h-12 bg-[#ffc439] hover:bg-[#f4b328] disabled:opacity-50 text-slate-950 font-bold font-sans rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 select-none shadow-md shadow-amber-500/5 group active:scale-[0.98]"
                      >
                        {isPaypalProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                            <span className="font-semibold text-xs font-mono uppercase tracking-wider">Generating Order Token...</span>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5 justify-center">
                            <span className="text-xs font-sans font-bold text-slate-900 tracking-wide uppercase mr-1">Pay with</span>
                            <span className="text-blue-900 font-black italic text-lg tracking-tight font-sans">Pay</span>
                            <span className="text-sky-500 font-black italic text-lg tracking-tight font-sans -ml-1">Pal</span>
                          </div>
                        )}
                      </button>
                    </div>
                  )}

                  {!isVerifying && paymentMethod === "card" && (
                    <form onSubmit={handleCardCheckoutSubmit} className="space-y-5">
                      <div className="border-b border-slate-850 pb-4">
                        <h2 className="text-md font-mono font-bold text-white uppercase flex items-center gap-2">
                          <Lock className="w-5 h-5 text-emerald-400" /> Secure Credit Card Authorization
                        </h2>
                        <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">256-BIT CRYPTOGRAPHIC WORKSPACE TELEMETRY</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[9px] font-mono uppercase text-slate-550 font-black">Name on Card</label>
                          <input
                            type="text"
                            required
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Alexander Mercer"
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
                          <span>I agree to the TradeModeAI terms of service and authorize local verification check of this transaction scope.</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isVerifying}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-450 hover:to-teal-350 disabled:opacity-50 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 active:scale-95"
                      >
                        <Lock className="w-4 h-4 text-slate-950" />
                        <span>Authorize Secure Card (${planInfo.price}.00)</span>
                      </button>
                    </form>
                  )}
                </div>
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

      {/* Interactive PayPal Sandbox Gateway Modal */}
      {showPaypalModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up text-left">
            
            {/* PayPal Branded Blue Header */}
            <div className="bg-[#003087] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="text-blue-200 font-black italic text-xl tracking-tight">Pay</span>
                <span className="text-sky-300 font-black italic text-xl tracking-tight -ml-2">Pal</span>
                <span className="text-[10px] font-mono bg-white/10 border border-white/20 text-white rounded px-1.5 py-0.5 uppercase font-bold tracking-wider">
                  Sandbox Secure
                </span>
              </div>
              <button 
                onClick={() => setShowPaypalModal(false)}
                className="text-white/70 hover:text-white font-mono text-xs cursor-pointer uppercase font-black tracking-widest"
              >
                Cancel
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <p className="text-xs font-mono text-slate-400">Logged in account:</p>
                <p className="text-xs font-mono font-bold text-white mt-0.5">{profile.email || "sandeshshende2000@gmail.com"}</p>
              </div>

              {/* Order summary */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-450">Merchant:</span>
                  <span className="text-white font-bold">TradeModeAI Ltd</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Subscription Item:</span>
                  <span className="text-white font-bold">{planInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450">Order ID:</span>
                  <span className="text-sky-400 font-bold break-all">{paypalOrderId}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-3">
                  <span className="text-slate-400 font-bold">Total Amount Expected:</span>
                  <span className="text-amber-400 font-extrabold text-md">${planInfo.price}.00 USD</span>
                </div>
              </div>

              {/* Secure Testing options to prove full backend validation */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-indigo-400 uppercase font-black tracking-wider block">
                  Verify Server-Side Security Limits (Integration Simulator)
                </span>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Option A: Normal secure checkout */}
                  <button
                    onClick={() => handlePaypalCapture()}
                    className="w-full py-3 bg-[#ffc439] hover:bg-[#f4b328] text-slate-950 font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    Authorize Normal Payment (Simulate Completed: SUCCESS)
                  </button>

                  <div className="border-t border-slate-800 my-2 pt-2">
                    <p className="text-[10px] text-slate-400 font-mono leading-relaxed mb-2">
                      Choose any of the following to force validation triggers on the server and check error messages:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Option B: Tampered amount */}
                    <button
                      onClick={() => handlePaypalCapture({ overrideAmount: "1.00" })}
                      className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold rounded-xl text-left transition-colors flex flex-col justify-between h-18"
                    >
                      <span>Mismatch Amount</span>
                      <span className="text-[9px] text-slate-400 font-normal">Sends $1.00 instead of ${planInfo.price}.00</span>
                    </button>

                    {/* Option C: Tampered Currency */}
                    <button
                      onClick={() => handlePaypalCapture({ overrideCurrency: "EUR" })}
                      className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold rounded-xl text-left transition-colors flex flex-col justify-between h-18"
                    >
                      <span>Mismatch Currency</span>
                      <span className="text-[9px] text-slate-400 font-normal">Sends EUR instead of USD</span>
                    </button>

                    {/* Option D: Failed status */}
                    <button
                      onClick={() => handlePaypalCapture({ overrideStatus: "FAILED" })}
                      className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold rounded-xl text-left transition-colors flex flex-col justify-between h-18"
                    >
                      <span>Failed Status</span>
                      <span className="text-[9px] text-slate-400 font-normal">Sends FAILED state</span>
                    </button>

                    {/* Option E: Empty Transaction ID */}
                    <button
                      onClick={() => handlePaypalCapture({ overrideTxId: "undefined" })}
                      className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold rounded-xl text-left transition-colors flex flex-col justify-between h-18"
                    >
                      <span>Invalid Tx ID</span>
                      <span className="text-[9px] text-slate-400 font-normal">Sends missing transaction reference</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-950 px-6 py-4 flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-850">
              <span>Merchant TradeID: {profile.id || "GUEST"}</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> Secure SSL Connection
              </span>
            </div>
          </div>
        </div>
      )}

      <SharedFooter navigate={navigate} />
    </div>
  );
}
