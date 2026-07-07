import React, { createContext, useContext, useState, useRef } from "react";
import { AIAnalysisRecord, AIAnalysisResult, UserProfile } from "../types";
import { useSubscription } from "./SubscriptionContext";

export type AnalysisStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface AnalysisJob {
  id: string;
  pair: string;
  accountSize: number;
  riskPercent: number;
  session: string;
  h1Chart: string;
  m15Chart: string;
  m5Chart: string;
  status: AnalysisStatus;
  result: AIAnalysisResult | null;
  error: string | null;
  createdAt: string;
}

interface AnalysisContextType {
  currentJob: AnalysisJob | null;
  status: AnalysisStatus;
  startAnalysis: (params: {
    pair: string;
    accountSize: number;
    riskPercent: number;
    session: string;
    h1Chart: string;
    m15Chart: string;
    m5Chart: string;
    userId?: string;
  }) => Promise<void>;
  cancelAnalysis: () => void;
  clearJob: () => void;
  notificationDismissed: boolean;
  setNotificationDismissed: (val: boolean) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}

interface AnalysisProviderProps {
  children: React.ReactNode;
  analyses: AIAnalysisRecord[];
  onAddAnalysis: (analysis: Omit<AIAnalysisRecord, "id" | "date">) => void;
}

export function AnalysisProvider({ children, analyses, onAddAnalysis }: AnalysisProviderProps) {
  const { profile, updateProfileState } = useSubscription();
  const [currentJob, setCurrentJob] = useState<AnalysisJob | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("QUEUED");
  const [notificationDismissed, setNotificationDismissed] = useState(true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const originalProfileRef = useRef<UserProfile | null>(null);

  const startAnalysis = async (params: {
    pair: string;
    accountSize: number;
    riskPercent: number;
    session: string;
    h1Chart: string;
    m15Chart: string;
    m5Chart: string;
    userId?: string;
  }) => {
    // 1. Immediately validate credits
    const limit = profile.total_credits !== undefined ? profile.total_credits : profile.creditsLimit;
    const remainingCredits = profile.credits_remaining !== undefined 
      ? profile.credits_remaining 
      : Math.max(0, limit - profile.creditsUsed);

    if (profile.paymentFailed) {
      throw new Error("Subscription payment required. Renew your plan to continue using AI analysis.");
    }
    if (remainingCredits <= 0) {
      throw new Error("Analysis blocked. You have used all available credits. Please upgrade your plan.");
    }

    // Capture original profile to restore in case of failure or cancellation
    originalProfileRef.current = { ...profile };

    // 2. Reserve 1 credit immediately visually
    const reservedRemaining = Math.max(0, remainingCredits - 1);
    const reservedUsed = profile.creditsUsed + 1;
    const reservedProfile: UserProfile = {
      ...profile,
      credits_remaining: reservedRemaining,
      free_analyses_remaining: reservedRemaining,
      credits: reservedRemaining,
      creditsUsed: reservedUsed,
    };
    updateProfileState(reservedProfile);

    // 3. Create analysis job & Mark status = RUNNING
    const jobId = "job-" + Date.now();
    const newJob: AnalysisJob = {
      id: jobId,
      ...params,
      status: "RUNNING",
      result: null,
      error: null,
      createdAt: new Date().toISOString(),
    };

    setCurrentJob(newJob);
    setStatus("RUNNING");
    setNotificationDismissed(true);

    // Set up AbortController for cancellation
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/analyze-trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pair: params.pair,
          accountSize: params.accountSize,
          riskPercent: params.riskPercent,
          session: params.session,
          h1Chart: params.h1Chart,
          m15Chart: params.m15Chart,
          m5Chart: params.m5Chart,
          profile, // Pass the original valid profile for backend check
          userId: params.userId || profile.id,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server was unable to complete the analysis blueprint.");
      }

      const { result: analysisResult, updatedProfile } = await response.json();

      // 4. Update the job state to COMPLETED
      const completedJob: AnalysisJob = {
        ...newJob,
        status: "COMPLETED",
        result: analysisResult,
      };
      setCurrentJob(completedJob);
      setStatus("COMPLETED");
      setNotificationDismissed(false); // Trigger floating completed notification

      // Save complete profile (returned from server with deducted credits)
      if (updatedProfile) {
        updateProfileState(updatedProfile);
      }

      // 5. Save completed analysis to database history
      onAddAnalysis({
        pair: params.pair,
        accountSize: params.accountSize,
        riskPercent: params.riskPercent,
        session: params.session,
        result: analysisResult,
        dateTime: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        creditsUsed: 1,
        status: "Success",
      } as any);

    } catch (err: any) {
      if (err.name === "AbortError" || status === "CANCELLED") {
        console.log("Analysis request aborted/cancelled.");
        return;
      }

      console.error("Analysis background request failed:", err);

      // Restore reserved credits back since it failed
      if (originalProfileRef.current) {
        updateProfileState(originalProfileRef.current);
      }

      const failedJob: AnalysisJob = {
        ...newJob,
        status: "FAILED",
        error: err.message || "An unexpected error occurred during background analysis.",
      };
      setCurrentJob(failedJob);
      setStatus("FAILED");
    } finally {
      abortControllerRef.current = null;
    }
  };

  const cancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Restore reserved credits back
    if (originalProfileRef.current) {
      updateProfileState(originalProfileRef.current);
    }

    if (currentJob) {
      setCurrentJob({
        ...currentJob,
        status: "CANCELLED",
        error: "Analysis was explicitly cancelled by user.",
      });
    }
    setStatus("CANCELLED");
  };

  const clearJob = () => {
    setCurrentJob(null);
    setStatus("QUEUED");
    setNotificationDismissed(true);
  };

  return (
    <AnalysisContext.Provider
      value={{
        currentJob,
        status,
        startAnalysis,
        cancelAnalysis,
        clearJob,
        notificationDismissed,
        setNotificationDismissed,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}
