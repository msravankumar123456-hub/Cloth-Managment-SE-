import { scrypt, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scryptAsync = promisify(scrypt);

export async function hashPassword(pw) {
  const salt = randomBytes(16);
  const key = await scryptAsync(pw, salt, 64);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}
export async function verifyPassword(pw, stored) {
  const [alg, saltHex, keyHex] = String(stored).split('$');
  if (alg !== 'scrypt') return false;
  const key = await scryptAsync(pw, Buffer.from(saltHex, 'hex'), 64);
  const expected = Buffer.from(keyHex, 'hex');
  return key.length === expected.length && timingSafeEqual(key, expected);
}
export const newToken = () => randomBytes(32).toString('base64url');
export const sha256 = (s) => createHash('sha256').update(s).digest('hex');

// Dummy hash so unknown-user logins cost the same time as real ones.
export const DUMMY_HASH = await hashPassword('dummy-password-for-timing');

export const validators = {
  fullName: (v) => /^[\p{L}][\p{L} .'-]{1,59}$/u.test(v) || 'Enter your full name (2–60 letters).',
  mobile: (v) => /^[6-9]\d{9}$/.test(v) || 'Enter a valid 10-digit Indian mobile number.',
  city: (v) => /^[\p{L}][\p{L} .'-]{1,59}$/u.test(v) || 'Enter a valid place / city.',
  email: (v) => (v.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) || 'Enter a valid email address.',
  pin: (v) => /^[1-9]\d{5}$/.test(v) || 'Enter a valid 6-digit PIN code.',
  password: (v) =>
    (v.length >= 8 && v.length <= 128 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v)) ||
    'Use 8+ characters with upper-case, lower-case and a number.',
};
