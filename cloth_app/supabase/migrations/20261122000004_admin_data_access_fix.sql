-- ==============================================================================
-- FIX: Admin accounts were moved out of factory_members, so policies that use
-- is_factory_member() no longer grant admins access to orders/products/etc.
-- This restores admin data access WITHOUT giving admins factory-member login
-- privileges (loginFactory blocks admin_accounts) and WITHOUT allowing them to
-- place orders (is_retailer() still excludes them).
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_factory_member(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN RETURN FALSE; END IF;

  -- Separate admin accounts also need full factory operations access.
  IF public.is_admin(p_user_id) THEN RETURN TRUE; END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.factory_members
    WHERE id = p_user_id AND is_active = TRUE
  );
END;
$$;

COMMENT ON FUNCTION public.is_factory_member(UUID) IS
  'True for active factory members and for separate admin accounts (data access only). Login separation is enforced in application code.';

-- Verification helper
SELECT public.is_admin() AS admin_ok, public.is_factory_member() AS factory_access_ok;
