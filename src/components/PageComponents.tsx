import React, { useState, useEffect } from "react";
import { 
  Check, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  BookOpen, 
  ShieldAlert, 
  Scale, 
  FileText, 
  DollarSign, 
  Lock, 
  UserPlus, 
  LogIn, 
  ArrowRight, 
  Star,
  Search,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Activity,
  Award,
  Sparkles,
  RefreshCw,
  Zap,
  Globe,
  Database,
  ArrowUpRight,
  Calculator,
  ChevronRight,
  Clock,
  Heart,
  Layers,
  Brain
} from "lucide-react";
import { SAAS_PLANS } from "../data";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

// Helper function to render a cohesive CTA Section
import { AIAnalysisResult } from "../types";
import { DEMO_ANALYSIS_CHANNELS } from "../data";

interface RouteProps {
  navigate: (path: string) => void;
  onLoginSuccess?: (name: string, email: string) => void;
  onSignupSuccess?: (name: string, email: string, plan: string) => void;
}

// Reuseable Common Header
export function SharedNavbar({ navigate, isDashboard = false }: { navigate: (path: string) => void; isDashboard?: boolean }) {
  return (
    <header className="border-b border-zinc-800/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-left cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="w-5 h-5 text-slate-950 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-400 via-sky-200 to-slate-100 bg-clip-text text-transparent">
              TradeModeAI
            </span>
            <span className="block text-[8px] font-mono tracking-widest text-blue-500 uppercase font-black">
              INSTITUTIONAL CORE
            </span>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-7 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          <button onClick={() => navigate("/features")} className="hover:text-blue-400 transition-colors cursor-pointer">Features</button>
          <button onClick={() => navigate("/pricing")} className="hover:text-blue-400 transition-colors cursor-pointer">Pricing</button>
          <button onClick={() => navigate("/faq")} className="hover:text-blue-400 transition-colors cursor-pointer">FAQ</button>
          <button onClick={() => navigate("/about")} className="hover:text-blue-400 transition-colors cursor-pointer">About Us</button>
          <button onClick={() => navigate("/contact")} className="hover:text-blue-400 transition-colors cursor-pointer">Contact</button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/login")}
            className="text-slate-300 hover:text-white transition-colors text-xs font-bold font-mono uppercase px-2.5 py-1.5 rounded-lg cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="bg-blue-500 hover:bg-blue-400 text-slate-950 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono tracking-wide transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          >
            FREE TRIAL
          </button>
        </div>
      </div>
    </header>
  );
}

// Reuseable Common Footer
export function SharedFooter({ navigate }: { navigate: (path: string) => void }) {
  return (
    <footer className="border-t border-zinc-800/60 bg-slate-950 pt-16 pb-10 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 text-left mb-12">
        {/* Brand Info */}
        <div className="col-span-2 lg:col-span-1 space-y-3.5">
          <div className="flex items-center gap-2" onClick={() => navigate("/")}>
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center cursor-pointer">
              <Activity className="w-4.5 h-4.5 text-slate-950" />
            </div>
            <span className="font-extrabold text-xs text-white font-mono tracking-tight cursor-pointer">TradeModeAI</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed max-w-xs font-mono">
            Intraday model evaluation, risk calibration analytics, and vision-model multi-timeframe scans.
          </p>
        </div>

        {/* Product column */}
        <div>
          <h4 className="font-mono text-xs uppercase text-slate-300 font-bold tracking-wider mb-3">Product</h4>
          <ul className="space-y-2 text-xs text-slate-500 font-mono">
            <li><button onClick={() => navigate("/features")} className="hover:text-blue-400 transition-colors cursor-pointer">Features</button></li>
            <li><button onClick={() => navigate("/pricing")} className="hover:text-blue-400 transition-colors cursor-pointer">Pricing</button></li>
            <li><button onClick={() => navigate("/faq")} className="hover:text-blue-400 transition-colors cursor-pointer">FAQ</button></li>
          </ul>
        </div>

        {/* Company column */}
        <div>
          <h4 className="font-mono text-xs uppercase text-slate-300 font-bold tracking-wider mb-3">Company</h4>
          <ul className="space-y-2 text-xs text-slate-500 font-mono">
            <li><button onClick={() => navigate("/about")} className="hover:text-blue-400 transition-colors cursor-pointer">About Us</button></li>
            <li><button onClick={() => navigate("/contact")} className="hover:text-blue-400 transition-colors cursor-pointer">Contact Us</button></li>
          </ul>
        </div>

        {/* Legal columns */}
        <div>
          <h4 className="font-mono text-xs uppercase text-slate-300 font-bold tracking-wider mb-3">Legal Info</h4>
          <ul className="space-y-2 text-xs text-slate-500 font-mono">
            <li><button onClick={() => navigate("/privacy-policy")} className="hover:text-blue-400 transition-colors cursor-pointer">Privacy Policy</button></li>
            <li><button onClick={() => navigate("/terms")} className="hover:text-blue-400 transition-colors cursor-pointer">Terms & Conditions</button></li>
            <li><button onClick={() => navigate("/refund-policy")} className="hover:text-blue-400 transition-colors cursor-pointer">Refund Policy</button></li>
            <li><button onClick={() => navigate("/risk-disclaimer")} className="hover:text-blue-400 transition-colors cursor-pointer">Risk Disclaimer</button></li>
          </ul>
        </div>

        {/* Support columns */}
        <div>
          <h4 className="font-mono text-xs uppercase text-slate-300 font-bold tracking-wider mb-3">Support</h4>
          <ul className="space-y-2 text-xs text-slate-500 font-mono">
            <li><button onClick={() => navigate("/support")} className="hover:text-blue-400 transition-colors cursor-pointer">Help Center Status</button></li>
            <li><button onClick={() => navigate("/contact")} className="hover:text-blue-400 transition-colors cursor-pointer">Submit Support Ticket</button></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-500 text-xs font-mono text-center sm:text-left">
          &copy; 2026 TradeModeAI. All Rights Reserved.
        </p>
        <span className="text-slate-400 text-xs font-mono bg-slate-900 px-3 py-1 rounded border border-slate-805/60">
          SYSTEM HEALTH: <span className="text-emerald-400 font-bold">100% SECURE</span>
        </span>
      </div>
    </footer>
  );
}

