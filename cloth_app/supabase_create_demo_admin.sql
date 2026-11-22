-- ==============================================================================
-- File: supabase_create_demo_admin.sql
-- Purpose: Setup demo123@gmail.com as Factory Admin
-- ==============================================================================

-- 1. Ensure factory_members constraint allows factory_admin role
ALTER TABLE public.factory_members 
  DROP CONSTRAINT IF EXISTS factory_members_role_check;

ALTER TABLE public.factory_members 
  ADD CONSTRAINT factory_members_role_check 
  CHECK (role IN ('factory_member', 'factory_staff', 'factory_admin'));

ALTER TABLE public.factory_members 
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Link demo123@gmail.com from auth.users to public.factory_members as factory_admin
-- (Make sure you created demo123@gmail.com in Authentication -> Users first)
INSERT INTO public.factory_members (id, email, full_name, role, is_active, permissions)
SELECT
  u.id,
  u.email,
  'Demo Admin' AS full_name,
  'factory_admin'::text AS role,
  TRUE AS is_active,
  '{}'::jsonb AS permissions
FROM auth.users u
WHERE LOWER(u.email) = 'demo123@gmail.com'
ON CONFLICT (id) DO UPDATE
  SET role       = 'factory_admin',
      is_active  = TRUE,
      full_name  = 'Demo Admin';

-- 3. Verify
SELECT id, email, role, is_active FROM public.factory_members WHERE LOWER(email) = 'demo123@gmail.com';
