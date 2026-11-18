import http from 'node:http';
import { db } from './db.js';
import { hashPassword, verifyPassword, newToken, sha256, DUMMY_HASH, validators as V } from './security.js';

const PORT = Number(process.env.PORT || 4000);
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'; // your Vite dev URL
const IS_PROD = process.env.NODE_ENV === 'production';
const SESSION_MS = 1000 * 60 * 60 * 8;
const COOKIE = 'loopmex_sid';

// ---------- helpers ----------
const json = (res, code, body, headers = {}) => {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(body));
};
async function readBody(req) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > 10_000) throw new Error('too large'); chunks.push(c); }
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { return null; }
}
const str = (v) => (typeof v === 'string' ? v.trim() : '');
function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((p) => p[0]));
}
function setCookie(token, maxAgeSec) {
  return `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSec}${IS_PROD ? '; Secure' : ''}`;
}
function createSession(userType, userId) {
  const token = newToken();
  db.prepare('INSERT INTO sessions VALUES (?,?,?,?)').run(sha256(token), userType, userId, Date.now() + SESSION_MS);
  return setCookie(token, SESSION_MS / 1000);
}
function currentUser(req) {
  const t = cookies(req)[COOKIE];
  if (!t) return null;
  const s = db.prepare('SELECT * FROM sessions WHERE token_hash=?').get(sha256(t));
  if (!s) return null;
  if (s.expires_at < Date.now()) { db.prepare('DELETE FROM sessions WHERE token_hash=?').run(s.token_hash); return null; }
  if (s.user_type === 'retailer') {
    const u = db.prepare('SELECT id, full_name, email, city FROM retailers WHERE id=?').get(s.user_id);
    return u && { type: 'retailer', role: 'retailer', id: u.id, name: u.full_name, email: u.email, city: u.city };
  }
  const u = db.prepare('SELECT id, full_name, role, active FROM factory_members WHERE id=?').get(s.user_id);
  return u && u.active && { type: 'factory', role: u.role, id: u.id, name: u.full_name };
}
// simple brute-force limiter: 8 failures / 15 min per (ip + name)
function tooManyAttempts(key) {
  const since = Date.now() - 15 * 60_000;
  db.prepare('DELETE FROM login_attempts WHERE at < ?').run(since);
  return db.prepare('SELECT COUNT(*) n FROM login_attempts WHERE key=?').get(key).n >= 8;
}
const recordFailure = (key) => db.prepare('INSERT INTO login_attempts VALUES (?,?)').run(key, Date.now());

// role guard — enforced server-side on every protected route
const requireRole = (user, ...roles) => user && roles.includes(user.role);

