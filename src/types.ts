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
  detectedSymbol?: string;
  detectedPrice?: string;
  detectedTrend?: string;
  detectedBias?: string;
  detectedSupport?: string;
  detectedResistance?: string;
  confidenceScore?: string;
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

export interface UserProfile {
  id?: string;
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
  role?: string;
  free_analyses_remaining?: number;
  subscription_status?: string;
  credits_remaining?: number;
  plan_name?: string;
  total_credits?: number;
  status?: string;
  activation_date?: string;
  expiration_date?: string;
  days_remaining?: string;
  plan?: 'FREE_TRIAL' | 'PRO' | 'ELITE';
  credits?: number;
  price?: number;
  expiry_date?: string;
  payment_history?: Array<{
    id: string;
    date: string;
    plan: string;
    amount: number;
    status: string;
    transaction_id?: string;
  }>;
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
  dateTime?: string;
  creditsUsed?: number;
  status?: string;
}
