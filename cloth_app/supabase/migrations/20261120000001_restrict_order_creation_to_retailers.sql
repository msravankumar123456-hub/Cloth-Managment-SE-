-- LOOPMEX — ORDER CREATION RESTRICTED TO RETAILERS ONLY
-- Paste this entire file into Supabase SQL Editor → Run. Safe to run twice.

-- 1. Trusted role check: true only for a real retailer profile that is NOT
--    also an active factory member (owner/admin/partner/staff).
CREATE OR REPLACE FUNCTION public.is_retailer(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF p_user_id IS NULL THEN RETURN FALSE; END IF;
  IF EXISTS (
    SELECT 1 FROM public.factory_members
    WHERE id = p_user_id AND is_active = TRUE
  ) THEN RETURN FALSE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.retailers
    WHERE id = p_user_id OR user_id = p_user_id
  );
END;
$$;

-- 2. Database-level guard on the actual write operation.
--    Fires for EVERY order insert: the create_order RPC, direct PostgREST
--    requests, or any other route. Authorization comes from auth.uid() (the
--    trusted JWT) and the role is read from database tables.
CREATE OR REPLACE FUNCTION public.guard_order_insert_retailer_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_retailer(auth.uid()) THEN
    RAISE EXCEPTION 'Only authorized retailer accounts can place orders';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_order_insert_retailer_only ON public.orders;
CREATE TRIGGER trg_guard_order_insert_retailer_only
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.guard_order_insert_retailer_only();

-- 3. RLS: remove the factory-member bypass from direct order inserts.
DROP POLICY IF EXISTS "Retailers insert own orders" ON public.orders;
CREATE POLICY "Retailers insert own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_retailer(auth.uid())
    AND (auth.uid() = user_id OR auth.uid() = retailer_id)
  );

-- 4. RLS: same restriction on invoices. Factory keeps view/update/delete
--    (order management) but can no longer insert purchase invoices.
DROP POLICY IF EXISTS "Factory members manage invoices" ON public.invoices;
CREATE POLICY "Factory members view invoices" ON public.invoices
  FOR SELECT TO authenticated USING (public.is_factory_member());
CREATE POLICY "Factory members update invoices" ON public.invoices
  FOR UPDATE TO authenticated
  USING (public.is_factory_member()) WITH CHECK (public.is_factory_member());
CREATE POLICY "Factory members delete invoices" ON public.invoices
  FOR DELETE TO authenticated USING (public.is_factory_member());
CREATE POLICY "Retailers insert own invoices" ON public.invoices
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_retailer(auth.uid())
    AND (auth.uid() = user_id OR auth.uid() = retailer_id)
  );

SELECT 'ORDER SECURITY APPLIED' AS status;
