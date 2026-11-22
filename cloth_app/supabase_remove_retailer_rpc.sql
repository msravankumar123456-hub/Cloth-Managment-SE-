-- ==============================================================================
-- File: supabase_remove_retailer_rpc.sql
-- ==============================================================================

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

CREATE OR REPLACE FUNCTION public.remove_retailer_account(
  p_retailer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_admin_id UUID;
  v_email TEXT;
  v_name TEXT;
  v_bname TEXT;
  v_orders INTEGER := 0;
  v_invoices INTEGER := 0;
BEGIN
  -- 1. Security Check: verify caller is factory_admin
  v_admin_id := auth.uid();
  IF v_admin_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.factory_members
    WHERE id = v_admin_id AND role = 'factory_admin' AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Unauthorized operation: Only Factory Admins can remove retailer accounts.'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Existence Check
  SELECT email, name, business_name
  INTO v_email, v_name, v_bname
  FROM public.retailers
  WHERE id = p_retailer_id;

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Account not found.'
      USING ERRCODE = 'P0002';
  END IF;

  -- 3. Count existing orders & invoices
  SELECT COUNT(*) INTO v_orders FROM public.orders WHERE retailer_id = p_retailer_id OR user_id = p_retailer_id;
  SELECT COUNT(*) INTO v_invoices FROM public.invoices WHERE retailer_id = p_retailer_id OR user_id = p_retailer_id;

  -- 4. Preserve Historical Transactions
  IF v_orders > 0 THEN
    UPDATE public.orders SET retailer_id = NULL, user_id = NULL WHERE retailer_id = p_retailer_id OR user_id = p_retailer_id;
  END IF;

  IF v_invoices > 0 THEN
    UPDATE public.invoices SET retailer_id = NULL, user_id = NULL WHERE retailer_id = p_retailer_id OR user_id = p_retailer_id;
  END IF;

  -- 5. Delete retailer & auth user
  DELETE FROM public.retailers WHERE id = p_retailer_id;
  DELETE FROM auth.users WHERE id = p_retailer_id;

  -- 6. Audit log in factory_activity_logs
  BEGIN
    INSERT INTO public.factory_activity_logs (
      user_id, user_email, action, resource_type, resource_id, details
    ) VALUES (
      v_admin_id,
      (SELECT email FROM auth.users WHERE id = v_admin_id),
      'REMOVE_RETAILER_ACCOUNT',
      'retailer',
      p_retailer_id::text,
      jsonb_build_object('name', v_name, 'email', v_email, 'business_name', v_bname, 'preserved_orders', v_orders, 'preserved_invoices', v_invoices)
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Account successfully removed.',
    'had_transactions', (v_orders > 0 OR v_invoices > 0),
    'preserved_orders', v_orders,
    'preserved_invoices', v_invoices
  );
END;
$$;
