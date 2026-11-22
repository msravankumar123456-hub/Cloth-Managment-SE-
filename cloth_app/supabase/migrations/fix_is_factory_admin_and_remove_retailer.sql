-- ==============================================================================
-- FIX: is_factory_admin and remove_retailer_account
-- Run this in your Supabase SQL Editor:
-- When Supabase asks "Potential issues detected", click "Run without RLS"!
-- ==============================================================================

-- 1. Overload 1: is_factory_admin with no arguments
CREATE OR REPLACE FUNCTION public.is_factory_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.factory_members
    WHERE id = auth.uid()
      AND role = 'factory_admin'
      AND is_active = TRUE
  );
END;
$$;

-- 2. Overload 2: is_factory_admin with UUID argument
CREATE OR REPLACE FUNCTION public.is_factory_admin(
  p_user_id UUID
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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_factory_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_factory_admin(UUID) TO authenticated, anon;

-- 3. Function to safely remove a retailer account
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
  v_retailer_name TEXT;
  v_retailer_email TEXT;
  v_retailer_business TEXT;
  v_order_count INTEGER := 0;
  v_invoice_count INTEGER := 0;
BEGIN
  -- 1. Security Check: verify caller is factory_admin in factory_members
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.factory_members
    WHERE id = v_caller_id AND role = 'factory_admin' AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Unauthorized operation: Only Factory Admins can remove retailer accounts.'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Fetch retailer info
  SELECT name, email, business_name
  INTO v_retailer_name, v_retailer_email, v_retailer_business
  FROM public.retailers
  WHERE id = p_retailer_id;

  IF v_retailer_email IS NULL AND NOT FOUND THEN
    RAISE EXCEPTION 'Account not found.'
      USING ERRCODE = 'P0002';
  END IF;

  -- 3. Count existing orders and invoices
  SELECT COUNT(*) INTO v_order_count
  FROM public.orders
  WHERE retailer_id = p_retailer_id OR user_id = p_retailer_id;

  SELECT COUNT(*) INTO v_invoice_count
  FROM public.invoices
  WHERE retailer_id = p_retailer_id OR user_id = p_retailer_id;

  -- 4. Preserve Historical Transactions by detaching foreign key
  IF v_order_count > 0 THEN
    UPDATE public.orders
    SET retailer_id = NULL,
        user_id = NULL
    WHERE retailer_id = p_retailer_id OR user_id = p_retailer_id;
  END IF;

  IF v_invoice_count > 0 THEN
    UPDATE public.invoices
    SET retailer_id = NULL,
        user_id = NULL
    WHERE retailer_id = p_retailer_id OR user_id = p_retailer_id;
  END IF;

  -- 5. Delete from public.retailers table
  DELETE FROM public.retailers WHERE id = p_retailer_id;

  -- 6. Delete from auth.users (permanently revokes login capability)
  DELETE FROM auth.users WHERE id = p_retailer_id;

  -- 7. Audit log in factory_activity_logs if table exists
  BEGIN
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
        'name', v_retailer_name,
        'email', v_retailer_email,
        'business_name', v_retailer_business,
        'preserved_orders', v_order_count,
        'preserved_invoices', v_invoice_count
      )
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN jsonb_build_object(
    'success', TRUE,
    'message', 'Account successfully removed.',
    'had_transactions', (v_order_count > 0 OR v_invoice_count > 0),
    'preserved_orders', v_order_count,
    'preserved_invoices', v_invoice_count
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.remove_retailer_account(UUID) TO authenticated;
