import React, { useEffect } from "react";
import { Lock, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { useSubscription } from "../context/SubscriptionContext";

export default function PayPalCheckoutModal() {
  const {
    profile,
    showPaypalModal,
    selectedPlanId,
    paypalOrderId,
    paypalTxId,
    sdkReady,
    paypalClientId,
    isVerifying,
    capturePayPalPayment,
    cancelPayPalPayment
  } = useSubscription();

  // Handle standard PayPal buttons rendering inside the modal
  useEffect(() => {
    if (!sdkReady || !paypalClientId || !showPaypalModal || !selectedPlanId) return;

    const containerId = "global-paypal-button-container";
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous button renderings
    container.innerHTML = "";

    try {
      const win = window as any;
      if (win.paypal && win.paypal.Buttons) {
        win.paypal.Buttons({
          createOrder: async () => {
            return paypalOrderId;
          },
          onApprove: async (data: any) => {
            await capturePayPalPayment({
              overrideTxId: data.paymentID || data.orderID
            });
          },
          onCancel: () => {
            cancelPayPalPayment();
          },
          onError: (err: any) => {
            console.error("PayPal button error:", err);
            cancelPayPalPayment();
          }
        }).render(`#${containerId}`);
      }
    } catch (e) {
      console.error("Error rendering PayPal buttons in Global PayPalCheckoutModal:", e);
    }
  }, [sdkReady, selectedPlanId, paypalClientId, showPaypalModal, paypalOrderId]);

  if (!showPaypalModal) return null;

  const planPrice = selectedPlanId === "plan-elite" ? 49 : 29;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-left animate-in fade-in zoom-in-95 duration-200">
        
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
            onClick={cancelPayPalPayment}
            className="text-white/70 hover:text-white font-mono text-xs cursor-pointer uppercase font-black tracking-widest bg-transparent border-none"
          >
            Cancel
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
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
              <span className="text-white font-bold">
                {selectedPlanId === "plan-elite" ? "ELITE" : "PRO"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450">Order ID:</span>
              <span className="text-sky-400 font-bold break-all">{paypalOrderId}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-3">
              <span className="text-slate-440 font-bold">Total Amount Expected:</span>
              <span className="text-amber-400 font-extrabold text-md">
                ${planPrice}.00 USD
              </span>
            </div>
          </div>

          {/* Real PayPal buttons container if ready */}
          {sdkReady && paypalClientId && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-blue-400 uppercase font-black tracking-wider block">
                PayPal Official Payment Gateway
              </span>
              <div id="global-paypal-button-container" className="w-full" />
            </div>
          )}

          {/* Secure Testing options to prove full backend validation */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-black tracking-wider block font-bold">
              Verify Server-Side Security Limits (Integration Simulator)
            </span>
            
            <div className="grid grid-cols-1 gap-2.5">
              {/* Option A: Normal secure checkout */}
              <button
                onClick={() => capturePayPalPayment()}
                disabled={isVerifying}
                className="w-full py-3 bg-[#ffc439] hover:bg-[#f4b328] text-slate-950 font-sans font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 border-none"
              >
                {isVerifying ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                )}
                Authorize Normal Payment (Simulate Completed: SUCCESS)
              </button>

              <div className="border-t border-slate-800 my-2 pt-2">
                <p className="text-[10px] text-slate-450 font-mono leading-relaxed mb-2">
                  Choose any of the following to force validation triggers on the server and check error messages:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Option B: Tampered amount */}
                <button
                  onClick={() => capturePayPalPayment({ overrideAmount: "1.00" })}
                  disabled={isVerifying}
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold rounded-xl text-left transition-colors flex flex-col justify-between h-18 disabled:opacity-50"
                >
                  <span className="font-bold">Mismatch Amount</span>
                  <span className="text-[9px] text-slate-450 font-normal mt-1 leading-normal">Sends $1.00 instead of ${planPrice}.00</span>
                </button>

                {/* Option C: Tampered Currency */}
                <button
                  onClick={() => capturePayPalPayment({ overrideCurrency: "EUR" })}
                  disabled={isVerifying}
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold rounded-xl text-left transition-colors flex flex-col justify-between h-18 disabled:opacity-50"
                >
                  <span className="font-bold">Mismatch Currency</span>
                  <span className="text-[9px] text-slate-450 font-normal mt-1 leading-normal">Sends EUR instead of USD</span>
                </button>

                {/* Option D: Failed status */}
                <button
                  onClick={() => capturePayPalPayment({ overrideStatus: "FAILED" })}
                  disabled={isVerifying}
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold rounded-xl text-left transition-colors flex flex-col justify-between h-18 disabled:opacity-50"
                >
                  <span className="font-bold">Failed Status</span>
                  <span className="text-[9px] text-slate-450 font-normal mt-1 leading-normal">Sends FAILED state</span>
                </button>

                {/* Option E: Empty Transaction ID */}
                <button
                  onClick={() => capturePayPalPayment({ overrideTxId: "undefined" })}
                  disabled={isVerifying}
                  className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold rounded-xl text-left transition-colors flex flex-col justify-between h-18 disabled:opacity-50"
                >
                  <span className="font-bold">Invalid Tx ID</span>
                  <span className="text-[9px] text-slate-450 font-normal mt-1 leading-normal">Sends missing transaction reference</span>
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
  );
}