// Custom CTA Section for Landing Sub-Pages
export function PageCTA({ navigate }: { navigate: (path: string) => void }) {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-zinc-800/40 text-center relative px-4 overflow-hidden">
      <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full max-w-xl mx-auto pointer-events-none" />
      <div className="max-w-2xl mx-auto relative space-y-5">
        <span className="text-[10px] font-mono text-blue-500 uppercase font-extrabold tracking-widest block">INSTANT EVALUATION SECURED</span>
        <h2 className="text-3xl font-black text-white tracking-tight">Ready to pass your valuation cleanly?</h2>
        <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
          Unlock standard metrics compliance and detailed psychological coaching now. Start your risk management evolution.
        </p>
        <div className="pt-3 flex justify-center gap-3">
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/10"
          >
            Start Free Trial
          </button>
          <button
            onClick={() => navigate("/demo")}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            View Demo Run
          </button>
        </div>
      </div>
    </section>
  );
}

// Global Persistent Navigation Toolbar requested
export function BackHomeBar({ navigate }: { navigate: (path: string) => void }) {
  const isAuth = typeof window !== "undefined" && localStorage.getItem("TRADEMODEAI_IS_AUTHENTICATED") === "true";
  return (
    <div className="bg-slate-950/90 border-b border-slate-900/80 sticky top-0 z-50 py-2.5 px-4 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            &larr; Back
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(isAuth ? "/dashboard" : "/")}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-820 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isAuth ? "Enter Portal" : "Humble Home Page"}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-400 text-slate-950 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            Launch Dashboard &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}


