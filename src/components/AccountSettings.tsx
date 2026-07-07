import React, { useState, useEffect } from "react";
import { User, Settings, Lock, Shield, CreditCard, RefreshCw, CheckCircle2, Trash2, LogOut, Check, AlertTriangle, Key, X } from "lucide-react";
import { UserProfile } from "../types";
import { isSupabaseConfigured, supabase } from "../supabaseClient";

interface AccountSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (name: string, email: string) => void;
  navigate?: (path: string) => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

export default function AccountSettings({
  profile,
  onUpdateProfile,
  navigate,
  onLogout,
  onDeleteAccount,
}: AccountSettingsProps) {
  const [userName, setUserName] = useState(profile.name);
  const [userEmail, setUserEmail] = useState(profile.email);
  const [success, setSuccess] = useState(false);
  
  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Deletion confirmation states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Email verification status
  const [isEmailVerified, setIsEmailVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setIsEmailVerified(!!data.user.email_confirmed_at);
        }
      }).catch((e) => {
        console.warn("Could not retrieve real email verification status:", e);
      });
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(userName, userEmail);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          throw new Error(error.message);
        }
        setPasswordSuccess("Password updated successfully in the secure credential store.");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setShowPasswordForm(false), 2500);
      } else {
        // Local only success fallback
        setPasswordSuccess("Password updated locally (Bypassed Supabase).");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setShowPasswordForm(false), 2500);
      }
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccountConfirm = () => {
    if (deleteConfirmationText !== "DELETE") {
      setDeleteError("Please type DELETE to confirm account deletion.");
      return;
    }

    if (onDeleteAccount) {
      onDeleteAccount();
    } else if (onLogout) {
      onLogout();
    }
    setShowDeleteModal(false);
  };

  const handleUpgradeNavigation = () => {
    if (navigate) {
      navigate("/subscription");
    }
  };

  const currentPlan = profile.subscriptionPlan || "Free";
  const planNameFormatted = currentPlan === "Free" ? "FREE TRIAL" : currentPlan.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-500" />
          Account Settings
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-wider">
          Manage your personal profiles, subscription limits, and account access security
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Core Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: ACCOUNT INFORMATION */}
          <form onSubmit={handleSaveProfile} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-xl backdrop-blur-sm">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800/80 pb-3 font-sans">
              <User className="w-4 h-4 text-blue-400" />
              Account Information
            </h3>

            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Your profile information has been saved successfully.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest block">Username</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg text-xs font-bold text-white px-3 py-2 outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest block">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-lg text-xs font-bold text-white px-3 py-2 outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-850/40 text-xs">
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">Member Since</span>
                <span className="block text-slate-200 font-bold mt-0.5">{profile.joinDate || "N/A"}</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">Current Plan</span>
                <span className="block text-blue-400 font-bold mt-0.5">{planNameFormatted}</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">Plan Status</span>
                <span className="block text-emerald-400 font-bold mt-0.5 uppercase">
                  {profile.paymentFailed ? "Payment Failed" : (profile.subscription_status || "Active")}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                Save Profile Details
              </button>
            </div>
          </form>

          {/* SECTION 2: SUBSCRIPTION */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-5 shadow-xl backdrop-blur-sm">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800/80 pb-3 font-sans">
              <CreditCard className="w-4 h-4 text-blue-400" />
              Subscription Status
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">Tier</span>
                <span className="block text-slate-200 font-extrabold mt-0.5 uppercase">{planNameFormatted}</span>
              </div>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">Credits Remaining</span>
                <span className="block text-emerald-400 font-mono font-bold mt-0.5">
                  {profile.credits_remaining !== undefined ? profile.credits_remaining : (profile.credits !== undefined ? profile.credits : 0)}
                </span>
              </div>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">Total Credits</span>
                <span className="block text-slate-200 font-mono mt-0.5">
                  {profile.total_credits !== undefined ? profile.total_credits : profile.creditsLimit}
                </span>
              </div>
              <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3">
                <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">Credits Used</span>
                <span className="block text-slate-200 font-mono mt-0.5">{profile.creditsUsed || 0}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-950/40 border border-slate-900 rounded-xl gap-4">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Billing Period Renewal Date</span>
                <span className="text-xs text-slate-300 font-bold mt-0.5 block">{profile.nextResetDate || profile.expiry_date || "Never"}</span>
              </div>

              {currentPlan === "Free" && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleUpgradeNavigation}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 hover:opacity-90 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-lg uppercase tracking-wider"
                  >
                    Upgrade to Pro
                  </button>
                  <button
                    onClick={handleUpgradeNavigation}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-lg uppercase tracking-wider"
                  >
                    Upgrade to Elite
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-6">
          
          {/* SECTION 3: ACCOUNT SECURITY */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Lock className="w-4 h-4 text-blue-400" />
              Account Security
            </h3>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Password</span>
                <span className="font-mono text-slate-500 font-bold tracking-widest">••••••••</span>
              </div>

              {/* Show email verification status ONLY if real backend status exists */}
              {isEmailVerified !== null && (
                <div className="flex justify-between items-center text-xs border-t border-slate-850/50 pt-3">
                  <span className="text-slate-400 font-medium">Email Verification</span>
                  <span className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    isEmailVerified 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {isEmailVerified ? "Verified" : "Pending"}
                  </span>
                </div>
              )}

              <div className="pt-2">
                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-800 hover:bg-slate-900 text-slate-300 font-mono text-xs rounded-xl transition-all cursor-pointer uppercase tracking-wider font-bold"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Change Password
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChangeSubmit} className="space-y-3 bg-slate-950/60 p-3 rounded-xl border border-slate-850 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-1.5 mb-1.5">
                      <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest font-bold">Update Password</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordError("");
                          setPasswordSuccess("");
                        }}
                        className="text-slate-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {passwordError && (
                      <p className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/10 p-2 rounded-lg font-mono">
                        {passwordError}
                      </p>
                    )}

                    {passwordSuccess && (
                      <p className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 p-2 rounded-lg font-mono">
                        {passwordSuccess}
                      </p>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-mono uppercase block">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs text-white px-2.5 py-1.5 outline-none focus:border-blue-500/45"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 font-mono uppercase block">Confirm Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs text-white px-2.5 py-1.5 outline-none focus:border-blue-500/45"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer uppercase font-mono tracking-wider shrink-0"
                    >
                      {isUpdatingPassword ? "Updating..." : "Save Password"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: ACCOUNT MANAGEMENT */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Account Management
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-950/50 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl border border-slate-900 transition-all cursor-pointer font-bold text-xs"
              >
                <span>Log Out of Session</span>
                <LogOut className="w-4 h-4 text-slate-450" />
              </button>

              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteConfirmationText("");
                  setDeleteError("");
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer font-bold text-xs"
              >
                <span>Delete Account Permanently</span>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800/90 rounded-2xl p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-white text-base">Permanent Account Deletion</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This action is permanent and cannot be undone. All database records including trades, journal entries, subscription details, and AI analyses will be purged immediately.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg font-mono">
                {deleteError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] text-slate-450 font-bold font-mono uppercase tracking-widest block">
                Type <span className="text-rose-400 font-black">DELETE</span> below to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white px-3.5 py-2 outline-none focus:border-rose-500/50 uppercase tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-850 hover:bg-slate-950 text-slate-300 text-xs font-bold font-mono rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccountConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black font-mono rounded-xl transition-all shadow-lg shadow-rose-600/15 cursor-pointer uppercase"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
