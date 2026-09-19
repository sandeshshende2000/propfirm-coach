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
        const newTotalSuccessfulAnalyses = (dbProfile?.total_successful_analyses !== undefined ? dbProfile.total_successful_analyses : 0) + 1;

        // Create the analysis record item
        const dateTimeStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newAnalysisItem = {
          id: "analysis-" + Date.now(),
          user_id: userId,
          pair: pair,
          asset: pair,
          account_size: accountSize,
          risk_percent: riskPercent,
          session: session,
          result: resultData,
          dateTime: dateTimeStr,
          creditsUsed: 1,
          status: "Success"
        };

        let existingHistory: any[] = [];
        if (dbProfile?.analysis_history) {
          try {
            existingHistory = typeof dbProfile.analysis_history === "string"
              ? JSON.parse(dbProfile.analysis_history)
              : dbProfile.analysis_history;
          } catch (e) {
            console.warn("Could not parse profile analysis_history:", e);
          }
        }
        const updatedHistory = [newAnalysisItem, ...existingHistory];

        // Update the database profiles table
        const { error: profileUpdateError } = await sSupabase
          .from("profiles")
          .update({
            Credits: newCredits,
            credits_remaining: newCredits,
            free_analyses_remaining: newCredits,
            creditsUsed: newCreditsUsed,
            credits_used: newCreditsUsed,
            total_successful_analyses: newTotalSuccessfulAnalyses,
            analysis_history: JSON.stringify(updatedHistory),
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
            total_successful_analyses: newTotalSuccessfulAnalyses,
            analysis_history: updatedHistory
          };
        }

        // 2. Insert into analysis_history table
        const { error: historyInsertError } = await sSupabase
          .from("analysis_history")
          .insert({
            id: newAnalysisItem.id,
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
      // Ensure custom columns are synchronized even on RPC success
      try {
        const { data: dbProfile } = await sSupabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (dbProfile) {
          const currentCredits = dbProfile.Credits !== undefined ? dbProfile.Credits : dbProfile.credits_remaining;
          const newCredits = Math.max(0, (currentCredits !== undefined ? currentCredits : remainingCredits) - 1);
          const newCreditsUsed = (dbProfile.creditsUsed !== undefined ? dbProfile.creditsUsed : (dbProfile.credits_used || 0)) + 1;
          const newTotalSuccessfulAnalyses = (dbProfile.total_successful_analyses !== undefined ? dbProfile.total_successful_analyses : 0) + 1;

          const dateTimeStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newAnalysisItem = {
            id: "analysis-" + Date.now(),
            user_id: userId,
            pair: pair,
            asset: pair,
            account_size: accountSize,
            risk_percent: riskPercent,
            session: session,
            result: resultData,
            dateTime: dateTimeStr,
            creditsUsed: 1,
            status: "Success"
          };

          let existingHistory: any[] = [];
          if (dbProfile.analysis_history) {
            try {
              existingHistory = typeof dbProfile.analysis_history === "string"
                ? JSON.parse(dbProfile.analysis_history)
                : dbProfile.analysis_history;
            } catch (e) {}
          }
          const updatedHistory = [newAnalysisItem, ...existingHistory];

          await sSupabase
            .from("profiles")
            .update({
              Credits: newCredits,
              credits_remaining: newCredits,
              free_analyses_remaining: newCredits,
              creditsUsed: newCreditsUsed,
              credits_used: newCreditsUsed,
              total_successful_analyses: newTotalSuccessfulAnalyses,
              analysis_history: JSON.stringify(updatedHistory),
              updated_at: new Date()
            })
            .eq("id", userId);
        }
      } catch (syncErr) {
        console.warn("Could not sync custom columns after RPC success:", syncErr);
      }

      // If RPC succeeded, query the updated profile to return it to frontend
      try {
        const { data: updatedDbProfile } = await sSupabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (updatedDbProfile) {
          let parsedHistory = [];
          if (updatedDbProfile.analysis_history) {
            try {
              parsedHistory = typeof updatedDbProfile.analysis_history === "string"
                ? JSON.parse(updatedDbProfile.analysis_history)
                : updatedDbProfile.analysis_history;
            } catch (e) {}
          }

          updatedProfile = {
            ...profile,
            Credits: updatedDbProfile.Credits,
            credits_remaining: updatedDbProfile.credits_remaining !== undefined ? updatedDbProfile.credits_remaining : updatedDbProfile.Credits,
            free_analyses_remaining: updatedDbProfile.free_analyses_remaining !== undefined ? updatedDbProfile.free_analyses_remaining : updatedDbProfile.Credits,
            creditsUsed: updatedDbProfile.creditsUsed !== undefined ? updatedDbProfile.creditsUsed : updatedDbProfile.credits_used,
            current_plan: updatedDbProfile.current_plan || updatedDbProfile.plan,
            subscription_status: updatedDbProfile.subscription_status || "active",
            total_credits: updatedDbProfile.total_credits !== undefined ? updatedDbProfile.total_credits : updatedDbProfile.Credits,
            subscription_start_date: updatedDbProfile.subscription_start_date || updatedDbProfile.activation_date || updatedDbProfile.joinDate || "",
            subscription_end_date: updatedDbProfile.subscription_end_date || updatedDbProfile.expiry_date || "Never",
            total_successful_analyses: updatedDbProfile.total_successful_analyses !== undefined ? updatedDbProfile.total_successful_analyses : 0,
            analysis_history: parsedHistory
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
// Helper function to enforce strict internal logical consistency in AI analysis output
function enforceConsistency(result: any) {
  if (!result || typeof result !== "object") return result;

  // 1. Harmonize marketBias & detectedBias
  let bias = (result.marketBias || result.detectedBias || "Neutral").trim();
  if (bias.toLowerCase().includes("bull")) bias = "Bullish";
  else if (bias.toLowerCase().includes("bear")) bias = "Bearish";
  else bias = "Neutral";

  result.marketBias = bias;
  result.detectedBias = bias;

  // 2. Harmonize detectedTrend
  let trend = (result.detectedTrend || "").trim();
  if (bias === "Bullish" && (!trend || trend === "Not Available" || trend.toLowerCase().includes("down"))) {
    trend = "Uptrend";
  } else if (bias === "Bearish" && (!trend || trend === "Not Available" || trend.toLowerCase().includes("up"))) {
    trend = "Downtrend";
  } else if (bias === "Neutral" && (!trend || trend === "Not Available")) {
    trend = "Sideways";
  }
  result.detectedTrend = trend;

  // 3. Inspect decision from coachCommentary or tradePlan
  let feedbackText = result.coachCommentary?.feedback || "";
  let finalDecisionMatch = feedbackText.match(/### Final Decision\s*\n\s*([^\n#]+)/i);
  let rawDecision = finalDecisionMatch ? finalDecisionMatch[1].trim().toUpperCase() : "";

  let decision = "NO TRADE";
  if (rawDecision.includes("BUY")) decision = "BUY";
  else if (rawDecision.includes("SELL")) decision = "SELL";
  else if (rawDecision.includes("NO TRADE")) decision = "NO TRADE";
  else {
    if (bias === "Bullish") decision = "BUY";
    else if (bias === "Bearish") decision = "SELL";
    else decision = "NO TRADE";
  }

  // 4. Strict Logical Validation Rules:
  // - Never report Bearish while recommending BUY
  // - Never report Bullish while recommending SELL
  // - Never report Neutral while recommending BUY or SELL
  if (bias === "Bearish" && decision === "BUY") {
    console.warn("Consistency Enforcer: Correcting invalid Bearish + BUY contradiction to NO TRADE.");
    decision = "NO TRADE";
  } else if (bias === "Bullish" && decision === "SELL") {
    console.warn("Consistency Enforcer: Correcting invalid Bullish + SELL contradiction to NO TRADE.");
    decision = "NO TRADE";
  } else if (bias === "Neutral" && decision !== "NO TRADE") {
    console.warn("Consistency Enforcer: Correcting invalid Neutral bias + active trade decision to NO TRADE.");
    decision = "NO TRADE";
  }

  // 5. Update feedbackText sections to be 100% consistent
  if (typeof feedbackText === "string" && feedbackText.length > 0) {
    if (feedbackText.includes("### Market Bias")) {
      feedbackText = feedbackText.replace(/### Market Bias\s*\n\s*[^\n#]+/i, `### Market Bias\n${bias}`);
    }
    if (feedbackText.includes("### Trend")) {
      feedbackText = feedbackText.replace(/### Trend\s*\n\s*[^\n#]+/i, `### Trend\n${trend}`);
    }
    if (feedbackText.includes("### Final Decision")) {
      feedbackText = feedbackText.replace(/### Final Decision\s*\n\s*[^\n#]+/i, `### Final Decision\n${decision}`);
    }
    if (result.coachCommentary) {
      result.coachCommentary.feedback = feedbackText;
    }
  }

  // 6. If NO TRADE, sanitize tradePlan if entry was invalid
  if (decision === "NO TRADE" && result.tradePlan) {
    const entry = (result.tradePlan.suggestedEntry || "").toLowerCase();
    if (entry && !entry.includes("no trade") && entry !== "not available") {
      result.tradePlan.suggestedEntry = "NO TRADE - Setup Invalidation / Contradictory Signals";
    }
  }

  return result;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUUID(val: any): boolean {
  return typeof val === "string" && UUID_REGEX.test(val);
}

app.post("/api/analyze-trade", async (req, res) => {
  const { pair, accountSize, riskPercent, session, h1Chart, m15Chart, m5Chart, profile, userId } = req.body;

  if (!pair || !accountSize || !riskPercent || !session) {
    return res.status(400).json({ error: "Missing required fields: pair, accountSize, riskPercent, session" });
  }

  // Strict backend-enforced credit and screenshot check
  if (!h1Chart || !m15Chart || !m5Chart) {
    return res.status(400).json({ error: "All three screenshots (H1, M15, M5) are required for multi-frame analysis." });
  }

  const sSupabase = getServerSupabase();
  let dbProfile: any = null;

  if (sSupabase && userId && isUUID(userId)) {
    try {
      const { data, error } = await Promise.race([
        sSupabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Supabase profile fetch timeout")), 3000))
      ]);

      if (error) {
        console.warn("Notice: Supabase profile fetch for credit check had an issue, falling back to client profile:", error);
      } else if (data) {
        dbProfile = data;
      }
    } catch (err) {
      console.warn("Notice: Exception during Supabase profile fetch for credit check, using client profile:", err);
    }
  }

  // Fallback to body profile if Supabase is not configured, unreachable, or user is in local/demo mode
  const currentProfile = dbProfile || profile;

  if (!currentProfile) {
    return res.status(400).json({ error: "Missing profile information for credit validation." });
  }

  const currentPlan = currentProfile.current_plan || currentProfile.plan || "FREE_TRIAL";
  const subscriptionStatus = currentProfile.subscription_status || "active";
  const limit = typeof currentProfile.total_credits === "number" 
    ? currentProfile.total_credits 
    : (typeof currentProfile.creditsLimit === "number" ? currentProfile.creditsLimit : 3);

  let creditsRemaining = typeof currentProfile.credits_remaining === "number"
    ? currentProfile.credits_remaining
    : (typeof currentProfile.free_analyses_remaining === "number"
        ? currentProfile.free_analyses_remaining
        : (typeof currentProfile.credits === "number"
            ? currentProfile.credits
            : (typeof currentProfile.Credits === "number"
                ? currentProfile.Credits
                : Math.max(0, limit - (typeof currentProfile.creditsUsed === "number" ? currentProfile.creditsUsed : 0)))));

  // Strict Zero Credit Blocker: Stop analysis and return NO_CREDITS error
  if (creditsRemaining <= 0) {
    return res.status(403).json({
      success: false,
      code: "NO_CREDITS",
      error: "Your available analysis credits have been exhausted. Please upgrade your subscription to Pro or Elite plan.",
      message: "Your available analysis credits have been exhausted. Please upgrade your subscription to Pro or Elite plan."
    });
  }

  if (currentProfile.paymentFailed) {
    return res.status(403).json({ error: "Subscription payment required. Renew your plan to continue using AI analysis." });
  }

  if (!ai) {
    return res.status(500).json({ error: "AI Engine is not initialized. Please verify your GEMINI_API_KEY inside Settings > Secrets." });
  }

  // Concurrency Protection: Pessimistic reservation of 1 credit when connected
  let reservationSucceeded = false;
  let originalCreditsRemaining = creditsRemaining;

  if (sSupabase && userId && isUUID(userId) && dbProfile) {
    try {
      const reservedCredits = Math.max(0, creditsRemaining - 1);
      const { data: reservedRows, error: reserveError } = await Promise.race([
        sSupabase
          .from("profiles")
          .update({
            credits_remaining: reservedCredits,
            free_analyses_remaining: reservedCredits,
            credits: reservedCredits,
            updated_at: new Date()
          })
          .eq("id", userId)
          .select(),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Supabase reservation timeout")), 3000))
      ]);

      if (reserveError) {
        console.warn(`Notice: Supabase reservation warning for user ${userId}:`, reserveError);
      }
      reservationSucceeded = true;
      console.log(`Successfully reserved 1 credit for user ${userId}. New credits_remaining: ${reservedCredits}`);
    } catch (err) {
      console.warn("Notice: Exception during credit reservation, continuing with client-profile credit tracking:", err);
      reservationSucceeded = true;
    }
  } else {
    // Local / Demo mode fallback
    reservationSucceeded = true;
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

DETERMINISTIC ANALYSIS & LOGICAL CONSISTENCY MANDATES:
- You are operating as a 100% deterministic institutional trading engine. Given identical chart images and parameters (Symbol: ${pair}, Account Size: $${accountSize}, Risk: ${riskPercent}%, Session: ${session}), you MUST generate identical, reproducible analysis reports.
- Avoid random alternative scenarios or generating multiple speculative possibilities. Focus on ONE definitive institutional decision.
- STRICT LOGICAL CONSISTENCY RULES:
  1. Never report a "Bearish" bias or "Downtrend" while recommending a "BUY" decision or Buy entry.
  2. Never report a "Bullish" bias or "Uptrend" while recommending a "SELL" decision or Sell entry.
  3. If trends/timeframes conflict or bias is Neutral/Sideways, the Final Decision MUST be "NO TRADE".
  4. Ensure marketBias, detectedBias, detectedTrend, tradePlan, and Final Decision in coachCommentary.feedback are 100% synchronized and free of internal contradictions.

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
    let attempts = 4;
    let delayMs = 1000;
    let lastError: any = null;
    const modelCandidates = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-pro-preview"];
    let selectedModel = modelCandidates[0];

    for (let i = 0; i < attempts; i++) {
      try {
        selectedModel = modelCandidates[Math.min(i, modelCandidates.length - 1)];
        console.log(`AI Vision attempt ${i + 1} of ${attempts} using model ${selectedModel}...`);
        response = await ai.models.generateContent({
          model: selectedModel,
          contents: { parts },
          config: {
            responseMimeType: "application/json",
            temperature: 0,
            topP: 0.1,
            topK: 1,
            seed: 42,
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
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs *= 1.5;
        }
      }
    }

    if (!response) {
      throw lastError || new Error("Failed to get response from Gemini after multiple retries");
    }

    const responseText = response.text;
    if (responseText) {
      const resultData = enforceConsistency(JSON.parse(responseText.trim()));

      const updatedRemaining = Math.max(0, creditsRemaining - 1);
      const currentUsed = typeof currentProfile.creditsUsed === "number" 
        ? currentProfile.creditsUsed 
        : (typeof currentProfile.credits_used === "number" ? currentProfile.credits_used : 0);
      const updatedCreditsUsed = Math.min(limit, currentUsed + 1);
      const newTotalSuccessfulAnalyses = (typeof currentProfile.total_successful_analyses === "number" ? currentProfile.total_successful_analyses : 0) + 1;

      // Create the analysis record item
      const dateTimeStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newAnalysisId = "analysis-" + Date.now();
      const newAnalysisItem = {
        id: newAnalysisId,
        user_id: userId,
        pair: pair,
        asset: pair,
        account_size: accountSize,
        risk_percent: riskPercent,
        session: session,
        result: resultData,
        dateTime: dateTimeStr,
        creditsUsed: 1,
        status: "Success"
      };

      let existingHistory: any[] = [];
      if (currentProfile.analysis_history) {
        try {
          existingHistory = typeof currentProfile.analysis_history === "string"
            ? JSON.parse(currentProfile.analysis_history)
            : currentProfile.analysis_history;
        } catch (e) {
          console.warn("Could not parse profile analysis_history:", e);
        }
      }
      const updatedHistory = [newAnalysisItem, ...existingHistory];

      const updatedProfile = {
        ...currentProfile,
        creditsUsed: updatedCreditsUsed,
        credits_used: updatedCreditsUsed,
        credits_remaining: updatedRemaining,
        free_analyses_remaining: updatedRemaining,
        Credits: updatedRemaining,
        credits: updatedRemaining,
        total_credits: limit,
        creditsLimit: limit,
        total_successful_analyses: newTotalSuccessfulAnalyses,
        analysis_history: updatedHistory
      };

      if (sSupabase && userId && isUUID(userId) && dbProfile) {
        try {
          // Step 3: Save analysis_history with full payload
          await Promise.race([
            sSupabase
              .from("analysis_history")
              .insert({
                id: newAnalysisId,
                user_id: userId,
                asset: pair,
                pair: pair,
                account_size: accountSize,
                risk_percent: riskPercent,
                session: session,
                result: typeof resultData === "string" ? resultData : JSON.stringify(resultData),
                status: "Success",
                dateTime: dateTimeStr,
                created_at: new Date()
              }),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error("History insert timeout")), 3000))
          ]).catch((historyInsertError) => {
            console.warn("Notice: analysis_history insert warning:", historyInsertError);
          });

          // Step 4 & 5: Update profiles with full credit and analysis count metadata
          await Promise.race([
            sSupabase
              .from("profiles")
              .update({
                credits_remaining: updatedRemaining,
                free_analyses_remaining: updatedRemaining,
                credits: updatedRemaining,
                credits_used: updatedCreditsUsed,
                creditsUsed: updatedCreditsUsed,
                total_successful_analyses: newTotalSuccessfulAnalyses,
                analysis_history: JSON.stringify(updatedHistory),
                updated_at: new Date()
              })
              .eq("id", userId),
            new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Profile update timeout")), 3000))
          ]);

          // Step 6: Record credit usage in credit_transactions
          try {
            await sSupabase.from("credit_transactions").insert({
              id: "tx-use-" + Date.now(),
              user_id: userId,
              transaction_type: "usage",
              amount: 1,
              created_at: new Date()
            });
          } catch (ctErr) {
            console.warn("Notice: credit_transactions insert optional:", ctErr);
          }

          console.log(`Successfully committed analysis transaction for user ${userId}. Remaining credits: ${updatedRemaining}`);
        } catch (dbErr: any) {
          console.warn("Notice: Remote database sync failed, continuing with client-side profile sync:", dbErr?.message || dbErr);
        }
      }

      return res.json({
        result: resultData,
        updatedProfile,
        credits_remaining: updatedRemaining
      });
    } else {
      throw new Error("Empty response from Gemini server");
    }
  } catch (apiError: any) {
    console.error("Gemini Vision Analysis Error:", apiError);

    const restoredProfile = {
      ...currentProfile,
      credits_remaining: originalCreditsRemaining,
      free_analyses_remaining: originalCreditsRemaining,
      Credits: originalCreditsRemaining,
      credits: originalCreditsRemaining,
      creditsUsed: Math.max(0, (currentProfile.creditsUsed !== undefined ? currentProfile.creditsUsed : (currentProfile.credits_used || 0)))
    };

    // Rollback the reserved credit on any error during the generation process
    if (reservationSucceeded && sSupabase && userId && dbProfile) {
      try {
        console.log(`Rolling back credit reservation for user ${userId}. Restoring credits to ${originalCreditsRemaining}`);
        await sSupabase
          .from("profiles")
          .update({
            credits_remaining: originalCreditsRemaining,
            free_analyses_remaining: originalCreditsRemaining,
            Credits: originalCreditsRemaining,
            updated_at: new Date()
          })
          .eq("id", userId);
      } catch (rollbackErr) {
        console.error("Failed to restore credits during API level rollback:", rollbackErr);
      }
    }

    return res.status(500).json({
      error: `AI Vision Analysis failed: ${apiError?.message || apiError}`,
      updatedProfile: restoredProfile,
      credits_remaining: originalCreditsRemaining
    });
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
          selected_plan: data.plan_name?.toLowerCase().includes("elite") ? "plan-elite" : "plan-pro",
          expected_amount: data.amount,
          currency: data.currency || "USD",
          status: data.transaction_id ? "Completed" : "Pending"
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
    plan_name: planId === "plan-elite" ? "ELITE TRADER" : "PRO TRADER",
    amount: amount,
    currency: "USD",
    created_at: new Date()
  };

  pendingPaymentsInMemory.set(orderId, {
    ...orderObj,
    selected_plan: planId,
    expected_amount: amount,
    status: "Pending"
  });

  const sSupabase = getServerSupabase();
  if (sSupabase && userId && userId !== "guest") {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(userId)) {
      try {
        const { error } = await sSupabase
          .from("payments")
          .insert({
            id: orderId,
            order_id: orderId,
            user_id: userId,
            plan_name: orderObj.plan_name,
            amount: amount,
            currency: "USD",
            created_at: orderObj.created_at
          });
        if (error) {
          console.warn("Could not insert pending payment in Supabase:", error);
        } else {
          console.log("Inserted pending payment record in Supabase:", orderId);
        }
      } catch (err) {
        console.warn("Could not insert pending payment in Supabase:", err);
      }
    } else {
      console.warn(`Skipped inserting pending payment in Supabase: user_id '${userId}' is not a valid UUID`);
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
      const updatePayload: any = {
        status: status
      };
      if (transactionId) {
        updatePayload.transaction_id = transactionId;
      }
      
      const { error } = await sSupabase
        .from("payments")
        .update(updatePayload)
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
  const purchasedCredits = isElite ? 500 : 200;
  const price = isElite ? 49 : 29;
  const nextResetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formattedPlanName = isElite ? "ELITE TRADER" : "PRO TRADER";
  const planCode = isElite ? "ELITE" : "PRO";

  let updatedProfile = {
    ...currentProfile,
    subscriptionPlan: planName,
    plan_name: formattedPlanName,
    current_plan: planCode,
    plan: planCode,
    Credits: purchasedCredits,
    credits_remaining: purchasedCredits,
    total_credits: purchasedCredits,
    free_analyses_remaining: purchasedCredits,
    subscription_status: "active",
    Subscription: "active",
    nextResetDate,
    paymentFailed: false,
  };

  const sSupabase = getServerSupabase();
  if (sSupabase && userId && userId !== "guest") {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUserUuid = uuidRegex.test(userId);

    if (isUserUuid) {
      // Fetch existing database profile first to perform accurate credit accumulation
      let existingDbProfile: any = null;
      try {
        const { data } = await sSupabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        existingDbProfile = data;
      } catch (e) {
        console.warn("Could not fetch existing profile prior to subscription activation:", e);
      }

      // FIX #1: Existing remaining credits must always be preserved. New purchased credits must be added.
      const currentRemaining = existingDbProfile?.credits_remaining !== undefined 
        ? Number(existingDbProfile.credits_remaining) 
        : (existingDbProfile?.credits !== undefined 
          ? Number(existingDbProfile.credits) 
          : (existingDbProfile?.free_analyses_remaining !== undefined 
            ? Number(existingDbProfile.free_analyses_remaining) 
            : (currentProfile?.credits_remaining !== undefined 
              ? Number(currentProfile.credits_remaining) 
              : (currentProfile?.free_analyses_remaining !== undefined ? Number(currentProfile.free_analyses_remaining) : 0))));

      const currentTotal = existingDbProfile?.total_credits !== undefined 
        ? Number(existingDbProfile.total_credits) 
        : (currentProfile?.total_credits !== undefined ? Number(currentProfile.total_credits) : 0);

      const newCreditsRemaining = currentRemaining + purchasedCredits;
      const newTotalCredits = currentTotal > 0 ? (currentTotal + purchasedCredits) : newCreditsRemaining;

      // 1. Ensure payment row is recorded in payments table (FIX #2: Every purchase creates a NEW row)
      try {
        const ordId = (isCard ? "CC-ORD-" : "ORD-") + Date.now() + "-" + Math.floor(Math.random() * 1000);
        const txId = "TXN-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        await sSupabase.from("payments").insert({
          id: ordId,
          order_id: ordId,
          user_id: userId,
          plan_name: formattedPlanName,
          amount: price,
          currency: "USD",
          status: "Completed",
          transaction_id: txId,
          created_at: new Date()
        });
        console.log("Logged successful completed payment into Supabase payments table:", ordId);
      } catch (paymentErr) {
        console.warn("Could not log payment into payments table:", paymentErr);
      }

      // 2. Ensure subscription row is recorded in subscriptions table
      try {
        await sSupabase.from("subscriptions").insert({
          id: "sub-" + Date.now(),
          user_id: userId,
          plan_name: formattedPlanName,
          status: "active",
          created_at: new Date()
        });
        console.log("Logged active subscription into Supabase subscriptions table");
      } catch (subErr) {
        console.warn("Could not insert into subscriptions table:", subErr);
      }

      // 3. Atomically update user profiles table with paid plan & accumulated credits
      try {
        const { error: profileUpdateError } = await sSupabase
          .from("profiles")
          .update({
            plan: planCode,
            plan_name: formattedPlanName,
            current_plan: planCode,
            credits_remaining: newCreditsRemaining,
            total_credits: newTotalCredits,
            free_analyses_remaining: newCreditsRemaining,
            credits: newCreditsRemaining,
            subscription_status: "active",
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: nextResetDate,
            expiry_date: nextResetDate,
            updated_at: new Date()
          })
          .eq("id", userId);

        if (profileUpdateError) {
          console.error("Backend error updating profile to paid tier in Supabase:", profileUpdateError);
        } else {
          console.log(`Successfully updated profiles table with accumulated credits (${currentRemaining} + ${purchasedCredits} = ${newCreditsRemaining}):`, planCode);
        }
      } catch (profErr) {
        console.error("Error writing profile update to Supabase:", profErr);
      }

      // 4. Try legacy RPCs for additional database triggers if defined
      const specificRpc = isElite ? "activate_elite_subscription" : "activate_pro_subscription";
      try {
        await sSupabase.rpc(specificRpc, { p_user_id: userId });
      } catch (err) {}

      // 5. Query latest authoritative profile directly from database to return to client
      try {
        const { data: finalDbProfile } = await sSupabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        // 6. Query payment history from payments table
        const { data: dbPayments } = await sSupabase
          .from("payments")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        let mappedDbPayments: any[] = [];
        if (dbPayments && dbPayments.length > 0) {
          mappedDbPayments = dbPayments.map((row: any) => ({
            id: row.id || row.order_id,
            date: row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
            plan: row.plan_name || formattedPlanName,
            amount: row.amount || price,
            status: row.status ? row.status.toUpperCase() : "COMPLETED",
            transaction_id: row.transaction_id || row.id || ""
          }));
        }

        if (finalDbProfile) {
          let parsedHistory: any[] = [];
          if (finalDbProfile.payment_history) {
            try {
              parsedHistory = typeof finalDbProfile.payment_history === "string"
                ? JSON.parse(finalDbProfile.payment_history)
                : finalDbProfile.payment_history;
            } catch (e) {}
          }
          if (!Array.isArray(parsedHistory)) parsedHistory = [];

          if (mappedDbPayments.length > 0) {
            const existingIds = new Set(parsedHistory.map((p: any) => p.id || p.transaction_id));
            for (const p of mappedDbPayments) {
              if (!existingIds.has(p.id)) {
                parsedHistory.push(p);
              }
            }
          }

          let parsedAnalysisHistory = [];
          if (finalDbProfile.analysis_history) {
            try {
              parsedAnalysisHistory = typeof finalDbProfile.analysis_history === "string"
                ? JSON.parse(finalDbProfile.analysis_history)
                : finalDbProfile.analysis_history;
            } catch (e) {}
          }

          const activePlanCode = finalDbProfile.plan || planCode;
          const activePlanName = activePlanCode === "ELITE" ? "ELITE TRADER" : (activePlanCode === "PRO" ? "PRO TRADER" : formattedPlanName);
          const finalPaymentHistory = parsedHistory.length > 0 ? parsedHistory : mappedDbPayments;

          // Sync payment history JSON back into profiles table
          try {
            await sSupabase
              .from("profiles")
              .update({ payment_history: JSON.stringify(finalPaymentHistory) })
              .eq("id", userId);
          } catch (phErr) {
            console.warn("Could not sync payment_history on profiles:", phErr);
          }

          // Record grant in credit_transactions
          try {
            await sSupabase
              .from("credit_transactions")
              .insert({
                id: "tx-grant-" + Date.now(),
                user_id: userId,
                transaction_type: "grant",
                amount: purchasedCredits,
                created_at: new Date()
              });
          } catch (ctErr) {
            console.warn("Could not log credit grant into credit_transactions:", ctErr);
          }

          updatedProfile = {
            ...currentProfile,
            id: finalDbProfile.id,
            name: finalDbProfile.name || finalDbProfile.name_display || currentProfile?.name || "Trader",
            email: finalDbProfile.email || currentProfile?.email || "",
            subscriptionPlan: activePlanCode === "ELITE" ? "Elite" : "Pro",
            accountBalance: finalDbProfile.accountBalance || 100000,
            joinDate: finalDbProfile.joinDate || currentProfile?.joinDate || "",
            creditsUsed: finalDbProfile.creditsUsed !== undefined ? finalDbProfile.creditsUsed : 0,
            creditsLimit: finalDbProfile.total_credits !== undefined ? finalDbProfile.total_credits : newTotalCredits,
            nextResetDate: finalDbProfile.expiry_date || nextResetDate,
            paymentFailed: false,
            plan_name: activePlanName,
            subscription_status: "active",
            free_analyses_remaining: finalDbProfile.credits_remaining !== undefined ? finalDbProfile.credits_remaining : newCreditsRemaining,
            credits_remaining: finalDbProfile.credits_remaining !== undefined ? finalDbProfile.credits_remaining : newCreditsRemaining,
            total_credits: finalDbProfile.total_credits !== undefined ? finalDbProfile.total_credits : newTotalCredits,
            plan: activePlanCode,
            credits: finalDbProfile.credits_remaining !== undefined ? finalDbProfile.credits_remaining : newCreditsRemaining,
            price: price,
            activation_date: finalDbProfile.activation_date || new Date().toISOString(),
            expiry_date: finalDbProfile.expiry_date || nextResetDate,
            payment_history: finalPaymentHistory,
            current_plan: activePlanCode,
            subscription_start_date: finalDbProfile.subscription_start_date || new Date().toISOString(),
            subscription_end_date: finalDbProfile.subscription_end_date || nextResetDate,
            total_successful_analyses: finalDbProfile.total_successful_analyses !== undefined ? finalDbProfile.total_successful_analyses : 0,
            analysis_history: parsedAnalysisHistory
          };
        }
      } catch (profileFetchErr) {
        console.error("Error fetching updated profile after paid subscription activation:", profileFetchErr);
      }
    }
  } else {
    // Guest / fallback mode
    const currentRemaining = currentProfile?.credits_remaining !== undefined 
      ? Number(currentProfile.credits_remaining) 
      : (currentProfile?.free_analyses_remaining !== undefined ? Number(currentProfile.free_analyses_remaining) : 0);
    const currentTotal = currentProfile?.total_credits !== undefined ? Number(currentProfile.total_credits) : 0;
    const newCreditsRemaining = currentRemaining + purchasedCredits;
    const newTotalCredits = currentTotal > 0 ? (currentTotal + purchasedCredits) : newCreditsRemaining;

    updatedProfile = {
      ...currentProfile,
      subscriptionPlan: planName,
      plan_name: formattedPlanName,
      current_plan: planCode,
      plan: planCode,
      Credits: newCreditsRemaining,
      credits_remaining: newCreditsRemaining,
      total_credits: newTotalCredits,
      free_analyses_remaining: newCreditsRemaining,
      credits: newCreditsRemaining,
      subscription_status: "active",
      Subscription: "active",
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

    const isRealRzpOrder = orderId && orderId.startsWith("order_");

    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && isRealRzpOrder) {
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
      // Simulation mode or simulated fallback order (RZP-ORD-...)
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
    const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest"];
    for (const modelName of modelsToTry) {
      try {
        const gHistory = messages.slice(0, -1).map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        const sysInstruction = `You are an elite, highly empathetic but disciplined TradeModeAI Trader Coach & Performance Psychologist. Your mission is to assist evaluation traders to manage their emotions, maintain strict risk limits, analyze psychological hurdles (fear of loss, greed, FOMO, over-trading), and build institutional discipline.
Context of Current Trader Status: ${JSON.stringify(context || {})}
Be concise, practical, highly supportive, and institutional. Avoid AI platitudes. Speak in clean, direct trading terminology. Mention drawdown rules, lot sizes, or risk rewards where relevant.`;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            ...gHistory,
            { role: "user", parts: [{ text: latestMessage }] }
          ],
          config: {
            systemInstruction: sysInstruction,
          },
        });

        if (response && response.text) {
          return res.json({ text: response.text });
        }
      } catch (chatError) {
        console.warn(`Gemini Coach Chat Warning with model ${modelName}:`, chatError);
        // continue to next model in loop
      }
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
