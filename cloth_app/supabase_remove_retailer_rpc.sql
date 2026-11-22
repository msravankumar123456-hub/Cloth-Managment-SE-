-- ==============================================================================
-- File: supabase_remove_retailer_rpc.sql
-- Run this in the Supabase SQL Editor to install the server-side RPC function
-- for safely removing retailer accounts with transaction preservation.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.remove_retailer_account(
  p_retailer_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_id UUID;
  v_retailer RECORD;
  v_orders_count INTEGER := 0;
  v_invoices_count INTEGER := 0;
BEGIN
  -- 1. Security Check: Only factory_admin can remove retailers
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL OR NOT public.is_factory_admin(v_caller_id) THEN
    RAISE EXCEPTION 'Unauthorized operation: Only Factory Admins can remove retailer accounts.'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Existence Check
  SELECT * INTO v_retailer
  FROM public.retailers
  WHERE id = p_retailer_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found.'
      USING ERRCODE = 'P0002';
  END IF;

  -- 3. Count existing orders and invoices
  SELECT COUNT(*) INTO v_orders_count
  FROM public.orders
  WHERE retailer_id = p_retailer_id OR user_id = p_retailer_id;

  SELECT COUNT(*) INTO v_invoices_count
  FROM public.invoices
  WHERE retailer_id = p_retailer_id OR user_id = p_retailer_id;

  -- 4. Preserve Historical Transactions
  -- Detach user_id and retailer_id so all orders, invoices, and totals remain intact
  IF v_orders_count > 0 THEN
    UPDATE public.orders
    SET retailer_id = NULL,
        user_id = NULL
    WHERE retailer_id = p_retailer_id OR user_id = p_retailer_id;
  END IF;

  IF v_invoices_count > 0 THEN
    UPDATE public.invoices
    SET retailer_id = NULL,
        user_id = NULL
    WHERE retailer_id = p_retailer_id OR user_id = p_retailer_id;
  END IF;

  -- 5. Delete from public.retailers
  DELETE FROM public.retailers WHERE id = p_retailer_id;

  -- 6. Delete from auth.users to permanently prevent login
  DELETE FROM auth.users WHERE id = p_retailer_id;

  -- 7. Audit log in factory_activity_logs
  INSERT INTO public.factory_activity_logs (
    user_id,
    user_email,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    v_caller_id,
    (SELECT email FROM auth.users WHERE id = v_caller_id),
    'REMOVE_RETAILER_ACCOUNT',
    'retailer',
    p_retailer_id::text,
    jsonb_build_object(
      'name', v_retailer.name,
      'email', v_retailer.email,
      'business_name', v_retailer.business_name,
      'preserved_orders', v_orders_count,
      'preserved_invoices', v_invoices_count
    )
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Account successfully removed.',
    'had_transactions', (v_orders_count > 0 OR v_invoices_count > 0),
    'preserved_orders', v_orders_count,
    'preserved_invoices', v_invoices_count
  );
END;
$$;
