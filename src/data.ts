import { TradeJournalEntry, UserProfile, AIAnalysisResult } from "./types";

export const SAMPLE_USER_PROFILE: UserProfile = {
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

export const SAMPLE_TRADE_JOURNAL: TradeJournalEntry[] = [
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
  },
  {
    id: "trade-5",
    pair: "XAUUSD (Gold)",
    entryPrice: 2345.50,
    exitPrice: 2339.20,
    size: 4.0,
    type: "BUY",
    status: "LOSS",
    profit: -2520,
    session: "New York Close",
    date: "2026-06-15",
    notes: "Aggressive entry before FOMC news release. High slippage triggered stop loss before ultimate upward expansion occurred.",
    emotions: ["Anxious", "Greedy"],
    mistakes: ["Overleveraged"],
  }
];

export const PERFORMANCE_CHARTS = {
  equityCurve: [
    { day: "Day 0", equity: 100000, profit: 0 },
    { day: "Day 1", equity: 100450, profit: 450 },
    { day: "Day 2", equity: 101200, profit: 1200 },
    { day: "Day 3", equity: 100340, profit: 340 },
    { day: "Day 4", equity: 101900, profit: 1900 },
    { day: "Day 5", equity: 102450, profit: 2450 },
    { day: "Day 6", equity: 103100, profit: 3100 },
    { day: "Day 7", equity: 103980, profit: 3980 },
    { day: "Day 8", equity: 104520, profit: 4520 },
  ],
  winRateTrend: [
    { name: "Week 1", winRate: 58 },
    { name: "Week 2", winRate: 64 },
    { name: "Week 3", winRate: 61 },
    { name: "Week 4", winRate: 68 },
    { name: "Week 5", winRate: 72 },
  ],
  profitFactorDays: [
    { name: "Mon", factor: 1.8 },
    { name: "Tue", factor: 2.4 },
    { name: "Wed", factor: 3.1 },
    { name: "Thu", factor: 1.2 },
    { name: "Fri", factor: 4.5 },
  ],
  drawdownLogs: [
    { day: "Day 1", drawdown: 0.1 },
    { day: "Day 2", drawdown: 0.8 },
    { day: "Day 3", drawdown: 1.9 },
    { day: "Day 4", drawdown: 0.4 },
    { day: "Day 5", drawdown: 0.2 },
    { day: "Day 6", drawdown: 0.9 },
    { day: "Day 7", drawdown: 1.5 },
    { day: "Day 8", drawdown: 1.25 },
  ],
  bestSessions: [
    { session: "London Open", profit: 8900 },
    { session: "NY Open", profit: 15400 },
    { session: "London Close", profit: 4500 },
    { session: "Asian session", profit: -1200 },
  ],
  profitableAssets: [
    { name: "XAUUSD", value: 65 },
    { name: "EURUSD", value: 20 },
    { name: "GBPUSD", value: 10 },
    { name: "BTCUSD", value: 5 },
  ],
};

export const SAAS_PLANS = [
  {
    id: "plan-pro",
    name: "Pro Trader",
    price: 29,
    popular: true,
    creditsLimit: 200,
    features: [
      "200 AI Analyses Per Month",
      "Multi-Timeframe Analysis",
      "H1 + M15 + M5 Analysis",
      "Trade Journal",
      "Risk Calculator",
      "Analysis History",
      "Email Support"
    ],
    premium: true,
    cta: "Start Pro Trial"
  },
  {
    id: "plan-elite",
    name: "Elite Trader",
    price: 49,
    popular: false,
    creditsLimit: 500,
    features: [
      "500 AI Analyses Per Month",
      "Everything in Pro Plan",
      "Advanced Analytics",
      "Priority Processing",
      "Priority Support",
      "Extended Analysis History"
    ],
    premium: false,
    cta: "Go Elite Value"
  }
];

export const DEMO_ANALYSIS_CHANNELS: AIAnalysisResult = {
  marketBias: "Bullish",
  multiTimeframe: {
    h1Trend: "Clean higher highs building above Daily Mean Threshold. Bulky institutional volumes observed on H1.",
    m15Confirmation: "Flipped order block structures, establishing clear demand liquidity at 2305.",
    m5EntrySignal: "Standard double bottom reclaim of session low with clear displacement on breakout.",
  },
  keyLevels: {
    supports: ["$2305.50 (NY Breaker Block)", "$2298.00 (HTF Demand Stack)"],
    resistances: ["$2324.80 (HTF Swing High)", "$2335.00 (HTF Imbalance Target)"],
    liquidityZones: ["$2295.00 (Retail Stop Hunt Zone)", "$2332.00 (Equal High Targets)"],
    fairValueGaps: ["$2311.20 - $2313.50 (M15 Structural imbalance)"],
    orderBlocks: ["$2306.00 (Institutional Bullish Hammer)"],
  },
  tradePlan: {
    suggestedEntry: 2311.50,
    stopLoss: 2304.00,
    takeProfit1: 2319.20,
    takeProfit2: 2326.50,
    takeProfit3: 2334.80,
  },
  riskAnalysis: {
    riskAmountDollars: 1000,
    recommendedLotSize: 13.33,
    riskRewardRatio: 3.11,
    probabilityScore: 84,
    confidencePercentage: 88,
  },
  scenarios: {
    bullish: "Wait for NY open volatility to push the price into the $2311.20 Fair Value Gap. Watch for sudden bullish buy displacement as orders execute at standard liquidity boundaries.",
    bearish: "If price breaches $2304 support without buyer absorption, abort longs and wait for the $2298 order block to verify structural alignment.",
    neutral: "Price consolidates tightly between $2310 and $2318 during pre-session hours leading up to core economic announcements.",
  },
  coachCommentary: {
    feedback: "This setup exhibits high-probability flow. Excellent patience waiting for the stop sweep of regional Asian highs before plotting structural demand entries. High compliance with the risk checklist.",
    mistakesToAvoid: [
      "Overreacting to initial pullback spikes in pre-NY volume.",
      "Averaging down on losing scales if the suggested stop-loss is taken.",
    ],
    psychologyTip: "Your trade probability is built on execution consistency. Do not let one single stop-loss execution define your trader credentials.",
  },
};
