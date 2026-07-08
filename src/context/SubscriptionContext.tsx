import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile } from "../types";
import { supabase, isSupabaseConfigured, db } from "../supabaseClient";

interface SubscriptionContextType {
  profile: UserProfile;
  isLoading: boolean;
  isVerifying: boolean;
  isPaypalProcessing: boolean;
  showPaypalModal: boolean;
  paypalOrderId: string | null;
  paypalTxId: string;
  selectedPlanId: "plan-pro" | "plan-elite" | null;
  feedbackMsg: { type: "success" | "error"; text: string } | null;
  sdkReady: boolean;
  paypalClientId: string;
  initiatePayPalCheckout: (plan: "pro" | "elite") => Promise<void>;
  capturePayPalPayment: (options?: {
    overrideAmount?: string;
    overrideCurrency?: string;
    overrideStatus?: string;
    overrideTxId?: string;
  }) => Promise<void>;
  cancelPayPalPayment: () => void;
  setFeedbackMsg: React.Dispatch<React.SetStateAction<{ type: "success" | "error"; text: string } | null>>;
  refreshProfile: () => Promise<UserProfile | null>;
  updateProfileState: (updated: UserProfile) => void;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  navigate: (path: string) => void;
  
  // Razorpay Additions
  isIndia: boolean;
  isRazorpaySdkReady: boolean;
  razorpayOrderId: string | null;
  razorpayPriceInr: number;
  razorpayKeyId: string;
  captureRazorpayPayment: (options?: {
    paymentId?: string;
    signature?: string;
    status?: "SUCCESS" | "FAILED";
  }) => Promise<void>;
  cancelRazorpayPayment: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}

interface SubscriptionProviderProps {
  children: React.ReactNode;
  initialProfile: UserProfile;
  onProfileChange?: (profile: UserProfile) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  navigate: (path: string) => void;
}

