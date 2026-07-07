import React, { useState, useEffect, useRef } from "react";
import {
  Brain,
  Award,
  Clipboard,
  Calculator,
  Activity,
  Settings,
  ShieldCheck,
  Sparkles,
  LogOut,
  MessageSquare,
  Send,
  X,
  CreditCard,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  Layers,
  RefreshCw,
  Database,
  Check,
  Copy,
  AlertCircle,
  CheckCircle
} from "lucide-react";

// Types & Data
import { TradeJournalEntry, UserProfile, ChatMessage, AIAnalysisRecord } from "./types";
import { SAMPLE_USER_PROFILE, SAMPLE_TRADE_JOURNAL } from "./data";
import { db, supabase, isSupabaseConfigured } from "./supabaseClient";

// Sub-screens components
import LandingPage from "./components/LandingPage";
import DashboardOverview from "./components/DashboardOverview";
import AIAnalysis from "./components/AIAnalysis";
import TradeJournal from "./components/TradeJournal";
import RiskCalculator from "./components/RiskCalculator";
import PerformanceAnalytics from "./components/PerformanceAnalytics";
import AccountSettings from "./components/AccountSettings";
import AdminPanel from "./components/AdminPanel";
import ManageSubscription from "./components/ManageSubscription";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { AnalysisProvider, useAnalysis } from "./context/AnalysisContext";
import PayPalCheckoutModal from "./components/PayPalCheckoutModal";

// Dynamic routing page components
import {
  FeaturesPage,
  PricingPage,
  FaqPage,
  ContactPage,
  AboutPage,
  LoginPage,
  SignupPage,
  DemoPage,
  PrivacyPolicyPage,
  TermsPage,
  RefundPolicyPage,
  RiskDisclaimerPage,
  SupportPage
} from "./components/PageComponents";

