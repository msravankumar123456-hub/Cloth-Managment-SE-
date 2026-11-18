-- ==============================================================================
-- LOOPMEX — SQL ALTERNATIVE TO seed-users.mjs
-- File: supabase_seed_users.sql
-- Use this ONLY if you created the 6 auth users manually in Supabase Dashboard
-- (Authentication → Users → Add User) and want to link their profile rows.
--
-- HOW TO USE:
--  1. In Supabase Dashboard, go to Authentication → Users.
--  2. Create the 6 users manually with email_confirm = true:
--       m.sravankumar123456+factory1@gmail.com   … +factory5@gmail.com
--       m.sravankumar123456+retailer@gmail.com
--  3. Run this script in SQL Editor — it matches by email and inserts profiles.
-- ==============================================================================

-- ─── 5 FACTORY MEMBERS ───────────────────────────────────────────────────────
INSERT INTO public.factory_members (id, email, full_name, role, is_active)
SELECT
  u.id,
  u.email,
  CASE
    WHEN u.email ILIKE '%+factory1%' THEN 'Factory Member 1'
    WHEN u.email ILIKE '%+factory2%' THEN 'Factory Member 2'
    WHEN u.email ILIKE '%+factory3%' THEN 'Factory Member 3'
    WHEN u.email ILIKE '%+factory4%' THEN 'Factory Member 4'
    WHEN u.email ILIKE '%+factory5%' THEN 'Factory Member 5'
    ELSE split_part(u.email, '@', 1)
  END AS full_name,
  'factory_member',
  TRUE
FROM auth.users u
WHERE u.email ILIKE '%sravankumar123456+factory%'
  AND NOT EXISTS (
    SELECT 1 FROM public.factory_members fm WHERE fm.id = u.id
  )
ON CONFLICT (id) DO NOTHING;

-- ─── 1 DEFAULT RETAILER ───────────────────────────────────────────────────────
INSERT INTO public.retailers (
  id, user_id, name, first_name, business_name, email,
  phone, city, place, state, pincode, address, shop_address,
  proof_id_type, proof_id_number, gst_number, credit_limit, joined_date
)
SELECT
  u.id,
  u.id,
  'M Sravan Kumar',
  'M Sravan Kumar',
  'Default Retailer',
  u.email,
  '',
  'Hyderabad',
  'Hyderabad',
  'Telangana',
  '500001',
  'Loopmex Test Account, Hyderabad',
  'Loopmex Test Account, Hyderabad',
  'Aadhaar',
  '',
  '',
  200000,
  to_char(NOW(), 'Mon YYYY')
FROM auth.users u
WHERE u.email ILIKE '%sravankumar123456+retailer%'
  AND NOT EXISTS (
    SELECT 1 FROM public.retailers r WHERE r.id = u.id
  )
ON CONFLICT (id) DO NOTHING;

-- ─── VERIFY ───────────────────────────────────────────────────────────────────
SELECT 'factory_members' AS tbl, COUNT(*) AS rows FROM public.factory_members
UNION ALL
SELECT 'retailers', COUNT(*) FROM public.retailers;
