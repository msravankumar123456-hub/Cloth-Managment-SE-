import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError, type User } from './api';
import { useAuth } from './AuthContext';
import { Card, Field, PrimaryButton } from './ui';

const rules: Record<string, (v: string, all: Record<string, string>) => string | ''> = {
  fullName: (v) => (/^[\p{L}][\p{L} .'-]{1,59}$/u.test(v) ? '' : 'Enter your full name.'),
  mobile: (v) => (/^[6-9]\d{9}$/.test(v) ? '' : 'Enter a valid 10-digit mobile number.'),
  city: (v) => (v.length >= 2 ? '' : 'Enter your place / city.'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Enter a valid email address.'),
  pinCode: (v) => (/^[1-9]\d{5}$/.test(v) ? '' : 'Enter a valid 6-digit PIN code.'),
  password: (v) => (v.length >= 8 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v) ? '' : 'Use 8+ characters with upper-case, lower-case and a number.'),
  confirmPassword: (v, a) => (v && v === a.password ? '' : 'Passwords do not match.'),
};

export default function RetailerAuthPage({ portalPath = '/portal', homePath = '/retailer' }) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const nav = useNavigate(); const { setUser } = useAuth();
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const switchTab = (t: 'login' | 'signup') => { setTab(t); setErrors({}); setMsg(null); setForm({}); };

  async function submit(e: FormEvent) {
    e.preventDefault(); setMsg(null);
    const keys = tab === 'login' ? ['fullName', 'password'] : Object.keys(rules);
    const errs: Record<string, string> = {};
    for (const k of keys) {
      const v = (form[k] ?? '').trim();
      if (!v && !(k === 'password' || k === 'confirmPassword')) errs[k] = 'This field is required.';
      else if (tab === 'login' && k === 'password') { if (!form.password) errs.password = 'Enter your password.'; }
      else { const m = rules[k]?.(k.includes('assword') ? form[k] ?? '' : v, form); if (m) errs[k] = m; }
    }
    setErrors(errs); if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const body = tab === 'login' ? { fullName: form.fullName.trim(), password: form.password }
        : { ...form, fullName: form.fullName.trim(), email: form.email.trim().toLowerCase() };
      const r = await api<{ user: User }>(tab === 'login' ? '/api/auth/retailer/login' : '/api/auth/retailer/register', body);
      setUser(r.user); nav(homePath, { replace: true });
    } catch (err) {
      const e = err as ApiError; setErrors(e.fields ?? {}); setMsg({ kind: 'error', text: e.message });
    } finally { setBusy(false); }
  }
  async function forgot() {
    try { await api('/api/auth/forgot-password', { fullName: form.fullName ?? '' }); setMsg({ kind: 'ok', text: 'Check your inbox for reset instructions.' }); }
    catch (err) { setMsg({ kind: 'error', text: (err as ApiError).message }); }
  }

  return (
    <Card>
      <button type="button" onClick={() => nav(portalPath)} className="text-sm text-neutral-400 hover:text-[#FF7135] mb-4">← Back to portals</button>
      <h1 className="text-2xl font-bold">{tab === 'login' ? 'Retailer Login' : 'Create Retailer Account'}</h1>
      <div className="mt-5 grid grid-cols-2 rounded-lg bg-[#101114] p-1 text-sm" role="tablist">
        {(['login', 'signup'] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} type="button" onClick={() => switchTab(t)}
            className={`rounded-md py-2 font-medium ${tab === t ? 'bg-[#FF7135] text-white' : 'text-neutral-400'}`}>
            {t === 'login' ? 'Existing Retailer' : 'New Retailer'}
          </button>
        ))}
      </div>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        {msg && <p role="alert" className={`rounded-lg px-3 py-2 text-sm ${msg.kind === 'error' ? 'bg-red-500/10 text-red-300' : 'bg-green-500/10 text-green-300'}`}>{msg.text}</p>}
        <Field label="Full Name" autoComplete="name" value={form.fullName ?? ''} onChange={set('fullName')} error={errors.fullName} />
        {tab === 'signup' && <>
          <Field label="Mobile Number" inputMode="numeric" maxLength={10} autoComplete="tel-national" value={form.mobile ?? ''} onChange={set('mobile')} error={errors.mobile} />
          <Field label="Place / City" autoComplete="address-level2" value={form.city ?? ''} onChange={set('city')} error={errors.city} />
          <Field label="Email Address" type="email" autoComplete="email" value={form.email ?? ''} onChange={set('email')} error={errors.email} />
          <Field label="PIN Code" inputMode="numeric" maxLength={6} autoComplete="postal-code" value={form.pinCode ?? ''} onChange={set('pinCode')} error={errors.pinCode} />
        </>}
        <Field label={tab === 'login' ? 'Password' : 'Create Password'} secret autoComplete={tab === 'login' ? 'current-password' : 'new-password'} value={form.password ?? ''} onChange={set('password')} error={errors.password} />
        {tab === 'signup' && <Field label="Confirm Password" secret autoComplete="new-password" value={form.confirmPassword ?? ''} onChange={set('confirmPassword')} error={errors.confirmPassword} />}
        <PrimaryButton type="submit" loading={busy}>{tab === 'login' ? 'Login' : 'Create Account'}</PrimaryButton>
        {tab === 'login' ? (
          <div className="flex justify-between text-sm">
            <button type="button" onClick={() => switchTab('signup')} className="text-[#FF7135] hover:underline">Create New Account</button>
            <button type="button" onClick={forgot} className="text-neutral-400 hover:text-[#FF7135]">Forgot Password?</button>
          </div>
        ) : (
          <button type="button" onClick={() => switchTab('login')} className="w-full text-sm text-neutral-400 hover:text-[#FF7135]">Back to Login</button>
        )}
      </form>
    </Card>
  );
}