// ---------- routes ----------
const routes = {
  'POST /api/auth/retailer/register': async (req, res) => {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Invalid JSON.' });
    const d = {
      fullName: str(b.fullName), mobile: str(b.mobile), city: str(b.city),
      email: str(b.email).toLowerCase(), pin: str(b.pinCode),
      password: typeof b.password === 'string' ? b.password : '',
      confirm: typeof b.confirmPassword === 'string' ? b.confirmPassword : '',
    };
    const errors = {};
    const check = (field, fn, val) => { const r = fn(val); if (r !== true) errors[field] = r; };
    check('fullName', V.fullName, d.fullName); check('mobile', V.mobile, d.mobile);
    check('city', V.city, d.city); check('email', V.email, d.email);
    check('pinCode', V.pin, d.pin); check('password', V.password, d.password);
    if (!d.confirm) errors.confirmPassword = 'Confirm your password.';
    else if (d.confirm !== d.password) errors.confirmPassword = 'Passwords do not match.';
    if (Object.keys(errors).length) return json(res, 422, { error: 'Please fix the highlighted fields.', fields: errors });

    const dupe = db.prepare('SELECT email, mobile FROM retailers WHERE email=? OR mobile=?').get(d.email, d.mobile);
    if (dupe) {
      const fields = {};
      if (dupe.email === d.email) fields.email = 'An account with this email already exists.';
      if (dupe.mobile === d.mobile) fields.mobile = 'An account with this mobile number already exists.';
      return json(res, 409, { error: 'Account already registered.', fields });
    }
    const hash = await hashPassword(d.password);
    let id;
    try {
      id = Number(db.prepare(`INSERT INTO retailers (full_name, full_name_lc, mobile, city, email, pin_code, password_hash)
        VALUES (?,?,?,?,?,?,?)`).run(d.fullName, d.fullName.toLowerCase(), d.mobile, d.city, d.email, d.pin, hash).lastInsertRowid);
    } catch { return json(res, 409, { error: 'Account already registered.' }); } // race on UNIQUE
    json(res, 201, { user: { type: 'retailer', role: 'retailer', name: d.fullName } }, { 'Set-Cookie': createSession('retailer', id) });
  },

  'POST /api/auth/retailer/login': async (req, res) => {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Invalid JSON.' });
    const name = str(b.fullName), pw = typeof b.password === 'string' ? b.password : '';
    if (!name || !pw) return json(res, 422, { error: 'Enter your full name and password.' });
    const key = `r:${req.socket.remoteAddress}:${name.toLowerCase()}`;
    if (tooManyAttempts(key)) return json(res, 429, { error: 'Too many attempts. Try again in 15 minutes.' });

    // Names are not unique, so check every account with this name; accept only if exactly one matches.
    const candidates = db.prepare('SELECT id, password_hash FROM retailers WHERE full_name_lc=?').all(name.toLowerCase());
    let matches = [];
    if (!candidates.length) await verifyPassword(pw, DUMMY_HASH);
    for (const c of candidates) if (await verifyPassword(pw, c.password_hash)) matches.push(c.id);
    if (matches.length !== 1) { recordFailure(key); return json(res, 401, { error: 'Incorrect name or password, or no registered account found.' }); }
    json(res, 200, { user: { type: 'retailer', role: 'retailer', name } }, { 'Set-Cookie': createSession('retailer', matches[0]) });
  },

  'POST /api/auth/factory/login': async (req, res) => {
    const b = await readBody(req); if (!b) return json(res, 400, { error: 'Invalid JSON.' });
    const name = str(b.fullName), pw = typeof b.password === 'string' ? b.password : '';
    if (!name || !pw) return json(res, 422, { error: 'Enter your full name and password.' });
    const key = `f:${req.socket.remoteAddress}:${name.toLowerCase()}`;
    if (tooManyAttempts(key)) return json(res, 429, { error: 'Too many attempts. Try again in 15 minutes.' });
    const m = db.prepare('SELECT * FROM factory_members WHERE full_name_lc=?').get(name.toLowerCase());
    const ok = await verifyPassword(pw, m ? m.password_hash : DUMMY_HASH);
    if (!m || !ok || !m.active) { recordFailure(key); return json(res, 401, { error: 'Incorrect credentials, or this account is not authorized for the factory dashboard.' }); }
    json(res, 200, { user: { type: 'factory', role: m.role, name: m.full_name } }, { 'Set-Cookie': createSession('factory', m.id) });
  },

  'POST /api/auth/forgot-password': async (req, res) => {
    // No email/SMS provider is configured, so we cannot send reset links. Be honest about it.
    json(res, 501, { error: 'Password reset is not set up yet. Configure an email/SMS provider (SMTP_* env vars) or ask a factory admin to reset your password.' });
  },

  'POST /api/auth/logout': async (req, res) => {
    const t = cookies(req)[COOKIE];
    if (t) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(sha256(t));
    json(res, 200, { ok: true }, { 'Set-Cookie': setCookie('', 0) });
  },

  'GET /api/auth/me': async (req, res) => {
    const u = currentUser(req);
    return u ? json(res, 200, { user: u }) : json(res, 401, { error: 'Not signed in.' });
  },

  // Example protected endpoints. Wrap your real retailer / factory API routes the same way.
  'GET /api/retailer/ping': async (req, res) => {
    const u = currentUser(req);
    if (!u) return json(res, 401, { error: 'Sign in required.' });
    if (!requireRole(u, 'retailer')) return json(res, 403, { error: 'Retailer access only.' });
    json(res, 200, { ok: true, area: 'retailer' });
  },
  'GET /api/factory/ping': async (req, res) => {
    const u = currentUser(req);
    if (!u) return json(res, 401, { error: 'Sign in required.' });
    if (!requireRole(u, 'factory_admin', 'factory_staff')) return json(res, 403, { error: 'Factory members only.' });
    json(res, 200, { ok: true, area: 'factory', role: u.role });
  },
};

export const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin === ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  // CSRF defence for cookie auth: state-changing requests must come from the allowed origin (or same-origin tools w/o Origin).
  if (req.method === 'POST' && origin && origin !== ORIGIN) return json(res, 403, { error: 'Origin not allowed.' });

  const handler = routes[`${req.method} ${new URL(req.url, 'http://x').pathname}`];
  if (!handler) return json(res, 404, { error: 'Not found.' });
  try { await handler(req, res); }
  catch (e) { console.error('Server error:', e.message); json(res, 500, { error: 'Something went wrong.' }); }
});

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  server.listen(PORT, () => console.log(`Loopmex API on :${PORT} (CORS origin ${ORIGIN})`));
}