/* ---------------------------------
   FEATURES PAGE
--------------------------------- */
export function FeaturesPage({ navigate }: RouteProps) {
  const list = [
    {
      title: "Tri-Frame Convergence Analysis",
      desc: "Upload H1, M15, and M5 chart screenshots simultaneously. Our vision model aggregates multi-interval orderblocks and fair value gaps.",
      icon: <Layers className="w-5 h-5 text-blue-400" />
    },
    {
      title: "Strategic Portfolio Guardrails",
      desc: "Continuous telemetry on active account metrics and custom rules. Never breach daily risk limits again.",
      icon: <Award className="w-5 h-5 text-sky-400" />
    },
    {
      title: "Intraday Drawdown Warning Systems",
      desc: "Live, responsive warning indices calculating dynamic drawdown allowances strictly matched to your trading journal records.",
      icon: <ShieldAlert className="w-5 h-5 text-rose-450" />
    },
    {
      title: "Cognitive Psychology Desk",
      desc: "Combat London Session FOMO and revenge trading. Our built-in AI psychologist listens to your emotional states and recommends breathing triggers to stabilize actions.",
      icon: <Brain className="w-5 h-5 text-indigo-400" />
    },
    {
      title: "Adaptive Risk Calculator",
      desc: "Input capital parameters and custom stop distances to instantly receive mathematical position sizing recommendations.",
      icon: <Calculator className="w-5 h-5 text-emerald-400" />
    },
    {
      title: "Sharpe & Sortino Tracking",
      desc: "Compute real-time performance analytics curves, profits by session volumes, and edge-win rate levels instantly.",
      icon: <Activity className="w-5 h-5 text-purple-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow py-16 px-4 animate-fade-in max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[10px] font-mono text-blue-500 uppercase font-extrabold tracking-widest block bg-slate-900 border border-slate-800 rounded-full px-3 py-1 w-fit mx-auto">
            SYSTEM SPECIFICATION SHEET
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight leading-tight">
            Institutional Technical Features
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
            Explore our advanced vision-model trading stack engineered specifically to protect capital and speed up performance scaling metrics.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {list.map((item, idx) => (
            <div key={idx} className="p-6 bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-2xl space-y-4 transition-all">
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl w-fit">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-mono">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <PageCTA navigate={navigate} />
      <SharedFooter navigate={navigate} />
    </div>
  );
}


/* ---------------------------------
   PRICING PAGE
--------------------------------- */
export function PricingPage({
  navigate,
  isAuthenticated = false,
  activeProfile,
  onUpdateProfile
}: RouteProps & {
  isAuthenticated?: boolean;
  activeProfile?: any;
  onUpdateProfile?: (updated: any) => void;
}) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [checkoutPlan, setCheckoutPlan] = useState<any | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("369");
  const [acceptTermsCheckout, setAcceptTermsCheckout] = useState(true);
  const [checkoutError, setCheckoutError] = useState("");

  const handlePlanSelect = (plan: any) => {
    if (!isAuthenticated) {
      navigate("/signup");
    } else {
      navigate("/subscription");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-extrabold tracking-widest block bg-emerald-500/5 border border-emerald-500/15 rounded-full px-3.5 py-1 w-fit mx-auto">
            3 Free Analyses Available Before Upgrading First
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight uppercase">
            CHOOSE YOUR RADAR DEPTH
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-sans">
            Every analysis processes your H1 + M15 + M5 screenshot charts as a single comprehensive query, consuming only one (1) credit. Start with 3 free runs risk-free, no credit card required.
          </p>

          {/* Toggle Monthly/Yearly */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-xs font-mono ${billingCycle === "monthly" ? "text-white" : "text-slate-500"}`}>Monthly billing</span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="w-10 h-6 bg-blue-500/20 border border-blue-500/40 rounded-full relative p-0.5 pointer-events-auto cursor-pointer"
            >
              <div className={`w-4 h-4 bg-blue-500 rounded-full transition-transform ${billingCycle === "yearly" ? "translate-x-4" : ""}`} />
            </button>
            <span className={`text-xs font-mono flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-white" : "text-slate-500"}`}>
              Yearly billing <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">SAVE 20%</span>
            </span>
          </div>
        </div>

        {/* Two Plan Cards Centered Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-20">
          {SAAS_PLANS.map((plan) => {
            const isPopular = plan.id === "plan-pro";
            const computedPrice = billingCycle === "yearly" ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-7 relative flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? "bg-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10"
                    : "bg-slate-900/40 border border-slate-850 hover:border-slate-800"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-mono font-black py-1 px-4 rounded-full uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                )}
                {!isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-950 text-indigo-400 border border-slate-850 text-[10px] font-mono font-black py-1 px-4 rounded-full uppercase tracking-wider">
                    Best Value
                  </span>
                )}

                <div>
                  <div className="space-y-1 mb-4">
                    <h3 className="text-xl font-black text-white uppercase">{plan.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {plan.id === "plan-pro" ? "Ideal for regular traders" : "Elite toolkit for power traders"}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-5 border-b border-slate-850 pb-4">
                    <span className="text-4xl font-black text-white font-mono">${computedPrice}</span>
                    <span className="text-slate-500 text-xs font-mono">/ mo</span>
                  </div>

                  <ul className="space-y-3 mb-8 text-[11px] font-mono text-slate-300">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3 px-4 rounded-xl font-black font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isPopular
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-450 hover:to-teal-350 text-slate-950 shadow-md shadow-emerald-500/10"
                      : "bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Plan Comparison Table Section */}
        <div className="max-w-4xl mx-auto bg-slate-900/20 border border-slate-850/80 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center max-w-sm mx-auto space-y-1.5">
            <h3 className="text-md sm:text-lg font-bold text-white uppercase font-mono">FEATURING METRIC COMPARISON</h3>
            <p className="text-[10px] text-slate-500 font-mono">DIRECT SPECIFICATIONS & COVERAGES</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-450 text-[10px]">
                  <th className="py-3 px-2 uppercase font-extrabold">Feature / Capability</th>
                  <th className="py-3 px-2 uppercase font-extrabold text-blue-400">Pro Trader</th>
                  <th className="py-3 px-2 uppercase font-extrabold text-indigo-400 font-extrabold">Elite Trader</th>
                </tr>
              </thead>
              <tbody className="text-slate-305 divide-y divide-slate-900/60">
                <tr>
                  <td className="py-3 px-2 font-sans font-medium text-slate-100">Monthly AI Analysis Sessions</td>
                  <td className="py-3 px-2 text-emerald-450 font-bold">200 Credits</td>
                  <td className="py-3 px-2 text-emerald-450 font-bold">500 Credits</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-sans font-medium text-slate-100">Credit Deduction Rate</td>
                  <td className="py-3 px-2">1 Credit per report</td>
                  <td className="py-3 px-2">1 Credit per report</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-sans font-medium text-slate-100">Multi-Timeframe Screenshots (H1+M15+M5)</td>
                  <td className="py-3 px-2 text-emerald-400"><Check className="w-4 h-4 inline" /> Yes</td>
                  <td className="py-3 px-2 text-emerald-400"><Check className="w-4 h-4 inline" /> Yes</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-sans font-medium text-slate-100">Risk & Margin Calculators</td>
                  <td className="py-3 px-2 text-emerald-400"><Check className="w-4 h-4 inline" /> Yes</td>
                  <td className="py-3 px-2 text-emerald-400"><Check className="w-4 h-4 inline" /> Yes</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-sans font-medium text-slate-100">Challenge Dashboard and Journal</td>
                  <td className="py-3 px-2 text-emerald-400"><Check className="w-4 h-4 inline" /> Yes</td>
                  <td className="py-3 px-2 text-emerald-400"><Check className="w-4 h-4 inline" /> Yes</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-sans font-medium text-slate-100">Advanced SMC Pattern Analytics</td>
                  <td className="py-3 px-2 text-slate-500">Standard</td>
                  <td className="py-3 px-2 text-emerald-400 font-bold">Advanced Neural</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-sans font-medium text-slate-100">Server Execution Priority</td>
                  <td className="py-3 px-2 text-slate-500">Standard</td>
                  <td className="py-3 px-2 text-teal-400 font-bold">Ultra-Priority Priority</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-sans font-medium text-slate-100">Support Availability</td>
                  <td className="py-3 px-2 text-slate-350">Email Support</td>
                  <td className="py-3 px-2 text-teal-400 font-bold">Priority 24/7 Support</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <PageCTA navigate={navigate} />
      <SharedFooter navigate={navigate} />
    </div>
  );
}


/* ---------------------------------
   FAQ PAGE
--------------------------------- */
export function FaqPage({ navigate }: RouteProps) {
  const [search, setSearch] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const entries = [
    {
      q: "How does the AI analyze my multi-timeframe charts?",
      a: "Our system relies on multimodal vision transformers. By matching the structural order of liquidity blocks on H1 and identifying internal sweeps on M15, the AI maps entries on M5 with precision.",
      cat: "Technical"
    },
    {
      q: "Can I use this for multiple accounts simultaneously?",
      a: "Yes! Under the Pro and VIP plans, you can provision and switch portfolios instantly for up to 5 individual account segments, aligning metrics concurrently.",
      cat: "Account Setup"
    },
    {
      q: "What payment systems do you accept?",
      a: "We support Shopify Pay, Apple Pay, Stripe, and global visa/mastercards. Cryptographic stablecoins (USDT/USDC) can be processed through custom requests.",
      cat: "Billing"
    },
    {
      q: "Is there any software to install on my MT4 or MT5 terminal?",
      a: "No software download is needed. We built the platform as a browser-native workspace console. Simply snap and upload your chart screenshots or let our calculator guide risk parameters.",
      cat: "General"
    },
    {
      q: "Can I upgrade or cancel during my assessment phase?",
      a: "Definitely. Subscriptions are billed monthly. Cancel from your billing panel inside settings in a single tap before your monthly window closes.",
      cat: "Billing"
    },
    {
      q: "Does this violate third-party trading policies?",
      a: "No! This is an educational analysis and psychological coach desk. No trades are executed automatically on your terminals. You retain absolute control over manual inputs, adhering strictly to standard trading terms.",
      cat: "Safety"
    }
  ];

  const filtered = entries.filter(
    e => e.q.toLowerCase().includes(search.toLowerCase()) || e.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow py-16 px-4 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-4 mb-12">
          <span className="text-[10px] font-mono text-blue-500 uppercase font-extrabold tracking-widest block bg-slate-900 border border-slate-800 rounded-full px-3 py-1 w-fit mx-auto">
            KNOWLEDGE RESOLUTION DESK
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight text-center">
            Support FAQs
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Quickly search and locate diagnostic resolutions for the vision system, capital limits, and risk guardrails.
          </p>

          <div className="pt-6 max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for answers (e.g., drawdown, MT5, billing...)"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-10 py-3 text-xs outline-none focus:border-blue-500 transition-all font-mono placeholder:text-slate-500 text-slate-200"
            />
          </div>
        </div>

        {/* FAQ list */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {filtered.length === 0 ? (
            <div className="py-12 border border-dashed border-slate-850 text-center text-slate-500 text-xs font-mono rounded-2xl">
              No answers matching your criteria were scanned. Contact official support.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                      {item.q}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-950 px-2.5 py-1 text-slate-500 rounded border border-slate-850 font-semibold tracking-wider flex items-center shrink-0 uppercase">
                      {item.cat}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-3 border-t border-slate-850/40 text-xs sm:text-sm text-slate-400 leading-relaxed font-mono">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      <PageCTA navigate={navigate} />
      <SharedFooter navigate={navigate} />
    </div>
  );
}


/* ---------------------------------
   CONTACT PAGE
--------------------------------- */
export function ContactPage({ navigate }: RouteProps) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Setup Issue");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !msg) return;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow py-16 px-4 max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-10 items-start">
        {/* Contact info cards */}
        <div className="md:col-span-5 space-y-6">
          <span className="text-[10px] font-mono text-blue-500 uppercase font-extrabold tracking-widest block bg-slate-900 border border-slate-800 rounded-full px-3 py-1 w-fit">
            TELEMETRY NODE LOCATIONS
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight leading-none">
            Get in touch
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-mono">
            Our support officers monitor priority channels in New York, London, and Tokyo. Submit an analytical incident alert or billing request instantly.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 p-4 bg-slate-900/30 border border-slate-850 rounded-xl font-mono">
              <Mail className="w-4 h-4 text-blue-400" />
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase">SECURED GENERAL EMAIL</span>
                <span className="text-xs text-white">support@trademodeai.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-900/30 border border-slate-850 rounded-xl font-mono">
              <Phone className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase">HOTLINE ALERT LINE</span>
                <span className="text-xs text-white">+1 (800) 555-TRADE-AI</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-900/30 border border-slate-850 rounded-xl font-mono">
              <MapPin className="w-4 h-4 text-purple-400" />
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase">PHYSICAL CORE HEADQUARTERS</span>
                <span className="text-xs text-white">One World Trade Center, New York, NY 10007</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message form */}
        <div className="md:col-span-7 bg-slate-900/30 border border-slate-850 rounded-2xl p-6 sm:p-8 relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Send className="w-24 h-24 text-blue-500" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1 tracking-tight">Priority Incident Ticket</h3>
          <p className="text-[11px] text-slate-400 font-mono mb-6">ALL RESPONSE PIPELINES CURRENTLY ENGAGED</p>

          {sent ? (
            <div className="p-8 text-center space-y-4 border border-dashed border-blue-500/30 bg-blue-500/5 rounded-xl animate-fade-in">
              <Check className="w-10 h-10 text-blue-400 mx-auto bg-slate-950 p-2 rounded-full border border-blue-500/20" />
              <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Incident Logged successfully</h4>
              <p className="text-xs text-slate-4g0 max-w-sm mx-auto font-sans leading-relaxed">
                Your priority ticket hash code has been assigned code <b>#PA-7294</b>. A senior verification analyst will reach out within 15 minutes. Check your email.
              </p>
              <button onClick={() => setSent(false)} className="px-4 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs font-mono hover:bg-slate-900">
                Submit another ticket
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-mono text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold">Incident Topic</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-mono text-slate-200"
                  >
                    <option>Analysis Crash</option>
                    <option>Billing / Invoice Request</option>
                    <option>Plan Upgrade Problem</option>
                    <option>Custom Partnership Proposal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold">Message Details</label>
                <textarea
                  required
                  rows={4}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Describe your assessment requirements, current account balances, or account configurations..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-xs outline-none focus:border-blue-500 font-mono text-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <span>Dispatch Alert Signal</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </main>

      <PageCTA navigate={navigate} />
      <SharedFooter navigate={navigate} />
    </div>
  );
}


/* ---------------------------------
   ABOUT US PAGE
--------------------------------- */
export function AboutPage({ navigate }: RouteProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow py-16 px-4 max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-mono text-blue-500 uppercase font-extrabold tracking-widest block bg-slate-900 border border-slate-800 rounded-full px-3 py-1 w-fit mx-auto">
            CORPORATE ACCREDITATION SHEET
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight text-center">
            Managing Capital Wisely
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
            Our mission is simple: eliminate drawdown violation rates and help individual retail traders operate on institutional scales.
          </p>
        </div>

        {/* Corporate core blocks */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
          <div className="space-y-4 text-left">
            <h2 className="text-xl font-bold text-white font-mono uppercase tracking-tight text-blue-400">Our Backstory</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              Founded in 2024 by a coalition of institutional proprietary desk traders and vision model researchers, TradeModeAI bridges the gap between raw trading psychology and exact risk calculus.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              We realized that 94% of traders failures are not due to incorrect charts, but due to trailing drawdown parameters, emotional revenge scaling on high-risk currencies, or losing session direction.
            </p>
          </div>
          <div className="p-8 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-6">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono border-b border-slate-800 pb-2">Platform Credentials</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-2xl font-black text-white font-mono">1.3M+</span>
                <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">Traders Protected</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white font-mono">$1.4B+</span>
                <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">Monitored Volume</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white font-mono">95%</span>
                <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">Evaluation Success</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-white font-mono">0.05%</span>
                <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">Drawdown Breaches</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PageCTA navigate={navigate} />
      <SharedFooter navigate={navigate} />
    </div>
  );
}


/* ---------------------------------
   LOGIN PAGE
--------------------------------- */
export function LoginPage({ navigate, onLoginSuccess }: RouteProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("TRADEMODEAI_VERIFICATION_PENDING") === "true") {
      setErrorMsg("Please verify your email address to activate your TradeModeAI account.");
      localStorage.removeItem("TRADEMODEAI_VERIFICATION_PENDING");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email) return;

    if (isSupabaseConfigured && supabase) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          setIsLoading(false);
          return;
        }

        if (data.user && !data.user.email_confirmed_at) {
          // Block login by signing out immediately
          await supabase.auth.signOut();
          setErrorMsg("Please verify your email address to activate your TradeModeAI account.");
          setIsLoading(false);
          return;
        }

        let displayName = name;
        if (data.user) {
          // Attempt to retrieve profile name
          const { data: profileRow } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", data.user.id)
            .single();
          if (profileRow?.name) {
            displayName = profileRow.name;
          }
        }

        if (onLoginSuccess) {
          onLoginSuccess(displayName || "Pro Trader", email);
        }
        navigate("/dashboard");
      } catch (err: any) {
        setErrorMsg(err.message || "An authentication error occurred.");
      } finally {
        setIsLoading(false);
      }
    } else {
      if (onLoginSuccess) {
        onLoginSuccess(name || "Pro Trader", email);
      }
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow flex items-center justify-center p-4 py-16 animate-fade-in relative">
        <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full max-w-xl mx-auto pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-2xl p-6 sm:p-8 relative">
          <div className="text-center space-y-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center mx-auto shadow-md">
              <LogIn className="w-5.5 h-5.5 text-slate-950" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">Client Portal Entry</h1>
            <p className="text-[10px] text-slate-450 font-mono tracking-widest">SECURE TRANSACTION SECURITY HUB</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold">Trader Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-mono text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marcus@trademodeai.com"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-mono text-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-mono text-slate-200"
              />
            </div>

            <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-slate-400">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(e) => setIsDemo(e.target.checked)}
                  className="rounded border-slate-850 bg-slate-950 text-blue-500 outline-none"
                />
                Toggle Sandbox Grounding
              </label>
              <button
                type="button"
                onClick={() => {
                  setName("Demo Pilot");
                  setEmail("pilot@demo.com");
                  setPassword("demopass123");
                }}
                className="text-blue-400 hover:underline hover:text-blue-300"
              >
                Autofill Credentials
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-4 disabled:opacity-50"
            >
              <span>{isLoading ? "Synchronizing secure hub..." : "Connect to Secure Telemetry"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center font-mono text-[10px] text-slate-500 mt-6">
            New pilot? <button onClick={() => navigate("/signup")} className="text-blue-400 hover:underline">Provision free account</button>
          </p>
        </div>
      </main>

      <SharedFooter navigate={navigate} />
    </div>
  );
}


/* ---------------------------------
   SIGNUP PAGE
--------------------------------- */
export function SignupPage({ navigate, onSignupSuccess }: RouteProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Full Name is required.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Email Address is required.");
      return;
    }
    if (!password) {
      setErrorMsg("Password is required.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!terms) {
      setErrorMsg("You must accept the Terms & Conditions.");
      return;
    }

    // Email Normalization & Validation
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // Block disposable email domains
    const domain = cleanEmail.split("@")[1] || "";
    const disposableKeywords = [
      "temp-mail", "tempmail", "mailinator", "guerrillamail", "yopmail", 
      "10minutemail", "throwawaymail", "fakemail", "moakt", "sharklasers", 
      "maildrop", "dispostable", "getairmail", "boun.cr", "crazymailing", 
      "mailnesia", "mailcatch"
    ];
    if (disposableKeywords.some(keyword => domain.includes(keyword))) {
      setErrorMsg("Temporary or disposable email addresses are not supported. Please use a permanent email address.");
      return;
    }

    if (isSupabaseConfigured && supabase) {
      setIsLoading(true);
      try {
        // Query profiles table to check if account already exists with the normalized email
        const { data: existingProfiles, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", cleanEmail);

        if (existingProfiles && existingProfiles.length > 0) {
          setErrorMsg("An account already exists with this email. Please log in instead.");
          setIsLoading(false);
          return;
        }

        // Proceed to Supabase signUp
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: name,
            }
          }
        });

        if (error) {
          setErrorMsg(error.message);
          setIsLoading(false);
          return;
        }

        // If user already exists in Auth, identities will be an empty array
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setErrorMsg("An account already exists with this email. Please log in instead.");
          setIsLoading(false);
          return;
        }

        setSuccessMsg("Please verify your email address to activate your TradeModeAI account.");
      } catch (err: any) {
        setErrorMsg(err.message || "An authentication error occurred.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local Bypass Mode Flow
      const localProfile = localStorage.getItem("TRADEMODEAI_REAL_PROFILE");
      if (localProfile) {
        try {
          const prof = JSON.parse(localProfile);
          if (prof.email && prof.email.trim().toLowerCase() === cleanEmail) {
            setErrorMsg("An account already exists with this email. Please log in instead.");
            return;
          }
        } catch (e) {}
      }

      if (onSignupSuccess) {
        onSignupSuccess(name, cleanEmail, "Free");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow flex items-center justify-center p-4 py-16 animate-fade-in relative">
        <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full max-w-xl mx-auto pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900 border border-slate-850 rounded-2xl p-6 sm:p-8 relative">
          <div className="text-center space-y-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center mx-auto shadow-md">
              <UserPlus className="w-5.5 h-5.5 text-slate-950 animate-bounce" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">Provision Assessment Entry</h1>
            <p className="text-[10px] text-slate-450 font-mono tracking-widest uppercase">CREATE YOUR FREE ACCOUNT TO START RUNS</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-mono text-[10px] text-center uppercase tracking-wide">
              {errorMsg}
            </div>
          )}

          {successMsg ? (
            <div className="space-y-6 py-4 text-center">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 font-mono text-xs leading-relaxed uppercase tracking-wider">
                {successMsg}
              </div>
              <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
                Check your inbox for a confirmation email. Once verified, you can access your portal.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-400 hover:to-sky-300 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Login</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-black">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marcus Vance"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-mono text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-black">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="marcus@trademodeai.com"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-mono text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-black">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-mono text-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-slate-500 font-black">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-blue-500 font-mono text-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-400">
                <input
                  type="checkbox"
                  required
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="rounded border-slate-850 bg-slate-950 text-blue-500 outline-none cursor-pointer"
                />
                <span>I agree to Terms & Conditions</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-400 hover:to-sky-300 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-4 disabled:opacity-50"
              >
                <span>{isLoading ? "Provisioning portal account..." : "Create Free Account"}</span>
              </button>
            </form>
          )}

          <p className="text-center font-mono text-[10px] text-slate-500 mt-6">
            Already configured? <button onClick={() => navigate("/login")} className="text-blue-400 hover:underline">Access my portal</button>
          </p>
        </div>
      </main>

      <SharedFooter navigate={navigate} />
    </div>
  );
}


/* ---------------------------------
   DEMO RUN PAGE
--------------------------------- */
export function DemoPage({ navigate }: RouteProps) {
  const result: AIAnalysisResult = DEMO_ANALYSIS_CHANNELS;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow py-12 px-4 max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-mono text-blue-500 uppercase font-extrabold tracking-widest block bg-slate-900 border border-slate-800 rounded-full px-3 py-1 w-fit mx-auto">
            LIVE PRE-POPULATED DECK REPORT
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight text-center">
            Gold (XAUUSD) Analysis Demo
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Witness how the platform processes multi-interval FVG elements, risk parameters, and orderblocks inside real-time metrics.
          </p>
        </div>

        {/* Dynamic Mock Interactive Chart Box */}
        <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-xs font-bold rounded">
                PAIR: XAUUSD
              </div>
              <span className="text-slate-500 text-xs font-mono">NY Session (London/US overlap)</span>
            </div>
            <span className="text-emerald-400 text-xs font-bold font-mono tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded mt-2 sm:mt-0">
              HIGH CONFIDENCE BIAS: BULLISH
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4 text-left font-mono text-xs">
              <h3 className="text-slate-200 font-bold border-b border-slate-800 pb-2">Multi-Frame Direction</h3>
              <p className="text-slate-400"><b>H1 Structure:</b> Bullish market displacement from 2304.50; Order Block validated.</p>
              <p className="text-slate-400"><b>M15 Confirmation:</b> Fair Value Gap filled perfectly at 2311.20 with rapid buying reaction.</p>
              <p className="text-slate-400"><b>M5 Entry Trigger:</b> Double bottom retest along micro liquidity sweeps.</p>

              <h3 className="text-slate-200 font-bold border-b border-slate-800 pb-2 pt-2">Trade Execution Levels</h3>
              <p className="text-slate-400"><b>Recommended Entry limit:</b> ${result.tradePlan.suggestedEntry} USD</p>
              <p className="text-rose-400"><b>Stop Loss protection limit:</b> ${result.tradePlan.stopLoss} USD</p>
              <p className="text-emerald-400"><b>Take Profit 1:</b> ${result.tradePlan.takeProfit1} USD</p>
              <p className="text-emerald-400"><b>Take Profit 2:</b> ${result.tradePlan.takeProfit2} USD</p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4 text-left font-mono">
              <h3 className="text-teal-400 text-xs font-bold border-b border-slate-900 pb-2">Risk Coefficient Calibration</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Max Risk Alloc</span>
                  <span className="font-bold text-white">${result.riskAnalysis.riskAmountDollars.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Optimal Lot Size</span>
                  <span className="font-bold text-white">{result.riskAnalysis.recommendedLotSize} LOTS</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">Reward factor</span>
                  <span className="font-bold text-white">{result.riskAnalysis.riskRewardRatio} R:R</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px]">AI Win Rate Prob</span>
                  <span className="font-bold text-emerald-400">{result.riskAnalysis.probabilityScore}%</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-900/60 block text-[11px] text-zinc-400 italic">
                "Stop mitigation is configured outside NYC liquidity low limits. Adhering to these bounds minimizes the chance of a premature stop-hunt."
              </div>
            </div>
          </div>
        </div>
      </main>

      <PageCTA navigate={navigate} />
      <SharedFooter navigate={navigate} />
    </div>
  );
}


