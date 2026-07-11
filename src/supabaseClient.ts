import { createClient } from "@supabase/supabase-js";
import { UserProfile, TradeJournalEntry, AIAnalysisRecord, ChatMessage } from "./types";

// Lazy-initialization of Supabase Client to prevent crashes if credentials have not been configured yet
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey) && typeof window !== 'undefined' && localStorage.getItem("TRADEMODEAI_BYPASS_SUPABASE") !== "true";

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database State Structure
interface DatabaseSchema {
  profile: UserProfile;
  trades: TradeJournalEntry[];
  analyses: AIAnalysisRecord[];
  chats: ChatMessage[];
}

const DEFAULT_REAL_USER_SCHEMA: DatabaseSchema = {
  profile: {
    name: "New Trader",
    email: "sandeshshende2000@gmail.com",
    subscriptionPlan: "Free",
    accountBalance: 0,
    joinDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    creditsUsed: 0,
    creditsLimit: 3,
    nextResetDate: "N/A (3 Free Runs)",
    paymentFailed: false,
    plan_name: "FREE TRIAL",
    subscription_status: "inactive",
    free_analyses_remaining: 3,
    credits_remaining: 3,
    total_credits: 3,
    plan: "FREE_TRIAL",
    credits: 3,
    price: 0,
    activation_date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    expiry_date: "Never",
    payment_history: []
  },
  trades: [],
  analyses: [],
  chats: [
    {
      id: "m-welcome",
      role: "assistant",
      content: "Welcome to TradeModeAI. Start your first analysis to begin tracking your trading performance.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]
};

// Database class to orchestrate calculations and sync to Supabase/LocalStorage in real-time
class RealTimeDatabase {
  private listeners: (() => void)[] = [];

  constructor() {
    // Synchronize to Supabase if configured
    if (isSupabaseConfigured) {
      console.log("Supabase connected. Synchronizing real-time streams.");
    }
  }

  // Add observer pattern for automatic component re-render on database changes
  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(callback => callback());
  }

  // Local storage keys
  private getStorageKey(key: string, isDemo: boolean): string {
    return isDemo ? `TRADEMODEAI_DEMO_${key}` : `TRADEMODEAI_REAL_${key}`;
  }

  // Generic Getters
  getProfile(isDemo: boolean = false): UserProfile {
    const saved = localStorage.getItem(this.getStorageKey("PROFILE", isDemo));
    if (saved) return JSON.parse(saved);

    if (isDemo) {
      return {
        name: "Alexander Mercer",
        email: "alex.mercer@institutional.fm",
        subscriptionPlan: "Pro",
        accountBalance: 104520,
        joinDate: "May 12, 2026",
        creditsUsed: 2,
        creditsLimit: 200,
        nextResetDate: "Jul 22, 2026",
        paymentFailed: false,
      };
    }

    const hasAuthSession = typeof window !== 'undefined' && (
      localStorage.getItem("TRADEMODEAI_IS_AUTHENTICATED") === "true" ||
      Object.keys(localStorage).some(key => key.startsWith("sb-") && key.endsWith("-auth-token"))
    );

    if (hasAuthSession) {
      // Return a temporary blank skeleton for authenticated users, NOT the DEFAULT_REAL_USER_SCHEMA
      return {
        id: "",
        name: "Trader",
        email: "",
        subscriptionPlan: "Free",
        accountBalance: 100000,
        joinDate: "",
        creditsUsed: 0,
        creditsLimit: 0,
        nextResetDate: "",
        paymentFailed: false,
        plan_name: "Loading...",
        subscription_status: "inactive",
        free_analyses_remaining: 0,
        credits_remaining: 0,
        total_credits: 0,
        plan: undefined as any,
        credits: 0,
        price: 0,
        activation_date: "",
        expiry_date: "",
        payment_history: []
      };
    }

    return DEFAULT_REAL_USER_SCHEMA.profile;
  }

  getTrades(isDemo: boolean = false): TradeJournalEntry[] {
    const saved = localStorage.getItem(this.getStorageKey("TRADES", isDemo));
    if (saved) return JSON.parse(saved);

    if (isDemo) {
      return [
        {
          id: "trade-1",
          pair: "XAUUSD (Gold)",
          entryPrice: 2315.40,
          exitPrice: 2328.60,
          size: 5.0,
          type: "BUY",
          status: "WIN",
          profit: 6600,
          session: "New York Open",
          date: "2026-06-19",
          notes: "Perfect bounce off the H1 demand block on Gold. Cleared New York Asian high stops and reversed immediately.",
          emotions: ["Confident", "Patient"],
          mistakes: ["None"],
        },
        {
          id: "trade-2",
          pair: "EURUSD (Euro)",
          entryPrice: 1.08640,
          exitPrice: 1.08210,
          size: 10.0,
          type: "SELL",
          status: "WIN",
          profit: 4300,
          session: "London Open",
          date: "2026-06-18",
          notes: "Standard mitigation of 15m supply zone. Position filled at Premium FVG imbalance boundaries.",
          emotions: ["Patient"],
          mistakes: ["None"],
        },
        {
          id: "trade-3",
          pair: "BTCUSD (Bitcoin)",
          entryPrice: 67250.00,
          exitPrice: 66500.00,
          size: 1.5,
          type: "BUY",
          status: "LOSS",
          profit: -1125,
          session: "Asian Session",
          date: "2026-06-17",
          notes: "Tried to catch a falling knife at the breaker block. Retest failed and swept the low wick into support.",
          emotions: ["Ashes", "FOMO"],
          mistakes: ["Chase Trade", "Early Exit"],
        },
        {
          id: "trade-4",
          pair: "GBPUSD (Sterling)",
          entryPrice: 1.26820,
          exitPrice: 1.27210,
          size: 8.0,
          type: "BUY",
          status: "WIN",
          profit: 3120,
          session: "London Close",
          date: "2026-06-16",
          notes: "NY session continuation following high-impact retail sales report. Trend line resistance broken cleanly.",
          emotions: ["Confident"],
          mistakes: ["None"],
        }
      ];
    }
    return DEFAULT_REAL_USER_SCHEMA.trades;
  }

  getAnalyses(isDemo: boolean = false): AIAnalysisRecord[] {
    const saved = localStorage.getItem(this.getStorageKey("ANALYSES", isDemo));
    if (saved) return JSON.parse(saved);

    if (isDemo) {
      // Demo mode pre-built high fidelity analyses (represented as array of past analyses)
      return [
        {
          id: "analysis-demo-1",
          date: "2026-06-20",
          pair: "XAUUSD",
          accountSize: 100000,
          riskPercent: 1.0,
          session: "New York Open",
          result: {
            marketBias: "Bullish",
            multiTimeframe: {
              h1Trend: "Uptrend continuing inside NYC structural order block",
              m15Confirmation: "Sweep of London Session lows cleared",
              m5EntrySignal: "FVG mitigation with heavy volume displacement",
            },
            keyLevels: {
              supports: ["2315.40", "2308.20"],
              resistances: ["2335.00", "2345.50"],
              liquidityZones: ["2310.00 Sell Stops", "2340.00 Buy Stops"],
              fairValueGaps: ["2318.00 - 2320.50"],
              orderBlocks: ["2314.00 Institutional Stack"],
            },
            tradePlan: {
              suggestedEntry: 2315.40,
              stopLoss: 2308.20,
              takeProfit1: 2328.60,
              takeProfit2: 2335.00,
              takeProfit3: 2345.00,
            },
            riskAnalysis: {
              riskAmountDollars: 1000,
              recommendedLotSize: 5.0,
              riskRewardRatio: 3.1,
              probabilityScore: 88,
              confidencePercentage: 92,
            },
            scenarios: {
              bullish: "Price leverages order block support to target liquidity highs.",
              bearish: "Breaching 2308 level invalidates long bias, seeking deep demand pools.",
              neutral: "Pre-news consolidation between 2315 and 2325 ranges.",
            },
            coachCommentary: {
              feedback: "Outstanding gold alignment setup. High likelihood structural retest.",
              mistakesToAvoid: ["Revenge loading", "Premature take-profits"],
              psychologyTip: "Be patient. Let the London session clean the board first.",
            }
          }
        }
      ];
    }
    return DEFAULT_REAL_USER_SCHEMA.analyses;
  }

  getChats(isDemo: boolean = false): ChatMessage[] {
    const saved = localStorage.getItem(this.getStorageKey("CHATS", isDemo));
    if (saved) return JSON.parse(saved);
    return DEFAULT_REAL_USER_SCHEMA.chats;
  }

  private getUserId(isDemo: boolean): string | undefined {
    if (isDemo) return undefined;
    const saved = localStorage.getItem(this.getStorageKey("PROFILE", false));
    if (saved) {
      try {
        const prof = JSON.parse(saved);
        return prof.id;
      } catch (e) {}
    }
    return undefined;
  }

  // Mutators
  saveProfile(profile: UserProfile, isDemo: boolean = false, syncToDb: boolean = true) {
    localStorage.setItem(this.getStorageKey("PROFILE", isDemo), JSON.stringify(profile));
    if (isSupabaseConfigured && !isDemo && profile.id && syncToDb) {
      // Query to check if profile row already exists in Supabase (selecting * so we have current values for accurate comparison)
      supabase?.from("profiles").select("*").eq("id", profile.id).maybeSingle().then(({ data: existingProfile }) => {
        if (existingProfile) {
          // If a profile already exists, only UPDATE changed fields. Never INSERT or initialize defaults again.
          const dbProfile: any = {
            updated_at: new Date()
          };

          // Compare fields and guard against reverting active premium attributes with default values
          const dbPlan = existingProfile.plan || existingProfile.Plan || "FREE_TRIAL";
          const incomingPlan = profile.plan || "FREE_TRIAL";
          const isPlanDowngradeToDefault = (dbPlan === "PRO" || dbPlan === "ELITE") && incomingPlan === "FREE_TRIAL";

          if (profile.name !== undefined && profile.name !== existingProfile.name) {
            dbProfile.name = profile.name;
          }
          if (profile.email !== undefined && profile.email !== existingProfile.email) {
            dbProfile.email = profile.email;
          }

          // Plan protections
          if (!isPlanDowngradeToDefault) {
            if (profile.plan !== undefined && profile.plan !== dbPlan) {
              dbProfile.plan = profile.plan;
              dbProfile.Plan = profile.plan;
            }
            if (profile.subscriptionPlan !== undefined && profile.subscriptionPlan !== existingProfile.subscriptionPlan) {
              dbProfile.subscriptionPlan = profile.subscriptionPlan;
            }
            if (profile.plan_name !== undefined && profile.plan_name !== existingProfile.plan_name) {
              dbProfile.plan_name = profile.plan_name;
            }
            if (profile.current_plan !== undefined && profile.current_plan !== existingProfile.current_plan) {
              dbProfile.current_plan = profile.current_plan;
            }
            if (profile.price !== undefined && profile.price !== existingProfile.price) {
              dbProfile.price = profile.price;
            }
          }

          if (profile.accountBalance !== undefined && profile.accountBalance !== existingProfile.accountBalance) {
            dbProfile.accountBalance = profile.accountBalance;
          }
          if (profile.joinDate !== undefined && profile.joinDate !== existingProfile.joinDate) {
            dbProfile.joinDate = profile.joinDate;
          }

          // Credits protection
          const dbCredits = existingProfile.credits_remaining !== undefined 
            ? existingProfile.credits_remaining 
            : (existingProfile.Credits !== undefined ? existingProfile.Credits : 3);
          const incomingCredits = profile.credits_remaining;
          const isCreditsResetToDefault = dbCredits !== 3 && incomingCredits === 3 && isPlanDowngradeToDefault;

          if (!isCreditsResetToDefault) {
            if (profile.credits_remaining !== undefined && profile.credits_remaining !== dbCredits) {
              dbProfile.credits_remaining = profile.credits_remaining;
              dbProfile.free_analyses_remaining = profile.credits_remaining;
              dbProfile.credits = profile.credits_remaining;
              dbProfile.Credits = profile.credits_remaining;
            }
            if (profile.total_credits !== undefined && profile.total_credits !== existingProfile.total_credits) {
              dbProfile.total_credits = profile.total_credits;
              dbProfile.creditsLimit = profile.total_credits;
            }
            if (profile.creditsUsed !== undefined && profile.creditsUsed !== existingProfile.creditsUsed) {
              dbProfile.creditsUsed = profile.creditsUsed;
              dbProfile.credits_used = profile.creditsUsed;
            }
          }

          if (profile.nextResetDate !== undefined && profile.nextResetDate !== existingProfile.nextResetDate) {
            dbProfile.nextResetDate = profile.nextResetDate;
          }
          if (profile.paymentFailed !== undefined && profile.paymentFailed !== existingProfile.paymentFailed) {
            dbProfile.paymentFailed = profile.paymentFailed;
          }
          if (profile.role !== undefined && profile.role !== existingProfile.role) {
            dbProfile.role = profile.role;
          }
          if (profile.subscription_status !== undefined && profile.subscription_status !== existingProfile.subscription_status) {
            dbProfile.subscription_status = profile.subscription_status;
          }
          if (profile.activation_date !== undefined && profile.activation_date !== existingProfile.activation_date) {
            dbProfile.activation_date = profile.activation_date;
          }
          if (profile.expiry_date !== undefined && profile.expiry_date !== existingProfile.expiry_date) {
            dbProfile.expiry_date = profile.expiry_date;
          }

          // History protections
          if (profile.payment_history !== undefined && Array.isArray(profile.payment_history) && profile.payment_history.length > 0) {
            dbProfile.payment_history = JSON.stringify(profile.payment_history);
          }

          if (profile.subscription_start_date !== undefined && profile.subscription_start_date !== existingProfile.subscription_start_date) {
            dbProfile.subscription_start_date = profile.subscription_start_date;
          }
          if (profile.subscription_end_date !== undefined && profile.subscription_end_date !== existingProfile.subscription_end_date) {
            dbProfile.subscription_end_date = profile.subscription_end_date;
          }
          if (profile.total_successful_analyses !== undefined && profile.total_successful_analyses !== existingProfile.total_successful_analyses) {
            dbProfile.total_successful_analyses = profile.total_successful_analyses;
          }

          if (profile.analysis_history !== undefined && Array.isArray(profile.analysis_history) && profile.analysis_history.length > 0) {
            dbProfile.analysis_history = JSON.stringify(profile.analysis_history);
          }

          const payloadKeys = Object.keys(dbProfile).filter(k => k !== "updated_at");
          if (payloadKeys.length > 0) {
            supabase?.from("profiles").update(dbProfile).eq("id", profile.id).then();
          }
        } else {
          // Brand-new profile creation: write all fields explicitly
          const dbProfile: any = {
            id: profile.id,
            updated_at: new Date()
          };
          dbProfile.Plan = profile.plan || "FREE_TRIAL";
          dbProfile.plan_name = profile.plan_name || "FREE TRIAL";
          dbProfile.subscriptionPlan = profile.subscriptionPlan || "Free";
          dbProfile.credits_remaining = profile.credits_remaining !== undefined ? profile.credits_remaining : 3;
          dbProfile.total_credits = profile.total_credits !== undefined ? profile.total_credits : 3;
          dbProfile.free_analyses_remaining = profile.free_analyses_remaining !== undefined ? profile.free_analyses_remaining : 3;
          dbProfile.subscription_status = profile.subscription_status || "active";
          dbProfile.current_plan = profile.current_plan || "FREE_TRIAL";
          dbProfile.credits_used = profile.creditsUsed !== undefined ? profile.creditsUsed : 0;
          dbProfile.total_successful_analyses = profile.total_successful_analyses !== undefined ? profile.total_successful_analyses : 0;
          dbProfile.name = profile.name || "New Trader";
          dbProfile.email = profile.email || "";
          dbProfile.accountBalance = profile.accountBalance !== undefined ? profile.accountBalance : 0;
          dbProfile.joinDate = profile.joinDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
          dbProfile.creditsLimit = profile.creditsLimit !== undefined ? profile.creditsLimit : 3;
          dbProfile.nextResetDate = profile.nextResetDate || "Never";
          dbProfile.paymentFailed = !!profile.paymentFailed;
          dbProfile.role = profile.role || "user";
          dbProfile.plan = profile.plan || "FREE_TRIAL";
          dbProfile.credits = profile.credits !== undefined ? profile.credits : 3;
          dbProfile.price = profile.price !== undefined ? profile.price : 0;
          dbProfile.activation_date = profile.activation_date || dbProfile.joinDate;
          dbProfile.expiry_date = profile.expiry_date || "Never";
          dbProfile.payment_history = profile.payment_history ? JSON.stringify(profile.payment_history) : JSON.stringify([]);
          dbProfile.subscription_start_date = profile.subscription_start_date || dbProfile.joinDate;
          dbProfile.subscription_end_date = profile.subscription_end_date || "Never";
          dbProfile.analysis_history = profile.analysis_history ? JSON.stringify(profile.analysis_history) : JSON.stringify([]);
          
          supabase?.from("profiles").insert(dbProfile).then();
        }
      });
    }
    this.notify();
  }

  saveTrades(trades: TradeJournalEntry[], isDemo: boolean = false, syncToDb: boolean = true) {
    localStorage.setItem(this.getStorageKey("TRADES", isDemo), JSON.stringify(trades));
    this.notify();
  }

  saveAnalyses(analyses: AIAnalysisRecord[], isDemo: boolean = false, syncToDb: boolean = true) {
    localStorage.setItem(this.getStorageKey("ANALYSES", isDemo), JSON.stringify(analyses));
    this.notify();
  }

  saveChats(chats: ChatMessage[], isDemo: boolean = false) {
    localStorage.setItem(this.getStorageKey("CHATS", isDemo), JSON.stringify(chats));
    this.notify();
  }

  // Clear data (for resets)
  resetToFreshState(isDemo: boolean = false) {
    if (isDemo) {
      localStorage.removeItem(this.getStorageKey("PROFILE", true));
      localStorage.removeItem(this.getStorageKey("TRADES", true));
      localStorage.removeItem(this.getStorageKey("ANALYSES", true));
      localStorage.removeItem(this.getStorageKey("CHATS", true));
    } else {
      localStorage.setItem(this.getStorageKey("PROFILE", false), JSON.stringify(DEFAULT_REAL_USER_SCHEMA.profile));
      localStorage.setItem(this.getStorageKey("TRADES", false), JSON.stringify(DEFAULT_REAL_USER_SCHEMA.trades));
      localStorage.setItem(this.getStorageKey("ANALYSES", false), JSON.stringify(DEFAULT_REAL_USER_SCHEMA.analyses));
      localStorage.setItem(this.getStorageKey("CHATS", false), JSON.stringify(DEFAULT_REAL_USER_SCHEMA.chats));
    }
    this.notify();
  }

  // Real-time calculation helpers as dictated in request
  calculateDashboardMetrics(isDemo: boolean = false) {
    const listTrades = this.getTrades(isDemo);
    const listAnalyses = this.getAnalyses(isDemo);

    const activeAccountSize = 100000;
    
    // Total Trades taken
    const tradesTaken = listTrades.length;

    // Win rate
    const wins = listTrades.filter(t => t.status === "WIN");
    const winRate = tradesTaken > 0 ? parseFloat(((wins.length / tradesTaken) * 100).toFixed(1)) : 0;

    // Current net profits
    const netProfit = listTrades.reduce((acc, t) => acc + t.profit, 0);

    // Profit Factor: Gross Profit / Gross Loss (absolute)
    const grossProfit = listTrades.filter(t => t.profit > 0).reduce((acc, t) => acc + t.profit, 0);
    const grossLoss = Math.abs(listTrades.filter(t => t.profit < 0).reduce((acc, t) => acc + t.profit, 0));
    const profitFactor = grossLoss > 0 ? parseFloat((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? grossProfit : 0;

    // Risk Metrics
    const avgWin = wins.length > 0 ? (grossProfit / wins.length) : 0;
    const lossesCount = listTrades.filter(t => t.status === "LOSS").length;
    const avgLoss = lossesCount > 0 ? (grossLoss / lossesCount) : 0;
    const riskRewardRatio = avgLoss > 0 ? parseFloat((avgWin / avgLoss).toFixed(1)) : 0;

    // AI Usage
    const aiUsageCount = listAnalyses.length;

    return {
      accountSize: activeAccountSize,
      currentProfit: netProfit,
      winRate,
      tradesTaken,
      portfolioProgress: 0,
      profitTarget: 10000,
      riskMetrics: riskRewardRatio,
      profitFactor,
      aiUsageCount,
      activePortfolioName: ""
    };
  }
}

export const db = new RealTimeDatabase();
