#!/usr/bin/env node
/**
 * scripts/seed-users.mjs
 * Creates 5 factory accounts + 1 retailer account in Supabase Auth,
 * then inserts their profile rows into public.factory_members / public.retailers.
 *
 * Usage:
 *   node --env-file=supabase/.env.factory-secrets scripts/seed-users.mjs
 *
 * Requires Node 20.6+ for --env-file, or set env vars manually before running.
 * Never prints passwords. Idempotent: skips existing users.
 */

import { createClient } from '@supabase/supabase-js';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BASE_EMAIL = 'm.sravankumar123456@gmail.com';

const FACTORY_USERS = [1, 2, 3, 4, 5].map((n) => ({
  email: `m.sravankumar123456+factory${n}@gmail.com`,
  fullName: `Factory Member ${n}`,
  role: 'factory_member',
  passwordEnvKey: `FACTORY_PASSWORD_${n}`,
}));

const RETAILER_USER = {
  email: `m.sravankumar123456+retailer@gmail.com`,
  fullName: 'Default Retailer',
  role: 'retailer',
  passwordEnvKey: 'RETAILER_PASSWORD',
};

const ALL_USERS = [...FACTORY_USERS, RETAILER_USER];

// ─── ENV VALIDATION ───────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n' +
    '   Run:  node --env-file=supabase/.env.factory-secrets scripts/seed-users.mjs'
  );
  process.exit(1);
}

// Validate all 6 passwords
const passwords = {};
const missing = [];
for (const u of ALL_USERS) {
  const val = process.env[u.passwordEnvKey];
  if (!val || val.length < 10) {
    missing.push(
      `${u.passwordEnvKey} is ${val ? `too short (${val.length} chars, min 10)` : 'missing'}`
    );
  } else {
    passwords[u.email] = val;
  }
}
if (missing.length > 0) {
  console.error('❌  Password validation failed:\n' + missing.map((m) => `   • ${m}`).join('\n'));
  process.exit(1);
}

// ─── SUPABASE ADMIN CLIENT ─────────────────────────────────────────────────────
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const normalise = (email) => email.trim().toLowerCase();

/** Find an existing auth user by email (pages through results). */
async function findAuthUserByEmail(email) {
  const norm = normalise(email);
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const match = data.users.find((u) => u.email && normalise(u.email) === norm);
    if (match) return match;
    if (data.users.length < 100) return null;
  }
}

/** Pretty status table row. */
const row = (email, status, note = '') =>
  `  ${status.padEnd(8)}  ${email.padEnd(48)}  ${note}`;

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n📦  Loopmex — Seed Users\n');
  console.log(row('Email', 'Status', 'Note'));
  console.log('  ' + '─'.repeat(80));

  for (const userDef of ALL_USERS) {
    const email = normalise(userDef.email);
    let authUser = await findAuthUserByEmail(email);
    let status = '';
    let note = '';

    // 1. Create auth user if missing
    if (!authUser) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: passwords[userDef.email],
        email_confirm: true,
        user_metadata: {
          full_name: userDef.fullName,
          role: userDef.role,
        },
      });
      if (error) {
        console.log(row(email, 'ERROR', error.message));
        continue;
      }
      authUser = data.user;
      status = 'CREATED';
    } else {
      status = 'EXISTS';
      note = '(auth user already present — password NOT changed)';
    }

    // 2. Insert profile row
    if (userDef.role === 'factory_member') {
      const { error: profErr } = await admin.from('factory_members').upsert(
        {
          id: authUser.id,
          email,
          full_name: userDef.fullName,
          role: 'factory_member',
          is_active: true,
        },
        { onConflict: 'id', ignoreDuplicates: false }
      );
      if (profErr) {
        note += ` ⚠ factory_members insert failed: ${profErr.message}`;
      } else if (status === 'CREATED') {
        note = 'factory_members row inserted';
      } else {
        note += ' | factory_members row ensured';
      }
    } else {
      // retailer profile
      const { error: profErr } = await admin.from('retailers').upsert(
        {
          id: authUser.id,
          user_id: authUser.id,
          email,
          name: userDef.fullName,
          first_name: userDef.fullName,
          business_name: 'Default Retailer',
          phone: '',
          city: 'Hyderabad',
          place: 'Hyderabad',
          state: 'Telangana',
          pincode: '500001',
          address: 'Loopmex Test Account',
          shop_address: 'Loopmex Test Account',
          proof_id_type: 'Aadhaar',
          proof_id_number: '',
          gst_number: '',
          credit_limit: 200000,
          joined_date: new Date().toLocaleString('en-IN', { month: 'short', year: 'numeric' }),
        },
        { onConflict: 'id', ignoreDuplicates: false }
      );
      if (profErr) {
        note += ` ⚠ retailers insert failed: ${profErr.message}`;
      } else if (status === 'CREATED') {
        note = 'retailers row inserted';
      } else {
        note += ' | retailers row ensured';
      }
    }

    console.log(row(email, status, note));
  }

  console.log('\n✅  Done. Never share the service-role key.\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
