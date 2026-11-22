-- ==============================================================================
-- LOOPMEX — SEPARATE ADMIN ACCOUNTS + STOCK ADJUSTMENT
-- Run in Supabase SQL Editor. Safe to re-run (idempotent).
-- Order matters: is_admin() must exist before any policy references it.
-- ==============================================================================

-- 1. is_admin() FIRST — no policies reference it yet.
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

-- 2. Admin accounts table
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Helpers (after is_admin exists)
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
      AND role IN ('factory_member','factory_staff')
      AND is_active = TRUE
  );
END;
$$;

-- 4. RLS on admin_accounts (is_admin now exists)
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin accounts self read" ON public.admin_accounts;
CREATE POLICY "admin accounts self read"
  ON public.admin_accounts FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

-- 5. Migrate existing admins into the separate table
INSERT INTO public.admin_accounts (id,email,full_name)
SELECT id,email,COALESCE(full_name,split_part(email,'@',1))
FROM public.factory_members
WHERE role='factory_admin'
ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email, is_active=TRUE;

INSERT INTO public.admin_accounts (id,email,full_name)
SELECT u.id,u.email,'Demo Admin'
FROM auth.users u
WHERE lower(u.email)='demo123@gmail.com'
ON CONFLICT (id) DO UPDATE SET is_active=TRUE;

UPDATE public.factory_members SET is_active=FALSE WHERE role='factory_admin';

UPDATE auth.users
SET encrypted_password=extensions.crypt('Admin12345!',extensions.gen_salt('bf')),
    email_confirmed_at=COALESCE(email_confirmed_at,now())
WHERE lower(email)='demo123@gmail.com';

-- 6. Stock adjustment history
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('Stock In','Stock Out','Set Stock')),
  size TEXT NOT NULL DEFAULT 'TOTAL',
  previous_quantity INTEGER NOT NULL,
  adjusted_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stock_adj_product ON public.stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adj_created ON public.stock_adjustments(created_at DESC);
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stock_adjustments select" ON public.stock_adjustments;
CREATE POLICY "stock_adjustments select" ON public.stock_adjustments
  FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "stock_adjustments insert" ON public.stock_adjustments;
CREATE POLICY "stock_adjustments insert" ON public.stock_adjustments
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- 7. adjust_stock RPC — ADMIN ONLY
CREATE OR REPLACE FUNCTION public.adjust_stock(
  p_product_id TEXT, p_adjustment_type TEXT, p_size TEXT,
  p_quantity INTEGER, p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_email TEXT;
  v_p RECORD;
  v_col TEXT;
  v_prev INT := 0;
  v_new INT := 0;
  v_total INT;
  v_ratio NUMERIC;
  v_s INT; v_m INT; v_l INT; v_xl INT; v_xxl INT;
  v_target TEXT;
BEGIN
  IF v_uid IS NULL OR NOT public.is_admin(v_uid) THEN
    RAISE EXCEPTION 'Unauthorized: only a separate Admin account can adjust stock.'
      USING ERRCODE = '42501';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;

  IF p_quantity IS NULL OR p_quantity < 0 THEN
    RAISE EXCEPTION 'Quantity cannot be negative.' USING ERRCODE = '22003';
  END IF;
  IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
    RAISE EXCEPTION 'A reason is required.' USING ERRCODE = '22023';
  END IF;
  IF p_adjustment_type NOT IN ('Stock In','Stock Out','Set Stock') THEN
    RAISE EXCEPTION 'Invalid adjustment type.' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_p FROM public.products WHERE id = p_product_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product "%" not found.', p_product_id USING ERRCODE = 'P0002';
  END IF;

  v_s := COALESCE(v_p.stock_s,0); v_m := COALESCE(v_p.stock_m,0);
  v_l := COALESCE(v_p.stock_l,0); v_xl := COALESCE(v_p.stock_xl,0);
  v_xxl := COALESCE(v_p.stock_xxl,0); v_total := v_s+v_m+v_l+v_xl+v_xxl;
  v_target := UPPER(COALESCE(p_size,'TOTAL'));

  v_col := CASE v_target
    WHEN 'S' THEN 'stock_s' WHEN 'M' THEN 'stock_m' WHEN 'L' THEN 'stock_l'
    WHEN 'XL' THEN 'stock_xl' WHEN 'XXL' THEN 'stock_xxl' ELSE NULL END;

  IF v_col IS NOT NULL THEN
    v_prev := CASE v_col WHEN 'stock_s' THEN v_s WHEN 'stock_m' THEN v_m
              WHEN 'stock_l' THEN v_l WHEN 'stock_xl' THEN v_xl ELSE v_xxl END;
    IF p_adjustment_type='Stock In' THEN v_new := v_prev + p_quantity;
    ELSIF p_adjustment_type='Stock Out' THEN v_new := v_prev - p_quantity;
    ELSE v_new := p_quantity; END IF;
    IF v_new < 0 THEN
      RAISE EXCEPTION 'Stock for size % cannot be negative (current %).', v_target, v_prev;
    END IF;
    EXECUTE format('UPDATE public.products SET %I = $1 WHERE id = $2', v_col) USING v_new, p_product_id;
  ELSE
    v_prev := v_total;
    IF p_adjustment_type='Stock In' THEN v_new := v_prev + p_quantity;
    ELSIF p_adjustment_type='Stock Out' THEN v_new := v_prev - p_quantity;
    ELSE v_new := p_quantity; END IF;
    IF v_new < 0 THEN
      RAISE EXCEPTION 'Total stock cannot be negative (current %).', v_prev;
    END IF;
    IF v_prev > 0 THEN
      v_ratio := v_new::NUMERIC / v_prev::NUMERIC;
      v_s := ROUND(v_s*v_ratio); v_m := ROUND(v_m*v_ratio);
      v_l := ROUND(v_l*v_ratio); v_xl := ROUND(v_xl*v_ratio);
      v_xxl := v_new - (v_s+v_m+v_l+v_xl);
      IF v_xxl < 0 THEN v_xxl := 0; END IF;
    ELSE
      v_s := v_new/5; v_m := v_new/5; v_l := v_new/5; v_xl := v_new/5;
      v_xxl := v_new - (v_s*4);
    END IF;
    UPDATE public.products SET stock_s=v_s, stock_m=v_m, stock_l=v_l, stock_xl=v_xl, stock_xxl=v_xxl
    WHERE id = p_product_id;
  END IF;

  INSERT INTO public.stock_adjustments
    (product_id, admin_id, admin_email, adjustment_type, size,
     previous_quantity, adjusted_quantity, new_quantity, reason, created_at)
  VALUES
    (p_product_id, v_uid, v_email, p_adjustment_type, v_target,
     v_prev, p_quantity, v_new, TRIM(p_reason), NOW());

  RETURN jsonb_build_object(
    'success', TRUE,
    'product_id', p_product_id,
    'adjustment_type', p_adjustment_type,
    'size', v_target,
    'previous_quantity', v_prev,
    'adjusted_quantity', p_quantity,
    'new_quantity', v_new,
    'reason', TRIM(p_reason)
  );
END;
$$;

SELECT id,email,full_name,is_active FROM public.admin_accounts ORDER BY email;
