process.env.DB_FILE = ':memory:';
process.env.CORS_ORIGIN = 'http://localhost:5173';
const { server } = await import('./server.js');
const { db } = await import('./db.js');
const { hashPassword } = await import('./security.js');
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;
const H = { 'Content-Type': 'application/json', Origin: 'http://localhost:5173' };
const call = async (method, path, body, cookie) => {
  const r = await fetch(base + path, { method, headers: { ...H, ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, body: await r.json(), cookie: (r.headers.get('set-cookie') || '').split(';')[0] };
};
let pass = 0, fail = 0;
const t = (name, cond) => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`); };

const good = { fullName: 'Ravi Kumar', mobile: '9876543210', city: 'Vijayawada', email: 'Ravi@Example.com', pinCode: '520001', password: 'Secret123', confirmPassword: 'Secret123' };
let r = await call('POST', '/api/auth/retailer/register', { ...good, mobile: '12345', email: 'bad', pinCode: '12', password: 'weak', confirmPassword: 'x' });
t('invalid signup → field-specific errors', r.status === 422 && ['mobile','email','pinCode','password','confirmPassword'].every((f) => r.body.fields[f]));
r = await call('POST', '/api/auth/retailer/register', good);
t('valid signup creates account + session', r.status === 201 && r.cookie.startsWith('loopmex_sid='));
const retailerCookie = r.cookie;
t('password stored hashed, not plaintext', !JSON.stringify(db.prepare('SELECT * FROM retailers').all()).includes('Secret123'));
r = await call('POST', '/api/auth/retailer/register', { ...good, mobile: '9000000001' });
t('duplicate email rejected', r.status === 409 && r.body.fields?.email);
r = await call('POST', '/api/auth/retailer/register', { ...good, email: 'other@example.com' });
t('duplicate mobile rejected', r.status === 409 && r.body.fields?.mobile);
r = await call('POST', '/api/auth/retailer/login', { fullName: 'ravi kumar', password: 'Secret123' });
t('registered retailer can log in', r.status === 200);
r = await call('POST', '/api/auth/retailer/login', { fullName: 'Ravi Kumar', password: 'Wrong123' });
t('wrong password rejected', r.status === 401);
r = await call('POST', '/api/auth/retailer/login', { fullName: 'Nobody Here', password: 'Secret123' });
t('unregistered retailer rejected', r.status === 401);

db.prepare('INSERT INTO factory_members (full_name, full_name_lc, role, password_hash) VALUES (?,?,?,?)')
  .run('Anita Rao', 'anita rao', 'factory_admin', await hashPassword('Factory123'));
r = await call('POST', '/api/auth/factory/login', { fullName: 'Anita Rao', password: 'Factory123' });
t('authorized factory member logs in', r.status === 200 && r.body.user.role === 'factory_admin');
const factoryCookie = r.cookie;
r = await call('POST', '/api/auth/factory/login', { fullName: 'Ravi Kumar', password: 'Secret123' });
t('retailer credentials rejected at factory login', r.status === 401);

r = await call('GET', '/api/factory/ping');
t('no session → factory API 401', r.status === 401);
r = await call('GET', '/api/factory/ping', null, retailerCookie);
t('retailer session → factory API 403', r.status === 403);
r = await call('GET', '/api/factory/ping', null, factoryCookie);
t('factory session → factory API 200', r.status === 200);
r = await call('GET', '/api/retailer/ping', null, factoryCookie);
t('factory session → retailer API 403', r.status === 403);

db.prepare("UPDATE factory_members SET active=0").run();
r = await call('GET', '/api/auth/me', null, factoryCookie);
t('deactivated factory member loses access', r.status === 401);

r = await call('POST', '/api/auth/logout', {}, retailerCookie);
r = await call('GET', '/api/auth/me', null, retailerCookie);
t('logout invalidates session server-side', r.status === 401);
r = await call('POST', '/api/auth/forgot-password', { fullName: 'x' });
t('forgot password reports setup required', r.status === 501);

let last; for (let i = 0; i < 9; i++) last = await call('POST', '/api/auth/factory/login', { fullName: 'Brute Force', password: 'x' });
t('brute force is rate-limited', last.status === 429);

console.log(`\n${pass} passed, ${fail} failed`);
server.close(); process.exit(fail ? 1 : 0);
