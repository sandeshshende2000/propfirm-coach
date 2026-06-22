export interface MultiTimeframeTrend {
  h1Trend: string;
  m15Confirmation: string;
  m5EntrySignal: string;
}

export interface KeyLevels {
  supports: string[];
  resistances: string[];
  liquidityZones: string[];
  fairValueGaps: string[];
  orderBlocks: string[];
}

export interface TradePlan {
  suggestedEntry: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
}

export interface RiskAnalysis {
  riskAmountDollars: number;
  recommendedLotSize: number;
  riskRewardRatio: number;
  probabilityScore: number;
  confidencePercentage: number;
}

export interface Scenarios {
  bullish: string;
  bearish: string;
  neutral: string;
}

export interface CoachCommentary {
  feedback: string;
  mistakesToAvoid: string[];
  psychologyTip: string;
}

export interface AIAnalysisResult {
  marketBias: string;
  multiTimeframe: MultiTimeframeTrend;
  keyLevels: KeyLevels;
  tradePlan: TradePlan;
  riskAnalysis: RiskAnalysis;
  scenarios: Scenarios;
  coachCommentary: CoachCommentary;
}

export interface TradeJournalEntry {
  id: string;
  pair: string;
  entryPrice: number;
  exitPrice: number;
  size: number; // lots
  type: 'BUY' | 'SELL';
  status: 'WIN' | 'LOSS' | 'PENDING';
  profit: number;
  session: string; // NYC, London, Asian
  date: string;
  notes: string;
  emotions: string[]; // FOMO, Patient, Confident, Anxious, Greedy
  mistakes: string[]; // Overleveraged, Early Exit, Chase Trade, None
  chartUrl?: string; // screenshot mockup or uploaded image
}

export interface PropChallenge {
  id: string;
  name: string; // e.g., "FundingPips Evaluation"
  firmType: 'FundingPips' | 'FTMO' | 'The5ers' | 'FundedNext' | 'Custom';
  accountSize: number;
  dailyLossLimitPercent: number; // e.g. 5%
  maxDrawdownPercent: number; // e.g. 10%
  targetProfitPercent: number; // e.g. 8%
  currentProfit: number;
  currentLossToday: number;
  daysTraded: number;
  startDate: string;
  status: 'ACTIVE' | 'PASSED' | 'FAILED';
}

export interface UserProfile {
  name: string;
  email: string;
  subscriptionPlan: 'Free' | 'Pro' | 'Elite';
  accountBalance: number;
  avatarUrl?: string;
  joinDate: string;
  creditsUsed: number;
  creditsLimit: number;
  nextResetDate: string;
  paymentFailed: boolean;
  free_analyses_remaining?: number;
  subscription_status?: string;
  credits_remaining?: number;
  plan_name?: string;
  total_credits?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIAnalysisRecord {
  id: string;
  date: string;
  pair: string;
  accountSize: number;
  riskPercent: number;
  session: string;
  result: AIAnalysisResult;
}
