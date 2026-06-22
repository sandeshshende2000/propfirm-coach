import React, { useState } from "react";
import { User, Settings, Lock, Shield, CreditCard, RefreshCw, Layers, CheckCircle2, Copy } from "lucide-react";
import { UserProfile } from "../types";

interface AccountSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (name: string, email: string) => void;
}

export default function AccountSettings({ profile, onUpdateProfile }: AccountSettingsProps) {
  const [userName, setUserName] = useState(profile.name);
  const [userEmail, setUserEmail] = useState(profile.email);
  const [copiedKey, setCopiedKey] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(userName, userEmail);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText("pfaicoach_live_99djksha8kjs81hj2kja9a721sh");
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-400" />
          Settings Panel
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          PROFILE DELEGATION, SECURITY KEYS, AND INTEGRATION CONTEXT
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Core Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-slate-900/40 border border-slate-800/85 rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-2 font-sans">
              <User className="w-4 h-4 text-emerald-400" />
              UserProfile Configuration
            </h3>

            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Account parameters updated securely.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-mono block">TRADER DESIGNATION NAME</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white px-3 py-2 outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-mono block">MEMBER EMAIL</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white px-3 py-2 outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-lg active:scale-95 transition-all shadow-lg"
              >
                APPLY PROFILE CHANGES
              </button>
            </div>
          </form>

          {/* API Integrations */}
          <div className="bg-slate-900/40 border border-slate-800/85 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-105 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Developer API Access (Prop Webhooks Link)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Link PropFirm AI Coach direct signals stream to trading servers, MT5 bridge apps, or personal dashboards to trigger live risk and imbalance alarms.
            </p>

            <div className="flex items-center gap-3 bg-slate-950 border border-slate-850 p-3 rounded-lg overflow-x-auto">
              <code className="text-slate-350 text-[10px] font-mono select-all flex-1 break-all">
                pfaicoach_live_99djksha8kjs81hj2kja9a721sh
              </code>
              <button
                type="button"
                onClick={copyApiKey}
                className="text-slate-400 hover:text-white bg-slate-900 px-3 py-1.5 rounded text-[10px] font-mono border border-slate-800 flex items-center gap-1 shrink-0"
              >
                {copiedKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey ? "COPIED" : "COPY SECRET"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar constraints */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/85 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Security Diagnostics
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Account Status</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded">VERIFIED</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Database Synced</span>
                <span className="font-mono text-emerald-450 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded">CONNECTED</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Stripe/Razor ID</span>
                <span className="font-mono text-slate-500 font-bold">active_sub_sub_X98c</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Node Connection</span>
                <span className="font-mono text-slate-500 font-bold">SSL Secure SHA-256</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/85 rounded-2xl p-5 text-xs text-slate-310 space-y-2">
            <h4 className="font-bold text-slate-100 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-450" />
              Risk Rules Override Alert
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Our AI diagnostic algorithms will never ask for your broker credentials or personal credit credentials during calculations. Keep your secrets safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