/* ---------------------------------
   PRIVACY POLICY PAGE
--------------------------------- */
export function PrivacyPolicyPage({ navigate }: RouteProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow py-16 px-4 max-w-4xl mx-auto w-full space-y-8 text-left">
        <h1 className="text-3xl font-black text-white font-mono uppercase tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-500 font-mono">LAST REVISED: JUNE 22, 2026</p>

        <section className="space-y-4 text-slate-300 font-sans text-sm leading-relaxed">
          <p>
            At TradeModeAI, we prioritize protecting your trading metrics and diagnostic chart uploads. This policy delineates how we handle, store, and utilize your personal information and diagnostic screenshot assets.
          </p>

          <h3 className="text-base font-bold text-white font-mono uppercase pt-4 border-b border-slate-850 pb-2">1. Data Collection Methods</h3>
          <p>
            We process standard credentials (such as name, email) and interactive uploads (H1, M15, M5 chart snapshots). These components are processed to provide real-time vision diagnostics. No files are shared with third-party advertising companies.
          </p>

          <h3 className="text-base font-bold text-white font-mono uppercase pt-4 border-b border-slate-850 pb-2">2. Local Workspace Isolation</h3>
          <p>
            Your trade journal logs, emotional metadata entries, and portfolio balances are stored locally in your browser workspace cache. They can also securely populate your cloud configuration, if enabled.
          </p>
        </section>
      </main>

      <SharedFooter navigate={navigate} />
    </div>
  );
}


