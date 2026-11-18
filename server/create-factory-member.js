// Usage: node create-factory-member.js "Full Name" factory_admin|factory_staff
// Password is read from the FACTORY_PASSWORD env var or prompted (never passed on the command line / logged).
import { createInterface } from 'node:readline/promises';
import { db } from './db.js';
import { hashPassword, validators as V } from './security.js';

const [name, role = 'factory_staff'] = process.argv.slice(2);
if (!name || !['factory_admin', 'factory_staff'].includes(role)) {
  console.error('Usage: node create-factory-member.js "Full Name" [factory_admin|factory_staff]'); process.exit(1);
}
let pw = process.env.FACTORY_PASSWORD;
if (!pw) { const rl = createInterface({ input: process.stdin, output: process.stdout }); pw = await rl.question('Password: '); rl.close(); }
const ok = V.password(pw);
if (ok !== true) { console.error(ok); process.exit(1); }
db.prepare('INSERT INTO factory_members (full_name, full_name_lc, role, password_hash) VALUES (?,?,?,?)')
  .run(name.trim(), name.trim().toLowerCase(), role, await hashPassword(pw));
console.log(`Created ${role}: ${name}`);
