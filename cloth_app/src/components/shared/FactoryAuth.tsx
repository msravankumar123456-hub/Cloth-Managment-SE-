import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, User } from 'lucide-react';

export const FactoryAuth: React.FC = () => {
  const { loginFactory, setCurrentView } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [changePasswordRequired, setChangePasswordRequired] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    const email = loginData.email.trim();
    if (!email || !loginData.password) {
      setError('Please fill in your email and password.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError('Please enter a valid factory email address.');
      return;
    }

    setLoading(true);
    const success = await loginFactory({ email, password: loginData.password });

    if (!success) {
      const { data } = await supabase?.auth.getUser() ?? { data: { user: null } };
      if (data.user?.user_metadata?.password_reset_required) {
        setChangePasswordRequired(true);
        setError(null);
        setStatusMessage('For security, choose a new password before continuing.');
      } else {
        setError('Invalid email or password. Please use your authorized factory account.');
      }
    }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (newPassword.length < 8) {
      setError('Your new password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    if (!supabase) {
      setError('Password changes are unavailable because Supabase is not configured.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      data: { password_reset_required: false },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    const success = await loginFactory({ email: loginData.email, password: newPassword });
    setLoading(false);
    if (!success) {
      setError('Your password was changed, but factory access could not be verified. Sign in again.');
      setChangePasswordRequired(false);
      setLoginData((previous) => ({ ...previous, password: '' }));
    }
  };

  const handleForgotPassword = async () => {
    const email = loginData.email.trim();
    if (!email) {
      setError('Enter your factory email address first.');
      return;
    }

    if (!supabase) {
      setError('Password reset is unavailable because Supabase is not configured on this build.');
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/?password-reset=1`,
      });

      if (resetError) {
        throw resetError;
      }

      setError(null);
      setStatusMessage('Password reset link sent. Check your email inbox and follow the instructions.');
    } catch (resetFailure) {
      const message = resetFailure instanceof Error ? resetFailure.message : 'Unable to send reset email.';
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div 
        className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#17181C] border border-white/[0.12] shadow-2xl shadow-black/95 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF7135]/15 border border-[#FF7135]/30 flex items-center justify-center text-[#FF7135]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-tight">Factory Member Login</h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Authorized factory staff only
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('landing')}
            className="p-2 rounded hover:bg-white/[0.05] text-[#A1A1AA] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="px-6 py-3 mx-6 mt-4 rounded-xl bg-[#FF7135]/10 border border-[#FF7135]/30 text-[#FF7135] text-xs font-medium">
            {error}
          </div>
        )}

        {statusMessage && (
          <div className="px-6 py-3 mx-6 mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            {statusMessage}
          </div>
        )}

        <div className="p-6 space-y-6">
          {changePasswordRequired ? (
            <form className="space-y-4" onSubmit={handleChangePassword}>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101114] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7135] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101114] border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF7135] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-semibold text-sm tracking-wide uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating password...' : 'Set New Password'}
              </button>
            </form>
          ) : (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Factory Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                <input
                  type="email"
                  placeholder="factory.member@loopmex.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#101114] border border-white/10 text-white placeholder-[#71717A] text-sm focus:outline-none focus:border-[#FF7135] transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#101114] border border-white/10 text-white placeholder-[#71717A] text-sm focus:outline-none focus:border-[#FF7135] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(visible => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#FFB38A] hover:text-[#FFD1B0] transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF7135] hover:bg-[#FF5C1B] text-white font-semibold text-sm tracking-wide uppercase transition-all duration-200 shadow-xl shadow-[#FF7135]/25 hover:shadow-[#FF7135]/40 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
          )}

          <div className="pt-4 border-t border-white/[0.06] text-center space-y-2">
            <p className="text-xs text-[#71717A]">
              Factory staff accounts are managed by an authorized administrator.
            </p>
            <button
              onClick={() => setCurrentView('landing')}
              className="text-xs text-[#A1A1AA] hover:text-white"
            >
              ← Back to Portal Selection
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => setCurrentView('landing')}
        className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close authentication"
      />
    </div>
  );
};