function PortalAnalysisIndicator({ navigate }: { navigate: (path: string) => void }) {
  const { currentJob, status, notificationDismissed, setNotificationDismissed } = useAnalysis();
  const currentPath = window.location.pathname;

  // We only show indicators if the user is NOT on the analysis page
  if (currentPath === "/analysis") {
    return null;
  }

  return (
    <>
      {/* 1. Global "AI Analysis Running..." Indicator */}
      {status === "RUNNING" && (
        <div 
          onClick={() => navigate("/analysis")}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900 border border-emerald-500/35 text-white rounded-xl shadow-2xl hover:border-emerald-400 transition-all cursor-pointer group animate-bounce duration-1000"
        >
          <div className="relative">
            <div className="w-6 h-6 rounded-full border-2 border-slate-800 border-t-emerald-500 animate-spin" />
            <Brain className="w-3 h-3 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-left font-mono">
            <span className="block text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors uppercase">
              AI Analysis Running...
            </span>
            <span className="block text-[9px] text-slate-400">
              Analyzing multi-timeframe candle structures
            </span>
          </div>
        </div>
      )}

      {/* 2. Global "Analysis Completed" Notification */}
      {status === "COMPLETED" && !notificationDismissed && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 bg-slate-900 border border-blue-500/40 text-white rounded-xl shadow-2xl max-w-sm animate-slide-in" style={{ animationDuration: "0.3s" }}>
          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <CheckCircle className="w-4 h-4 text-blue-400" />
          </div>
          <div 
            onClick={() => {
              setNotificationDismissed(true);
              navigate("/analysis");
            }}
            className="text-left cursor-pointer flex-1 group"
          >
            <span className="block text-xs font-black text-slate-100 group-hover:text-blue-400 transition-colors uppercase tracking-wider font-mono">
              Analysis Completed
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5 leading-relaxed font-sans">
              Institutional-grade multi-timeframe report is ready for <span className="text-slate-100 font-bold">{currentJob?.pair}</span>. Click to view.
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setNotificationDismissed(true);
            }}
            className="p-1 hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer animate-pulse"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

export default function App() {
  // Navigation states: 'Landing' | 'Portal'
  const [currentView, setCurrentView] = useState<"Landing" | "Portal">("Landing");
  const [activeTab, setActiveTab] = useState<string>("Dashboard");

  // Real dynamic client-side router state
  const [pathname, setPathname] = useState<string>(window.location.pathname);

  // Auth session manager state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("TRADEMODEAI_IS_AUTHENTICATED") === "true";
  });

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, "", path);
    setPathname(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Routing and access control enforcement hook
  useEffect(() => {
    const protectedPaths = [
      "/dashboard",
      "/analysis",
      "/journal",
      "/calculator",
      "/analytics",
      "/settings",
      "/admin",
      "/subscription"
    ];
    const publicAuthPaths = ["/", "/login", "/signup"];

    if (isAuthenticated) {
      if (publicAuthPaths.includes(pathname)) {
        navigate("/dashboard");
      }
    } else {
      if (protectedPaths.includes(pathname)) {
        navigate("/login");
      }
    }
  }, [pathname, isAuthenticated]);

  const handleLoginSuccess = (name: string, email: string) => {
    setIsAuthenticated(true);
    localStorage.setItem("TRADEMODEAI_IS_AUTHENTICATED", "true");

    if (isDemoMode) {
      const currentProfile = db.getProfile(true);
      const updated = {
        ...currentProfile,
        name: name || currentProfile.name,
        email: email || currentProfile.email,
      };
      setProfile(updated);
      db.saveProfile(updated, true);
    }

    navigate("/dashboard");
  };

  const handleSignupSuccess = (name: string, email: string, plan: string) => {
    setIsAuthenticated(true);
    localStorage.setItem("TRADEMODEAI_IS_AUTHENTICATED", "true");

    if (isDemoMode) {
      const updatedProfile: UserProfile = {
        name: name,
        email: email,
        subscriptionPlan: "Free",
        accountBalance: 100000,
        joinDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        creditsUsed: 0,
        creditsLimit: 3,
        nextResetDate: "N/A (3 Free Runs)",
        paymentFailed: false,
        free_analyses_remaining: 3,
        subscription_status: "inactive",
        credits_remaining: 3,
        plan_name: "FREE TRIAL",
        total_credits: 3,
      };
      setProfile(updatedProfile);
      db.saveProfile(updatedProfile, true);
    }

    navigate("/dashboard");
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    localStorage.removeItem("TRADEMODEAI_IS_AUTHENTICATED");
    
    // Clear all real user cached data on logout to prevent state leaks or overwrites
    localStorage.removeItem("TRADEMODEAI_PROFILE_real");
    localStorage.removeItem("TRADEMODEAI_CHALLENGES_real");
    localStorage.removeItem("TRADEMODEAI_TRADES_real");
    localStorage.removeItem("TRADEMODEAI_ANALYSES_real");
    localStorage.removeItem("TRADEMODEAI_CHATS_real");
    
    navigate("/");
  };

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("TRADEMODEAI_IS_DEMO");
    return saved ? JSON.parse(saved) : false; // Default to false (Real Account)
  });

  const [isDataLoading, setIsDataLoading] = useState<boolean>(() => {
    const savedDemo = localStorage.getItem("TRADEMODEAI_IS_DEMO");
    const isDemo = savedDemo ? JSON.parse(savedDemo) : false;
    const isAuth = localStorage.getItem("TRADEMODEAI_IS_AUTHENTICATED") === "true";
    return isAuth && !isDemo;
  });

  const [supabaseLoadError, setSupabaseLoadError] = useState<any>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Core Global States
  const [profile, setProfile] = useState<UserProfile>(() => db.getProfile(isDemoMode));
  const [trades, setTrades] = useState<TradeJournalEntry[]>(() => db.getTrades(isDemoMode));
  const [analyses, setAnalyses] = useState<AIAnalysisRecord[]>(() => db.getAnalyses(isDemoMode));

  // 1. Listen for Supabase session on mount & react to Auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsDataLoading(false);
      return;
    }

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        localStorage.setItem("TRADEMODEAI_IS_AUTHENTICATED", "true");
        const publicAuthPaths = ["/", "/login", "/signup"];
        if (publicAuthPaths.includes(window.location.pathname)) {
          navigate("/dashboard");
        }
      } else {
        const wasAuthenticated = localStorage.getItem("TRADEMODEAI_IS_AUTHENTICATED") === "true";
        setIsAuthenticated(false);
        localStorage.removeItem("TRADEMODEAI_IS_AUTHENTICATED");
        setIsDataLoading(false);
        if (wasAuthenticated) {
          // Session expired
          navigate("/login");
        } else {
          // Unauthenticated guest user
          const protectedPaths = [
            "/dashboard",
            "/analysis",
            "/journal",
            "/calculator",
            "/analytics",
            "/settings",
            "/admin"
          ];
          if (protectedPaths.includes(window.location.pathname)) {
            navigate("/login");
          }
        }
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        localStorage.setItem("TRADEMODEAI_IS_AUTHENTICATED", "true");
        const publicAuthPaths = ["/", "/login", "/signup"];
        if (publicAuthPaths.includes(window.location.pathname)) {
          navigate("/dashboard");
        }
      } else {
        const wasAuthenticated = localStorage.getItem("TRADEMODEAI_IS_AUTHENTICATED") === "true";
        setIsAuthenticated(false);
        localStorage.removeItem("TRADEMODEAI_IS_AUTHENTICATED");
        setIsDataLoading(false);
        if (event === "SIGNED_OUT") {
          navigate("/");
        } else if (wasAuthenticated) {
          // Session expired
          navigate("/login");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Load and map real-time profile/analyses directly from Supabase tables
  useEffect(() => {
    if (!isAuthenticated || !isSupabaseConfigured || !supabase) return;

    const loadSupabaseData = async () => {
      setIsDataLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsDataLoading(false);
          return;
        }

        // Fetch user profile
        let { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.warn("Issue fetching profile from Supabase:", profileError);
          setSupabaseLoadError(profileError);
          setIsDataLoading(false);
          return;
        }

        // Fetch user payment history
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (paymentsError) {
          console.warn("Issue fetching payments from Supabase:", paymentsError);
          setSupabaseLoadError(paymentsError);
          setIsDataLoading(false);
          return;
        }

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

        let mappedProfile: UserProfile;

        let parsedHistory = mappedPayments;
        if (profileData && profileData.payment_history) {
          try {
            parsedHistory = typeof profileData.payment_history === "string"
              ? JSON.parse(profileData.payment_history)
              : profileData.payment_history;
          } catch (e) {
            console.warn("Issue parsing payment_history from Supabase:", e);
          }
        }

        if (profileData) {
          const loadedPlan = profileData.plan || profileData.Plan || "FREE_TRIAL";
          const subPlanMapped = loadedPlan === "PRO" ? "Pro" : (loadedPlan === "ELITE" ? "Elite" : "Free");

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

          mappedProfile = {
            id: user.id,
            name: profileData.name || profileData.name_display || user.user_metadata?.name || "Trader",
            email: profileData.email || user.email || "",
            subscriptionPlan: subPlanMapped,
            accountBalance: profileData.accountBalance || 100000,
            joinDate: profileData.joinDate || new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            creditsUsed: usedCredits,
            creditsLimit: limitCredits,
            nextResetDate: profileData.expiry_date || profileData.nextResetDate || "N/A",
            paymentFailed: !!profileData.paymentFailed,
            role: profileData.role || "user",
            plan_name: currentPlanName,
            subscription_status: profileData.subscription_status || ((loadedPlan === "PRO" || loadedPlan === "ELITE" || loadedPlan === "FREE_TRIAL") ? "active" : "inactive"),
            free_analyses_remaining: remainingCredits,
            credits_remaining: remainingCredits,
            total_credits: limitCredits,
            plan: loadedPlan as 'FREE_TRIAL' | 'PRO' | 'ELITE',
            credits: remainingCredits,
            price: profileData.price !== undefined ? profileData.price : (loadedPlan === "PRO" ? 29 : (loadedPlan === "ELITE" ? 49 : 0)),
            activation_date: profileData.activation_date || profileData.joinDate || "",
            expiry_date: profileData.expiry_date || "Never",
            payment_history: parsedHistory
          };
        } else {
          // Profile does not exist yet (newly created account). Insert default profile with Status = ACTIVE!
          const todayDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          mappedProfile = {
            id: user.id,
            name: user.user_metadata?.name || "New Trader",
            email: user.email || "sandeshshende2000@gmail.com",
            subscriptionPlan: "Free",
            accountBalance: 0,
            joinDate: todayDate,
            creditsUsed: 0,
            creditsLimit: 3,
            nextResetDate: "Never",
            paymentFailed: false,
            plan_name: "FREE_TRIAL",
            subscription_status: "active",
            free_analyses_remaining: 3,
            credits_remaining: 3,
            total_credits: 3,
            plan: "FREE_TRIAL",
            credits: 3,
            price: 0,
            activation_date: todayDate,
            expiry_date: "Never",
            payment_history: []
          };
          // Insert the new profile into Supabase
          const { error: insertError } = await supabase.from("profiles").insert({
            id: user.id,
            name: mappedProfile.name,
            email: mappedProfile.email,
            Plan: "FREE_TRIAL",
            plan_name: "FREE TRIAL",
            subscriptionPlan: "Free",
            Credits: 3,
            credits_remaining: 3,
            total_credits: 3,
            free_analyses_remaining: 3,
            subscription_status: "active",
            nextResetDate: "Never",
            paymentFailed: false,
            joinDate: mappedProfile.joinDate,
            creditsUsed: 0,
            creditsLimit: 3,
            plan: "FREE_TRIAL",
            credits: 3,
            price: 0,
            activation_date: mappedProfile.joinDate,
            expiry_date: "Never",
            payment_history: JSON.stringify([]),
            updated_at: new Date()
          });

          if (insertError) {
            console.warn("Profile insertion failed, checking if profile actually exists:", insertError);
            // Re-fetch to guarantee we use the authoritative database record rather than wiping it
            const { data: retryProfile, error: retryError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .maybeSingle();

            if (retryProfile) {
              const loadedPlan = retryProfile.plan || retryProfile.Plan || "FREE_TRIAL";
              const subPlanMapped = loadedPlan === "PRO" ? "Pro" : (loadedPlan === "ELITE" ? "Elite" : "Free");
              const remainingCredits = retryProfile.credits_remaining !== undefined ? retryProfile.credits_remaining : 3;
              mappedProfile = {
                id: user.id,
                name: retryProfile.name || user.user_metadata?.name || "Trader",
                email: retryProfile.email || user.email || "",
                subscriptionPlan: subPlanMapped,
                accountBalance: retryProfile.accountBalance || 100000,
                joinDate: retryProfile.joinDate || todayDate,
                creditsUsed: retryProfile.creditsUsed || 0,
                creditsLimit: retryProfile.creditsLimit || 3,
                nextResetDate: retryProfile.expiry_date || retryProfile.nextResetDate || "N/A",
                paymentFailed: !!retryProfile.paymentFailed,
                role: retryProfile.role || "user",
                plan_name: retryProfile.plan_name || "FREE TRIAL",
                subscription_status: retryProfile.subscription_status || "active",
                free_analyses_remaining: remainingCredits,
                credits_remaining: remainingCredits,
                total_credits: retryProfile.total_credits || 3,
                plan: loadedPlan as any,
                credits: remainingCredits,
                price: retryProfile.price !== undefined ? retryProfile.price : 0,
                activation_date: retryProfile.activation_date || retryProfile.joinDate || "",
                expiry_date: retryProfile.expiry_date || "Never",
                payment_history: parsedHistory
              };
            } else {
              console.warn("Warning: Cannot insert or retrieve user profile. Proceeding with local fallback to prevent data blocking.");
              setIsDataLoading(false);
              return;
            }
          }
        }

        setProfile(mappedProfile);
        db.saveProfile(mappedProfile, false, false); // Local cache only, never trigger redundant Supabase writes

        // Fetch user trades - Bypassed/Disabled to run only with local storage
        let mappedTrades: TradeJournalEntry[] = db.getTrades(false);
        setTrades(mappedTrades);
        db.saveTrades(mappedTrades, false, false); // Local cache only

        // Fetch user analysis history
        const { data: historyData, error: historyError } = await supabase
          .from("analysis_history")
          .select("*")
          .eq("user_id", user.id)
          .order("dateTime", { ascending: false });

        if (historyError) {
          console.warn("Issue fetching analysis history from Supabase:", historyError);
          setSupabaseLoadError(historyError);
          setIsDataLoading(false);
          return;
        }

        let mappedAnalyses: AIAnalysisRecord[] = [];
        if (historyData) {
          mappedAnalyses = historyData.map((row: any) => ({
            id: row.id,
            date: row.dateTime ? row.dateTime.split(" ")[0] : row.date_time || "",
            pair: row.pair || row.asset || row.Asset || "UNKNOWN",
            accountSize: row.accountSize || row.account_size || 100000,
            riskPercent: row.riskPercent || row.risk_percent || 1,
            session: row.session || "",
            result: typeof row.result === "string" ? JSON.parse(row.result) : row.result,
            dateTime: row.dateTime || row.date_time,
            creditsUsed: row.creditsUsed || row.credits_used || 1,
            status: row.status || "Success",
          }));
        }
        setAnalyses(mappedAnalyses);
        db.saveAnalyses(mappedAnalyses, false, false); // Local cache only

      } catch (e) {
        console.warn("Issue loading Supabase data:", e);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadSupabaseData();

    // Set up real-time postgres_changes channels to auto-refresh the dashboard
    const profilesSubscription = supabase
      .channel("profiles-changes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          loadSupabaseData();
        }
      )
      .subscribe();

    const historySubscription = supabase
      .channel("history-changes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "analysis_history" },
        () => {
          loadSupabaseData();
        }
      )
      .subscribe();

    const paymentsSubscription = supabase
      .channel("payments-changes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          loadSupabaseData();
        }
      )
      .subscribe();

    return () => {
      profilesSubscription.unsubscribe();
      historySubscription.unsubscribe();
      paymentsSubscription.unsubscribe();
    };
  }, [isAuthenticated]);

  // Sync state with database / mode changes
  useEffect(() => {
    localStorage.setItem("TRADEMODEAI_IS_DEMO", JSON.stringify(isDemoMode));
    if (!isAuthenticated) {
      setProfile(db.getProfile(isDemoMode));
      setTrades(db.getTrades(isDemoMode));
      setAnalyses(db.getAnalyses(isDemoMode));
    }
  }, [isDemoMode, isAuthenticated]);

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setProfile(db.getProfile(isDemoMode));
      setTrades(db.getTrades(isDemoMode));
      setAnalyses(db.getAnalyses(isDemoMode));
    });
    return unsubscribe;
  }, [isDemoMode]);

  // AI Psychologist Companion states
  const [showCoachDesk, setShowCoachDesk] = useState(false);
  const [coachMessages, setCoachMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("TRADEMODEAI_CHAT");
    if (saved) return JSON.parse(saved);

    return [
      {
        id: "m-welcome",
        role: "assistant",
        content: "Greetings trader. I am your AI Trading Psychologist and Performance Coach. Whether you are dealing with London Session FOMO, trailing drawdown anxieties, or need technical insights on Gold, text me here. What mental target are we mastering today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [chatInput, setChatInput] = useState("");
  const [isCoachThinking, setIsCoachThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem("TRADEMODEAI_CHAT", JSON.stringify(coachMessages));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coachMessages]);

  // Methods
  const handleAddTrade = (newEntry: Omit<TradeJournalEntry, "id">) => {
    const entryWithId: TradeJournalEntry = {
      ...newEntry,
      id: "trade-" + Date.now(),
    };
    db.saveTrades([entryWithId, ...trades], isDemoMode);
  };

  const handleDeleteTrade = (id: string) => {
    db.saveTrades(trades.filter((t) => t.id !== id), isDemoMode);
  };

  const handleAddAnalysis = (newAnalysis: Omit<AIAnalysisRecord, "id" | "date">) => {
    const fresh: AIAnalysisRecord = {
      ...newAnalysis,
      id: "analysis-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
    };
    const updatedList = [fresh, ...analyses];
    setAnalyses(updatedList);
    db.saveAnalyses(updatedList, isDemoMode);
  };

  const handleUpdateProfile = (name: string, email: string) => {
    const updated = {
      ...profile,
      name,
      email,
    };
    setProfile(updated);
    db.saveProfile(updated, isDemoMode);
  };

  const handleDeleteAccount = async () => {
    if (isSupabaseConfigured && supabase && profile.id) {
      try {
        await supabase.from("profiles").delete().eq("id", profile.id);
      } catch (err) {
        console.warn("Notice: supabase profile row deletion failed", err);
      }
    }
    await handleLogout();
  };

  const handleUpdateFullProfile = (updated: UserProfile) => {
    setProfile(updated);
    db.saveProfile(updated, isDemoMode);
  };

  // Trigger Chat with preloaded templates
  const triggerQuickAdvice = async (issueString: string) => {
    const userMsg: ChatMessage = {
      id: "m-user-" + Date.now(),
      role: "user",
      content: issueString,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCoachMessages((prev) => [...prev, userMsg]);
    setIsCoachThinking(true);
    setShowCoachDesk(true);

    try {
      const netProfit = trades.reduce((acc, curr) => acc + curr.profit, 0);
      const res = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...coachMessages, userMsg],
          context: {
            portfolioName: "Primary Portfolio",
            firm: "Prop",
            accountSize: 100000,
            profit: netProfit,
            lossToday: netProfit < 0 ? Math.abs(netProfit) : 0,
          },
        }),
      });

      if (res.ok) {
        const body = await res.json();
        setCoachMessages((prev) => [
          ...prev,
          {
            id: "m-coach-" + Date.now(),
            role: "assistant",
            content: body.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error();
      }
    } catch {
      // Offline / fallback premium answers
      setTimeout(() => {
        setCoachMessages((prev) => [
          ...prev,
          {
            id: "m-coach-" + Date.now(),
            role: "assistant",
            content: "Observe your trailing margins closely. Gold setups require absolute session volume alignments. Try stepping down your risk cost metric to 0.5% today and prioritize breathing control routines between candles.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1000);
    } finally {
      setIsCoachThinking(false);
    }
  };

  // Submit standard chat input
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isCoachThinking) return;

    const payloadText = chatInput;
    setChatInput("");

    const userMsg: ChatMessage = {
      id: "m-user-" + Date.now(),
      role: "user",
      content: payloadText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCoachMessages((prev) => [...prev, userMsg]);
    setIsCoachThinking(true);

    try {
      const netProfit = trades.reduce((acc, curr) => acc + curr.profit, 0);
      const res = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...coachMessages, userMsg],
          context: {
            portfolioName: "Primary Portfolio",
            firm: "Prop",
            accountSize: 100000,
            profit: netProfit,
            lossToday: netProfit < 0 ? Math.abs(netProfit) : 0,
          },
        }),
      });

      if (res.ok) {
        const body = await res.json();
        setCoachMessages((prev) => [
          ...prev,
          {
            id: "m-coach-" + Date.now(),
            role: "assistant",
            content: body.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error();
      }
    } catch {
      setTimeout(() => {
        setCoachMessages((prev) => [
          ...prev,
          {
            id: "m-coach-" + Date.now(),
            role: "assistant",
            content: "Patience pays premium. Let's map your key support orderblocks. Keep your risk cost restricted to elevate your trading consistency cleanly.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }, 1000);
    } finally {
      setIsCoachThinking(false);
    }
  };

  // Navigation Items
  const navItems = [
    { label: "Dashboard", icon: <Layers className="w-4 h-4" /> },
    { label: "AI Analysis", icon: <Brain className="w-4 h-4" /> },
    { label: "Trade Journal", icon: <Clipboard className="w-4 h-4" /> },
    { label: "Risk Calculator", icon: <Calculator className="w-4 h-4" /> },
    { label: "Performance Analytics", icon: <Activity className="w-4 h-4" /> },
    { label: "Manage Subscription", icon: <CreditCard className="w-4 h-4" /> },
    { label: "Account Settings", icon: <Settings className="w-4 h-4" /> },
    ...(profile.role === "admin" ? [{ label: "Admin Panel", icon: <ShieldCheck className="w-4 h-4" /> }] : []),
  ];

  // Dynamic Route Handler
  const renderRoute = () => {
    switch (pathname) {
      case "/":
        return (
          <LandingPage
            onGetStarted={(plan) => {
              setProfile({ ...profile, subscriptionPlan: plan as any });
              navigate("/signup");
            }}
            onLogin={() => {
              navigate("/login");
            }}
            navigate={navigate}
          />
        );
      case "/features":
        return <FeaturesPage navigate={navigate} />;
      case "/pricing":
        return (
          <PricingPage
            navigate={navigate}
            isAuthenticated={isAuthenticated}
            activeProfile={profile}
            onUpdateProfile={handleUpdateFullProfile}
          />
        );
      case "/faq":
        return <FaqPage navigate={navigate} />;
      case "/contact":
        return <ContactPage navigate={navigate} />;
      case "/login":
        return <LoginPage navigate={navigate} onLoginSuccess={handleLoginSuccess} />;
      case "/signup":
        return <SignupPage navigate={navigate} onSignupSuccess={handleSignupSuccess} />;
      case "/about":
        return <AboutPage navigate={navigate} />;
      case "/privacy-policy":
        return <PrivacyPolicyPage navigate={navigate} />;
      case "/terms":
        return <TermsPage navigate={navigate} />;
      case "/refund-policy":
        return <RefundPolicyPage navigate={navigate} />;
      case "/risk-disclaimer":
        return <RiskDisclaimerPage navigate={navigate} />;
      case "/support":
        return <SupportPage navigate={navigate} />;
      case "/demo":
        return <DemoPage navigate={navigate} />;
      
      // Portal tab-based views
      case "/dashboard":
        return renderPortalView("Dashboard");
      case "/analysis":
        return renderPortalView("AI Analysis");
      case "/journal":
        return renderPortalView("Trade Journal");
      case "/calculator":
        return renderPortalView("Risk Calculator");
      case "/analytics":
        return renderPortalView("Performance Analytics");
      case "/subscription":
        return renderPortalView("Manage Subscription");
      case "/settings":
        return renderPortalView("Account Settings");
      case "/admin":
        if (profile.role !== "admin") {
          return renderPortalView("Dashboard");
        }
        return renderPortalView("Admin Panel");

      default:
        // Try fallback to routing or default landing
        if (pathname.startsWith("/dashboard")) {
          return renderPortalView("Dashboard");
        }
        return (
          <LandingPage
            onGetStarted={(plan) => {
              setProfile({ ...profile, subscriptionPlan: plan as any });
              navigate("/signup");
            }}
            onLogin={() => {
              navigate("/login");
            }}
            navigate={navigate}
          />
        );
    }
  };

  const renderPortalView = (tab: string) => {
    return (
      <div className="flex min-h-screen relative overflow-hidden">
        {/* Main Sidebar */}
        <aside className="w-64 border-r border-slate-900 bg-slate-950/80 backdrop-blur-md hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 z-10 p-4">
          <div className="space-y-6">
            {/* Logo / Header */}
            <div className="flex items-center gap-2 px-2 focus:outline-none animate-pulse-glow" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/10 animate-pulse">
                <Brain className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-blue-400 to-sky-200 bg-clip-text text-transparent">
                  TradeModeAI
                </span>
                <span className="block text-[8px] font-mono tracking-widest text-blue-500 uppercase">
                  AI trading pilot
                </span>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const pathMap: Record<string, string> = {
                  "Dashboard": "/dashboard",
                  "AI Analysis": "/analysis",
                  "Trade Journal": "/journal",
                  "Risk Calculator": "/calculator",
                  "Performance Analytics": "/analytics",
                  "Manage Subscription": "/subscription",
                  "Account Settings": "/settings",
                  "Admin Panel": "/admin",
                };
                const targetPath = pathMap[item.label] || "/dashboard";
                const isSelected = tab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(targetPath);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold font-mono transition-all uppercase ${
                      isSelected
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5 cursor-pointer"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Profile banner */}
          <div className="border-t border-slate-900 pt-4 space-y-3">
            {/* Workspace Mode Selector */}
            <div className="px-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono font-bold text-slate-400">DEMO MODE</span>
                <button
                  onClick={() => setIsDemoMode(!isDemoMode)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isDemoMode ? "bg-amber-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                      isDemoMode ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-teal-400 font-mono">
                {profile.name.charAt(0)}{profile.name.split(" ")[1]?.charAt(0) || ""}
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-white truncate">{profile.name}</span>
                <span className="block text-[9px] font-mono text-blue-400 uppercase font-black">
                  {profile.subscriptionPlan === 'Free' ? 'Free Trial' : `${profile.subscriptionPlan} Trader`}
                </span>
                <span className="block text-[9px] font-mono text-emerald-400 font-black">
                  {(profile.credits_remaining !== undefined) ? profile.credits_remaining : Math.max(0, profile.creditsLimit - profile.creditsUsed)} / {(profile.total_credits !== undefined) ? profile.total_credits : profile.creditsLimit} Left
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-lg text-[10px] font-mono font-bold text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>LOGOUT SESSION</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace Frame */}
        <main className="flex-1 min-w-0 bg-slate-950 min-h-screen relative flex flex-col justify-between">
          {/* Mobile Header Bar */}
          <header className="border-b border-slate-900 bg-slate-950 px-4 py-3 flex md:hidden items-center justify-between sticky top-0 z-45">
            <div className="flex items-center gap-2 max-w-[60%]" onClick={() => navigate("/")}>
              <div className="w-7 h-7 rounded bg-blue-500 flex items-center justify-center shrink-0 animate-pulse">
                <Brain className="w-4.5 h-4.5 text-slate-950" />
              </div>
              <span className="font-bold text-xs font-mono text-white truncate">TradeModeAI</span>
            </div>

            {/* Mobile Tab Selectors */}
            <select
              value={tab}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "Challenge Tracker") return;
                const map: Record<string, string> = {
                  "Dashboard": "/dashboard",
                  "AI Analysis": "/analysis",
                  "Trade Journal": "/journal",
                  "Risk Calculator": "/calculator",
                  "Performance Analytics": "/analytics",
                  "Manage Subscription": "/subscription",
                  "Account Settings": "/settings",
                  "Admin Panel": "/admin",
                };
                navigate(map[val] || "/dashboard");
              }}
              className="bg-slate-900 border border-slate-800 rounded text-xs font-bold text-slate-200 px-2 py-1 outline-none font-mono"
            >
              {navItems.map((item) => (
                <option key={item.label} value={item.label} disabled={item.label === "Challenge Tracker"}>
                  {item.label.toUpperCase()} {item.label === "Challenge Tracker" ? "(OFFLINE)" : ""}
                </option>
              ))}
            </select>
          </header>

          {/* Core Content Shell */}
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
             {tab === "Dashboard" && (
              <DashboardOverview
                profile={profile}
                trades={trades}
                analyses={analyses}
                onNavigateToTab={(targetTab) => {
                  const map: Record<string, string> = {
                    "Dashboard": "/dashboard",
                    "AI Analysis": "/analysis",
                    "Trade Journal": "/journal",
                    "Risk Calculator": "/calculator",
                    "Performance Analytics": "/analytics",
                    "Manage Subscription": "/subscription",
                    "Account Settings": "/settings",
                    "Admin Panel": "/admin",
                  };
                  navigate(map[targetTab] || "/dashboard");
                }}
                isDemoMode={isDemoMode}
                onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
                onUpdateProfile={handleUpdateFullProfile}
                onLogout={handleLogout}
              />
            )}

            {tab === "AI Analysis" && (
              <AIAnalysis
                profile={profile}
                analyses={analyses}
                onAddAnalysis={handleAddAnalysis}
                onUpdateProfile={handleUpdateFullProfile}
                onNavigateToTab={(targetTab) => {
                  const map: Record<string, string> = {
                    "Dashboard": "/dashboard",
                    "AI Analysis": "/analysis",
                    "Trade Journal": "/journal",
                    "Risk Calculator": "/calculator",
                    "Performance Analytics": "/analytics",
                    "Manage Subscription": "/subscription",
                    "Account Settings": "/settings",
                    "Admin Panel": "/admin",
                  };
                  navigate(map[targetTab] || "/dashboard");
                }}
              />
            )}

            {tab === "Trade Journal" && (
              <TradeJournal
                trades={trades}
                onAddTrade={handleAddTrade}
                onDeleteTrade={handleDeleteTrade}
              />
            )}

            {tab === "Risk Calculator" && <RiskCalculator />}

            {tab === "Performance Analytics" && (
              <PerformanceAnalytics trades={trades} />
            )}

            {tab === "Manage Subscription" && (
              <ManageSubscription
                profile={profile}
                onUpdateProfile={handleUpdateFullProfile}
                onNavigateToTab={(targetTab) => {
                  const map: Record<string, string> = {
                    "Dashboard": "/dashboard",
                    "AI Analysis": "/analysis",
                    "Trade Journal": "/journal",
                    "Risk Calculator": "/calculator",
                    "Performance Analytics": "/analytics",
                    "Manage Subscription": "/subscription",
                    "Account Settings": "/settings",
                    "Admin Panel": "/admin",
                  };
                  navigate(map[targetTab] || "/dashboard");
                }}
                navigate={navigate}
              />
            )}

            {tab === "Account Settings" && (
              <AccountSettings 
                profile={profile} 
                onUpdateProfile={handleUpdateProfile} 
                navigate={navigate}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

            {tab === "Admin Panel" && <AdminPanel />}
          </div>

          {/* Aesthetic Human footer */}
          <footer className="border-t border-slate-900 py-4 px-8 text-center text-[10px] font-mono text-slate-600">
            TRADEMODEAI SECTOR LOGS SECURE ENDPOINT | DATA SYNC STATUS: GREEN
          </footer>
        </main>

        {/* AI Trading Psychologist Companion - Collapsible Assistant Drawer */}
        <div className="fixed right-6 bottom-6 z-50">
          {showCoachDesk ? (
            <div className="w-80 sm:w-96 h-[500px] bg-slate-900 border-2 border-blue-500/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in text-xs">
              {/* Desk Header */}
              <div className="bg-slate-950 p-4 border-b border-rose-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Brain className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-xs">Trading Psychologist Desk</h4>
                    <span className="text-[8px] font-mono text-blue-400 block uppercase tracking-wider animate-pulse">Online & Parsing Drawdown</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCoachDesk(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Desk Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20">
                {coachMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-500 text-slate-950 font-medium rounded-tr-none"
                          : "bg-slate-900 text-slate-200 rounded-tl-none border border-slate-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 mt-1">{msg.timestamp}</span>
                  </div>
                ))}
                {isCoachThinking && (
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                    <span>Psychologist is drafting guidance...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Advice Chips */}
              <div className="p-2 border-t border-slate-850 bg-slate-950/40 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => triggerQuickAdvice("Help! I am feeling massive FOMO and overtrading now.")}
                  className="text-[9px] font-mono font-bold bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 px-2.5 py-1 rounded-full text-slate-350 shrink-0 select-none cursor-pointer"
                >
                  FOMO RELIEF
                </button>
                <button
                  type="button"
                  onClick={() => triggerQuickAdvice("I just violated my daily drawdown limit. What should I do next?")}
                  className="text-[9px] font-mono font-bold bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 px-2.5 py-1 rounded-full text-slate-350 shrink-0 select-none cursor-pointer"
                >
                  BLEW LIMIT
                </button>
                <button
                  type="button"
                  onClick={() => triggerQuickAdvice("What parameters should I set for safe Gold trading today?")}
                  className="text-[9px] font-mono font-bold bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 px-2.5 py-1 rounded-full text-slate-350 shrink-0 select-none cursor-pointer"
                >
                  GOLD STRATEGY
                </button>
              </div>

              {/* Desk Chat Input Bar */}
              <form onSubmit={handleSendChat} className="p-3 bg-slate-950 border-t border-slate-900 flex gap-1.5 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask daily trading psychology suggestions..."
                  className="flex-1 bg-slate-900 border border-slate-850 rounded-lg text-xs text-white px-3 py-2 outline-none focus:border-blue-500/40"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-400 p-2 rounded-lg text-slate-950 font-bold active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 fill-slate-950 text-slate-950" />
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setShowCoachDesk(true)}
              className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-550 hover:to-sky-450 text-white p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 group hover:scale-105 active:scale-95 transition-all text-xs font-black font-mono cursor-pointer relative"
            >
              <Brain className="w-5 h-5 text-white" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap block font-bold font-mono">
                COACH DESK
              </span>
              {/* notification indicator */}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px] font-black font-sans text-white">1</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const sqlSchema = `-- TRADEMODEAI DATABASE CONFIGURATION SCRIPT
-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO PROVISION ALL NECESSARY TABLES

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  "Plan" TEXT DEFAULT 'FREE_TRIAL',
  plan_name TEXT DEFAULT 'FREE TRIAL',
  "subscriptionPlan" TEXT DEFAULT 'Free',
  "Credits" INTEGER DEFAULT 3,
  credits_remaining INTEGER DEFAULT 3,
  total_credits INTEGER DEFAULT 3,
  free_analyses_remaining INTEGER DEFAULT 3,
  subscription_status TEXT DEFAULT 'active',
  "nextResetDate" TEXT DEFAULT 'Never',
  "paymentFailed" BOOLEAN DEFAULT false,
  "joinDate" TEXT,
  "creditsUsed" INTEGER DEFAULT 0,
  "creditsLimit" INTEGER DEFAULT 3,
  plan TEXT DEFAULT 'FREE_TRIAL',
  credits INTEGER DEFAULT 3,
  price NUMERIC DEFAULT 0,
  activation_date TEXT,
  expiry_date TEXT DEFAULT 'Never',
  payment_history TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create analysis_history table
CREATE TABLE IF NOT EXISTS public.analysis_history (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pair TEXT,
  asset TEXT,
  "accountSize" NUMERIC,
  "riskPercent" NUMERIC,
  session TEXT,
  result TEXT,
  "dateTime" TEXT,
  "creditsUsed" INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Success',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT,
  selected_plan TEXT,
  amount NUMERIC,
  status TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT,
  status TEXT,
  price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 5. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. Create policies to allow users to view/edit their own data only
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage their own analyses" ON public.analysis_history;
CREATE POLICY "Users can manage their own analyses" ON public.analysis_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own payments" ON public.payments;
CREATE POLICY "Users can manage their own payments" ON public.payments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can manage their own subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
`;

  if (false) {
    const errorMsg = supabaseLoadError.message || JSON.stringify(supabaseLoadError);
    
    const handleBypassSupabase = () => {
      localStorage.setItem("TRADEMODEAI_BYPASS_SUPABASE", "true");
      window.location.reload();
    };

    const handleCopySql = () => {
      navigator.clipboard.writeText(sqlSchema);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    };

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4 md:p-8">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
          {/* Left panel: Info & Actions */}
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-mono font-bold tracking-tight text-slate-100">SUPABASE SYNC FAULT</h3>
                  <p className="text-xs font-mono text-red-400 font-medium">TABLES NOT PROVISIONED YET</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-red-500/10 rounded-xl space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <span className="text-xs font-mono font-semibold text-red-300">Database Response:</span>
                </div>
                <p className="text-[11px] font-mono text-slate-400 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-32">
                  {errorMsg}
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
                <p className="font-semibold text-slate-300">How to quickly resolve this:</p>
                <ul className="list-decimal list-inside space-y-2 font-mono text-[11px]">
                  <li>Go to your <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300 font-semibold">Supabase Dashboard</a>.</li>
                  <li>Open the <span className="text-slate-200 font-semibold">SQL Editor</span> tab on the left navigation rail.</li>
                  <li>Click <span className="text-slate-200 font-semibold">New Query</span>, paste the schema script, and click <span className="text-slate-200 font-semibold">Run</span>.</li>
                  <li>Provision is completed in under 2 seconds.</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <button
                onClick={handleBypassSupabase}
                className="w-full bg-blue-600 hover:bg-blue-500 text-slate-950 font-black font-mono text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 group transition-all cursor-pointer shadow-lg shadow-blue-600/10 active:scale-[0.99]"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                BYPASS & RUN OFFLINE (LOCAL FALLBACK)
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  RETRY CONNECTION
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-slate-950 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/30 text-rose-400 font-mono text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  LOG OUT
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: SQL Script viewer */}
          <div className="bg-slate-950 border-t md:border-t-0 md:border-l border-slate-800 p-6 md:p-8 flex-1 flex flex-col justify-between max-w-md space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider text-slate-400">POSTGRESQL DDL SCHEMA</span>
                <button
                  onClick={handleCopySql}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                    copiedSql 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                  }`}
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-300" />
                      COPY SCHEMA
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] font-mono text-slate-500 leading-normal">
                This query creates all tables (<span className="text-slate-400">profiles, analysis_history, payments, subscriptions</span>) and establishes Row Level Security (RLS) policies.
              </p>
            </div>

            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden relative group h-[250px] md:h-auto">
              <pre className="text-[9px] font-mono text-slate-400 overflow-y-auto absolute inset-4 leading-relaxed selection:bg-blue-500 selection:text-slate-950 select-all scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {sqlSchema}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && isDataLoading && !isDemoMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="relative flex flex-col items-center max-w-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-xl shadow-blue-500/15 animate-bounce">
            <Brain className="w-9 h-9 text-slate-950" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest font-black flex items-center justify-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              AUTHORITATIVE LINK
            </h3>
            <p className="text-xs font-mono text-slate-500">
              Synchronizing account state with TradeModeAI database...
            </p>
          </div>
          
          <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-blue-500 rounded-full animate-pulse" style={{ animationDuration: '1.5s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SubscriptionProvider
      initialProfile={profile}
      onProfileChange={(updated) => setProfile(updated)}
      isDemoMode={isDemoMode}
      setIsDemoMode={setIsDemoMode}
      navigate={navigate}
    >
      <AnalysisProvider
        analyses={analyses}
        onAddAnalysis={handleAddAnalysis}
      >
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-slate-900 transition-colors">
          {renderRoute()}
          <PayPalCheckoutModal />
          <PortalAnalysisIndicator navigate={navigate} />
        </div>
      </AnalysisProvider>
    </SubscriptionProvider>
  );
}
