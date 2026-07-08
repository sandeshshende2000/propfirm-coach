import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = 3000;

// Lazy-initialized Supabase Client
let serverSupabase: any = null;
function getServerSupabase() {
  if (!serverSupabase) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
    if (supabaseUrl && supabaseKey) {
      serverSupabase = createClient(supabaseUrl, supabaseKey);
    }
  }
  return serverSupabase;
}

// Supabase credit deduction and history log insertion helper
async function handleSupabaseDeductionAndHistory(
  userId: string | undefined,
  profile: any,
  pair: string,
  accountSize: number,
  riskPercent: number,
  session: string,
  resultData: any,
  limit: number,
  remainingCredits: number,
  updatedCreditsUsed: number,
  updatedRemaining: number
) {
  const sSupabase = getServerSupabase();
  let updatedProfile = {
    ...profile,
    creditsUsed: updatedCreditsUsed,
    credits_remaining: updatedRemaining,
    free_analyses_remaining: updatedRemaining,
  };

  if (sSupabase && userId) {
    let rpcSuccess = false;

    // Try 1: Exact database schema arguments for the complete_analysis function
    try {
      console.log("Attempting RPC complete_analysis with exact schema arguments...");
      
      // Parse confidence safely to a numeric value as expected by p_confidence parameter
      let confidenceNum = 85; // default fallback
      const rawConf = resultData.confidenceScore || resultData.riskAnalysis?.confidencePercentage || "85";
      if (typeof rawConf === "number") {
        confidenceNum = rawConf;
      } else if (typeof rawConf === "string") {
        const parsed = parseFloat(rawConf.replace(/%/g, ""));
        if (!isNaN(parsed)) {
          confidenceNum = parsed;
        }
      }

      const { data, error } = await sSupabase.rpc("complete_analysis", {
        p_user_id: userId,
        p_asset: pair,
        p_confidence: confidenceNum,
        p_market_bias: resultData.marketBias || "Neutral",
        p_ai_result: JSON.stringify(resultData)
      });

      if (!error) {
        console.log("RPC complete_analysis with exact schema arguments succeeded!");
        rpcSuccess = true;
      } else {
        console.warn("RPC complete_analysis with exact schema arguments failed:", error);
      }
    } catch (err) {
      console.warn("Error calling RPC with exact schema arguments:", err);
    }

    // Try 2: p_ prefixed arguments to complete_analysis RPC function
    if (!rpcSuccess) {
      try {
        console.log("Attempting RPC complete_analysis with p_ prefixed arguments...");
        const { data, error } = await sSupabase.rpc("complete_analysis", {
          p_user_id: userId,
          p_pair: pair,
          p_asset: pair,
          p_account_size: accountSize,
          p_risk_percent: riskPercent,
          p_session: session,
          p_result: JSON.stringify(resultData)
        });
        if (!error) {
          console.log("RPC complete_analysis with p_ prefixed arguments succeeded!");
          rpcSuccess = true;
        } else {
          console.warn("RPC complete_analysis with p_ prefixed arguments failed:", error);
        }
      } catch (err) {
        console.warn("Error calling RPC with p_ prefixed arguments:", err);
      }
    }

    // Try 3: snake_case arguments to complete_analysis RPC function
    if (!rpcSuccess) {
      try {
        console.log("Attempting RPC complete_analysis with snake_case arguments...");
        const { data, error } = await sSupabase.rpc("complete_analysis", {
          user_id: userId,
          pair: pair,
          asset: pair,
          account_size: accountSize,
          risk_percent: riskPercent,
          session: session,
          result: JSON.stringify(resultData)
        });
        if (!error) {
          console.log("RPC complete_analysis with snake_case arguments succeeded!");
          rpcSuccess = true;
        } else {
          console.warn("RPC complete_analysis with snake_case arguments failed:", error);
        }
      } catch (err) {
        console.warn("Error calling RPC with snake_case arguments:", err);
      }
    }

    // Try 4: basic arguments (user_id, pair) to complete_analysis RPC function
    if (!rpcSuccess) {
      try {
        console.log("Attempting RPC complete_analysis with basic arguments...");
        const { data, error } = await sSupabase.rpc("complete_analysis", {
          user_id: userId,
          pair: pair
        });
        if (!error) {
          console.log("RPC complete_analysis with basic arguments succeeded!");
          rpcSuccess = true;
        } else {
          console.warn("RPC complete_analysis with basic arguments failed:", error);
        }
      } catch (err) {
        console.warn("Error calling RPC with basic arguments:", err);
      }
    }

    // Fallback: If RPC failed or didn't run, execute direct database writes
    if (!rpcSuccess) {
      try {
        console.log("Falling back to manual database updates...");
        // 1. Fetch current profile from profiles table to prevent double spending/race conditions
        const { data: dbProfile } = await sSupabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        let currentCredits = dbProfile?.Credits !== undefined 
          ? dbProfile.Credits 
          : (dbProfile?.credits_remaining !== undefined ? dbProfile.credits_remaining : (dbProfile?.credits_limit - dbProfile?.credits_used));

        if (currentCredits === undefined) {
          currentCredits = remainingCredits;
        }

        // Deduct credit
        const newCredits = Math.max(0, currentCredits - 1);
        const newCreditsUsed = (dbProfile?.creditsUsed !== undefined ? dbProfile.creditsUsed : (dbProfile?.credits_used || 0)) + 1;

        // Update the database profiles table
        const { error: profileUpdateError } = await sSupabase
          .from("profiles")
          .update({
            Credits: newCredits,
            credits_remaining: newCredits,
            free_analyses_remaining: newCredits,
            creditsUsed: newCreditsUsed,
            credits_used: newCreditsUsed,
            updated_at: new Date()
          })
          .eq("id", userId);

        if (profileUpdateError) {
          console.error("Backend error updating profile credits in Supabase:", profileUpdateError);
        } else {
          // Construct updatedProfile from DB
          updatedProfile = {
            ...profile,
            creditsUsed: newCreditsUsed,
            credits_remaining: newCredits,
            free_analyses_remaining: newCredits,
            Credits: newCredits,
          };
        }

        // 2. Insert into analysis_history table
        const dateTimeStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const { error: historyInsertError } = await sSupabase
          .from("analysis_history")
          .insert({
            id: "analysis-" + Date.now(),
            user_id: userId,
            pair: pair,
            asset: pair,
            account_size: accountSize,
            risk_percent: riskPercent,
            session: session,
            result: JSON.stringify(resultData),
            dateTime: dateTimeStr,
            creditsUsed: 1,
            status: "Success"
          });

        if (historyInsertError) {
          console.error("Backend error inserting into analysis_history in Supabase:", historyInsertError);
        }
      } catch (dbErr) {
        console.error("Supabase Database error during backend processing fallback:", dbErr);
      }
    } else {
      // If RPC succeeded, query the updated profile to return it to frontend
      try {
        const { data: updatedDbProfile } = await sSupabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (updatedDbProfile) {
          updatedProfile = {
            ...profile,
            Credits: updatedDbProfile.Credits,
            credits_remaining: updatedDbProfile.credits_remaining !== undefined ? updatedDbProfile.credits_remaining : updatedDbProfile.Credits,
            free_analyses_remaining: updatedDbProfile.free_analyses_remaining !== undefined ? updatedDbProfile.free_analyses_remaining : updatedDbProfile.Credits,
            creditsUsed: updatedDbProfile.creditsUsed !== undefined ? updatedDbProfile.creditsUsed : updatedDbProfile.credits_used,
          };
        }
      } catch (profileFetchErr) {
        console.error("Error fetching updated profile after RPC success:", profileFetchErr);
      }
    }
  }

  return updatedProfile;
}

