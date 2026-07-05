import { createClient } from "@supabase/supabase-js";
import { UserProfile, PropChallenge, TradeJournalEntry, AIAnalysisRecord, ChatMessage } from "./types";

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
  challenges: PropChallenge[];
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
  challenges: [],
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
    return DEFAULT_REAL_USER_SCHEMA.profile;
  }

  getChallenges(isDemo: boolean = false): PropChallenge[] {
    const saved = localStorage.getItem(this.getStorageKey("CHALLENGES", isDemo));
    if (saved) return JSON.parse(saved);

    if (isDemo) {
      return [
        {
          id: "challenge-1",
          name: "FundingPips $100K Phase 1",
          firmType: "FundingPips",
          accountSize: 100000,
          dailyLossLimitPercent: 5,
          maxDrawdownPercent: 10,
          targetProfitPercent: 8,
          currentProfit: 4520,
          currentLossToday: 1250,
          daysTraded: 8,
          startDate: "2026-06-10",
          status: "ACTIVE",
        },
        {
          id: "challenge-2",
          name: "FTMO $50K Verification",
          firmType: "FTMO",
          accountSize: 50000,
          dailyLossLimitPercent: 5,
          maxDrawdownPercent: 10,
          targetProfitPercent: 5,
          currentProfit: 2550,
          currentLossToday: 0,
          daysTraded: 4,
          startDate: "2024-06-15",
          status: "PASSED",
        }
      ];
    }
    return DEFAULT_REAL_USER_SCHEMA.challenges;
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
      // Sync in background to Supabase
      const dbProfile = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        subscriptionPlan: profile.subscriptionPlan,
        accountBalance: profile.accountBalance,
        joinDate: profile.joinDate,
        creditsUsed: profile.creditsUsed,
        creditsLimit: profile.creditsLimit,
        nextResetDate: profile.nextResetDate,
        paymentFailed: profile.paymentFailed,
        role: profile.role || "user",
        plan_name: profile.plan_name,
        subscription_status: profile.subscription_status,
        free_analyses_remaining: profile.free_analyses_remaining,
        credits_remaining: profile.credits_remaining,
        total_credits: profile.total_credits,
        status: profile.status,
        plan: profile.plan || "FREE_TRIAL",
        credits: profile.credits !== undefined ? profile.credits : 3,
        price: profile.price !== undefined ? profile.price : 0,
        activation_date: profile.activation_date || profile.joinDate,
        expiry_date: profile.expiry_date || profile.nextResetDate,
        payment_history: profile.payment_history ? JSON.stringify(profile.payment_history) : null,
        updated_at: new Date()
      };
      supabase?.from("profiles").upsert(dbProfile).then();
    }
    this.notify();
  }

  saveChallenges(challenges: PropChallenge[], isDemo: boolean = false, syncToDb: boolean = true) {
    localStorage.setItem(this.getStorageKey("CHALLENGES", isDemo), JSON.stringify(challenges));
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
      localStorage.removeItem(this.getStorageKey("CHALLENGES", true));
      localStorage.removeItem(this.getStorageKey("TRADES", true));
      localStorage.removeItem(this.getStorageKey("ANALYSES", true));
      localStorage.removeItem(this.getStorageKey("CHATS", true));
    } else {
      localStorage.setItem(this.getStorageKey("PROFILE", false), JSON.stringify(DEFAULT_REAL_USER_SCHEMA.profile));
      localStorage.setItem(this.getStorageKey("CHALLENGES", false), JSON.stringify(DEFAULT_REAL_USER_SCHEMA.challenges));
      localStorage.setItem(this.getStorageKey("TRADES", false), JSON.stringify(DEFAULT_REAL_USER_SCHEMA.trades));
      localStorage.setItem(this.getStorageKey("ANALYSES", false), JSON.stringify(DEFAULT_REAL_USER_SCHEMA.analyses));
      localStorage.setItem(this.getStorageKey("CHATS", false), JSON.stringify(DEFAULT_REAL_USER_SCHEMA.chats));
    }
    this.notify();
  }

  // Real-time calculation helpers as dictated in request
  calculateDashboardMetrics(isDemo: boolean = false, activeChallengeId?: string) {
    const listChallenges = this.getChallenges(isDemo);
    const listTrades = this.getTrades(isDemo);
    const listAnalyses = this.getAnalyses(isDemo);

    const activeChallenge = listChallenges.find(c => c.id === activeChallengeId) || listChallenges[0] || null;

    // Account properties
    const activeAccountSize = activeChallenge ? activeChallenge.accountSize : 0;
    
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

    // Challenge Progress
    const targetProfitPercent = activeChallenge ? activeChallenge.targetProfitPercent : 0;
    const targetProfitDollars = (activeAccountSize * targetProfitPercent) / 100;
    const challengeProgress = targetProfitDollars > 0 ? Math.min(100, Math.max(0, (netProfit / targetProfitDollars) * 100)) : 0;

    // Risk Metrics
    const avgWin = wins.length > 0 ? (grossProfit / wins.length) : 0;
    const lossesCount = listTrades.filter(t => t.status === "LOSS").length;
    const avgLoss = lossesCount > 0 ? (grossLoss / lossesCount) : 0;
    const riskRewardRatio = avgLoss > 0 ? parseFloat((avgWin / avgLoss).toFixed(1)) : 0;

    // AI Usage
    const aiUsageCount = listAnalyses.length;

    return {
      accountSize: activeAccountSize,
      currentProfit: activeChallenge ? activeChallenge.currentProfit : 0,
      winRate,
      tradesTaken,
      challengeProgress,
      profitTarget: targetProfitDollars,
      riskMetrics: riskRewardRatio,
      profitFactor,
      aiUsageCount,
      activeChallengeName: activeChallenge ? activeChallenge.name : ""
    };
  }
}

export const db = new RealTimeDatabase();
