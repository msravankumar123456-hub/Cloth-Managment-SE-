import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

// UI guard only — the real enforcement is the server-side role check on every API call.
export function RequireRole({ allow, loginPath, children }: { allow: ('retailer' | 'factory')[]; loginPath: string; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-neutral-400">Loading…</div>;
  if (!user) return <Navigate to={loginPath} replace />;
  if (!allow.includes(user.type)) return <Navigate to="/portal" replace />;
  return <>{children}</>;
}
