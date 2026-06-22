import React from "react";
import { 
  Sparkles, 
  ChevronRight, 
  Check, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Layers, 
  Calculator, 
  Activity, 
  Star, 
  HelpCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  User, 
  ArrowRight,
  Plus,
  Lock,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { SAAS_PLANS } from "../data";

interface LandingPageProps {
  onGetStarted: (plan: string) => void;
  onLogin: () => void;
  navigate: (path: string) => void;
}

export default function LandingPage({ onGetStarted, onLogin, navigate }: LandingPageProps) {
  // Live market price states
  const [prices, setPrices] = React.useState({
    XAUUSD: 2315.42,
    BTCUSD: 67250.00,
    EURUSD: 1.08642,
    GBPUSD: 1.26824,
  });

  const [trends, setTrends] = React.useState({
    XAUUSD: "up",
    BTCUSD: "down",
    EURUSD: "up",
    GBPUSD: "down",
  });

  React.useEffect(() => {
    const priceInterval = setInterval(() => {
      setPrices(prev => {
        const xauChange = (Math.random() - 0.48) * 0.8;
        const btcChange = (Math.random() - 0.52) * 50;
        const eurChange = (Math.random() - 0.49) * 0.00012;
        const gbpChange = (Math.random() - 0.51) * 0.00014;

        const nextXau = parseFloat((prev.XAUUSD + xauChange).toFixed(2));
        const nextBtc = parseFloat((prev.BTCUSD + btcChange).toFixed(1));
        const nextEur = parseFloat((prev.EURUSD + eurChange).toFixed(5));
        const nextGbp = parseFloat((prev.GBPUSD + gbpChange).toFixed(5));

        setTrends({
          XAUUSD: nextXau >= prev.XAUUSD ? "up" : "down",
          BTCUSD: nextBtc >= prev.BTCUSD ? "up" : "down",
          EURUSD: nextEur >= prev.EURUSD ? "up" : "down",
          GBPUSD: nextGbp >= prev.GBPUSD ? "up" : "down",
        });

        return {
          XAUUSD: nextXau,
          BTCUSD: nextBtc,
          EURUSD: nextEur,
          GBPUSD: nextGbp,
        };
      });
    }, 2000);

    return () => clearInterval(priceInterval);
  }, []);

  // Section 6: Why Traders Use Us - Count state animation
  const [tradersCount, setTradersCount] = React.useState(0);
  const [analysesCount, setAnalysesCount] = React.useState(0);
  const [ratingCount, setRatingCount] = React.useState(0);
  const [satisfactionCount, setSatisfactionCount] = React.useState(0);

  React.useEffect(() => {
    const duration = 1800; // 1.8 seconds total duration
    const steps = 40;
    const stepDuration = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setTradersCount(Math.min(1300, Math.floor((1300 / steps) * step)));
      setAnalysesCount(Math.min(50000, Math.floor((50000 / steps) * step)));
      setRatingCount(parseFloat(Math.min(4.8, (4.8 / steps) * step).toFixed(1)));
      setSatisfactionCount(Math.min(95, Math.floor((95 / steps) * step)));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  // Section 7: Testimonial Auto-slider
  const testimonials = [
    {
      text: "This platform helps me analyze Gold faster and stay disciplined.",
      stars: 5,
      author: "Marcus Vance",
      tag: "Prop Funded ($400k)",
      avatarColor: "bg-blue-500/20 text-blue-400"
    },
    {
      text: "This has become part of my daily trading routine.",
      stars: 5,
      author: "Sarah Jenkins",
      tag: "Gold Sniper Specialist",
      avatarColor: "bg-indigo-500/20 text-indigo-400"
    },
    {
      text: "The challenge tracker is incredible.",
      stars: 5,
      author: "Viktor Petrov",
      tag: "FTMO Master Trader",
      avatarColor: "bg-sky-500/20 text-sky-400"
    }
  ];

  const [activeTestimonial, setActiveTestimonial] = React.useState(0);

  React.useEffect(() => {
    const cycle = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(cycle);
  }, [testimonials.length]);

  // Section 9: FAQ Accordion state
  const [openFaq, setOpenFaq] = React.useState<number | null>(0); // First one open by default

  const faqItems = [
    {
      q: "How does the AI work?",
      a: "Our core AI processing suite takes your H1, M15, and M5 chart screenshots in tandem. Leveraging vision models combined with trained market patterns, it detects Fair Value Gaps (FVG), major Orderblocks, and liquidity sweeps across all three timeframes, distilling them into a single high-conviction intraday BIAS."
    },
    {
      q: "Do I need trading experience?",
      a: "While basic chart reading and terminology helps, our insights explicitly map out logical stop mitigation bounds and position lot calculations. It behaves like an institutional analyst over your shoulder, reducing risk for beginners."
    },
    {
      q: "Which markets are supported?",
      a: "We optimized our model for Gold (XAUUSD), Bitcoin (BTCUSD), EURUSD, and GBPUSD. It works seamlessly for any global financial indices or majors that follow institutional liquidity structures."
    },
    {
      q: "How many free analyses do I get?",
      a: "Every new registration receives 3 credits for high-resolution analyses on the Pro Tier. No credit card, no risk, setup takes 15 seconds."
    },
    {
      q: "How do subscriptions work?",
      a: "Our subscriptions run on a simple month-to-month, non-binding rolling window. You may upgrade for a critical evaluation phase or downgrade right from your Client Portal in one click."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-slate-900 overflow-x-hidden">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/3 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header / Navigation */}
      <header className="border-b border-zinc-800/40 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-left bg-transparent border-none cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Brain className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-400 via-sky-200 to-slate-100 bg-clip-text text-transparent">
                PropFirm AI Coach
              </span>
              <span className="block text-[9px] font-mono tracking-widest text-blue-500 uppercase font-black">
                INSTITUTIONAL SAAS CORE
              </span>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-8 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            <button onClick={() => navigate("/features")} className="hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none">How it works</button>
            <button onClick={() => navigate("/demo")} className="hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none">AI Demo</button>
            <button onClick={() => navigate("/features")} className="hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none">SaaS Features</button>
            <button onClick={() => navigate("/pricing")} className="hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none">Plans</button>
            <button onClick={() => navigate("/faq")} className="hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none">Support FAQ</button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="text-slate-300 hover:text-white transition-colors text-xs font-bold font-mono uppercase px-3 py-2 rounded-lg cursor-pointer bg-transparent border-none"
            >
              Client Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-blue-500 hover:bg-blue-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold font-mono tracking-wide active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-500/20"
            >
              FREE TRIAL <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section className="relative pt-16 pb-24 px-4 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-mono uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            V3.5 MULTI-TIMEFRAME ACTIVE
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            AI-Powered Multi-Timeframe <br/>
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Trading Analysis
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
            Upload H1, M15 and M5 charts and receive AI-generated market insights in seconds.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-400 hover:to-sky-300 text-slate-950 font-bold text-sm rounded-xl shadow-xl shadow-blue-500/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
            >
              Start Free Trial <ArrowUpRight className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => navigate("/demo")}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white font-medium text-sm rounded-xl active:scale-98 transition-all cursor-pointer"
            >
              View Demo Analysis
            </button>
          </div>
        </div>

        {/* Hero Right side: Animated trading dashboard preview */}
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-1 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl blur-lg opacity-15 animate-pulse-glow" />
          <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            {/* Window header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="ml-2 font-black text-[10px] tracking-widest text-slate-400 uppercase">SYS_CONSOLE_PRIME</span>
              </div>
              <span className="text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded text-[10px]">ACTIVE ANALYTICS</span>
            </div>

            {/* Dashboard Fields Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Win Rate */}
              <div className="p-4 bg-slate-950/60 border border-slate-850/80 rounded-xl relative overflow-hidden group">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  Win Rate
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-white">68.2%</span>
                  <span className="text-[9px] font-mono text-blue-400 font-bold uppercase tracking-wider">SECURE EDGE</span>
                </div>
                <div className="h-1 bg-blue-500/20 w-full rounded-full mt-3 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: "68.2%" }} />
                </div>
              </div>

              {/* Profit Target Progress */}
              <div className="p-4 bg-slate-950/60 border border-slate-850/80 rounded-xl relative overflow-hidden group">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-500" />
                  Profit Target
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-white">78.5%</span>
                  <span className="text-slate-400 text-[10px]">/ 100%</span>
                </div>
                {/* Progress ratio animation bar */}
                <div className="h-1.5 bg-slate-800 w-full rounded-full mt-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-500 h-full rounded-full" style={{ width: "78.5%" }} />
                </div>
              </div>

              {/* Challenge Status */}
              <div className="p-4 bg-slate-950/60 border border-slate-850/80 rounded-xl relative overflow-hidden group">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Challenge Status
                </span>
                <span className="block text-lg font-extrabold text-emerald-400 tracking-tight mt-1">
                  IN LIMITS
                </span>
                <span className="block text-[9px] font-mono text-slate-500 uppercase mt-1">
                  Daily Limit: $5,000 max
                </span>
              </div>

              {/* AI Analysis Score */}
              <div className="p-4 bg-slate-950/60 border border-slate-850/80 rounded-xl relative overflow-hidden group">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-blue-500" />
                  AI Analysis Score
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2.5xl font-black text-white">A+</span>
                  <span className="text-[10px] font-mono text-blue-400">92% Match</span>
                </div>
                <span className="block text-[9px] font-mono text-slate-500 uppercase mt-1">
                  SYSTEM LEVEL DETERMINED
                </span>
              </div>
            </div>

            {/* Glowing active metrics bar */}
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                H1, M15, M5 SYNCED
              </span>
              <span>100% LATENCY COMPLIANT</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: LIVE MARKET SECTION */}
      <section className="bg-slate-950 border-y border-zinc-800/60 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono text-blue-500 uppercase font-black tracking-widest block mb-2">LIVE PLATFORM TELEMETRY</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Active Operations Pipeline</h2>
            </div>
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 border border-slate-800 rounded-lg text-xs font-mono">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>MARKET FEEDS ACTIVE</span>
            </div>
          </div>

          {/* Cards wrapper */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* GOLD (XAUUSD) */}
            <div className="p-5 bg-slate-900/40 border border-slate-850 hover:border-blue-500/20 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-slate-500">XAUUSD</span>
                  <h3 className="text-lg font-black text-white tracking-tight">Gold Spot</h3>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${trends.XAUUSD === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {trends.XAUUSD === 'up' ? 'BULLISH' : 'BEARISH'}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">${prices.XAUUSD.toLocaleString()}</span>
                <span className={`text-xs font-mono flex items-center ${trends.XAUUSD === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trends.XAUUSD === 'up' ? '▲' : '▼'}
                </span>
              </div>
              {/* Sparkline canvas simulation with SVG */}
              <div className="h-10 mt-4 overflow-hidden relative">
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path 
                    d={trends.XAUUSD === 'up' ? "M0,35 Q15,10 30,28 T60,18 T90,5 T100,2" : "M0,15 Q15,35 30,12 T60,32 T90,26 T100,32"} 
                    fill="none" 
                    stroke={trends.XAUUSD === 'up' ? "#10b981" : "#ef4444"} 
                    strokeWidth="1.8" 
                  />
                </svg>
              </div>
            </div>

            {/* BITCOIN (BTCUSD) */}
            <div className="p-5 bg-slate-900/40 border border-slate-850 hover:border-blue-500/20 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-slate-500">BTCUSD</span>
                  <h3 className="text-lg font-black text-white tracking-tight">Bitcoin</h3>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${trends.BTCUSD === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {trends.BTCUSD === 'up' ? 'BULLISH' : 'BEARISH'}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">${prices.BTCUSD.toLocaleString()}</span>
                <span className={`text-xs font-mono flex items-center ${trends.BTCUSD === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trends.BTCUSD === 'up' ? '▲' : '▼'}
                </span>
              </div>
              {/* Sparkline */}
              <div className="h-10 mt-4 overflow-hidden relative">
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path 
                    d={trends.BTCUSD === 'up' ? "M0,30 Q20,15 40,25 T80,10 T100,5" : "M0,5 Q20,35 40,15 T80,30 T100,35"} 
                    fill="none" 
                    stroke={trends.BTCUSD === 'up' ? "#10b981" : "#ef4444"} 
                    strokeWidth="1.8" 
                  />
                </svg>
              </div>
            </div>

            {/* EURUSD */}
            <div className="p-5 bg-slate-900/40 border border-slate-850 hover:border-blue-500/20 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-slate-500">EURUSD</span>
                  <h3 className="text-lg font-black text-white tracking-tight">Euro / Dollar</h3>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${trends.EURUSD === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {trends.EURUSD === 'up' ? 'BULLISH' : 'BEARISH'}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{prices.EURUSD.toFixed(5)}</span>
                <span className={`text-xs font-mono flex items-center ${trends.EURUSD === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trends.EURUSD === 'up' ? '▲' : '▼'}
                </span>
              </div>
              {/* Sparkline */}
              <div className="h-10 mt-4 overflow-hidden relative">
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path 
                    d={trends.EURUSD === 'up' ? "M0,35 T25,15 T50,22 T75,12 T100,4" : "M0,8 T25,28 T50,15 T75,32 T100,35"} 
                    fill="none" 
                    stroke={trends.EURUSD === 'up' ? "#10b981" : "#ef4444"} 
                    strokeWidth="1.8" 
                  />
                </svg>
              </div>
            </div>

            {/* GBPUSD */}
            <div className="p-5 bg-slate-900/40 border border-slate-850 hover:border-blue-500/20 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-slate-500">GBPUSD</span>
                  <h3 className="text-lg font-black text-white tracking-tight">Pound / Dollar</h3>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${trends.GBPUSD === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {trends.GBPUSD === 'up' ? 'BULLISH' : 'BEARISH'}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{prices.GBPUSD.toFixed(5)}</span>
                <span className={`text-xs font-mono flex items-center ${trends.GBPUSD === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {trends.GBPUSD === 'up' ? '▲' : '▼'}
                </span>
              </div>
              {/* Sparkline */}
              <div className="h-10 mt-4 overflow-hidden relative">
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path 
                    d={trends.GBPUSD === 'up' ? "M0,32 Q25,8 50,22 T75,15 T100,3" : "M0,5 Q25,32 50,12 T75,28 T100,34"} 
                    fill="none" 
                    stroke={trends.GBPUSD === 'up' ? "#10b981" : "#ef4444"} 
                    strokeWidth="1.8" 
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Scrolling Marquee Ticker */}
          <div className="mt-12 bg-slate-900/40 border border-slate-850 py-3 rounded-xl overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-10" />
            <div className="animate-marquee flex items-center whitespace-nowrap gap-12 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-blue-500"/> PROP-INTELLIGENCE FEED</span>
              <span className="flex items-center gap-1">XAUUSD <span className="text-emerald-400">▲</span> ${(prices.XAUUSD).toFixed(2)}</span>
              <span className="flex items-center gap-1">BTCUSD <span className="text-red-400">▼</span> ${(prices.BTCUSD).toFixed(1)}</span>
              <span className="flex items-center gap-1">EURUSD <span className="text-emerald-400">▲</span> {(prices.EURUSD).toFixed(5)}</span>
              <span className="flex items-center gap-1">GBPUSD <span className="text-red-400">▼</span> {(prices.GBPUSD).toFixed(5)}</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500"/> HIGHEST EXECUTIONS ACTIVE</span>
              <span className="flex items-center gap-1">XAUUSD <span className="text-emerald-400">▲</span> ${(prices.XAUUSD).toFixed(2)}</span>
              <span className="flex items-center gap-1">BTCUSD <span className="text-red-400">▼</span> ${(prices.BTCUSD).toFixed(1)}</span>
              <span className="flex items-center gap-1">EURUSD <span className="text-emerald-400">▲</span> {(prices.EURUSD).toFixed(5)}</span>
              <span className="flex items-center gap-1">GBPUSD <span className="text-red-400">▼</span> {(prices.GBPUSD).toFixed(5)}</span>
              {/* Duplicate list to fill container scroll natively */}
              <span className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-blue-500"/> PROP-INTELLIGENCE FEED</span>
              <span className="flex items-center gap-1">XAUUSD <span className="text-emerald-400">▲</span> ${(prices.XAUUSD).toFixed(2)}</span>
              <span className="flex items-center gap-1">BTCUSD <span className="text-red-400">▼</span> ${(prices.BTCUSD).toFixed(1)}</span>
              <span className="flex items-center gap-1">EURUSD <span className="text-emerald-400">▲</span> {(prices.EURUSD).toFixed(5)}</span>
              <span className="flex items-center gap-1">GBPUSD <span className="text-red-400">▼</span> {(prices.GBPUSD).toFixed(5)}</span>
              <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500"/> HIGHEST EXECUTIONS ACTIVE</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-4 text-center">
        <span className="text-xs font-mono text-blue-500 uppercase font-black tracking-widest block mb-3">SYNAPTIC SCANNING INTERFACE</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">How It Works</h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-16 font-mono">3 SIMPLE STEPS TO MULTI-TIMEFRAME ALIGNMENT</p>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {/* Step 1 */}
          <div className="p-6 bg-slate-900/30 border border-slate-850 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black font-mono text-lg mb-6">
              01
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Upload 3 screenshots</h3>
            <p className="text-slate-400 text-sm mb-4">Provide snapshots of your technical charts under key intervals:</p>
            <div className="space-y-2 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded border border-slate-850">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>H1 Chart (HTF structure & liquidity)</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded border border-slate-850">
                <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                <span>M15 Chart (MTF key boundaries & FB)</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded border border-slate-850">
                <span className="w-2 h-2 bg-sky-500 rounded-full" />
                <span>M5 Chart (LTF entry sweeps & triggers)</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-slate-900/30 border border-slate-850 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black font-mono text-lg mb-6">
              02
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Neural Multi-Frame Synth</h3>
            <p className="text-slate-400 text-sm mb-5 leading-relaxed">
              AI analyzes all timeframes together. Our deep vision nodes synthesize multi-frame indicators, tracking liquidity pools, orderblocks and structural displacement inside the combined model.
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Brain className="w-4 h-4 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-blue-500/20 rounded w-2/3 mb-1" />
                  <div className="h-1.5 bg-indigo-500/10 rounded w-1/2" />
                </div>
              </div>
              <div className="mt-3 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Full structural integrity matched.
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-slate-900/30 border border-slate-850 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black font-mono text-lg mb-6">
              03
            </div>
            <h3 className="text-xl font-bold text-white mb-3">High-Conviction Scenarios</h3>
            <p className="text-slate-400 text-sm mb-4">
              Receive a complete market scenario including instant actionable elements:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-950 rounded border border-slate-850 flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Bias
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-850 flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Entry Zone
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-850 flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Stop Loss
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-850 flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Profit Zones
              </div>
              <div className="p-2 bg-slate-950 rounded border border-slate-850 flex items-center gap-1.5 text-slate-300 md:col-span-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Risk Reward Ratio
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: DEMO ANALYSIS */}
      <section id="demo" className="py-20 bg-slate-950/40 border-t border-zinc-800/40 relative">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono text-blue-500 uppercase font-black tracking-widest block mb-2">IMMERSIVE CONSOLE PREVIEW</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Demo Analysis</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Behold our live execution framework logic, displaying structural targets mapped for retail liquidity hunt sweeps on Gold. We verify demand balance bounds and recommend accurate risk-reward execution parameters.
            </p>
            <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl flex items-center gap-3.5 text-left">
              <span className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <Zap className="w-6 h-6" />
              </span>
              <div>
                <span className="block text-xs font-mono text-slate-500 uppercase">INFERENCE ACCURACY</span>
                <span className="block text-sm font-bold text-white mt-0.5">74% High-probability win confidence</span>
              </div>
            </div>
            <button
              onClick={() => onGetStarted("Pro")}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-sm rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95"
            >
              Try Your Own Analysis <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative text-left">
              {/* Fake terminal top */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-850/80 mb-5">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-xs font-mono text-slate-400 font-bold">XAUUSD ANALYZED_CONSTRAINTS</span>
                </div>
                <span className="font-mono text-[9px] text-slate-500 bg-slate-950 px-2 py-1 rounded select-none">ID: #99A1C_GOLD</span>
              </div>

              {/* Grid detail overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <span className="block text-[9px] font-mono text-slate-500 uppercase">ASSET</span>
                  <span className="block text-sm font-black text-white mt-1">XAUUSD</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <span className="block text-[9px] font-mono text-slate-500 uppercase">BIAS</span>
                  <span className="block text-sm font-black text-emerald-400 mt-1">Bullish</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <span className="block text-[9px] font-mono text-slate-500 uppercase">CONFIDENCE</span>
                  <span className="block text-sm font-black text-blue-400 mt-1">74%</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                  <span className="block text-[9px] font-mono text-slate-500 uppercase">TRADE QUALITY</span>
                  <span className="block text-sm font-black text-indigo-400 mt-1">A</span>
                </div>
              </div>

              {/* Multi details list */}
              <div className="space-y-3 font-mono text-xs text-slate-400">
                <div className="flex justify-between items-center p-3.5 bg-slate-950/60 rounded-xl border border-slate-850">
                  <span className="text-slate-500 font-bold uppercase tracking-wide">Entry Zone</span>
                  <span className="text-white font-extrabold">$2,311.50 - $2,313.20</span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-slate-950/60 rounded-xl border border-slate-850">
                  <span className="text-slate-500 font-bold uppercase tracking-wide">Stop Loss</span>
                  <span className="text-red-400 font-extrabold">$2,305.00</span>
                </div>
                <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-slate-500 font-bold uppercase tracking-wide block">Take Profit Levels</span>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-slate-900 p-2 rounded text-center border border-slate-850">
                      <span className="block text-[9px] text-slate-500">TP1</span>
                      <span className="text-white font-extrabold">$2,319.20</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded text-center border border-slate-850">
                      <span className="block text-[9px] text-slate-500">TP2</span>
                      <span className="text-white font-extrabold">$2,326.50</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded text-center border border-slate-850">
                      <span className="block text-[9px] text-slate-500">TP3</span>
                      <span className="text-white font-extrabold">$2,334.80</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FEATURES */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 text-center">
        <span className="text-xs font-mono text-blue-500 uppercase font-black tracking-widest block mb-2">PRODUCT ENVIRONMENT ADVANTAGES</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">Features</h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-16 font-mono">COMPLETE ARCHITECTURAL CORE BUILT FOR FUNDED SCANS</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 bg-slate-900/40 border border-slate-850 hover:border-blue-500/25 transition-all rounded-2xl text-left group">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500 group-hover:text-slate-950 transition-all duration-300">
              <Brain className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">AI Multi-Timeframe Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Synthesizes H1 bias boundaries with execution windows across lower-level M15 and M5 timeframe structures.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-slate-900/40 border border-slate-850 hover:border-blue-500/25 transition-all rounded-2xl text-left group">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500 group-hover:text-slate-950 transition-all duration-300">
              <Target className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Challenge Tracker</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track FTMO, FundingPips, or custom evaluation loss limits and target indices with safety indicators.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-slate-900/40 border border-slate-850 hover:border-blue-500/25 transition-all rounded-2xl text-left group">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500 group-hover:text-slate-950 transition-all duration-300">
              <Layers className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Trade Journal</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Catalog historical wins with emotional metrics (FOMO, Greed, Confidence) for precise post-session audits.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 bg-slate-900/40 border border-slate-850 hover:border-blue-500/25 transition-all rounded-2xl text-left group">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500 group-hover:text-slate-950 transition-all duration-300">
              <Calculator className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Risk Calculator</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Instantly compute required position contract sizes relative to live target stops and balance thresholds.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 bg-slate-900/40 border border-slate-850 hover:border-blue-500/25 transition-all rounded-2xl text-left group">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500 group-hover:text-slate-950 transition-all duration-300">
              <Activity className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Performance Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Visualize real equity growth curves, win trends, session efficiency, and dynamic performance statistics.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 bg-slate-900/40 border border-slate-850 hover:border-blue-500/25 transition-all rounded-2xl text-left group">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500 group-hover:text-slate-950 transition-all duration-300">
              <User className="w-5.5 h-5.5" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">AI Coach</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time psychological assistance to diagnose emotional trading triggers and protect target margins.
            </p>
          </div>

          {/* Feature 7 - Centered on bottom for aesthetics */}
          <div className="p-6 bg-slate-900/40 border border-slate-850 hover:border-blue-500/25 transition-all rounded-2xl text-left group md:col-span-2 lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-mono">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" /> NEW SAAS ADVANCEMENT
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Smart Market Insights</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                  Automated notifications of institutional liquidity traps, regional Asian high sweeps, and dynamic fair value gap mitigation signals integrated cleanly.
                </p>
              </div>
              <button
                onClick={() => onGetStarted("Pro")}
                className="self-start sm:self-center px-6 py-3 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-slate-950 font-bold font-mono text-xs rounded-lg transition-all flex items-center gap-1.5 border border-blue-500/20 uppercase tracking-widest cursor-pointer shrink-0"
              >
                PROMPT ALL SCANS <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: WHY TRADERS USE US */}
      <section className="bg-slate-950 py-20 border-t border-zinc-800/40 text-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <span className="text-xs font-mono text-blue-500 uppercase font-black tracking-widest block mb-2">GLOBAL OPERATIONAL AUDITS</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">Why Traders Use Us</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-16 font-mono">ACCOUNTABILITY STATISTICS AND SECURED RATINGS</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stat 1 */}
            <div className="p-6 bg-slate-900/30 border border-slate-850 rounded-2xl relative overflow-hidden">
              <span className="block text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {tradersCount.toLocaleString()}+
              </span>
              <span className="block text-slate-500 text-xs font-mono uppercase font-bold tracking-widest mt-3">
                Traders Enabled
              </span>
            </div>

            {/* Stat 2 */}
            <div className="p-6 bg-slate-900/30 border border-slate-850 rounded-2xl relative overflow-hidden">
              <span className="block text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {analysesCount.toLocaleString()}+
              </span>
              <span className="block text-slate-500 text-xs font-mono uppercase font-bold tracking-widest mt-3">
                Scans Analyzed
              </span>
            </div>

            {/* Stat 3 */}
            <div className="p-6 bg-slate-900/30 border border-slate-850 rounded-2xl relative overflow-hidden">
              <span className="block text-4xl sm:text-5xl font-black text-white font-mono tracking-tight flex items-center justify-center gap-1">
                {ratingCount.toFixed(1)} <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 inline" />
              </span>
              <span className="block text-slate-500 text-xs font-mono uppercase font-bold tracking-widest mt-3">
                Trusted Rating
              </span>
            </div>

            {/* Stat 4 */}
            <div className="p-6 bg-slate-900/30 border border-slate-850 rounded-2xl relative overflow-hidden">
              <span className="block text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                {satisfactionCount}%
              </span>
              <span className="block text-slate-500 text-xs font-mono uppercase font-bold tracking-widest mt-3">
                User Satisfaction
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS */}
      <section className="py-24 bg-slate-950/40 border-t border-zinc-800/40 relative">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="text-xs font-mono text-blue-500 uppercase font-black tracking-widest block mb-2">COMMUNITY TRUST PROTOCOL</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">What Traders Say</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-16 font-mono">REAL RESULTS FROM ACTIVE PROP FUNDED SNIPERS</p>

          {/* Slider box with continuous transitions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <MessageSquare className="w-32 h-32 text-blue-400" />
            </div>

            <div className="min-h-[140px] flex flex-col justify-center items-center transition-opacity duration-300">
              {/* Rating block */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[activeTestimonial].stars)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Text Quote */}
              <blockquote className="text-xl sm:text-2xl font-medium text-slate-100 italic leading-relaxed mb-6">
                "{testimonials[activeTestimonial].text}"
              </blockquote>

              {/* Author Profile details */}
              <div className="flex items-center gap-3.5 mt-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${testimonials[activeTestimonial].avatarColor}`}>
                  {testimonials[activeTestimonial].author.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="text-left font-mono">
                  <span className="block font-extrabold text-sm text-white">{testimonials[activeTestimonial].author}</span>
                  <span className="block text-[10px] text-blue-400 font-bold uppercase mt-0.5">{testimonials[activeTestimonial].tag}</span>
                </div>
              </div>
            </div>

            {/* Action slide dots control */}
            <div className="flex justify-center gap-2.5 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${activeTestimonial === i ? 'bg-blue-500 w-6' : 'bg-slate-700 hover:bg-slate-500'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: PRICING PREVIEW */}
      <section id="pricing" className="py-24 bg-slate-950 border-t border-zinc-800/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-blue-500 uppercase font-black tracking-widest block mb-2">SCALABLE MEMBERSHIP PRICING</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">Choose Your Fast-Track Capitalization</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto font-mono">SECURED PAYMENTS, Rolling Month-to-Month Cancellation</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {SAAS_PLANS.map((plan) => {
              const isPopular = plan.id === "plan-pro";
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-8 relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                    isPopular
                      ? "bg-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/15"
                      : "bg-slate-900/40 border border-slate-850 hover:border-slate-800"
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3.5 right-8 bg-blue-500 text-slate-950 text-[9px] font-black font-mono px-3.5 py-1.5 rounded-full uppercase tracking-widest">
                      MOST POPULAR
                    </span>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1.5 mb-6">
                      <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                      <span className="text-slate-500 text-xs font-mono">/ month</span>
                    </div>

                    <ul className="space-y-4 mb-8 text-xs font-mono text-slate-300 border-t border-slate-850/80 pt-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate("/signup")}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-all active:scale-97 cursor-pointer ${
                      isPopular
                        ? "bg-blue-500 hover:bg-blue-400 text-slate-950 shadow-lg shadow-blue-500/20"
                        : "bg-slate-850 hover:bg-slate-800 text-slate-200"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 9: FAQ */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 border-t border-zinc-800/40">
        <div className="text-center mb-16">
          <span className="text-xs font-mono text-blue-500 uppercase font-black tracking-widest block mb-2">COMMON INQUIRIES</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm font-mono text-center">SYSTEM RECONCILED RESPONSES</p>
        </div>

        {/* Accordion container */}
        <div className="space-y-4">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-slate-900/50 border border-slate-850 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-500 shrink-0" />
                    {item.q}
                  </span>
                  <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform duration-350 shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-slate-450 leading-relaxed text-xs sm:text-sm border-t border-slate-850/40 pt-4 font-mono">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 10: FINAL CTA */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-zinc-800/40 text-center relative px-4">
        <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full max-w-3xl mx-auto pointer-events-none" />
        
        <div className="max-w-3xl mx-auto relative space-y-6">
          <span className="text-xs font-mono text-blue-500 uppercase font-black tracking-widest block mb-2">IMMEDIATE CLOUD ACCREDITATION</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Ready To Trade Smarter?</h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            Create your account today, synchronize your first timeframe snaps and lock down your operational margins cleanly.
          </p>
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="px-10 py-5 bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-400 hover:to-sky-300 text-slate-950 font-black font-mono text-xs uppercase tracking-wider rounded-xl shadow-2xl shadow-blue-500/20 active:scale-97 transition-all flex items-center gap-2 cursor-pointer"
            >
              Start Your 3 Free Analyses <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 11: PROFESSIONAL FOOTER */}
      <footer className="border-t border-zinc-800/60 bg-slate-950 pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 text-left">
          
          {/* Column 1: Brand Info */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-md">
                <Brain className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-extrabold text-sm text-white font-mono tracking-tight">PropFirm AI Coach</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs font-mono">
              Expert-level multi-frame analytical synthesis optimized for institutional and individual evaluation challenges worldwide.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="font-mono text-xs uppercase text-slate-300 font-bold tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-mono">
              <li><button onClick={() => navigate("/features")} className="hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer text-left block">Features</button></li>
              <li><button onClick={() => navigate("/pricing")} className="hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer text-left block">Pricing</button></li>
              <li><button onClick={() => navigate("/faq")} className="hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer text-left block">FAQ</button></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-mono text-xs uppercase text-slate-300 font-bold tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-mono">
              <li><button onClick={() => navigate("/about")} className="hover:text-blue-400 text-slate-500 transition-colors bg-transparent border-none p-0 cursor-pointer text-left block">About Us</button></li>
              <li><button onClick={() => navigate("/contact")} className="hover:text-blue-400 text-slate-500 transition-colors bg-transparent border-none p-0 cursor-pointer text-left block">Contact Us</button></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="font-mono text-xs uppercase text-slate-300 font-bold tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-mono">
              <li><button onClick={() => navigate("/privacy-policy")} className="hover:text-blue-400 text-slate-500 transition-colors bg-transparent border-none p-0 cursor-pointer text-left block">Privacy Policy</button></li>
              <li><button onClick={() => navigate("/terms")} className="hover:text-blue-400 text-slate-500 transition-colors bg-transparent border-none p-0 cursor-pointer text-left block">Terms & Conditions</button></li>
              <li><button onClick={() => navigate("/refund-policy")} className="hover:text-blue-400 text-slate-500 transition-colors bg-transparent border-none p-0 cursor-pointer text-left block">Refund Policy</button></li>
              <li><button onClick={() => navigate("/risk-disclaimer")} className="hover:text-blue-400 text-slate-500 transition-colors bg-transparent border-none p-0 cursor-pointer text-left block">Risk Disclaimer</button></li>
            </ul>
          </div>

          {/* Column 5: Support */}
          <div>
            <h4 className="font-mono text-xs uppercase text-slate-300 font-bold tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-500 font-mono">
              <li><button onClick={() => navigate("/contact")} className="hover:text-blue-400 text-slate-500 transition-colors bg-transparent border-none p-0 cursor-pointer text-left block">Email Support</button></li>
              <li><button onClick={() => navigate("/support")} className="hover:text-blue-400 text-slate-500 transition-colors bg-transparent border-none p-0 cursor-pointer text-left block">Help Center</button></li>
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex gap-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
            <span className="hover:text-blue-400 transition-colors cursor-pointer">YouTube</span>
            <span className="hover:text-blue-400 transition-colors cursor-pointer">Instagram</span>
            <span className="hover:text-blue-400 transition-colors cursor-pointer">X</span>
            <span className="hover:text-blue-400 transition-colors cursor-pointer">LinkedIn</span>
          </div>
          <p className="text-slate-500 text-xs font-mono text-center sm:text-right">
            &copy; 2026 PropFirm AI Coach. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