/* ---------------------------------
   TERMS & CONDITIONS PAGE
--------------------------------- */
export function TermsPage({ navigate }: RouteProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow py-16 px-4 max-w-4xl mx-auto w-full space-y-8 text-left">
        <h1 className="text-3xl font-black text-white font-mono uppercase tracking-tight">Terms & Conditions</h1>
        <p className="text-xs text-slate-500 font-mono">EFFECTIVE DATE: JUNE 22, 2026</p>

        <section className="space-y-4 text-slate-300 font-sans text-sm leading-relaxed">
          <p>
            Welcome to the TradeModeAI operational suite. By utilizing our analysis console, custom interactive risk models, or psychology coaching, you agree to these bounds.
          </p>

          <h3 className="text-base font-bold text-white font-mono uppercase pt-4 border-b border-slate-850 pb-2">1. Educational Purpose Constraints</h3>
          <p>
            My platform provides analytical metrics, educational position lot evaluations, and emotional diagnostics. No trade is placed automatically on any broker portal. We do not act as licensed financial advisors.
          </p>

          <h3 className="text-base font-bold text-white font-mono uppercase pt-4 border-b border-slate-850 pb-2">2. Evaluation Safety Compliance</h3>
          <p>
            Traders are solely responsible for ensuring manual compliance with drawdown rules. TradeModeAI is helper educational SaaS, not guaranteed legal insurance.
          </p>
        </section>
      </main>

      <SharedFooter navigate={navigate} />
    </div>
  );
}