export function SubscriptionProvider({
  children,
  initialProfile,
  onProfileChange,
  isDemoMode,
  setIsDemoMode,
  navigate
}: SubscriptionProviderProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPaypalProcessing, setIsPaypalProcessing] = useState(false);
  const [showPaypalModal, setShowPaypalModal] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [paypalTxId, setPaypalTxId] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<"plan-pro" | "plan-elite" | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [paypalClientId, setPaypalClientId] = useState("");
  const [sdkReady, setSdkReady] = useState(false);

  // Razorpay state properties
  const [isIndia, setIsIndia] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [isRazorpaySdkReady, setIsRazorpaySdkReady] = useState(false);
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [razorpayPriceInr, setRazorpayPriceInr] = useState(0);

  // Geo-IP and timezone evaluation for Billing Country routing
  useEffect(() => {
    const isIndiaTZ = Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Kolkata";
    setIsIndia(isIndiaTZ);

    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_code) {
          const code = data.country_code.toUpperCase();
          setCountryCode(code);
          setIsIndia(code === "IN" || isIndiaTZ);
        }
      })
      .catch((err) => {
        console.warn("Issue fetching Geo-IP dynamic country routing, relying on timezone:", err);
      });
  }, []);

  // Sync internal state when initialProfile changes from App.tsx
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  // Handle local change notification
  const updateProfileState = (updated: UserProfile) => {
    setProfile(updated);
    if (onProfileChange) {
      onProfileChange(updated);
    }
    db.saveProfile(updated, isDemoMode);
  };

  // Fetch PayPal Config on mount
  useEffect(() => {
    fetch("/api/paypal/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.clientId) {
          setPaypalClientId(data.clientId);
        }
      })
      .catch((err) => console.warn("Issue fetching PayPal config in context:", err));
  }, []);

  // Fetch Razorpay Config on mount
  useEffect(() => {
    fetch("/api/razorpay/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.keyId) {
          setRazorpayKeyId(data.keyId);
        }
      })
      .catch((err) => console.warn("Issue fetching Razorpay config in context:", err));
  }, []);

  // Dynamically load PayPal JS SDK
  useEffect(() => {
    if (!paypalClientId) return;

    const scriptId = "paypal-js-sdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&intent=capture`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
      };
      script.onerror = () => {
        console.warn("Could not load PayPal SDK script, continuing in simulator mode.");
      };
      document.body.appendChild(script);
    } else {
      setSdkReady(true);
    }
  }, [paypalClientId]);

  // Dynamically load Razorpay SDK
  useEffect(() => {
    const scriptId = "razorpay-checkout-sdk";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        setIsRazorpaySdkReady(true);
      };
      script.onerror = () => {
        console.warn("Could not load Razorpay script, continuing in simulator mode.");
      };
      document.body.appendChild(script);
    } else {
      setIsRazorpaySdkReady(true);
    }
  }, []);

  // Generate a mock tx ID when the modal opens
  useEffect(() => {
    if (showPaypalModal) {
      setPaypalTxId("TX-PAY-" + Math.floor(Math.random() * 1000000000));
    }
  }, [showPaypalModal]);

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        const loadedPlan = profileData.plan || profileData.Plan || "FREE_TRIAL";
        const subPlanMapped = loadedPlan === "PRO" ? "Pro" : (loadedPlan === "ELITE" ? "Elite" : "Free");

        // Load payments history from DB
        const { data: paymentsData } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        let mappedPayments: any[] = [];
        if (paymentsData) {
          mappedPayments = paymentsData.map((row: any) => ({
            id: row.id || row.order_id,
            date: row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
            plan: row.plan_name || (row.selected_plan === "plan-elite" ? "ELITE TRADER" : "PRO TRADER"),
            amount: row.amount || row.expected_amount || 0,
            status: row.status ? row.status.toUpperCase() : "PENDING",
            transaction_id: row.transaction_id || row.id || ""
          }));
        }

        let parsedHistory = mappedPayments;
        if (profileData.payment_history) {
          try {
            parsedHistory = typeof profileData.payment_history === "string"
              ? JSON.parse(profileData.payment_history)
              : profileData.payment_history;
          } catch (e) {
            console.warn("Issue parsing payment history in refreshProfile:", e);
          }
        }

        // Let's parse remaining credits correctly from Supabase
        const remainingCredits = profileData.credits_remaining !== undefined 
          ? profileData.credits_remaining 
          : (profileData.Credits !== undefined 
              ? profileData.Credits 
              : (profileData.free_analyses_remaining !== undefined 
                  ? profileData.free_analyses_remaining 
                  : 3));

        const usedCredits = profileData.creditsUsed !== undefined 
          ? profileData.creditsUsed 
          : (profileData.credits_used !== undefined 
              ? profileData.credits_used 
              : 0);

        const limitCredits = profileData.total_credits !== undefined 
          ? profileData.total_credits 
          : (profileData.creditsLimit !== undefined 
              ? profileData.creditsLimit 
              : (profileData.credits !== undefined 
                  ? profileData.credits 
                  : 3));

        let currentPlanName = profileData.plan_name || profileData.Plan_Name || "FREE TRIAL";
        if (loadedPlan === "FREE_TRIAL" && remainingCredits === 0) {
          currentPlanName = "FREE TRIAL EXPIRED";
        }

        const refreshed: UserProfile = {
          ...profile,
          subscriptionPlan: subPlanMapped,
          creditsUsed: usedCredits,
          creditsLimit: limitCredits,
          nextResetDate: profileData.expiry_date || profileData.nextResetDate || "N/A",
          plan_name: currentPlanName,
          subscription_status: profileData.subscription_status || ((loadedPlan === "PRO" || loadedPlan === "ELITE" || loadedPlan === "FREE_TRIAL") ? "active" : "inactive"),
          free_analyses_remaining: remainingCredits,
          credits_remaining: remainingCredits,
          total_credits: limitCredits,
          plan: loadedPlan as "FREE_TRIAL" | "PRO" | "ELITE",
          credits: remainingCredits,
          price: profileData.price !== undefined ? profileData.price : (loadedPlan === "PRO" ? 29 : (loadedPlan === "ELITE" ? 49 : 0)),
          activation_date: profileData.activation_date || profileData.joinDate || "",
          expiry_date: profileData.expiry_date || "Never",
          payment_history: parsedHistory
        };

        updateProfileState(refreshed);
        return refreshed;
      }
    } catch (err) {
      console.warn("Issue refreshing subscription profile from Supabase:", err);
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  // 1. Create PayPal/Razorpay Order based on billing country routing
  const initiatePayPalCheckout = async (plan: "pro" | "elite") => {
    const targetPlanId = plan === "elite" ? "plan-elite" : "plan-pro";
    setSelectedPlanId(targetPlanId);
    setFeedbackMsg(null);
    setIsPaypalProcessing(true);

    if (isIndia) {
      try {
        console.log("Country is India: Routing checkout through Razorpay...");
        const response = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: targetPlanId,
            userId: profile.id || "guest",
            currentProfile: profile
          })
        });

        const data = await response.json();

        if (response.ok && data.orderId) {
          setRazorpayOrderId(data.orderId);
          setRazorpayPriceInr(data.priceInr);
          
          const win = window as any;
          if (!win.Razorpay) {
            console.error("Razorpay SDK is not loaded on window object.");
            setFeedbackMsg({
              type: "error",
              text: "Razorpay Checkout script not loaded. Please refresh the page."
            });
            setIsPaypalProcessing(false);
            return;
          }

          // Launch official Razorpay Checkout experience
          const isRealOrder = data.orderId && !data.orderId.startsWith("RZP-ORD-");
          
          const options: any = {
            key: razorpayKeyId || "rzp_test_uG6fF6vEub94Uq",
            amount: data.priceInr * 100, // paise
            currency: "INR",
            name: "TradeModeAI Ltd",
            description: `${plan === "elite" ? "ELITE" : "PRO"} Trader License`,
            image: "https://ai.studio/build/favicon.ico",
            prefill: {
              name: profile.email ? profile.email.split("@")[0] : "Trader",
              email: profile.email || "sandeshshende2000@gmail.com",
              contact: "9999999999"
            },
            theme: {
              color: "#6366f1"
            },
            modal: {
              ondismiss: function () {
                console.log("Razorpay checkout was dismissed by the user.");
                setFeedbackMsg({
                  type: "error",
                  text: "Checkout flow cancelled by customer."
                });
                setIsPaypalProcessing(false);
              }
            }
          };

          if (isRealOrder) {
            options.order_id = data.orderId;
            options.handler = async function (resp: any) {
              console.log("Razorpay authorization successful with real order. Capturing...");
              await captureRazorpayPayment({
                paymentId: resp.razorpay_payment_id,
                signature: resp.razorpay_signature
              }, data.orderId, targetPlanId);
            };
          } else {
            options.handler = async function (resp: any) {
              console.log("Razorpay authorization successful with fallback. Capturing...");
              await captureRazorpayPayment({
                paymentId: resp.razorpay_payment_id,
                status: "SUCCESS"
              }, data.orderId, targetPlanId);
            };
          }

          const rzp = new win.Razorpay(options);
          rzp.on("payment.failed", function (resp: any) {
            console.error("Razorpay payment failed:", resp?.error || resp);
            setFeedbackMsg({
              type: "error",
              text: resp?.error?.description || resp?.error?.reason || "Razorpay transaction failed."
            });
            setIsPaypalProcessing(false);
          });
          rzp.open();
        } else {
          setFeedbackMsg({
            type: "error",
            text: data.error || "Razorpay Order creation failed."
          });
          setIsPaypalProcessing(false);
        }
      } catch (err) {
        console.warn("Razorpay checkout warning:", err);
        setFeedbackMsg({
          type: "error",
          text: "Failed to connect to Razorpay gateway."
        });
        setIsPaypalProcessing(false);
      }
    } else {
      try {
        const response = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: targetPlanId,
            userId: profile.id || "guest",
            currentProfile: profile
          })
        });

        const data = await response.json();

        if (response.ok && data.orderId) {
          setPaypalOrderId(data.orderId);
          // Open PayPal Checkout modal overlay directly!
          setShowPaypalModal(true);
        } else {
          setFeedbackMsg({
            type: "error",
            text: data.error || "Order creation failed. Please check setup."
          });
        }
      } catch (err) {
        console.warn("PayPal Initiation warning:", err);
        setFeedbackMsg({
          type: "error",
          text: "Failed to connect to PayPal gateway. Check dev settings."
        });
      } finally {
        setIsPaypalProcessing(false);
      }
    }
  };

  // 3. Verify Payment + 4. Update Supabase + 5. Redirect to /dashboard
  const capturePayPalPayment = async (options?: {
    overrideAmount?: string;
    overrideCurrency?: string;
    overrideStatus?: string;
    overrideTxId?: string;
  }) => {
    if (!paypalOrderId || !selectedPlanId) {
      setFeedbackMsg({ type: "error", text: "No pending order found to capture." });
      return;
    }

    setIsVerifying(true);
    setFeedbackMsg(null);

    const planPrice = selectedPlanId === "plan-elite" ? 49 : 29;
    const finalAmount = options?.overrideAmount !== undefined ? options.overrideAmount : planPrice.toString();
    const finalCurrency = options?.overrideCurrency !== undefined ? options.overrideCurrency : "USD";
    const finalStatus = options?.overrideStatus !== undefined ? options.overrideStatus : "COMPLETED";
    const finalTxId = options?.overrideTxId !== undefined ? options.overrideTxId : paypalTxId;

    try {
      // POST to verify payment
      const response = await fetch("/api/paypal/capture-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: paypalOrderId,
          transactionId: finalTxId,
          status: finalStatus,
          currentProfile: profile,
          testAmount: finalAmount,
          testCurrency: finalCurrency
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Complete full state updates on client from verified profile response
        updateProfileState(result.updatedProfile);
        setShowPaypalModal(false);
        setFeedbackMsg({
          type: "success",
          text: "Payment successfully processed! Enjoy your premium tools."
        });
        
        // 5. Direct navigation to dashboard with zero intermediate pricing or landing redirects!
        navigate("/dashboard");
      } else {
        setFeedbackMsg({
          type: "error",
          text: result.error || "Payment verification failed. Please try again."
        });
      }
    } catch (err) {
      console.warn("PayPal Capture warning:", err);
      setFeedbackMsg({
        type: "error",
        text: "Verification failed on subscription server."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const cancelPayPalPayment = () => {
    setShowPaypalModal(false);
    setFeedbackMsg({
      type: "error",
      text: "Checkout flow cancelled by customer."
    });
  };

  // Razorpay Capture & Cancel Handlers
  const captureRazorpayPayment = async (
    options?: {
      paymentId?: string;
      signature?: string;
      status?: "SUCCESS" | "FAILED";
    },
    overrideOrderId?: string,
    overridePlanId?: string
  ) => {
    const activeOrderId = overrideOrderId || razorpayOrderId;
    const activePlanId = overridePlanId || selectedPlanId;

    if (!activeOrderId || !activePlanId) {
      setFeedbackMsg({ type: "error", text: "No pending Razorpay order found to capture." });
      return;
    }

    setIsVerifying(true);
    setFeedbackMsg(null);

    try {
      const response = await fetch("/api/razorpay/capture-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeOrderId,
          razorpayPaymentId: options?.paymentId || "pay_mock_" + Math.floor(Math.random() * 1000000000),
          razorpaySignature: options?.signature || "sig_mock_" + Math.floor(Math.random() * 1000000000),
          status: options?.status || "SUCCESS",
          currentProfile: profile
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        updateProfileState(result.updatedProfile);
        setShowPaypalModal(false);
        setFeedbackMsg({
          type: "success",
          text: "Razorpay payment successfully processed! Enjoy your premium tools."
        });
        navigate("/dashboard");
      } else {
        setFeedbackMsg({
          type: "error",
          text: result.error || "Payment verification failed. Please try again."
        });
      }
    } catch (err) {
      console.warn("Razorpay Capture warning:", err);
      setFeedbackMsg({
        type: "error",
        text: "Verification failed on subscription server."
      });
    } finally {
      setIsVerifying(false);
      setIsPaypalProcessing(false);
    }
  };

  const cancelRazorpayPayment = () => {
    setShowPaypalModal(false);
    setFeedbackMsg({
      type: "error",
      text: "Checkout flow cancelled by customer."
    });
  };

  return (
    <SubscriptionContext.Provider
      value={{
        profile,
        isLoading,
        isVerifying,
        isPaypalProcessing,
        showPaypalModal,
        paypalOrderId,
        paypalTxId,
        selectedPlanId,
        feedbackMsg,
        sdkReady,
        paypalClientId,
        initiatePayPalCheckout,
        capturePayPalPayment,
        cancelPayPalPayment,
        setFeedbackMsg,
        refreshProfile,
        updateProfileState,
        setProfile,
        isDemoMode,
        setIsDemoMode,
        navigate,
        
        // Razorpay bindings
        isIndia,
        isRazorpaySdkReady,
        razorpayOrderId,
        razorpayPriceInr,
        razorpayKeyId,
        captureRazorpayPayment,
        cancelRazorpayPayment
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
