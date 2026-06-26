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
  AlertCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload
} from "lucide-react";
import { SAAS_PLANS } from "../data";
import { motion } from "motion/react";

interface LandingPageProps {
  onGetStarted: (plan: string) => void;
  onLogin: () => void;
  navigate: (path: string) => void;
}

export default function LandingPage({ onGetStarted, onLogin, navigate }: LandingPageProps) {
  // Video fallback and dynamic ticker states
  const [videoFailed, setVideoFailed] = React.useState(false);
  const [xauPrice, setXauPrice] = React.useState(2342.65);
  const [eurPrice, setEurPrice] = React.useState(1.0842);
  const [btcPrice, setBtcPrice] = React.useState(67250.40);
  const [priceDirections, setPriceDirections] = React.useState({ xau: "up", eur: "down", btc: "up" });

  React.useEffect(() => {
    const priceInterval = setInterval(() => {
      setXauPrice((prev) => {
        const change = (Math.random() - 0.5) * 0.6;
        setPriceDirections((d) => ({ ...d, xau: change >= 0 ? "up" : "down" }));
        return +(prev + change).toFixed(2);
      });
      setEurPrice((prev) => {
        const change = (Math.random() - 0.5) * 0.0002;
        setPriceDirections((d) => ({ ...d, eur: change >= 0 ? "up" : "down" }));
        return +(prev + change).toFixed(5);
      });
      setBtcPrice((prev) => {
        const change = (Math.random() - 0.5) * 18;
        setPriceDirections((d) => ({ ...d, btc: change >= 0 ? "up" : "down" }));
        return +(prev + change).toFixed(2);
      });
    }, 2000);
    return () => clearInterval(priceInterval);
  }, []);

  // Interactive See The AI Analysis Process player states
  const [activeStep, setActiveStep] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);

  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 6);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

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
                TradeModeAI
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
      <section className="relative overflow-hidden pt-12 pb-24 px-4 bg-slate-950">
        {/* Full Hero section-wide Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-[0.12]"
            src="https://cdn.pixabay.com/video/2018/11/02/19177-298910080_large.mp4"
          />
          {/* Dark grid/radial overlay with standard premium fintech gradient */}
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/45 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-mono uppercase tracking-widest bg-slate-950/80 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              V3.5 MULTI-TIMEFRAME ACTIVE
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              AI-Powered Multi-Timeframe <br />
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                Trading Analysis
              </span>
            </h1>

            <p className="text-slate-405 text-base sm:text-lg leading-relaxed max-w-2xl font-sans">
              Connect multi-timeframe screenshots (H1, M15, M5) directly to our deep vision network. Synthesize orderblocks and liquidity sweeps for institutional confirmation in seconds.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-400 hover:to-sky-300 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-blue-500/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer font-black"
              >
                Start Free Trial <ArrowUpRight className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => navigate("/demo")}
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-300 hover:text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xl active:scale-98 transition-all cursor-pointer"
              >
                View Demo Analysis
              </button>
            </div>
          </div>

          {/* Hero Right / Below: Large Trading Video with Premium Visual Upgrades */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full relative"
          >
            {/* Ambient dynamic backlight glow behind the container */}
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-650 rounded-3xl blur-xl opacity-25 animate-pulse" />

            {/* Main glass outer card */}
            <div className="relative backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-3xl p-3 sm:p-4 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden group">
              
              {/* Window header / system bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/5 text-xs font-mono mb-3 bg-slate-950/40 rounded-t-xl">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-md shadow-rose-500/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-md shadow-amber-500/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-md shadow-emerald-500/20" />
                  <span className="ml-2 font-black text-[9px] tracking-widest text-blue-400 uppercase">PROP_QUANT_v3.5</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[9px] text-emerald-400 font-mono font-bold tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                    SYS LIVE FEED
                  </span>
                </div>
              </div>

              {/* Dynamic ticker panel - real-time simulated live price telemetry */}
              <div className="grid grid-cols-3 gap-2 px-3 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-[10px] font-mono mb-3">
                <div className="flex flex-col items-start px-2 py-1 bg-slate-900/40 rounded-lg border border-white/5">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">XAUUSD (GOLD)</span>
                  <span className="font-bold flex items-center gap-1 text-white tabular-nums mt-0.5">
                    ${xauPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className={priceDirections.xau === "up" ? "text-emerald-400 font-black animate-pulse" : "text-rose-400 font-black animate-pulse"}>
                      {priceDirections.xau === "up" ? "▲" : "▼"}
                    </span>
                  </span>
                </div>
                <div className="flex flex-col items-start px-2 py-1 bg-slate-900/40 rounded-lg border border-white/5">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">EURUSD (FOREX)</span>
                  <span className="font-bold flex items-center gap-1 text-white tabular-nums mt-0.5">
                    {eurPrice.toFixed(5)}
                    <span className={priceDirections.eur === "up" ? "text-emerald-400 font-black" : "text-rose-400 font-black"}>
                      {priceDirections.eur === "up" ? "▲" : "▼"}
                    </span>
                  </span>
                </div>
                <div className="flex flex-col items-start px-2 py-1 bg-slate-900/40 rounded-lg border border-white/5">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">BTCUSD (CRYPTO)</span>
                  <span className="font-bold flex items-center gap-1 text-white tabular-nums mt-0.5">
                    ${btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    <span className={priceDirections.btc === "up" ? "text-emerald-400 font-black animate-pulse" : "text-rose-400 font-black animate-pulse"}>
                      {priceDirections.btc === "up" ? "▲" : "▼"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Trading Video Viewport */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/5 select-none shadow-inner">
                {videoFailed ? (
                  /* Fallback professional trading image */
                  <div className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col items-center justify-center animate-fade-in">
                    <img
                      referrerPolicy="no-referrer"
                      src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80"
                      alt="Professional AI Trading Market Dashboard"
                      className="w-full h-full object-cover opacity-75"
                    />
                    {/* Matrix style grid scanline layer */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent mix-blend-multiply pointer-events-none" />
                    <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />
                  </div>
                ) : (
                  /* High Quality interactive HTML5 background looping video */
                  <>
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls={false}
                      disablePictureInPicture
                      controlsList="nodownload nofullscreen noremoteplayback"
                      onContextMenu={(e) => e.preventDefault()}
                      onError={() => setVideoFailed(true)}
                      className="w-full h-full object-cover transition-transform duration-[4000ms] ease-out group-hover:scale-105"
                    >
                      <source src="https://assets.mixkit.co/videos/preview/mixkit-stock-market-candlestick-chart-focus-34293-large.mp4" type="video/mp4" />
                      <source src="https://assets.mixkit.co/videos/preview/mixkit-dashboard-screen-showing-ascending-business-graphs-and-charts-34292-large.mp4" type="video/mp4" />
                      Your browser does not support high quality video.
                    </video>
                    {/* Subtle Overlay gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent pointer-events-none mix-blend-multiply" />
                    <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/25 to-slate-950/15 pointer-events-none" />
                  </>
                )}

                {/* Cyber HUD Status Badge overlay on the video */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 bg-slate-900/95 border border-white/10 backdrop-blur-md rounded-lg text-[9px] font-mono font-bold text-blue-405 tracking-wider flex items-center gap-1.5 shadow-md shadow-black/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    RSI IND: 58.42
                  </span>
                  <span className="px-2.5 py-1 bg-slate-900/95 border border-white/10 backdrop-blur-md rounded-lg text-[9px] font-mono font-bold text-emerald-450 tracking-wider flex items-center gap-1.5 shadow-md shadow-black/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ORDERBLOCK: DETECTED
                  </span>
                </div>

                {/* Large centering telemetry layer watermark */}
                <div className="absolute inset-x-0 bottom-12 flex justify-center pointer-events-none select-none">
                  <span className="px-3 py-1.5 bg-slate-950/80 border border-white/5 backdrop-blur-xl rounded-full text-[8px] font-mono text-slate-500 tracking-[0.2em] font-extrabold uppercase animate-pulse shadow-md">
                    INSTITUTIONAL SAAS GRID v3.5
                  </span>
                </div>

                {/* Foot/HUD status pane */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[9px] font-mono bg-slate-900/95 border border-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl text-slate-300 shadow-xl shadow-black/30">
                  <span className="flex items-center gap-2 font-bold tracking-wide">
                    <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    XAUUSD & Forex Candlestick Telemetry
                  </span>
                  <span className="text-blue-400 font-black px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded">
                    ACTIVE CONFIRMATION MATRIX
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: SECOND VIDEO SECTION - AI ANALYSIS PROCESS */}
      <section className="bg-slate-950 border-t border-b border-zinc-800/50 py-24 relative overflow-hidden">
        {/* Ambient glow background */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-mono text-blue-500 uppercase font-black tracking-widest block">HOW TO ALIGN THE COGNITIVE PIPELINE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">See The AI Analysis Process</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto font-mono">STEP-BY-STEP SYNAPTIC EXECUTION TIMELINE</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Steps Timeline controller (Left) */}
            <div className="lg:col-span-5 space-y-4">
              {[
                { label: "Upload H1 Chart", desc: "Define structural HTF ranges, major liquidity sweeps, and overall daily bias constraints." },
                { label: "Upload M15 Chart", desc: "Sync MTF orderblocks, internal fair value gaps, and intermediate market structure shifts." },
                { label: "Upload M5 Chart", desc: "Pinpoint LTF entry zones, retail sweeps, and micro-channel liquidity extraction bounds." },
                { label: "AI Processing", desc: "Vision nodes analyze combined constraints, compiling high-probability simulation runs." },
                { label: "Analysis Report", desc: "Instant visual brief covering conviction bias, stop losses, and multi-tier profit indices." },
                { label: "Challenge Tracking", desc: "Automated verification against FTMO or custom prop-firm risk ceilings." }
              ].map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveStep(idx);
                      setIsPlaying(false); // Pause auto-play when user manually clicks
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 cursor-pointer relative overflow-hidden group ${
                      isActive 
                        ? "bg-slate-900 border-blue-500/30 shadow-lg shadow-blue-500/5" 
                        : "bg-slate-900/20 border-slate-850 hover:bg-slate-900/40 hover:border-slate-800"
                    }`}
                  >
                    {/* Glowing highlight indicator for the active card */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500" />
                    )}
                    
                    {/* Step index */}
                    <div className={`w-8 h-8 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 transition-all ${
                      isActive ? "bg-blue-500 text-slate-950" : "bg-slate-950 text-slate-400 group-hover:text-white"
                    }`}>
                      0{idx + 1}
                    </div>

                    <div className="space-y-1">
                      <h4 className={`text-sm font-black font-mono uppercase tracking-tight transition-colors ${
                        isActive ? "text-blue-400" : "text-slate-200 group-hover:text-blue-450"
                      }`}>
                        {step.label}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Simulated Live Video Player Viewport (Right) */}
            <div className="lg:col-span-7">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden text-left">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500/10 via-blue-500/30 to-blue-500/10" />

                {/* Player Header HUD */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-850 text-xs font-mono mb-4 text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    <span className="font-bold uppercase tracking-widest text-[10px] text-blue-400">AI PROJECTION LAB ACTIVE</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px]">
                    <span>STAGE 0{activeStep + 1} / 06</span>
                    <span className="text-slate-500">FORMAT: VISION_MULTIPLEX</span>
                  </div>
                </div>

                {/* Multi-layered Video Screen viewport */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-850 flex items-center justify-center">
                  
                  {/* Real Stock Trading Video Background */}
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-15"
                    src="https://assets.mixkit.co/videos/preview/mixkit-dashboard-screen-showing-ascending-business-graphs-and-charts-34292-large.mp4"
                  />

                  {/* Stage Overlays - Dynamic Glassmorphism Interface Card */}
                  <div className="w-full h-full relative z-10 flex items-center justify-center p-6">
                    {/* STEP 1: H1 */}
                    {activeStep === 0 && (
                      <div className="w-full max-w-sm bg-slate-900/90 border border-blue-500/30 backdrop-blur-md p-5 rounded-xl space-y-4 animate-fade-in text-left">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-blue-400 font-bold">H1_TIME_FRAME_IMPORT</span>
                          <span className="text-slate-500">100KB/S</span>
                        </div>
                        <div className="p-6 bg-slate-950/80 rounded-lg border border-slate-850 border-dashed flex flex-col items-center justify-center gap-3 text-center">
                          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center animate-bounce">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="block text-xs font-mono font-bold text-slate-200">Importing XAUUSD_H1.png</span>
                            <span className="text-[10px] font-mono text-emerald-400 block mt-1 uppercase">✓ High Res Scanned Successfully</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-800 w-full rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full animate-pulse" style={{ width: "100%" }} />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: M15 */}
                    {activeStep === 1 && (
                      <div className="w-full max-w-sm bg-slate-900/90 border border-indigo-500/30 backdrop-blur-md p-5 rounded-xl space-y-4 animate-fade-in text-left">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-indigo-400 font-bold">M15_STRUCTURE_IMPORT</span>
                          <span className="text-slate-500">READY</span>
                        </div>
                        <div className="p-6 bg-slate-950/80 rounded-lg border border-slate-850 border-dashed flex flex-col items-center justify-center gap-3 text-center">
                          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center animate-pulse">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="block text-xs font-mono font-bold text-slate-200">Importing XAUUSD_M15.png</span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-1">Sensing Fair Value Gaps (FVG)</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-800 w-full rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: "100%" }} />
                        </div>
                      </div>
                    )}

                    {/* STEP 3: M5 */}
                    {activeStep === 2 && (
                      <div className="w-full max-w-sm bg-slate-900/90 border border-sky-400/30 backdrop-blur-md p-5 rounded-xl space-y-4 animate-fade-in text-left">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-sky-400 font-bold">M5_EXECUTION_IMPORT</span>
                          <span className="text-slate-500">SCAN_PENDING</span>
                        </div>
                        <div className="p-6 bg-slate-950/80 rounded-lg border border-slate-850 border-dashed flex flex-col items-center justify-center gap-3 text-center">
                          <div className="w-12 h-12 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="block text-xs font-mono font-bold text-slate-200">Importing XAUUSD_M5.png</span>
                            <span className="text-[10px] font-mono text-amber-400 block mt-1 uppercase">▶ Searching Liquidity Sweep zones...</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-slate-800 w-full rounded-full overflow-hidden">
                          <div className="bg-sky-400 h-full rounded-full" style={{ width: "100%" }} />
                        </div>
                      </div>
                    )}

                    {/* STEP 4: AI PROCESSING */}
                    {activeStep === 3 && (
                      <div className="w-full max-w-md bg-slate-900/95 border border-blue-500/40 backdrop-blur-md p-5 rounded-xl space-y-4 animate-scale-up relative text-left">
                        <div className="absolute inset-x-0 top-1/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent animate-laser pointer-events-none" />
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-blue-400 font-bold flex items-center gap-1">
                            <Brain className="w-4 h-4 animate-pulse" /> NEURAL_SYNTH_ACTIVE
                          </span>
                          <span className="text-slate-500">COMPILING...</span>
                        </div>
                        
                        <div className="bg-slate-950/90 p-4 rounded-lg border border-slate-850/80 font-mono text-[10px] space-y-2 text-slate-300">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">&gt; ALIGN H1 BOUNDS:</span>
                            <span className="text-emerald-400 font-bold">SUCCESS [A+]</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">&gt; DETECT MTF ORDERBLOCK:</span>
                            <span className="text-emerald-400 font-bold">SUCCESS [X]</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">&gt; VERIFY M5 LIQUIDITY SWEEP:</span>
                            <span className="text-emerald-400 font-bold">SWEEP DETECTED</span>
                          </div>
                          <div className="flex items-center justify-between text-blue-400 font-black animate-pulse">
                            <span>&gt; SYNTHESIZING SCENARIOS...</span>
                            <span>IN_PROGRESS</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: REPORT */}
                    {activeStep === 4 && (
                      <div className="w-full max-w-sm bg-slate-900/95 border border-indigo-500/30 backdrop-blur-md p-4 rounded-xl space-y-3 animate-fade-in text-left">
                        <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-850">
                          <span className="text-indigo-400 font-bold">✓ CORE SCENARIO GENERATED</span>
                          <span className="text-emerald-400 uppercase font-black tracking-widest text-[9px]">A+ PROBABILITY</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2 bg-slate-950 rounded border border-slate-850">
                            <span className="text-slate-500 block text-[9px] uppercase">Asset</span>
                            <span className="text-white font-extrabold text-sm block mt-0.5">XAUUSD</span>
                          </div>
                          <div className="p-2 bg-slate-950 rounded border border-slate-850">
                            <span className="text-slate-500 block text-[9px] uppercase">Bias</span>
                            <span className="text-emerald-400 font-extrabold text-sm block mt-0.5">BULLISH</span>
                          </div>
                        </div>
                        <div className="p-2 bg-slate-950 rounded border border-slate-850 font-mono text-[10px] space-y-1 text-left">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Entry:</span>
                            <span className="text-slate-200 font-bold">$2,311.50 - $2,313.20</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Stop Loss:</span>
                            <span className="text-rose-400 font-bold">$2,305.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Target Profit:</span>
                            <span className="text-emerald-400 font-bold">$2,334.80</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 6: CHALLENGE */}
                    {activeStep === 5 && (
                      <div className="w-full max-w-sm bg-slate-900/95 border border-emerald-500/30 backdrop-blur-md p-4 rounded-xl space-y-3.5 animate-fade-in text-left">
                        <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-850">
                          <span className="text-emerald-400 font-bold">✓ RISK MONITOR SHIELD ENGAGED</span>
                          <span className="text-slate-500">SYNC ACTIVE</span>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">Account Size:</span>
                            <span className="text-white font-black">$100,000</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">Daily Balance Limit:</span>
                            <span className="text-slate-200 font-bold">$5,000 Max Loss</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">Active Trade Risk:</span>
                            <span className="text-emerald-400 font-bold">Within 0.5% Limit</span>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1 bg-emerald-500/10 py-1.5 rounded border border-emerald-500/20 text-center font-bold">
                          ✓ ACCOUNT PROTECTION LOCK ACTIVE
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Player Controls Bar */}
                <div className="flex items-center justify-between mt-3 px-1 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 text-blue-400" /> : <Play className="w-4 h-4 text-emerald-400 animate-pulse" />}
                    </button>
                    <span className="text-slate-500 font-bold text-[10px]">
                      {isPlaying ? "AUTO CYCLING STAGES" : "PAUSED"}
                    </span>
                  </div>
                  
                  {/* Timeline progress pills */}
                  <div className="flex items-center gap-1.5 font-bold">
                    {[0,1,2,3,4,5].map((idx) => {
                      const isActive = activeStep === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveStep(idx);
                            setIsPlaying(false);
                          }}
                          className={`w-5 h-1.5 rounded transition-all cursor-pointer ${
                            isActive ? "bg-blue-500 w-8" : "bg-slate-800 hover:bg-slate-700"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
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
              <span className="font-extrabold text-sm text-white font-mono tracking-tight">TradeModeAI</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs font-mono">
              AI-Powered Trading Intelligence. Expert-level multi-frame analytical synthesis optimized for institutional and individual traders worldwide.
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
            &copy; 2026 TradeModeAI. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
