import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError, type User } from './api';
import { useAuth } from './AuthContext';
import { Card, Field, PrimaryButton } from './ui';

export default function FactoryLoginPage({ portalPath = '/portal', dashboardPath = '/factory' }) {
  const nav = useNavigate(); const { setUser } = useAuth();
  const [name, setName] = useState(''); const [pw, setPw] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setErr('');
    if (!name.trim() || !pw) return setErr('Enter your full name and password.');
    setBusy(true);
    try {
      const r = await api<{ user: User }>('/api/auth/factory/login', { fullName: name.trim(), password: pw });
      setUser(r.user); nav(dashboardPath, { replace: true });
    } catch (e) { setErr((e as ApiError).message); } finally { setBusy(false); }
  }
  return (
    <Card>
      <button type="button" onClick={() => nav(portalPath)} className="text-sm text-neutral-400 hover:text-[#FF7135] mb-4">← Back to portals</button>
      <h1 className="text-2xl font-bold">Factory Member Login</h1>
      <p className="mt-1 text-sm text-neutral-400">Authorized factory members only. Accounts are created by a factory admin.</p>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        {err && <p role="alert" className="rounded-lg bg-red-500/10 text-red-300 px-3 py-2 text-sm">{err}</p>}
        <Field label="Full Name" autoComplete="username" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Password" secret autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <PrimaryButton type="submit" loading={busy}>Login</PrimaryButton>
        <button type="button" onClick={() => api('/api/auth/forgot-password', {}).catch((e) => setErr(e.message))} className="w-full text-sm text-neutral-400 hover:text-[#FF7135]">Forgot Password?</button>
      </form>
    </Card>
  );
}
