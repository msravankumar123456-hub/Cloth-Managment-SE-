import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';

export const RetailerAuth: React.FC = () => {
  const { setAuthMode, loginRetailer, registerRetailer, resetPassword, setCurrentView, showToast } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [regData, setRegData] = useState({
    firstName: '',
    mobile: '',
    place: '',
    email: '',
    pincode: '',
    shopAddress: '',
    proofIdType: 'Aadhaar' as 'Aadhaar' | 'PAN' | 'Other',
    proofIdNumber: '',
    password: '',
    confirmPassword: '',
  });

  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setError(null);
    setSuccessMsg(null);
    setMode(newMode);
    if (newMode === 'login' || newMode === 'register') {
      setAuthMode(newMode);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const email = loginData.identifier.trim();
    if (!email || !loginData.password) {
      setError('Please enter your registered email address and password.');
      return;
    }

    setLoading(true);
    const success = await loginRetailer({ identifier: email, password: loginData.password });
    setLoading(false);
    if (!success) {
      setError('Invalid email or password. Please verify your credentials or confirm your email.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!regData.firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!regData.mobile || !/^[6-9]\d{9}$/.test(regData.mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!regData.place.trim()) {
      setError('Place / City is required.');
      return;
    }
    if (!regData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!regData.pincode || !/^\d{6}$/.test(regData.pincode)) {
      setError('Please enter a valid 6-digit PIN code.');
      return;
    }
    if (!regData.shopAddress.trim()) {
      setError('Complete shop address is required.');
      return;
    }
    if (!regData.proofIdNumber.trim()) {
      setError('Proof ID number is required.');
      return;
    }
    if (!regData.password || regData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setError('Confirm password does not match.');
      return;
    }

    setLoading(true);
    const res = await registerRetailer({
      ...regData,
      name: regData.firstName,
    });
    setLoading(false);

    if (!res.success) {
      setError(res.message || 'Registration failed. Please check your details.');
    } else {
      if (res.message) {
        setSuccessMsg(res.message);
        showToast(res.message, 'info');
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const email = forgotEmail.trim();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      showToast(res.message, 'success');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-center overflow-y-auto overscroll-contain p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div
        className="relative z-10 my-auto w-full max-w-5xl shrink-0 overflow-hidden rounded-[28px] border border-white/[0.12] bg-[#17181C] shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid lg:grid-cols-[1.1fr_1.4fr]">
          <div className="hidden lg:flex flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(255,113,53,0.16),transparent_40%),linear-gradient(180deg,#121417,#17181C)] p-8 border-r border-white/[0.08]">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FF7135]/40 bg-[#FF7135]/10 text-[#FF7135]">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#FF7135]">Loopmex</p>
                  <h2 className="text-2xl font-semibold text-white">Retailer Access</h2>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-[#A1A1AA]">Trusted wholesale network</p>
                  <h3 className="mt-3 text-3xl font-semibold leading-tight text-white">Sign in to source premium fashion inventory faster.</h3>
                </div>

                <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <div className="flex items-center gap-3 text-sm text-[#E4E4E7]">
                    <ShieldCheck className="h-4 w-4 text-[#FF7135]" />
                    Secure Supabase Auth & RLS
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#E4E4E7]">
                    <MapPin className="h-4 w-4 text-[#FF7135]" />
                    Regional sourcing across India
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#E4E4E7]">
                    <IdCard className="h-4 w-4 text-[#FF7135]" />
                    Verified retail buyer network
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm text-[#F5F5F5]">
              <div className="font-medium text-[#FF7135]">Verified Wholesale Access</div>
              <p className="mt-2 text-[#D4D4D8]">Your account credentials and retail orders are protected by Supabase PostgreSQL Row Level Security.</p>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {mode === 'login' ? 'Existing Account' : mode === 'register' ? 'New Retailer' : 'Reset Password'}
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  {mode === 'login'
                    ? 'Sign into your Loopmex retailer account.'
                    : mode === 'register'
                    ? 'Create your wholesale retail account.'
                    : 'Enter your email to receive recovery instructions.'}
                </p>
              </div>

              <button
                onClick={() => setCurrentView('landing')}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-2 text-[#A1A1AA] transition-colors hover:text-white"
                aria-label="Close authentication"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 rounded-xl border border-[#FF7135]/30 bg-[#FF7135]/10 px-4 py-3 text-xs font-medium text-[#FFB199]">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mx-6 mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-300">
                {successMsg}
              </div>
            )}

            <div className="p-6">
              {mode !== 'forgot' && (
                <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-[#101114] p-1.5 ring-1 ring-white/[0.05]">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      mode === 'login'
                        ? 'bg-[#FF7135] text-white shadow-lg shadow-[#FF7135]/20'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    Existing Account
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      mode === 'register'
                        ? 'bg-[#FF7135] text-white shadow-lg shadow-[#FF7135]/20'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    New Retailer
                  </button>
                </div>
              )}

              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
                      <input
                        type="email"
                        value={loginData.identifier}
                        onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                        placeholder="retailer@business.com"
                        className="w-full rounded-xl border border-white/10 bg-[#101114] py-3 pl-10 pr-3 text-sm text-white placeholder-[#71717A] outline-none transition-colors focus:border-[#FF7135]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-white/10 bg-[#101114] py-3 pl-10 pr-10 text-sm text-white placeholder-[#71717A] outline-none transition-colors focus:border-[#FF7135]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="font-medium text-[#FF7135] hover:text-[#FF935B]"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF7135] px-5 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-[#FF5A1F] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Login
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {mode === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">
                      Registered Business Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="retailer@business.com"
                        className="w-full rounded-xl border border-white/10 bg-[#101114] py-3 pl-10 pr-3 text-sm text-white placeholder-[#71717A] outline-none transition-colors focus:border-[#FF7135]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF7135] px-5 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-[#FF5A1F] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Sending link...' : 'Send Password Recovery Email'}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-xs text-[#A1A1AA] hover:text-white"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </form>
              )}

              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">First Name</label>
                      <input
                        type="text"
                        value={regData.firstName}
                        onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                        placeholder="Ramesh"
                        className="w-full rounded-xl border border-white/10 bg-[#101114] px-3 py-3 text-sm text-white placeholder-[#71717A] outline-none transition-colors focus:border-[#FF7135]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">Mobile Number</label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
                        <input
                          type="tel"
                          value={regData.mobile}
                          onChange={(e) => setRegData({ ...regData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          maxLength={10}
                          placeholder="9876543210"
                          className="w-full rounded-xl border border-white/10 bg-[#101114] py-3 pl-10 pr-3 text-sm text-white placeholder-[#71717A] outline-none transition-colors focus:border-[#FF7135]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Verification Notice */}
                  {/* TODO: Integrate SMS OTP provider (e.g. Twilio/Gupshup) on Supabase Phone Auth when production SMS gateway is activated. Currently authenticating with secure email verification via Supabase Auth. */}
                  <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 text-xs text-[#A1A1AA]">
                    <ShieldCheck className="h-4 w-4 text-[#FF7135] shrink-0" />
                    <span>Direct email verification is enabled. An account confirmation link will be sent to your business email.</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">Place / City</label>
                      <input
                        type="text"
                        value={regData.place}
                        onChange={(e) => setRegData({ ...regData, place: e.target.value })}
                        placeholder="Tirupur"
                        className="w-full rounded-xl border border-white/10 bg-[#101114] px-3 py-3 text-sm text-white placeholder-[#71717A] outline-none transition-colors focus:border-[#FF7135]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">Pincode</label>
                      <input
                        type="text"
                        value={regData.pincode}
                        onChange={(e) => setRegData({ ...regData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        maxLength={6}
                        placeholder="641601"
                        className="w-full rounded-xl border border-white/10 bg-[#101114] px-3 py-3 text-sm text-white placeholder-[#71717A] outline-none transition-colors focus:border-[#FF7135]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">Business Email</label>
                    <input
                      type="email"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      placeholder="retailer@brand.com"
                      className="w-full rounded-xl border border-white/10 bg-[#101114] px-3 py-3 text-sm text-white placeholder-[#71717A] outline-none transition-colors focus:border-[#FF7135]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">Proof ID Type</label>
                    <select
                      value={regData.proofIdType}
                      onChange={(e) => setRegData({ ...regData, proofIdType: e.target.value as 'Aadhaar' | 'PAN' | 'Other' })}
                      className="w-full rounded-xl border border-white/10 bg-[#101114] px-3 py-3 text-sm text-white outline-none transition-colors focus:border-[#FF7135]"
                    >
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="PAN">PAN</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">Proof ID Number</label>
                    <input
                      type="text"
                      value={regData.proofIdNumber}
                      onChange={(e) => setRegData({ ...regData, proofIdNumber: e.target.value })}
                      placeholder="Enter proof ID number"
                      className="w-full rounded-xl border border-white/10 bg-[#101114] px-3 py-3 text-sm text-white placeholder-[#71717A] outline-none transition-colors focus:border-[#FF7135]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">Complete Shop Address</label>
                    <textarea
                      value={regData.shopAddress}
                      onChange={(e) => setRegData({ ...regData, shopAddress: e.target.value })}
                      rows={3}
                      placeholder="Plot 12, Textile Market, Tirupur"
                      className="w-full rounded-xl border border-white/10 bg-[#101114] px-3 py-3 text-sm text-white placeholder-[#71717A] outline-none transition-colors focus:border-[#FF7135]"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">Password</label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          value={regData.password}
                          onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                          placeholder="Create password"
                          className="w-full rounded-xl border border-white/10 bg-[#101114] py-3 pl-10 pr-10 text-sm text-white placeholder-[#71717A] outline-none transition-colors focus:border-[#FF7135]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword((value) => !value)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
                        >
                          {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#A1A1AA]">Confirm Password</label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
                        <input
                          type={showRegisterConfirmPassword ? 'text' : 'password'}
                          value={regData.confirmPassword}
                          onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                          placeholder="Confirm password"
                          className="w-full rounded-xl border border-white/10 bg-[#101114] py-3 pl-10 pr-10 text-sm text-white placeholder-[#71717A] outline-none transition-colors focus:border-[#FF7135]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterConfirmPassword((value) => !value)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white"
                        >
                          {showRegisterConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF7135] px-5 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-[#FF5A1F] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Sign Up
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setCurrentView('landing')}
        className="absolute inset-0 z-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close authentication modal"
      />
    </div>
  );
};
