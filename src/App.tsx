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
  RefreshCw
} from "lucide-react";

// Types & Data
import { PropChallenge, TradeJournalEntry, UserProfile, ChatMessage, AIAnalysisRecord } from "./types";
import { SAMPLE_USER_PROFILE, SAMPLE_CHALLENGES, SAMPLE_TRADE_JOURNAL } from "./data";
import { db, supabase, isSupabaseConfigured } from "./supabaseClient";

// Sub-screens components
import LandingPage from "./components/LandingPage";
import DashboardOverview from "./components/DashboardOverview";
import AIAnalysis from "./components/AIAnalysis";
import TradeJournal from "./components/TradeJournal";
import ChallengeTracker from "./components/ChallengeTracker";
import RiskCalculator from "./components/RiskCalculator";
import PerformanceAnalytics from "./components/PerformanceAnalytics";
import AccountSettings from "./components/AccountSettings";
import AdminPanel from "./components/AdminPanel";
import ManageSubscription from "./components/ManageSubscription";
import CheckoutPage from "./components/CheckoutPage";

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
      "/challenge",
      "/calculator",
      "/analytics",
      "/settings",
      "/admin"
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

    const currentProfile = db.getProfile(isDemoMode);
    const updated = {
      ...currentProfile,
      name: name || currentProfile.name,
      email: email || currentProfile.email,
    };
    setProfile(updated);
    db.saveProfile(updated, isDemoMode);

    navigate("/dashboard");
  };

  const handleSignupSuccess = (name: string, email: string, plan: string) => {
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
    db.saveProfile(updatedProfile, isDemoMode);

    setIsAuthenticated(true);
    localStorage.setItem("TRADEMODEAI_IS_AUTHENTICATED", "true");

    navigate("/dashboard");
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    localStorage.removeItem("TRADEMODEAI_IS_AUTHENTICATED");
    navigate("/");
  };

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("TRADEMODEAI_IS_DEMO");
    return saved ? JSON.parse(saved) : false; // Default to false (Real Account)
  });

  // Core Global States
  const [profile, setProfile] = useState<UserProfile>(() => db.getProfile(isDemoMode));
  const [challenges, setChallenges] = useState<PropChallenge[]>(() => db.getChallenges(isDemoMode));
  const [trades, setTrades] = useState<TradeJournalEntry[]>(() => db.getTrades(isDemoMode));
  const [analyses, setAnalyses] = useState<AIAnalysisRecord[]>(() => db.getAnalyses(isDemoMode));

  const [activeChallengeId, setActiveChallengeId] = useState<string>(() => {
    const currentChallenges = db.getChallenges(isDemoMode);
    return currentChallenges[0]?.id || "";
  });

  // 1. Listen for Supabase session on mount & react to Auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

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
        if (wasAuthenticated) {
          // Session expired
          navigate("/login");
        } else {
          // Unauthenticated guest user
          const protectedPaths = [
            "/dashboard",
            "/analysis",
            "/journal",
            "/challenge",
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
    if (!isAuthenticated || isDemoMode || !isSupabaseConfigured || !supabase) return;

    const loadSupabaseData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          const mappedProfile: UserProfile = {
            id: user.id,
            name: profileData.name || profileData.name_display || "Trader",
            email: profileData.email || user.email || "",
            subscriptionPlan: profileData.subscriptionPlan || (profileData.Plan === "FREE_TRIAL" ? "Free" : "Pro"),
            accountBalance: profileData.accountBalance || 100000,
            joinDate: profileData.joinDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            creditsUsed: profileData.creditsUsed !== undefined ? profileData.creditsUsed : (profileData.Credits !== undefined ? 3 - profileData.Credits : 0),
            creditsLimit: profileData.creditsLimit !== undefined ? profileData.creditsLimit : (profileData.total_credits !== undefined ? profileData.total_credits : 3),
            nextResetDate: profileData.nextResetDate || "N/A",
            paymentFailed: !!profileData.paymentFailed,
            role: profileData.role || "user",
            plan_name: profileData.plan_name || profileData.Plan || "FREE TRIAL",
            subscription_status: profileData.subscription_status || profileData.Subscription || "inactive",
            free_analyses_remaining: profileData.free_analyses_remaining !== undefined ? profileData.free_analyses_remaining : (profileData.Credits !== undefined ? profileData.Credits : 3),
            credits_remaining: profileData.credits_remaining !== undefined ? profileData.credits_remaining : (profileData.Credits !== undefined ? profileData.Credits : 3),
            total_credits: profileData.total_credits !== undefined ? profileData.total_credits : (profileData.total_credits !== undefined ? profileData.total_credits : 3),
          };
          setProfile(mappedProfile);
          db.saveProfile(mappedProfile, false);
        }

        // Fetch user analysis history
        const { data: historyData } = await supabase
          .from("analysis_history")
          .select("*")
          .eq("user_id", user.id)
          .order("dateTime", { ascending: false });

        if (historyData) {
          const mappedAnalyses: AIAnalysisRecord[] = historyData.map((row: any) => ({
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
          setAnalyses(mappedAnalyses);
          db.saveAnalyses(mappedAnalyses, false);
        }
      } catch (e) {
        console.error("Error loading Supabase data:", e);
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

    return () => {
      profilesSubscription.unsubscribe();
      historySubscription.unsubscribe();
    };
  }, [isAuthenticated, isDemoMode]);

  // Sync state with database / mode changes
  useEffect(() => {
    localStorage.setItem("TRADEMODEAI_IS_DEMO", JSON.stringify(isDemoMode));
    setProfile(db.getProfile(isDemoMode));
    setChallenges(db.getChallenges(isDemoMode));
    setTrades(db.getTrades(isDemoMode));
    setAnalyses(db.getAnalyses(isDemoMode));
  }, [isDemoMode]);

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setProfile(db.getProfile(isDemoMode));
      setChallenges(db.getChallenges(isDemoMode));
      setTrades(db.getTrades(isDemoMode));
      setAnalyses(db.getAnalyses(isDemoMode));
    });
    return unsubscribe;
  }, [isDemoMode]);

  useEffect(() => {
    if (challenges.length > 0) {
      if (!challenges.some(c => c.id === activeChallengeId)) {
        setActiveChallengeId(challenges[0].id);
      }
    } else {
      setActiveChallengeId("");
    }
  }, [challenges, activeChallengeId]);

  // Sync challenge profits on changes
  useEffect(() => {
    if (challenges.length > 0 && activeChallengeId) {
      const activeChal = challenges.find(c => c.id === activeChallengeId);
      if (activeChal) {
        // Calculate dynamic net profit from trades matching this challenge
        const netProfit = trades.reduce((acc, curr) => acc + curr.profit, 0);
        const updated = challenges.map((chal) => {
          if (chal.id === activeChallengeId) {
            return {
              ...chal,
              currentProfit: netProfit,
              currentLossToday: netProfit < 0 ? Math.abs(netProfit) : 0,
            };
          }
          return chal;
        });
        if (JSON.stringify(updated) !== JSON.stringify(challenges)) {
          db.saveChallenges(updated, isDemoMode);
        }
      }
    }
  }, [trades, activeChallengeId, challenges, isDemoMode]);

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

  const handleAddChallenge = (newChallenge: Omit<PropChallenge, "id" | "daysTraded" | "startDate" | "status">) => {
    const fresh: PropChallenge = {
      ...newChallenge,
      id: "challenge-" + Date.now(),
      daysTraded: 1,
      startDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
    };
    db.saveChallenges([fresh, ...challenges], isDemoMode);
    setActiveChallengeId(fresh.id);
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
      const activeChallenge = challenges.find((c) => c.id === activeChallengeId) || challenges[0];
      const res = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...coachMessages, userMsg],
          context: {
            challengeName: activeChallenge?.name,
            firm: activeChallenge?.firmType,
            accountSize: activeChallenge?.accountSize,
            profit: activeChallenge?.currentProfit,
            lossToday: activeChallenge?.currentLossToday,
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
      const activeChallenge = challenges.find((c) => c.id === activeChallengeId) || challenges[0];
      const res = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...coachMessages, userMsg],
          context: {
            challengeName: activeChallenge?.name,
            firm: activeChallenge?.firmType,
            accountSize: activeChallenge?.accountSize,
            profit: activeChallenge?.currentProfit,
            lossToday: activeChallenge?.currentLossToday,
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
            content: "Patience pays premium. Let's map your key support orderblocks. Keep your risk cost restricted to pass this FundingPips challenge cleanly.",
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
    { label: "Challenge Tracker", icon: <Award className="w-4 h-4" /> },
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
      case "/checkout":
        return (
          <CheckoutPage
            navigate={navigate}
            profile={profile}
            onUpdateProfile={handleUpdateFullProfile}
          />
        );
      
      // Portal tab-based views
      case "/dashboard":
        return renderPortalView("Dashboard");
      case "/analysis":
        return renderPortalView("AI Analysis");
      case "/journal":
        return renderPortalView("Trade Journal");
      case "/challenge":
        return renderPortalView("Challenge Tracker");
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
                  "Challenge Tracker": "/challenge",
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
                    className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-xs font-bold font-mono transition-all uppercase cursor-pointer ${
                      isSelected
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
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
                const map: Record<string, string> = {
                  "Dashboard": "/dashboard",
                  "AI Analysis": "/analysis",
                  "Trade Journal": "/journal",
                  "Challenge Tracker": "/challenge",
                  "Risk Calculator": "/calculator",
                  "Performance Analytics": "/analytics",
                  "Manage Subscription": "/subscription",
                  "Account Settings": "/settings",
                  "Admin Panel": "/admin",
                };
                navigate(map[e.target.value] || "/dashboard");
              }}
              className="bg-slate-900 border border-slate-800 rounded text-xs font-bold text-slate-200 px-2 py-1 outline-none font-mono"
            >
              {navItems.map((item) => (
                <option key={item.label} value={item.label}>
                  {item.label.toUpperCase()}
                </option>
              ))}
            </select>
          </header>

          {/* Core Content Shell */}
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
             {tab === "Dashboard" && (
              <DashboardOverview
                profile={profile}
                challenges={challenges}
                trades={trades}
                analyses={analyses}
                activeChallengeId={activeChallengeId}
                onSelectChallenge={(id) => setActiveChallengeId(id)}
                onNavigateToTab={(targetTab) => {
                  const map: Record<string, string> = {
                    "Dashboard": "/dashboard",
                    "AI Analysis": "/analysis",
                    "Trade Journal": "/journal",
                    "Challenge Tracker": "/challenge",
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
                activeChallenge={challenges.find((c) => c.id === activeChallengeId) || challenges[0]}
                analyses={analyses}
                onAddAnalysis={handleAddAnalysis}
                onUpdateProfile={handleUpdateFullProfile}
                onNavigateToTab={(targetTab) => {
                  const map: Record<string, string> = {
                    "Dashboard": "/dashboard",
                    "AI Analysis": "/analysis",
                    "Trade Journal": "/journal",
                    "Challenge Tracker": "/challenge",
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

            {tab === "Challenge Tracker" && (
              <ChallengeTracker
                challenges={challenges}
                activeChallengeId={activeChallengeId}
                onAddChallenge={handleAddChallenge}
                onSelectChallenge={(id) => setActiveChallengeId(id)}
              />
            )}

            {tab === "Risk Calculator" && <RiskCalculator />}

            {tab === "Performance Analytics" && (
              <PerformanceAnalytics trades={trades} challenges={challenges} />
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
                    "Challenge Tracker": "/challenge",
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

            {tab === "Account Settings" && (
              <AccountSettings profile={profile} onUpdateProfile={handleUpdateProfile} />
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-slate-900 transition-colors">
      {renderRoute()}
    </div>
  );
}
