-- =============================================================================
-- supabase_create_first_admin.sql
-- Purpose : Promote one existing Supabase Auth user to factory_admin role.
-- How     : Paste this into the Supabase SQL Editor (never run this in src/).
-- Safety  : Uses INSERT ... ON CONFLICT DO UPDATE — does NOT drop any rows.
-- =============================================================================

-- STEP 1: Find the UUID of your admin user (run this first to look it up)
-- SELECT id, email FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL_HERE';

-- STEP 2: Upsert into factory_members as factory_admin
-- Replace 'YOUR_ADMIN_EMAIL_HERE' with the real email before running.
INSERT INTO public.factory_members (id, email, full_name, role, is_active, permissions)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) AS full_name,
  'factory_admin'::text AS role,
  TRUE AS is_active,
  '{}'::jsonb AS permissions
FROM auth.users u
WHERE u.email = 'YOUR_ADMIN_EMAIL_HERE'
ON CONFLICT (id) DO UPDATE
  SET role       = 'factory_admin',
      is_active  = TRUE,
      full_name  = COALESCE(EXCLUDED.full_name, public.factory_members.full_name);

-- STEP 3: Verify
-- SELECT id, email, role, is_active FROM public.factory_members WHERE role = 'factory_admin';
