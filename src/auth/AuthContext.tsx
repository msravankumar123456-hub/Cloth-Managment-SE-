import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type User } from './api';

type Ctx = { user: User | null; loading: boolean; setUser: (u: User | null) => void; logout: () => Promise<void> };
const AuthCtx = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // The session lives in an httpOnly cookie; we only ask the server who we are. Nothing sensitive is stored in the browser.
  useEffect(() => {
    api<{ user: User }>('/api/auth/me').then((r) => setUser(r.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);
  const logout = async () => { await api('/api/auth/logout', {}).catch(() => {}); setUser(null); };
  return <AuthCtx.Provider value={{ user, loading, setUser, logout }}>{children}</AuthCtx.Provider>;
}