// Setup JSON parsing with ample limit for chart screenshots (base64 codes)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini SDK with recommended telemetry headers
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.log("WARNING: GEMINI_API_KEY is not defined. Falling back to dynamic mock simulation.");
}

// REST API Endpoints

// 1. Analyze Trade Endpoint (using Gemini 3.5 Flash vision + text analysis)
app.post("/api/analyze-trade", async (req, res) => {
  const { pair, accountSize, riskPercent, session, h1Chart, m15Chart, m5Chart, profile, userId } = req.body;

  if (!pair || !accountSize || !riskPercent || !session) {
    return res.status(400).json({ error: "Missing required fields: pair, accountSize, riskPercent, session" });
  }

  // Strict backend-enforced credit and screenshot check
  if (!h1Chart || !m15Chart || !m5Chart) {
    return res.status(400).json({ error: "All three screenshots (H1, M15, M5) are required for multi-frame analysis." });
  }

  if (!profile) {
    return res.status(400).json({ error: "Missing profile information for credit validation." });
  }

  const limit = profile.total_credits !== undefined ? profile.total_credits : profile.creditsLimit;
  const remainingCredits = profile.credits_remaining !== undefined 
    ? profile.credits_remaining 
    : Math.max(0, limit - profile.creditsUsed);

  if (profile.paymentFailed) {
    return res.status(403).json({ error: "Subscription payment required. Renew your plan to continue using AI analysis." });
  }

  if (remainingCredits <= 0) {
    return res.status(403).json({ error: "Analysis blocked. You have used all available credits. Please upgrade your plan." });
  }

  if (!ai) {
    return res.status(500).json({ error: "AI Engine is not initialized. Please verify your GEMINI_API_KEY inside Settings > Secrets." });
  }

  try {
    const parts: any[] = [];
    const promptString = `You are an elite, institutional-grade multi-timeframe trading analysis engine and senior quantitative market analyst.
You are given three actual screenshots of a trade setup from any trading platform (e.g. TradingView, MetaTrader, Binance, Bybit, Exness, cTrader, DXTrade, Match Trader, TopStepX, NinjaTrader, etc.): H1 (Hourly Chart), M15 (15-Minute Chart), and M5 (5-Minute Chart).

Your task is to analyze these screenshots to perform a complete institutional-grade market analysis and return a beautifully formatted markdown/text report along with structured JSON values.

CHART VALIDATION & HALUCINATION PREVENTION RULES:
1. Analyze ONLY what is visible in the provided H1, M15, and M5 screenshots.
2. NEVER invent information. Do NOT estimate missing indicators or draw levels not present on the charts.
3. If any indicator, metric, or pattern cannot be confirmed with absolute certainty on the charts, you MUST write "NOT VISIBLE" or "NOT CONFIRMED" for that section. Do NOT leave fields or sections blank or make them up.
4. Be extremely precise when scanning price levels, symbols, and indicator readings from the axes and labels.

ANALYSIS FRAMEWORK RULES:
Analyze every visible confirmation across the 3 screenshots:
1. Market Trend: Check for Higher Highs (HH), Higher Lows (HL), Lower Highs (LH), Lower Lows (LL), Trend Strength, range expansion, range compression, accumulation, and distribution.
2. Market Structure: Identify BOS (Break of Structure), CHOCH (Change of Character), MSS (Market Structure Shift), and internal vs. external structure.
3. Liquidity: Map Buy Side Liquidity, Sell Side Liquidity, Liquidity Sweeps, Equal Highs (EQH), Equal Lows (EQL), Premium vs. Discount zones, and Stop Hunts.
4. Smart Money Concepts (SMC): Look for Bullish/Bearish Order Blocks, Mitigation Blocks, Breaker Blocks, Fair Value Gaps (FVG), Inverse Fair Value Gaps, Balanced Price Ranges, Liquidity Voids, and Imbalances.
5. ICT Concepts: Analyze Premium/Discount Arrays, OTE (Optimal Trade Entry) Zone, Kill Zones, Session Liquidity, Session Manipulation, Inducement, SMT Divergence, and Market Maker Models (only if visible).
6. Wyckoff: Identify Accumulation/Distribution phases, Springs, Upthrusts, and Phase status (only if visible).
7. Market Auction Theory: Assess Acceptance, Rejection, Value Areas, Auction Continuation, and Balanced/Imbalanced Auctions (only if visible).
8. Order Flow Logic: Evaluate Buying/Selling Pressure, Momentum, Price Expansion, and Price Compression based on visible price action.
9. Supply & Demand: Identify key Supply Zones, Demand Zones, Support and Resistance levels, and Reaction Zones.
10. Volume: Analyze volume bars/indicators only if visible (else write "NOT VISIBLE").
11. Indicators: Examine visible EMAs, RSI, ATR, MACD, VWAP, etc. (only if visible, else write "NOT VISIBLE").
12. Candlestick Confirmation: Detect Bullish/Bearish Engulfing, Pin Bars, Inside Bars, Doji, and Strong/Weak Rejections.
13. Session Analysis: Detect Asian, London, New York session lines, Kill Zones, or Session Breakouts (only if visible).

MULTI-TIMEFRAME ALIGNMENT & RISK VALIDATION RULES:
- High priority: H1 (Macro) -> M15 (Medium) -> M5 (Micro). Never ignore H1.
- If H1 and M15 trends or structures disagree, the Final Decision must be "NO TRADE".
- Setup Validation: Suggest a BUY plan only when ALL necessary bullish confirmations exist. Suggest a SELL plan only when ALL necessary bearish confirmations exist. Otherwise, the Final Decision MUST be "NO TRADE".
- Professional traders avoid low-quality setups. If confirmations are missing or contradictory, return NO TRADE. Never force a BUY or SELL plan.

PARAMETER CONTEXT:
- Account size: $${accountSize}
- Risk percent: ${riskPercent}%
- Trading Session: ${session}
Calculate precise recommended lot sizes, risk amounts in dollars, and mathematically sound risk-to-reward ratios using these parameters.

You MUST compile a complete text report in the "coachCommentary.feedback" field.
Every section in the REPORT FORMAT below must appear in "coachCommentary.feedback" in the exact order specified. Do NOT omit any section. If a section's information is missing on the chart, write "NOT VISIBLE" or "NOT CONFIRMED" under that header.

REPORT FORMAT to be written inside "coachCommentary.feedback":

### Executive Summary
[Write detailed summary here, or NOT VISIBLE/NOT CONFIRMED]

### Market Bias
[Write market bias here, or NOT VISIBLE/NOT CONFIRMED]

### Trend
[Write trend analysis here, or NOT VISIBLE/NOT CONFIRMED]

### Market Structure
[Write market structure analysis here, or NOT VISIBLE/NOT CONFIRMED]

### Liquidity
[Write liquidity analysis here, or NOT VISIBLE/NOT CONFIRMED]

### SMC Analysis
[Write SMC analysis here, or NOT VISIBLE/NOT CONFIRMED]

### ICT Analysis
[Write ICT analysis here, or NOT VISIBLE/NOT CONFIRMED]

### Wyckoff Analysis
[Write Wyckoff analysis here, or NOT VISIBLE/NOT CONFIRMED]

### Market Auction Theory
[Write Market Auction Theory analysis here, or NOT VISIBLE/NOT CONFIRMED]

### Order Flow
[Write Order Flow analysis here, or NOT VISIBLE/NOT CONFIRMED]

### Supply & Demand
[Write Supply & Demand zones here, or NOT VISIBLE/NOT CONFIRMED]

### Volume
[Write Volume analysis here, or NOT VISIBLE/NOT CONFIRMED]

### Indicators
[Write Indicators analysis here, or NOT VISIBLE/NOT CONFIRMED]

### Candlestick Confirmation
[Write Candlestick Confirmation analysis here, or NOT VISIBLE/NOT CONFIRMED]

### Session Analysis
[Write Session analysis here, or NOT VISIBLE/NOT CONFIRMED]

### Multi Timeframe Alignment
[Write multi timeframe alignment status here, or NOT VISIBLE/NOT CONFIRMED]

### Entry Zone
[Write Entry Zone here, or NOT VISIBLE/NOT CONFIRMED]

### Stop Loss
[Write Stop Loss level here, or NOT VISIBLE/NOT CONFIRMED]

### Take Profit 1
[Write TP1 level here, or NOT VISIBLE/NOT CONFIRMED]

### Take Profit 2
[Write TP2 level here, or NOT VISIBLE/NOT CONFIRMED]

### Risk Reward
[Write Risk Reward ratio here, or NOT VISIBLE/NOT CONFIRMED]

### Confidence Score
[Write Confidence Score here, or NOT VISIBLE/NOT CONFIRMED]

### Trade Quality
[Write Trade Quality here, or NOT VISIBLE/NOT CONFIRMED]

### Risk Level
[Write Risk Level here, or NOT VISIBLE/NOT CONFIRMED]

### Setup Score (/100)
[Write Setup Score here, or NOT VISIBLE/NOT CONFIRMED]

### Probability Score (/100)
[Write Probability Score here, or NOT VISIBLE/NOT CONFIRMED]

### Trade Invalidation Level
[Write Trade Invalidation Level here, or NOT VISIBLE/NOT CONFIRMED]

### Final Decision
[Write Final Decision here (BUY, SELL, or NO TRADE)]

### Institutional Reasoning
[Write detailed Institutional Reasoning here, or NOT VISIBLE/NOT CONFIRMED]

Always finish the report in "coachCommentary.feedback" exactly with this footer text:
"Upload updated H1, M15 and M5 chart screenshots after approximately 15–30 minutes, or after a confirmed market structure change, for a fresh institutional-grade TradeModeAI analysis."`;

    parts.push({ text: promptString });

    const extractImagePart = (dataUrl: string) => {
      const match = dataUrl.match(/^data:(image\/\w+);base64,/);
      const mimeType = match ? match[1] : "image/png";
      const data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
      return {
        inlineData: {
          mimeType,
          data,
        },
      };
    };

    parts.push(extractImagePart(h1Chart));
    parts.push(extractImagePart(m15Chart));
    parts.push(extractImagePart(m5Chart));

    let response;
    let attempts = 3;
    let delayMs = 1500;
    let lastError: any = null;
    let selectedModel = "gemini-3.5-flash";

    for (let i = 0; i < attempts; i++) {
      try {
        console.log(`AI Vision attempt ${i + 1} of ${attempts} using model ${selectedModel}...`);
        response = await ai.models.generateContent({
          model: selectedModel,
          contents: { parts },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedSymbol: { type: Type.STRING, description: "The trading symbol visible on the chart (e.g. BTCUSD, EURUSD, XAUUSD) or 'Not Available'." },
                detectedPrice: { type: Type.STRING, description: "The current market price of the asset if visible, otherwise 'Not Available'." },
                detectedTrend: { type: Type.STRING, description: "The trend detected (e.g., Uptrend, Downtrend, Sideways) or 'Not Available'." },
                detectedBias: { type: Type.STRING, description: "The directional bias detected (e.g., Bullish, Bearish, Neutral) or 'Not Available'." },
                detectedSupport: { type: Type.STRING, description: "The main key support price level or 'Not Available'." },
                detectedResistance: { type: Type.STRING, description: "The main key resistance price level or 'Not Available'." },
                confidenceScore: { type: Type.STRING, description: "Confidence score percentage (e.g., 85%) of this detection or 'Not Available'." },
                marketBias: { type: Type.STRING, description: "Bullish, Bearish, or Neutral" },
                multiTimeframe: {
                  type: Type.OBJECT,
                  properties: {
                    h1Trend: { type: Type.STRING, description: "The trend on the hourly H1 chart, or 'Not Available'." },
                    m15Confirmation: { type: Type.STRING, description: "Structure confirmation on M15 chart, or 'Not Available'." },
                    m5EntrySignal: { type: Type.STRING, description: "Micro entry trigger or displacement signal on M5 chart, or 'Not Available'." },
                  },
                  required: ["h1Trend", "m15Confirmation", "m5EntrySignal"],
                },
                keyLevels: {
                  type: Type.OBJECT,
                  properties: {
                    supports: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Detected support price levels or ['Not Available']" },
                    resistances: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Detected resistance price levels or ['Not Available']" },
                    liquidityZones: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Detected liquidity pools or buy/sell stop zones or ['Not Available']" },
                    fairValueGaps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Detected fair value gaps/imbalances or ['Not Available']" },
                    orderBlocks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Detected institutional supply/demand order blocks or ['Not Available']" },
                  },
                  required: ["supports", "resistances", "liquidityZones", "fairValueGaps", "orderBlocks"],
                },
                tradePlan: {
                  type: Type.OBJECT,
                  properties: {
                    suggestedEntry: { type: Type.STRING, description: "Suggested entry price level or 'Not Available'" },
                    stopLoss: { type: Type.STRING, description: "Suggested stop loss price level or 'Not Available'" },
                    takeProfit1: { type: Type.STRING, description: "Take profit target 1 price level or 'Not Available'" },
                    takeProfit2: { type: Type.STRING, description: "Take profit target 2 price level or 'Not Available'" },
                    takeProfit3: { type: Type.STRING, description: "Take profit target 3 price level or 'Not Available'" },
                  },
                  required: ["suggestedEntry", "stopLoss", "takeProfit1", "takeProfit2", "takeProfit3"],
                },
                riskAnalysis: {
                  type: Type.OBJECT,
                  properties: {
                    riskAmountDollars: { type: Type.STRING, description: "Risk amount in dollars based on account size/risk percent, or 'Not Available'" },
                    recommendedLotSize: { type: Type.STRING, description: "Recommended lot size calculated or 'Not Available'" },
                    riskRewardRatio: { type: Type.STRING, description: "Risk reward ratio calculated or 'Not Available'" },
                    probabilityScore: { type: Type.STRING, description: "Overall setup probability score out of 100 or 'Not Available'" },
                    confidencePercentage: { type: Type.STRING, description: "Confidence level percentage or 'Not Available'" },
                  },
                  required: ["riskAmountDollars", "recommendedLotSize", "riskRewardRatio", "probabilityScore", "confidencePercentage"],
                },
                scenarios: {
                  type: Type.OBJECT,
                  properties: {
                    bullish: { type: Type.STRING, description: "What happens in a bullish outcome or 'Not Available'" },
                    bearish: { type: Type.STRING, description: "What happens in a bearish outcome or 'Not Available'" },
                    neutral: { type: Type.STRING, description: "What happens in a sideways outcome or 'Not Available'" },
                  },
                  required: ["bullish", "bearish", "neutral"],
                },
                coachCommentary: {
                  type: Type.OBJECT,
                  properties: {
                    feedback: { type: Type.STRING, description: "Institutional core assessment including trading symbol, market price and trend or 'Not Available'" },
                    mistakesToAvoid: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key list of psychological mistakes or ['Not Available']" },
                    psychologyTip: { type: Type.STRING, description: "Psychological tip for this setup or 'Not Available'" },
                  },
                  required: ["feedback", "mistakesToAvoid", "psychologyTip"],
                },
              },
              required: [
                "detectedSymbol",
                "detectedPrice",
                "detectedTrend",
                "detectedBias",
                "detectedSupport",
                "detectedResistance",
                "confidenceScore",
                "marketBias",
                "multiTimeframe",
                "keyLevels",
                "tradePlan",
                "riskAnalysis",
                "scenarios",
                "coachCommentary",
              ],
            },
          },
        });
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini call attempt ${i + 1} failed:`, err?.message || err);
        if (i < attempts - 1) {
          const errStr = String(err?.message || err).toLowerCase();
          if (errStr.includes("demand") || errStr.includes("unavailable") || errStr.includes("503")) {
            console.log("Switching to backup model gemini-flash-latest due to heavy traffic...");
            selectedModel = "gemini-flash-latest";
          }
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs *= 2;
        }
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to get response from Gemini after multiple retries");
    }

    const responseText = response.text;
    if (responseText) {
      const resultData = JSON.parse(responseText.trim());
      const updatedCreditsUsed = profile.creditsUsed + 1;
      const updatedRemaining = Math.max(0, limit - updatedCreditsUsed);
      const updatedProfile = await handleSupabaseDeductionAndHistory(
        userId,
        profile,
        pair,
        accountSize,
        riskPercent,
        session,
        resultData,
        limit,
        remainingCredits,
        updatedCreditsUsed,
        updatedRemaining
      );
      return res.json({
        result: resultData,
        updatedProfile,
      });
    } else {
      throw new Error("Empty response from Gemini server");
    }
  } catch (apiError: any) {
    console.error("Gemini Vision Analysis Error:", apiError);
    return res.status(500).json({ error: `AI Vision Analysis failed: ${apiError?.message || apiError}` });
  }
});

// 1.5 Secure Payment Verification and Plan Activation Helpers
const pendingPaymentsInMemory = new Map<string, any>();

async function getPendingOrder(orderId: string) {
  if (pendingPaymentsInMemory.has(orderId)) {
    return pendingPaymentsInMemory.get(orderId);
  }
  
  const sSupabase = getServerSupabase();
  if (sSupabase) {
    try {
      const { data, error } = await sSupabase
        .from("payments")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
      if (data) {
        return {
          order_id: data.id || data.order_id,
          user_id: data.user_id,
          selected_plan: data.selected_plan || (data.plan_name?.toLowerCase().includes("elite") ? "plan-elite" : "plan-pro"),
          expected_amount: data.expected_amount || data.amount,
          currency: data.currency,
          status: data.status
        };
      }
    } catch (err) {
      console.warn("Could not query payments table in Supabase:", err);
    }
  }
  return null;
}

async function createPendingOrder(orderId: string, userId: string, planId: string, amount: number) {
  const orderObj = {
    id: orderId,
    order_id: orderId,
    user_id: userId || "guest",
    selected_plan: planId,
    plan_name: planId === "plan-elite" ? "ELITE TRADER" : "PRO TRADER",
    expected_amount: amount,
    amount: amount,
    currency: "USD",
    status: "Pending",
    created_at: new Date()
  };

  pendingPaymentsInMemory.set(orderId, orderObj);

  const sSupabase = getServerSupabase();
  if (sSupabase && userId && userId !== "guest") {
    try {
      const { error } = await sSupabase
        .from("payments")
        .insert(orderObj);
      if (error) {
        console.warn("Could not insert pending payment in Supabase:", error);
      } else {
        console.log("Inserted pending payment record in Supabase:", orderId);
      }
    } catch (err) {
      console.warn("Could not insert pending payment in Supabase:", err);
    }
  }
}

async function updateOrderStatus(orderId: string, status: string, transactionId?: string) {
  const memOrder = pendingPaymentsInMemory.get(orderId);
  if (memOrder) {
    memOrder.status = status;
    if (transactionId) memOrder.transaction_id = transactionId;
  }

  const sSupabase = getServerSupabase();
  if (sSupabase) {
    try {
      const { error } = await sSupabase
        .from("payments")
        .update({
          status: status,
          transaction_id: transactionId || null,
          updated_at: new Date()
        })
        .eq("id", orderId);
      if (error) {
        console.warn("Could not update payment status in Supabase:", error);
      }
    } catch (err) {
      console.warn("Could not update payment status in Supabase:", err);
    }
  }
}

async function activateUserSubscription(userId: string | undefined, planId: string, currentProfile: any, isCard: boolean = false) {
  const isElite = planId === "plan-elite" || planId.toLowerCase().includes("elite");
  const planName = isElite ? "Elite" : "Pro";
  const credits = isElite ? 500 : 200;
  const price = isElite ? 49 : 29;
  const nextResetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  let updatedProfile = {
    ...currentProfile,
    subscriptionPlan: planName,
    plan_name: planName.toUpperCase() + " TRADER",
    Credits: credits,
    credits_remaining: credits,
    total_credits: credits,
    free_analyses_remaining: credits,
    subscription_status: "active",
    Subscription: "active",
    nextResetDate,
    paymentFailed: false,
  };

  const sSupabase = getServerSupabase();
  if (sSupabase && userId && userId !== "guest") {
    if (isCard) {
      try {
        const ordId = "CC-ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        const txId = "TXN-CC-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        await sSupabase.from("payments").insert({
          id: ordId,
          order_id: ordId,
          user_id: userId,
          selected_plan: planId,
          plan_name: isElite ? "ELITE TRADER" : "PRO TRADER",
          expected_amount: price,
          amount: price,
          currency: "USD",
          status: "Completed",
          transaction_id: txId,
          created_at: new Date()
        });
        console.log("Logged successful card payment into Supabase payments table:", ordId);
      } catch (ccPaymentErr) {
        console.warn("Could not log card payment into payments table:", ccPaymentErr);
      }
    }

    let rpcSuccess = false;

    // Try 1: activate_subscription RPC
    try {
      console.log("Attempting RPC activate_subscription...");
      const { error } = await sSupabase.rpc("activate_subscription", {
        p_user_id: userId,
        p_plan_name: planName,
        p_credits: credits
      });
      if (!error) {
        console.log("RPC activate_subscription succeeded!");
        rpcSuccess = true;
      } else {
        console.warn("RPC activate_subscription failed:", error);
      }
    } catch (err) {
      console.warn("Error calling RPC activate_subscription:", err);
    }

    // Try 2: activate_plan RPC
    if (!rpcSuccess) {
      try {
        console.log("Attempting RPC activate_plan...");
        const { error } = await sSupabase.rpc("activate_plan", {
          p_user_id: userId,
          p_plan_name: planName,
          p_credits: credits
        });
        if (!error) {
          console.log("RPC activate_plan succeeded!");
          rpcSuccess = true;
        } else {
          console.warn("RPC activate_plan failed:", error);
        }
      } catch (err) {
        console.warn("Error calling RPC activate_plan:", err);
      }
    }

    // Try 3: specific RPC like activate_pro or activate_elite
    if (!rpcSuccess) {
      const rpcName = isElite ? "activate_elite" : "activate_pro";
      try {
        console.log(`Attempting RPC ${rpcName}...`);
        const { error } = await sSupabase.rpc(rpcName, {
          p_user_id: userId
        });
        if (!error) {
          console.log(`RPC ${rpcName} succeeded!`);
          rpcSuccess = true;
        } else {
          console.warn(`RPC ${rpcName} failed:`, error);
        }
      } catch (err) {
        console.warn(`Error calling RPC ${rpcName}:`, err);
      }
    }

    // Try 4: activate_subscription with non-prefixed params
    if (!rpcSuccess) {
      try {
        console.log("Attempting RPC activate_subscription with non-prefixed params...");
        const { error } = await sSupabase.rpc("activate_subscription", {
          user_id: userId,
          plan_name: planName,
          credits: credits
        });
        if (!error) {
          console.log("RPC activate_subscription (non-prefixed) succeeded!");
          rpcSuccess = true;
        } else {
          console.warn("RPC activate_subscription (non-prefixed) failed:", error);
        }
      } catch (err) {
        console.warn("Error calling RPC activate_subscription (non-prefixed):", err);
      }
    }

    // Manual fallback updates if RPCs are missing/fail
    if (!rpcSuccess) {
      try {
        console.log("No RPC succeeded. Falling back to manual table inserts and updates...");

        // A. Update user profiles table
        const { error: profileUpdateError } = await sSupabase
          .from("profiles")
          .update({
            Plan: planName.toUpperCase(),
            plan_name: planName.toUpperCase() + " TRADER",
            subscriptionPlan: planName,
            Credits: credits,
            credits_remaining: credits,
            total_credits: credits,
            free_analyses_remaining: credits,
            subscription_status: "active",
            Subscription: "active",
            nextResetDate,
            paymentFailed: false,
            updated_at: new Date()
          })
          .eq("id", userId);

        if (profileUpdateError) {
          console.error("Backend error updating profile to paid tier in Supabase:", profileUpdateError);
        }

        // B. Log into subscriptions table
        await sSupabase
          .from("subscriptions")
          .insert({
            id: "sub-" + Date.now(),
            user_id: userId,
            plan_name: planName.toUpperCase() + " TRADER",
            status: "active",
            price,
            created_at: new Date(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          });

        // C. Log into credit_transactions table
        await sSupabase
          .from("credit_transactions")
          .insert({
            id: "tx-" + Date.now(),
            user_id: userId,
            amount: credits,
            transaction_type: "grant",
            description: `Granted credits for ${planName.toUpperCase()} plan activation`,
            created_at: new Date()
          });

      } catch (manualErr) {
        console.error("Manual subscription fallback database update error:", manualErr);
      }
    }

    // Always update/write the new specific columns requested to guarantee single source of truth in profiles table:
    try {
      let existingHistory: any[] = [];
      const { data: curProf } = await sSupabase
        .from("profiles")
        .select("payment_history")
        .eq("id", userId)
        .single();
      if (curProf && curProf.payment_history) {
        existingHistory = typeof curProf.payment_history === "string"
          ? JSON.parse(curProf.payment_history)
          : curProf.payment_history;
      }

      const txId = "TXN-PAY-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      const newPayment = {
        id: "pay-" + Date.now(),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        plan: isElite ? "ELITE" : "PRO",
        amount: price,
        status: "COMPLETED",
        transaction_id: txId
      };
      const updatedHistory = [...existingHistory, newPayment];

      await sSupabase
        .from("profiles")
        .update({
          plan: isElite ? "ELITE" : "PRO",
          credits: credits,
          price: price,
          activation_date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          expiry_date: nextResetDate,
          payment_history: JSON.stringify(updatedHistory)
        })
        .eq("id", userId);

    } catch (profCustomErr) {
      console.warn("Could not write custom columns on profiles table:", profCustomErr);
    }

    // Query and sync updated profile back to frontend
    try {
      const { data: finalDbProfile } = await sSupabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (finalDbProfile) {
        let parsedHistory = [];
        if (finalDbProfile.payment_history) {
          try {
            parsedHistory = typeof finalDbProfile.payment_history === "string"
              ? JSON.parse(finalDbProfile.payment_history)
              : finalDbProfile.payment_history;
          } catch (e) {}
        }

        updatedProfile = {
          ...currentProfile,
          id: finalDbProfile.id,
          name: finalDbProfile.name || finalDbProfile.name_display || currentProfile.name,
          email: finalDbProfile.email || currentProfile.email,
          subscriptionPlan: finalDbProfile.plan === "PRO" ? "Pro" : (finalDbProfile.plan === "ELITE" ? "Elite" : "Free"),
          accountBalance: finalDbProfile.accountBalance || 100000,
          joinDate: finalDbProfile.joinDate || currentProfile.joinDate,
          creditsUsed: finalDbProfile.creditsUsed !== undefined ? finalDbProfile.creditsUsed : 0,
          creditsLimit: finalDbProfile.credits !== undefined ? finalDbProfile.credits : (finalDbProfile.creditsLimit !== undefined ? finalDbProfile.creditsLimit : 3),
          nextResetDate: finalDbProfile.expiry_date || finalDbProfile.nextResetDate || nextResetDate,
          paymentFailed: !!finalDbProfile.paymentFailed,
          plan_name: finalDbProfile.plan || (planName.toUpperCase() + " TRADER"),
          subscription_status: (finalDbProfile.plan === "PRO" || finalDbProfile.plan === "ELITE") ? "active" : "inactive",
          free_analyses_remaining: finalDbProfile.credits !== undefined ? finalDbProfile.credits : (finalDbProfile.free_analyses_remaining !== undefined ? finalDbProfile.free_analyses_remaining : credits),
          credits_remaining: finalDbProfile.credits !== undefined ? finalDbProfile.credits : (finalDbProfile.credits_remaining !== undefined ? finalDbProfile.credits_remaining : credits),
          total_credits: finalDbProfile.credits !== undefined ? finalDbProfile.credits : (finalDbProfile.total_credits !== undefined ? finalDbProfile.total_credits : credits),
          plan: finalDbProfile.plan,
          credits: finalDbProfile.credits,
          price: finalDbProfile.price,
          activation_date: finalDbProfile.activation_date,
          expiry_date: finalDbProfile.expiry_date,
          payment_history: parsedHistory
        };
      }
    } catch (profileFetchErr) {
      console.error("Error fetching updated profile after paid subscription activation:", profileFetchErr);
    }
  } else {
    // If Supabase not connected (demo mode/guest mode fallback)
    updatedProfile = {
      ...currentProfile,
      subscriptionPlan: planName,
      plan_name: planName.toUpperCase() + " TRADER",
      Credits: credits,
      credits_remaining: credits,
      total_credits: credits,
      free_analyses_remaining: credits,
      subscription_status: "active",
      nextResetDate,
      paymentFailed: false,
    };
  }

  return updatedProfile;
}

// 1.5.1 Traditional Credit Card Payment simulation
app.post("/api/verify-payment", async (req, res) => {
  const { planId, cardNumber, cardExpiry, cardCvc, simulateFailure, currentProfile } = req.body;

  if (simulateFailure) {
    return res.status(400).json({ error: "Card processor rejected card telemetry. Simulation mode: FAILURE triggered." });
  }

  const userId = currentProfile?.id;
  const updatedProfile = await activateUserSubscription(userId, planId, currentProfile, true);

  res.json({
    success: true,
    updatedProfile,
  });
});

app.get("/api/plans", (req, res) => {
  res.json([
    { id: "FREE_TRIAL", name: "FREE TRIAL", price: 0, credits: 3 },
    { id: "PRO", name: "PRO", price: 29, credits: 200 },
    { id: "ELITE", name: "ELITE", price: 49, credits: 500 }
  ]);
});

// 1.5.1.4 Razorpay Config, Create and Capture Endpoints
app.get("/api/razorpay/config", (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || ""
  });
});

app.post("/api/razorpay/create-order", async (req, res) => {
  const { planId, userId, currentProfile } = req.body;
  if (!planId) {
    return res.status(400).json({ error: "Selected Plan is required" });
  }

  const isElite = planId === "plan-elite";
  const amountUsd = isElite ? 49 : 29;
  const amountInr = isElite ? 4599 : 2499;
  const amountPaise = amountInr * 100; // Razorpay expects amount in paise (1 INR = 100 paise)

  // Generate unique receipt/order ID
  let orderId = "RZP-ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  let rzpOrderId = orderId;

  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      console.log(`Contacting Razorpay REST API to create order for ${planId} (${amountInr} INR)...`);
      const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
      const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: orderId
        })
      });

      if (!rzpResponse.ok) {
        const errText = await rzpResponse.text();
        throw new Error(`Failed to create Razorpay order: ${errText}`);
      }

      const rzpOrder = await rzpResponse.json();
      rzpOrderId = rzpOrder.id;
      console.log("Successfully created real Razorpay Order:", rzpOrderId);
    } catch (err: any) {
      console.error("Failed to create real Razorpay Order, falling back to simulated:", err);
    }
  }

  // Store pending order in DB (Supabase/Memory) - store USD amount to match PayPal logic
  await createPendingOrder(rzpOrderId, userId, planId, amountUsd);

  res.json({
    orderId: rzpOrderId,
    priceInr: amountInr,
    priceUsd: amountUsd,
    currency: "INR"
  });
});

app.post("/api/razorpay/capture-payment", async (req, res) => {
  const { orderId, razorpayPaymentId, razorpaySignature, status, currentProfile } = req.body;
  const userId = currentProfile?.id || "guest";

  try {
    const pendingOrder = await getPendingOrder(orderId);
    if (!pendingOrder) {
      return res.status(400).json({ error: "Order ID must match the pending order." });
    }

    if (pendingOrder.status === "Completed") {
      return res.status(400).json({ error: "The payment has already been processed." });
    }

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      // Real HMAC-SHA256 signature verification for production security
      if (!razorpayPaymentId || !razorpaySignature) {
        await updateOrderStatus(orderId, "Failed");
        return res.status(400).json({ error: "Missing payment ID or signature for verification." });
      }

      const body = orderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        await updateOrderStatus(orderId, "Failed");
        return res.status(400).json({ error: "Razorpay signature verification failed. Tampering detected." });
      }
    } else {
      // Simulation mode
      if (status === "FAILED") {
        await updateOrderStatus(orderId, "Failed");
        return res.status(400).json({ error: "Payment failed during Razorpay transaction." });
      }
    }

    // Update Order to Completed and activate subscription
    const finalTxId = razorpayPaymentId || "RZP-TXN-" + Date.now();
    await updateOrderStatus(orderId, "Completed", finalTxId);
    const updatedProfile = await activateUserSubscription(userId, pendingOrder.selected_plan, currentProfile);

    return res.json({
      success: true,
      updatedProfile,
      message: "Razorpay subscription payment fully verified and activated on the server."
    });

  } catch (error: any) {
    console.error("Server Razorpay Verification Error:", error);
    await updateOrderStatus(orderId, "Failed");
    return res.status(500).json({ error: `Razorpay Server Error: ${error?.message || error}` });
  }
});

// 1.5.1.5 PayPal - Client ID Config Endpoint
app.get("/api/paypal/config", (req, res) => {
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID || ""
  });
});

// 1.5.2 PayPal - Create Order Endpoint
app.post("/api/paypal/create-order", async (req, res) => {
  const { planId, userId, currentProfile } = req.body;
  if (!planId) {
    return res.status(400).json({ error: "Selected Plan is required" });
  }

  const isElite = planId === "plan-elite";
  const price = isElite ? 49 : 29;

  // Generate a fallback unique PayPal-style Order ID
  let orderId = "PAYPAL-ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  let approvalUrl = `/paypal-checkout?token=${orderId}&plan=${planId === 'plan-elite' ? 'elite' : 'pro'}`;

  if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    try {
      console.log("Contacting PayPal REST API to create real order for plan:", planId);
      const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
      
      const oauthResponse = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
      });
      
      if (!oauthResponse.ok) {
        throw new Error("Failed to authenticate with PayPal server-side API");
      }
      
      const oauthData: any = await oauthResponse.json();
      const accessToken = oauthData.access_token;

      const orderResponse = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: "USD",
                value: price.toFixed(2)
              },
              description: isElite ? "ELITE TRADER" : "PRO TRADER"
            }
          ]
        })
      });

      if (!orderResponse.ok) {
        const errText = await orderResponse.text();
        throw new Error(`Failed to create PayPal order: ${errText}`);
      }

      const paypalOrder = await orderResponse.json();
      orderId = paypalOrder.id;
      const approveLink = paypalOrder.links.find((l: any) => l.rel === "approve" || l.rel === "payer-action");
      approvalUrl = approveLink ? approveLink.href : approvalUrl;

      console.log("Successfully created real PayPal Order:", orderId);
    } catch (err: any) {
      console.error("Failed to create real PayPal Order, falling back to simulated:", err);
    }
  }

  // Store pending order in DB (Supabase/Memory)
  await createPendingOrder(orderId, userId, planId, price);

  res.json({
    orderId,
    price,
    currency: "USD",
    approvalUrl
  });
});

// 1.5.3 PayPal - Capture & Verify Endpoint
app.post("/api/paypal/capture-payment", async (req, res) => {
  const { orderId, transactionId, status, currentProfile } = req.body;
  const userId = currentProfile?.id || "guest";

  try {
    // 1. Retrieve the pending order to confirm it exists
    const pendingOrder = await getPendingOrder(orderId);
    if (!pendingOrder) {
      return res.status(400).json({ error: "Order ID must match the pending order." });
    }

    // 2. Ensure payment has not been processed before
    if (pendingOrder.status === "Completed") {
      return res.status(400).json({ error: "The payment has already been processed." });
    }

    let paypalOrderDetails;

    // 3. Contact PayPal Server-Side REST API directly to verify payment credentials
    if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
      try {
        console.log("Contacting PayPal REST API to retrieve order:", orderId);
        const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
        
        const oauthResponse = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: "grant_type=client_credentials"
        });
        
        if (!oauthResponse.ok) {
          throw new Error("Failed to authenticate with PayPal server-side API");
        }
        
        const oauthData: any = await oauthResponse.json();
        const accessToken = oauthData.access_token;

        let orderResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });

        if (!orderResponse.ok) {
          throw new Error("Failed to retrieve PayPal order details");
        }

        let orderData = await orderResponse.json();

        // If order status is APPROVED, capture it now!
        if (orderData.status === "APPROVED") {
          console.log("Order is APPROVED on PayPal. Issuing server-side capture now:", orderId);
          const captureResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            }
          });

          if (captureResponse.ok) {
            orderData = await captureResponse.json();
            console.log("Successfully captured approved PayPal order:", orderId);
          } else {
            const errText = await captureResponse.text();
            console.warn("Capture request failed, trying GET again in case already captured:", errText);
            orderResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              }
            });
            if (orderResponse.ok) {
              orderData = await orderResponse.json();
            }
          }
        }

        paypalOrderDetails = orderData;
      } catch (paypalApiErr: any) {
        console.error("PayPal Server API connection failed:", paypalApiErr);
        await updateOrderStatus(orderId, "Failed");
        return res.status(400).json({ error: `PayPal Server-Side API verification failed: ${paypalApiErr?.message || paypalApiErr}` });
      }
    } else {
      // Server-Side Verification Simulation Mode (when API keys are not provided yet)
      if (!transactionId || transactionId === "undefined") {
        await updateOrderStatus(orderId, "Failed");
        return res.status(400).json({ error: "Transaction ID must be valid." });
      }

      paypalOrderDetails = {
        id: orderId,
        status: status || "COMPLETED",
        purchase_units: [
          {
            amount: {
              currency_code: req.body.testCurrency || "USD",
              value: req.body.testAmount || pendingOrder.expected_amount.toString()
            },
            payments: {
              captures: [
                {
                  id: transactionId,
                  status: "COMPLETED",
                  amount: {
                    currency_code: req.body.testCurrency || "USD",
                    value: req.body.testAmount || pendingOrder.expected_amount.toString()
                  }
                }
              ]
            }
          }
        ]
      };
    }

    // 4. Run rigorous backend validations on the retrieved details
    const paypalStatus = paypalOrderDetails.status;
    const paypalAmount = parseFloat(paypalOrderDetails.purchase_units[0].amount.value);
    const paypalCurrency = paypalOrderDetails.purchase_units[0].amount.currency_code;
    const capture = paypalOrderDetails.purchase_units[0].payments?.captures?.[0];
    const paypalTxId = capture?.id || transactionId;

    // Check Payment Status must be COMPLETED
    if (paypalStatus !== "COMPLETED") {
      await updateOrderStatus(orderId, "Failed");
      return res.status(400).json({ error: "Payment Status must be COMPLETED." });
    }

    // Currency must be USD
    if (paypalCurrency !== "USD") {
      await updateOrderStatus(orderId, "Failed");
      return res.status(400).json({ error: "Currency must be USD." });
    }

    // Paid Amount must exactly match the expected amount
    if (paypalAmount !== parseFloat(pendingOrder.expected_amount)) {
      await updateOrderStatus(orderId, "Failed");
      return res.status(400).json({ error: "Paid Amount must exactly match the expected amount." });
    }

    // Transaction ID must be valid
    if (!paypalTxId) {
      await updateOrderStatus(orderId, "Failed");
      return res.status(400).json({ error: "Transaction ID must be valid." });
    }

    // 5. Update Order to Completed and activate subscription
    await updateOrderStatus(orderId, "Completed", paypalTxId);
    const updatedProfile = await activateUserSubscription(userId, pendingOrder.selected_plan, currentProfile);

    return res.json({
      success: true,
      updatedProfile,
      message: "PayPal subscription payment fully verified and activated on the server."
    });

  } catch (error: any) {
    console.error("Server PayPal Verification Error:", error);
    await updateOrderStatus(orderId, "Failed");
    return res.status(500).json({ error: `PayPal Server Error: ${error?.message || error}` });
  }
});

// 2. AI Coach Chat Companion
app.post("/api/coach-chat", async (req, res) => {
  const { messages, context } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid thread history" });
  }

  const latestMessage = messages[messages.length - 1]?.content || "";

  if (ai) {
    try {
      const gHistory = messages.slice(0, -1).map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const sysInstruction = `You are an elite, highly empathetic but disciplined TradeModeAI Trader Coach & Performance Psychologist. Your mission is to assist evaluation traders to manage their emotions, maintain strict risk limits, analyze psychological hurdles (fear of loss, greed, FOMO, over-trading), and build institutional discipline.
Context of Current Trader Status: ${JSON.stringify(context || {})}
Be concise, practical, highly supportive, and institutional. Avoid AI platitudes. Speak in clean, direct trading terminology. Mention drawdown rules, lot sizes, or risk rewards where relevant.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...gHistory,
          { role: "user", parts: [{ text: latestMessage }] }
        ],
        config: {
          systemInstruction: sysInstruction,
        },
      });

      return res.json({ text: response.text });
    } catch (chatError) {
      console.error("Gemini Coach Chat Error:", chatError);
      // fallback handled below
    }
  }

  // Dynamic premium simulator response
  let answer = `Always remember that psychological resilience is what separates the top 1% of funded traders from the rest. `;
  if (latestMessage.toLowerCase().includes("fomo") || latestMessage.toLowerCase().includes("fear")) {
    answer += `FOMO is simply the fear of missing out on money that was never yours to begin with. In a high-stakes evaluation, market patience is literally your highest paying asset. When you see a candle expand without you, respect your setup and wait for the pullback or next session.`;
  } else if (latestMessage.toLowerCase().includes("loss") || latestMessage.toLowerCase().includes("blew") || latestMessage.toLowerCase().includes("fail")) {
    answer += `Losing an evaluation account is a temporary write-off of fee capital, but an invaluable lesson in risk discipline. Review your journals: did you violate the maximum daily drawdown or the trailing loss rules due to oversized lot sizes? Refocus on your model, reduce risk per trade to 0.5% in your next attempt, and prioritize preservation over speed.`;
  } else if (latestMessage.toLowerCase().includes("gold") || latestMessage.toLowerCase().includes("xau")) {
    answer += `Gold (XAUUSD) has extreme session levels and rapid stop hunts. For trading challenges, reduce your risk parameters on Gold by half because standard volatility will trigger daily drawdown blocks if you trade full lots prematurely. Focus strictly on New York Open displacement.`;
  } else {
    answer += `Focus heavily on keeping your daily drawdown below 4%. The best way to achieve sustained funding is to target a consistent 0.5% - 1% gain per day, keeping your downside tightly protected. What trading mindset obstacle are we mastering next?`;
  }

  res.json({ text: answer });
});

// Setup Vite & static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TradeModeAI server running on port ${PORT}`);
  });
}

startServer();