/* ---------------------------------
   REFUND POLICY PAGE
--------------------------------- */
export function RefundPolicyPage({ navigate }: RouteProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow py-16 px-4 max-w-4xl mx-auto w-full space-y-8 text-left">
        <h1 className="text-3xl font-black text-white font-mono uppercase tracking-tight">Refund Policy</h1>
        <p className="text-xs text-slate-500 font-mono">EFFECTIVE DATE: JUNE 22, 2026</p>

        <section className="space-y-4 text-slate-300 font-sans text-sm leading-relaxed">
          <p>
            We take pride in our multi-timeframe analytical pipeline. However, we understand that prop evaluations can be challenging.
          </p>

          <h3 className="text-base font-bold text-white font-mono uppercase pt-4 border-b border-slate-850 pb-2">1. 14-Day Evaluation Window</h3>
          <p>
            You may request a 100% money-back refund on your initial SaaS plan within 14 calendar days of your transaction. No questions asked.
          </p>

          <h3 className="text-base font-bold text-white font-mono uppercase pt-4 border-b border-slate-850 pb-2">2. Custom Credit Adjustments</h3>
          <p>
            If you breached your account balance limits due to clear system malfunction on our UI, our billing department will issue VIP coaching credits as additional assistance.
          </p>
        </section>
      </main>

      <SharedFooter navigate={navigate} />
    </div>
  );
}


