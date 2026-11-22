-- ==============================================================================
-- LOOPMEX — SEPARATE ADMIN ACCOUNTS + STOCK ADJUSTMENT
-- File: 20261122000003_admin_separation_and_stock_adjust.sql
-- Safe to run more than once. No accounts or data are deleted.
--
-- Admin accounts move out of factory_members into their own table.
-- Factory members keep only factory-member privileges.
-- Stock adjustment becomes an ADMIN-ONLY action with full history.
-- ==============================================================================

-- ---------------------------------------------------------------------------
-- 1. Dedicated admin accounts table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL UNIQUE,
  full_name  TEXT        NOT NULL,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin accounts self read" ON public.admin_accounts;
CREATE POLICY "admin accounts self read"
  ON public.admin_accounts FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "admin accounts admin manage" ON public.admin_accounts;
CREATE POLICY "admin accounts admin manage"
  ON public.admin_accounts FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. is_admin() — the single trusted admin check
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.admin_accounts
    WHERE id = p_user_id AND is_active = TRUE
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 3. Re-point existing admin helpers to the separate table
--    is_factory_admin() is kept as an alias so existing policies keep working.
--    is_factory_staff() now EXCLUDES admins — admins are not factory members.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_factory_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.is_admin(p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_factory_staff(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.factory_members
    WHERE id = p_user_id
      AND role IN ('factory_member', 'factory_staff')
      AND is_active = TRUE
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. Migrate any existing factory_admin rows into admin_accounts, then
--    deactivate those factory_members rows so they are no longer "members".
-- ---------------------------------------------------------------------------
INSERT INTO public.admin_accounts (id, email, full_name, is_active)
SELECT fm.id, fm.email, COALESCE(fm.full_name, split_part(fm.email, '@', 1)), TRUE
FROM public.factory_members fm
WHERE fm.role = 'factory_admin'
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email, is_active = TRUE;

UPDATE public.factory_members
SET is_active = FALSE
WHERE role = 'factory_admin' AND is_active = TRUE;

-- Ensure the demo admin has a known working password.
UPDATE auth.users
SET encrypted_password = extensions.crypt('Admin12345!', extensions.gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE lower(email) = 'demo123@gmail.com';

-- ---------------------------------------------------------------------------
-- 5. Stock adjustment history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         TEXT        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  admin_id           UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email        TEXT,
  adjustment_type    TEXT        NOT NULL CHECK (adjustment_type IN ('Stock In','Stock Out','Set Stock')),
  size               TEXT        NOT NULL DEFAULT 'TOTAL',
  previous_quantity  INTEGER     NOT NULL,
  adjusted_quantity  INTEGER     NOT NULL,
  new_quantity       INTEGER     NOT NULL,
  reason             TEXT        NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_adj_product ON public.stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adj_created ON public.stock_adjustments(created_at DESC);

ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stock_adjustments select" ON public.stock_adjustments;
CREATE POLICY "stock_adjustments select"
  ON public.stock_adjustments FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "stock_adjustments insert" ON public.stock_adjustments;
CREATE POLICY "stock_adjustments insert"
  ON public.stock_adjustments FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 6. adjust_stock RPC — ADMIN ONLY
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.adjust_stock(
  p_product_id TEXT,
  p_adjustment_type TEXT,
  p_size TEXT,
  p_quantity INTEGER,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_caller_id UUID;
  v_caller_email TEXT;
  v_product RECORD;
  v_prev_qty INTEGER := 0;
  v_new_qty INTEGER := 0;
  v_target_size TEXT;
  v_s INTEGER; v_m INTEGER; v_l INTEGER; v_xl INTEGER; v_xxl INTEGER;
  v_total INTEGER;
  v_ratio NUMERIC;
BEGIN
  -- Trusted auth identity + separate admin table. No frontend values trusted.
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL OR NOT public.is_admin(v_caller_id) THEN
    RAISE EXCEPTION 'Unauthorized: only a separate Admin account can adjust stock.'
      USING ERRCODE = '42501';
  END IF;

  SELECT email INTO v_caller_email FROM auth.users WHERE id = v_caller_id;

  IF p_quantity IS NULL OR p_quantity < 0 THEN
    RAISE EXCEPTION 'Adjustment quantity cannot be negative.' USING ERRCODE = '22003';
  END IF;
  IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
    RAISE EXCEPTION 'A reason for stock adjustment is required.' USING ERRCODE = '22023';
  END IF;
  IF p_adjustment_type NOT IN ('Stock In','Stock Out','Set Stock') THEN
    RAISE EXCEPTION 'Invalid adjustment type.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_product FROM public.products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with ID "%" not found.', p_product_id USING ERRCODE = 'P0002';
  END IF;

  v_s := COALESCE(v_product.stock_s, 0);
  v_m := COALESCE(v_product.stock_m, 0);
  v_l := COALESCE(v_product.stock_l, 0);
  v_xl := COALESCE(v_product.stock_xl, 0);
  v_xxl := COALESCE(v_product.stock_xxl, 0);
  v_total := v_s + v_m + v_l + v_xl + v_xxl;
  v_target_size := UPPER(COALESCE(p_size, 'TOTAL'));

  IF v_target_size IN ('S','M','L','XL','XXL') THEN
    IF v_target_size = 'S' THEN v_prev_qty := v_s;
    ELSIF v_target_size = 'M' THEN v_prev_qty := v_m;
    ELSIF v_target_size = 'L' THEN v_prev_qty := v_l;
    ELSIF v_target_size = 'XL' THEN v_prev_qty := v_xl;
    ELSE v_prev_qty := v_xxl; END IF;

    IF p_adjustment_type = 'Stock In' THEN v_new_qty := v_prev_qty + p_quantity;
    ELSIF p_adjustment_type = 'Stock Out' THEN v_new_qty := v_prev_qty - p_quantity;
    ELSE v_new_qty := p_quantity; END IF;

    IF v_new_qty < 0 THEN
      RAISE EXCEPTION 'Stock for size % cannot be negative (current: %).', v_target_size, v_prev_qty;
    END IF;

    IF v_target_size = 'S' THEN UPDATE public.products SET stock_s = v_new_qty WHERE id = p_product_id;
    ELSIF v_target_size = 'M' THEN UPDATE public.products SET stock_m = v_new_qty WHERE id = p_product_id;
    ELSIF v_target_size = 'L' THEN UPDATE public.products SET stock_l = v_new_qty WHERE id = p_product_id;
    ELSIF v_target_size = 'XL' THEN UPDATE public.products SET stock_xl = v_new_qty WHERE id = p_product_id;
    ELSE UPDATE public.products SET stock_xxl = v_new_qty WHERE id = p_product_id; END IF;
  ELSE
    v_prev_qty := v_total;
    IF p_adjustment_type = 'Stock In' THEN v_new_qty := v_prev_qty + p_quantity;
    ELSIF p_adjustment_type = 'Stock Out' THEN v_new_qty := v_prev_qty - p_quantity;
    ELSE v_new_qty := p_quantity; END IF;

    IF v_new_qty < 0 THEN
      RAISE EXCEPTION 'Total stock cannot be negative (current: %).', v_prev_qty;
    END IF;

    IF v_prev_qty > 0 THEN
      v_ratio := v_new_qty::NUMERIC / v_prev_qty::NUMERIC;
      v_s := ROUND(v_s * v_ratio);
      v_m := ROUND(v_m * v_ratio);
      v_l := ROUND(v_l * v_ratio);
      v_xl := ROUND(v_xl * v_ratio);
      v_xxl := v_new_qty - (v_s + v_m + v_l + v_xl);
      IF v_xxl < 0 THEN v_xxl := 0; END IF;
    ELSE
      v_s := v_new_qty / 5; v_m := v_new_qty / 5; v_l := v_new_qty / 5;
      v_xl := v_new_qty / 5; v_xxl := v_new_qty - (v_s * 4);
    END IF;

    UPDATE public.products
    SET stock_s = v_s, stock_m = v_m, stock_l = v_l, stock_xl = v_xl, stock_xxl = v_xxl
    WHERE id = p_product_id;
  END IF;

  INSERT INTO public.stock_adjustments (
    product_id, admin_id, admin_email, adjustment_type, size,
    previous_quantity, adjusted_quantity, new_quantity, reason, created_at
  ) VALUES (
    p_product_id, v_caller_id, v_caller_email, p_adjustment_type, v_target_size,
    v_prev_qty, p_quantity, v_new_qty, TRIM(p_reason), NOW()
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'product_id', p_product_id,
    'adjustment_type', p_adjustment_type,
    'size', v_target_size,
    'previous_quantity', v_prev_qty,
    'adjusted_quantity', p_quantity,
    'new_quantity', v_new_qty,
    'reason', TRIM(p_reason)
  );
END;
$$;

-- Admin account summary (informational)
SELECT id, email, full_name, is_active FROM public.admin_accounts ORDER BY email;
