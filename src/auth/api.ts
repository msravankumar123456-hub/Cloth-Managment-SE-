const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export type User = { type: 'retailer' | 'factory'; role: 'retailer' | 'factory_admin' | 'factory_staff'; name: string };
export class ApiError extends Error {
  constructor(message: string, public status: number, public fields?: Record<string, string>) { super(message); }
}

export async function api<T = any>(path: string, body?: unknown, method = body ? 'POST' : 'GET'): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      method, credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch { throw new ApiError('Cannot reach the server. Is the Loopmex API running?', 0); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || 'Request failed.', res.status, data.fields);
  return data as T;
}