/* ---------------------------------
   RISK DISCLAIMER PAGE
--------------------------------- */
export function RiskDisclaimerPage({ navigate }: RouteProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow py-16 px-4 max-w-4xl mx-auto w-full space-y-8 text-left">
        <h1 className="text-3xl font-black text-white font-mono uppercase tracking-tight">Risk Disclaimer</h1>
        <p className="text-xs text-rose-500 font-mono font-bold uppercase">CRITICAL SECURITIES WARNING</p>

        <section className="space-y-4 text-slate-300 font-sans text-sm leading-relaxed border-l-2 border-rose-500/30 pl-4 py-1">
          <p className="font-bold text-white">
            Trading foreign exchange, indices, gold, or crypto tokens involves high levels of speculative risk.
          </p>
          <p>
            Leveraged financial contracts carry substantial risk of loss. Past performances of any custom model are never indicators of future success.
          </p>
          <p>
            All position lot recommendations, stop indicators, and target intervals are for simulation and learning purposes only. Only risk capital you can afford to lose.
          </p>
        </section>
      </main>

      <SharedFooter navigate={navigate} />
    </div>
  );
}


/* ---------------------------------
   SUPPORT PAGE / HELP CENTER
--------------------------------- */
export function SupportPage({ navigate }: RouteProps) {
  const categories = [
    { name: "Getting Started", count: 12, desc: "Account setup, workspace provisioning, and demo configuration." },
    { name: "Vision Model Failures", count: 8, desc: "Dealing with screenshot rendering or model analysis timeouts." },
    { name: "Drawdown Control Index", count: 5, desc: "Formulas, lot sizing, stop calculation mechanisms, and daily limits." },
    { name: "Billing Queries", count: 4, desc: "Invoices, rolling cancellations, plans, and credit updates." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <BackHomeBar navigate={navigate} />
      <SharedNavbar navigate={navigate} />

      <main className="flex-grow py-16 px-4 max-w-5xl mx-auto w-full space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-mono text-blue-500 uppercase font-extrabold tracking-widest block bg-slate-900 border border-slate-800 rounded-full px-3 py-1 w-fit mx-auto">
            HELP CENTER PROTOCOL
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight text-center">
            Help Center
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Need support calibrating your target objectives or resolving a billing error? Browse categories below.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {categories.map((c, idx) => (
            <div key={idx} className="p-6 bg-slate-900/40 border border-slate-850 hover:border-slate-800 rounded-2xl relative block text-left">
              <span className="absolute top-4 right-4 bg-blue-500/10 text-blue-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-blue-500/20">
                {c.count} FILES
              </span>
              <h3 className="text-base font-bold text-white font-mono mb-2">{c.name}</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">{c.desc}</p>
              <button onClick={() => navigate("/faq")} className="text-xs text-blue-400 font-mono font-bold hover:underline flex items-center gap-1">
                <span>View articles</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </main>

      <PageCTA navigate={navigate} />
      <SharedFooter navigate={navigate} />
    </div>
  );
}
