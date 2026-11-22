-- ==============================================================================
-- Migration: 20261122000002_stock_adjustments.sql
-- Purpose  : 1. Create stock_adjustments history table with RLS
--            2. Create adjust_stock RPC function for atomic stock adjustment
-- ==============================================================================

-- 1. Create stock_adjustments table
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('Stock In', 'Stock Out', 'Set Stock')),
  size TEXT NOT NULL DEFAULT 'Total',
  previous_quantity INTEGER NOT NULL,
  adjusted_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast history lookups
CREATE INDEX IF NOT EXISTS idx_stock_adj_product ON public.stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adj_created ON public.stock_adjustments(created_at DESC);

-- Enable RLS
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stock_adjustments select" ON public.stock_adjustments;
CREATE POLICY "stock_adjustments select"
  ON public.stock_adjustments
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "stock_adjustments insert" ON public.stock_adjustments;
CREATE POLICY "stock_adjustments insert"
  ON public.stock_adjustments
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 2. Atomic Stock Adjustment RPC Function
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
  v_s INTEGER;
  v_m INTEGER;
  v_l INTEGER;
  v_xl INTEGER;
  v_xxl INTEGER;
  v_total INTEGER;
  v_ratio NUMERIC;
BEGIN
  -- 1. Authorization check: Only Factory Admin (or authorized staff)
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL OR NOT public.is_admin(v_caller_id) THEN
    RAISE EXCEPTION 'Unauthorized: only a separate Admin account can adjust stock.'
      USING ERRCODE = '42501';
  END IF;

  SELECT email INTO v_caller_email FROM auth.users WHERE id = v_caller_id;

  -- 2. Parameter validation
  IF p_quantity < 0 THEN
    RAISE EXCEPTION 'Adjustment quantity cannot be negative.'
      USING ERRCODE = '22003';
  END IF;

  IF p_reason IS NULL OR TRIM(p_reason) = '' THEN
    RAISE EXCEPTION 'A reason for stock adjustment is required.'
      USING ERRCODE = '22023';
  END IF;

  IF p_adjustment_type NOT IN ('Stock In', 'Stock Out', 'Set Stock') THEN
    RAISE EXCEPTION 'Invalid adjustment type: %', p_adjustment_type
      USING ERRCODE = '22023';
  END IF;

  -- 3. Lock product row FOR UPDATE to prevent race conditions
  SELECT * INTO v_product
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with ID "%" not found.', p_product_id
      USING ERRCODE = 'P0002';
  END IF;

  v_s := COALESCE(v_product.stock_s, 0);
  v_m := COALESCE(v_product.stock_m, 0);
  v_l := COALESCE(v_product.stock_l, 0);
  v_xl := COALESCE(v_product.stock_xl, 0);
  v_xxl := COALESCE(v_product.stock_xxl, 0);
  v_total := v_s + v_m + v_l + v_xl + v_xxl;

  v_target_size := UPPER(COALESCE(p_size, 'TOTAL'));

  -- Handle by Size
  IF v_target_size = 'S' THEN
    v_prev_qty := v_s;
    IF p_adjustment_type = 'Stock In' THEN v_new_qty := v_prev_qty + p_quantity;
    ELSIF p_adjustment_type = 'Stock Out' THEN v_new_qty := v_prev_qty - p_quantity;
    ELSE v_new_qty := p_quantity; END IF;
    IF v_new_qty < 0 THEN RAISE EXCEPTION 'Stock for size S cannot be negative (current: %, decrease: %).', v_prev_qty, p_quantity; END IF;
    UPDATE public.products SET stock_s = v_new_qty WHERE id = p_product_id;

  ELSIF v_target_size = 'M' THEN
    v_prev_qty := v_m;
    IF p_adjustment_type = 'Stock In' THEN v_new_qty := v_prev_qty + p_quantity;
    ELSIF p_adjustment_type = 'Stock Out' THEN v_new_qty := v_prev_qty - p_quantity;
    ELSE v_new_qty := p_quantity; END IF;
    IF v_new_qty < 0 THEN RAISE EXCEPTION 'Stock for size M cannot be negative (current: %, decrease: %).', v_prev_qty, p_quantity; END IF;
    UPDATE public.products SET stock_m = v_new_qty WHERE id = p_product_id;

  ELSIF v_target_size = 'L' THEN
    v_prev_qty := v_l;
    IF p_adjustment_type = 'Stock In' THEN v_new_qty := v_prev_qty + p_quantity;
    ELSIF p_adjustment_type = 'Stock Out' THEN v_new_qty := v_prev_qty - p_quantity;
    ELSE v_new_qty := p_quantity; END IF;
    IF v_new_qty < 0 THEN RAISE EXCEPTION 'Stock for size L cannot be negative (current: %, decrease: %).', v_prev_qty, p_quantity; END IF;
    UPDATE public.products SET stock_l = v_new_qty WHERE id = p_product_id;

  ELSIF v_target_size = 'XL' THEN
    v_prev_qty := v_xl;
    IF p_adjustment_type = 'Stock In' THEN v_new_qty := v_prev_qty + p_quantity;
    ELSIF p_adjustment_type = 'Stock Out' THEN v_new_qty := v_prev_qty - p_quantity;
    ELSE v_new_qty := p_quantity; END IF;
    IF v_new_qty < 0 THEN RAISE EXCEPTION 'Stock for size XL cannot be negative (current: %, decrease: %).', v_prev_qty, p_quantity; END IF;
    UPDATE public.products SET stock_xl = v_new_qty WHERE id = p_product_id;

  ELSIF v_target_size = 'XXL' THEN
    v_prev_qty := v_xxl;
    IF p_adjustment_type = 'Stock In' THEN v_new_qty := v_prev_qty + p_quantity;
    ELSIF p_adjustment_type = 'Stock Out' THEN v_new_qty := v_prev_qty - p_quantity;
    ELSE v_new_qty := p_quantity; END IF;
    IF v_new_qty < 0 THEN RAISE EXCEPTION 'Stock for size XXL cannot be negative (current: %, decrease: %).', v_prev_qty, p_quantity; END IF;
    UPDATE public.products SET stock_xxl = v_new_qty WHERE id = p_product_id;

  ELSE
    -- TOTAL stock adjustment: proportionally adjust all 5 sizes
    v_prev_qty := v_total;
    IF p_adjustment_type = 'Stock In' THEN v_new_qty := v_prev_qty + p_quantity;
    ELSIF p_adjustment_type = 'Stock Out' THEN v_new_qty := v_prev_qty - p_quantity;
    ELSE v_new_qty := p_quantity; END IF;

    IF v_new_qty < 0 THEN
      RAISE EXCEPTION 'Total stock cannot be negative (current total: %, decrease: %).', v_prev_qty, p_quantity;
    END IF;

    IF v_prev_qty > 0 THEN
      v_ratio := v_new_qty::NUMERIC / v_prev_qty::NUMERIC;
      v_s := ROUND(v_s * v_ratio);
      v_m := ROUND(v_m * v_ratio);
      v_l := ROUND(v_l * v_ratio);
      v_xl := ROUND(v_xl * v_ratio);
      -- Assign remainder to XXL so exact total matches v_new_qty
      v_xxl := v_new_qty - (v_s + v_m + v_l + v_xl);
      IF v_xxl < 0 THEN
        v_xxl := 0;
      END IF;
    ELSE
      -- Previously 0: distribute evenly across 5 sizes
      v_s := v_new_qty / 5;
      v_m := v_new_qty / 5;
      v_l := v_new_qty / 5;
      v_xl := v_new_qty / 5;
      v_xxl := v_new_qty - (v_s * 4);
    END IF;

    UPDATE public.products
    SET stock_s = v_s, stock_m = v_m, stock_l = v_l, stock_xl = v_xl, stock_xxl = v_xxl
    WHERE id = p_product_id;
  END IF;

  -- 4. Record in stock_adjustments history table
  INSERT INTO public.stock_adjustments (
    product_id,
    admin_id,
    admin_email,
    adjustment_type,
    size,
    previous_quantity,
    adjusted_quantity,
    new_quantity,
    reason,
    created_at
  ) VALUES (
    p_product_id,
    v_caller_id,
    v_caller_email,
    p_adjustment_type,
    v_target_size,
    v_prev_qty,
    p_quantity,
    v_new_qty,
    TRIM(p_reason),
    NOW()
  );

  -- 5. Return summary
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
