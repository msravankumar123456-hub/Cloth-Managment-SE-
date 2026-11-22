-- =============================================================================
-- Migration: 20261122000000_admin_system.sql
-- Purpose  : Extend factory_members for admin/staff roles, add permission and
--            activity-log tables, helper functions, and RLS policies.
-- Safety   : All statements are idempotent (IF NOT EXISTS / OR REPLACE / DROP IF EXISTS).
--            No existing data is dropped or truncated.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Expand factory_members.role CHECK constraint
--    Old: CHECK (role = 'factory_member')
--    New: CHECK (role IN ('factory_member','factory_staff','factory_admin'))
-- ---------------------------------------------------------------------------
ALTER TABLE public.factory_members
  DROP CONSTRAINT IF EXISTS factory_members_role_check;

ALTER TABLE public.factory_members
  ADD CONSTRAINT factory_members_role_check
  CHECK (role IN ('factory_member', 'factory_staff', 'factory_admin'));

-- ---------------------------------------------------------------------------
-- 2. Add permissions JSONB column to factory_members (safe, IF NOT EXISTS)
-- ---------------------------------------------------------------------------
ALTER TABLE public.factory_members
  ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- 3. factory_staff_permissions table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.factory_staff_permissions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id     UUID        NOT NULL REFERENCES public.factory_members(id) ON DELETE CASCADE,
  permission   TEXT        NOT NULL,
  granted_by   UUID        REFERENCES public.factory_members(id) ON DELETE SET NULL,
  granted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (staff_id, permission)
);

-- ---------------------------------------------------------------------------
-- 4. factory_activity_logs table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.factory_activity_logs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email    TEXT,
  action        TEXT        NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  details       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 5. Helper: is_factory_admin(uuid) — SECURITY DEFINER
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_factory_admin(
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.factory_members
    WHERE id = p_user_id
      AND role = 'factory_admin'
      AND is_active = TRUE
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 6. Helper: is_factory_staff(uuid) — any active factory role
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_factory_staff(
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.factory_members
    WHERE id = p_user_id
      AND role IN ('factory_member', 'factory_staff', 'factory_admin')
      AND is_active = TRUE
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. RLS on factory_staff_permissions
-- ---------------------------------------------------------------------------
ALTER TABLE public.factory_staff_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin manages permissions" ON public.factory_staff_permissions;
CREATE POLICY "admin manages permissions"
  ON public.factory_staff_permissions
  FOR ALL
  TO authenticated
  USING (public.is_factory_admin())
  WITH CHECK (public.is_factory_admin());

-- ---------------------------------------------------------------------------
-- 8. RLS on factory_activity_logs
-- ---------------------------------------------------------------------------
ALTER TABLE public.factory_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin reads logs" ON public.factory_activity_logs;
CREATE POLICY "admin reads logs"
  ON public.factory_activity_logs
  FOR SELECT
  TO authenticated
  USING (public.is_factory_admin());

DROP POLICY IF EXISTS "staff inserts logs" ON public.factory_activity_logs;
CREATE POLICY "staff inserts logs"
  ON public.factory_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_factory_staff());

-- ---------------------------------------------------------------------------
-- 9. Update factory_members RLS — allow admin to manage all rows
-- ---------------------------------------------------------------------------
-- Drop old policies that may conflict
DROP POLICY IF EXISTS "Factory member can read own profile"  ON public.factory_members;
DROP POLICY IF EXISTS "Factory member can update own profile" ON public.factory_members;
DROP POLICY IF EXISTS "factory_members self read"            ON public.factory_members;
DROP POLICY IF EXISTS "factory_members self update"          ON public.factory_members;
DROP POLICY IF EXISTS "admin insert factory_members"         ON public.factory_members;
DROP POLICY IF EXISTS "admin delete factory_members"         ON public.factory_members;

-- Self or admin can read
CREATE POLICY "factory_members self read"
  ON public.factory_members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_factory_admin());

-- Self (own row) or admin can update
CREATE POLICY "factory_members self update"
  ON public.factory_members
  FOR UPDATE
  TO authenticated
  USING  (auth.uid() = id OR public.is_factory_admin())
  WITH CHECK (auth.uid() = id OR public.is_factory_admin());

-- Only admin can insert new members
CREATE POLICY "admin insert factory_members"
  ON public.factory_members
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_factory_admin());

-- Only admin can delete / deactivate members
CREATE POLICY "admin delete factory_members"
  ON public.factory_members
  FOR DELETE
  TO authenticated
  USING (public.is_factory_admin());

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
