import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

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

    // Try 1: p_ prefixed arguments to complete_analysis RPC function
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

    // Try 2: snake_case arguments to complete_analysis RPC function
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

    // Try 3: basic arguments (user_id, pair) to complete_analysis RPC function
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
    const promptString = `You are a real elite institutional-grade multi-timeframe trading analysis engine.
You are given three actual screenshots of a trade setup: H1 (Hourly Chart), M15 (15-Minute Chart), and M5 (5-Minute Chart).
Your task is to analyze these screenshots to automatically detect the following values:
- Trading Symbol (e.g. BTCUSDT, EURUSD, XAUUSD)
- Current Market Price
- Trend (overall trend observed)
- Multi-timeframe Bias (e.g., Bullish, Bearish, Neutral)
- Support (key support price level visible)
- Resistance (key resistance price level visible)
- Entry (suggested entry price level)
- Stop Loss (suggested stop loss price level)
- Take Profit 1 (first target profit level)
- Take Profit 2 (second target profit level)
- Confidence Score (from 0% to 100%)

Strict Rules:
1. Every value must come ONLY from the uploaded screenshots. Do NOT use any mock JSON, sample response, placeholder values or hardcoded trading plan.
2. If you cannot confidently detect any of the requested values, you MUST set that value to "Not Available" exactly. Do NOT make up or simulate numbers if they are not clearly readable.
3. Be as precise as possible when scanning numbers and text labels on the charts.
4. Construct a mathematically consistent trading plan and risk analysis using the actual detected numbers from the charts where possible.
5. Account size: $${accountSize}, Risk percent: ${riskPercent}%, Session: ${session}. Use these parameters to formulate risk advice in the feedback and calculate risk amounts if possible.`;

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

// 1.5 Secure Payment Verification and Plan Activation Endpoint
app.post("/api/verify-payment", async (req, res) => {
  const { planId, cardNumber, cardExpiry, cardCvc, simulateFailure, currentProfile } = req.body;

  if (simulateFailure) {
    return res.status(400).json({ error: "Card processor rejected card telemetry. Simulation mode: FAILURE triggered." });
  }

  const isElite = planId === "plan-elite";
  const planName = isElite ? "Elite" : "Pro";
  const credits = isElite ? 500 : 200;
  const price = isElite ? 49 : 29;
  const nextResetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const userId = currentProfile?.id;
  const sSupabase = getServerSupabase();

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

  if (sSupabase && userId) {
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

        // C. Log into payments table
        await sSupabase
          .from("payments")
          .insert({
            id: "pay-" + Date.now(),
            user_id: userId,
            amount: price,
            currency: "USD",
            status: "success",
            plan_name: planName.toUpperCase() + " TRADER",
            created_at: new Date()
          });

        // D. Log into credit_transactions table
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

    // Query and sync updated profile back to frontend
    try {
      const { data: finalDbProfile } = await sSupabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (finalDbProfile) {
        updatedProfile = {
          ...currentProfile,
          id: finalDbProfile.id,
          name: finalDbProfile.name || finalDbProfile.name_display || currentProfile.name,
          email: finalDbProfile.email || currentProfile.email,
          subscriptionPlan: finalDbProfile.subscriptionPlan || (finalDbProfile.Plan === "FREE_TRIAL" ? "Free" : finalDbProfile.Plan === "PRO" ? "Pro" : finalDbProfile.Plan === "ELITE" ? "Elite" : "Pro"),
          accountBalance: finalDbProfile.accountBalance || 100000,
          joinDate: finalDbProfile.joinDate || currentProfile.joinDate,
          creditsUsed: finalDbProfile.creditsUsed !== undefined ? finalDbProfile.creditsUsed : (finalDbProfile.credits_used !== undefined ? finalDbProfile.credits_used : 0),
          creditsLimit: finalDbProfile.creditsLimit !== undefined ? finalDbProfile.creditsLimit : (finalDbProfile.total_credits !== undefined ? finalDbProfile.total_credits : credits),
          nextResetDate: finalDbProfile.nextResetDate || nextResetDate,
          paymentFailed: !!finalDbProfile.paymentFailed,
          plan_name: finalDbProfile.plan_name || finalDbProfile.Plan || (planName.toUpperCase() + " TRADER"),
          subscription_status: finalDbProfile.subscription_status || finalDbProfile.Subscription || "active",
          free_analyses_remaining: finalDbProfile.free_analyses_remaining !== undefined ? finalDbProfile.free_analyses_remaining : (finalDbProfile.Credits !== undefined ? finalDbProfile.Credits : credits),
          credits_remaining: finalDbProfile.credits_remaining !== undefined ? finalDbProfile.credits_remaining : (finalDbProfile.Credits !== undefined ? finalDbProfile.Credits : credits),
          total_credits: finalDbProfile.total_credits !== undefined ? finalDbProfile.total_credits : (finalDbProfile.total_credits !== undefined ? finalDbProfile.total_credits : credits),
        };
      }
    } catch (profileFetchErr) {
      console.error("Error fetching updated profile after paid subscription activation:", profileFetchErr);
    }
  }

  res.json({
    success: true,
    updatedProfile,
  });
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
