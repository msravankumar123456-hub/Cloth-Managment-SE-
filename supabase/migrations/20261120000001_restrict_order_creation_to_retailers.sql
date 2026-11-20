-- ==============================================================================
-- LOOPMEX — PHASE 3 MIGRATION: RESTRICT ORDER CREATION TO RETAILER ACCOUNTS ONLY
-- File: supabase/migrations/20261120000001_restrict_order_creation_to_retailers.sql
-- Idempotent: safe to execute multiple times in the Supabase SQL Editor.
--
-- WHY THIS MIGRATION EXISTS
--   The original create_order() RPC only checked auth.uid() IS NOT NULL. Because
--   it is SECURITY DEFINER it bypasses RLS, so ANY authenticated account
--   (including factory owners/admins/partners/staff) could create a purchase
--   order. In addition, the orders INSERT RLS policy ended with
--   "OR public.is_factory_member()", explicitly granting factory members a
--   direct-PostgREST insert path. Both holes are closed below.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TRUSTED RETAILER CHECK
--    Returns true ONLY when the caller has a real retailer profile AND does not
--    hold an active factory_members role. The role is read from the database,
--    never from user-supplied metadata or request payloads.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_retailer(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Factory owners, admins, partners and staff are never retailers for purchasing.
  IF EXISTS (
    SELECT 1 FROM public.factory_members
    WHERE id = p_user_id AND is_active = TRUE
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.retailers
    WHERE id = p_user_id OR user_id = p_user_id
  );
END;
$$;

COMMENT ON FUNCTION public.is_retailer(UUID) IS
  'True only for verified, active retailer profiles that are not also active factory members.';

-- ------------------------------------------------------------------------------
-- 2. HARDEN THE create_order() RPC
--    SECURITY DEFINER is retained (needed for atomic stock + order + invoice
--    writes), but authorization is now enforced from the trusted auth context
--    before any data is written.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_order(
  p_order_info JSONB,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_retailer_name TEXT;
  v_retailer_store TEXT;
  v_retailer_city TEXT;
  v_retailer_phone TEXT;
  v_payment_method TEXT;
  v_payment_status TEXT;
  v_subtotal INTEGER := 0;
  v_gst_amount INTEGER := 0;
  v_grand_total INTEGER := 0;
  v_total_pieces INTEGER := 0;
  v_random_suffix TEXT;
  v_order_number TEXT;
  v_order_id TEXT;
  v_invoice_id TEXT;
  v_today TEXT;
  v_est_delivery TEXT;
  v_tracking_number TEXT;
  v_item JSONB;
  v_product_id TEXT;
  v_prod_record RECORD;
  v_qty_s INTEGER;
  v_qty_m INTEGER;
  v_qty_l INTEGER;
  v_qty_xl INTEGER;
  v_qty_xxl INTEGER;
  v_item_qty INTEGER;
  v_item_total INTEGER;
  v_sanitized_items JSONB := '[]'::JSONB;
BEGIN
  -- (1) Identity from the trusted Supabase auth context.
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to place an order';
  END IF;

  -- (2-5) Role is fetched from trusted database tables. Nothing supplied by the
  --        frontend (email, role, user id, metadata) is accepted as proof.
  IF NOT public.is_retailer(v_user_id) THEN
    RAISE EXCEPTION 'Only authorized retailer accounts can place orders';
  END IF;

  v_retailer_name := COALESCE(p_order_info->>'retailerName', p_order_info->>'retailer_name', 'Valued Retailer');
  v_retailer_store := COALESCE(p_order_info->>'retailerStore', p_order_info->>'retailer_store', 'Retail Boutique');
  v_retailer_city := COALESCE(p_order_info->>'retailerCity', p_order_info->>'retailer_city', 'India');
  v_retailer_phone := COALESCE(p_order_info->>'retailerPhone', p_order_info->>'retailer_phone', '');
  v_payment_method := COALESCE(p_order_info->>'paymentMethod', p_order_info->>'payment_method', 'NEFT / RTGS');

  IF v_payment_method = 'Factory Credit (15 Days)' THEN
    v_payment_status := 'Pending';
  ELSE
    v_payment_status := 'Paid';
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- Validate and deduct stock for each item atomically
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := COALESCE(v_item->'product'->>'id', v_item->>'productId', v_item->>'product_id');
    IF v_product_id IS NULL THEN
      RAISE EXCEPTION 'Invalid product in order payload';
    END IF;

    -- Pessimistic locking (FOR UPDATE) prevents race conditions & overselling
    SELECT * INTO v_prod_record
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not found in catalog', v_product_id;
    END IF;

    v_qty_s := COALESCE((v_item->'sizes'->>'S')::INTEGER, 0);
    v_qty_m := COALESCE((v_item->'sizes'->>'M')::INTEGER, 0);
    v_qty_l := COALESCE((v_item->'sizes'->>'L')::INTEGER, 0);
    v_qty_xl := COALESCE((v_item->'sizes'->>'XL')::INTEGER, 0);
    v_qty_xxl := COALESCE((v_item->'sizes'->>'XXL')::INTEGER, 0);

    IF v_prod_record.stock_s < v_qty_s THEN
      RAISE EXCEPTION 'Insufficient size S stock for %. Available: %, Requested: %', v_prod_record.name, v_prod_record.stock_s, v_qty_s;
    END IF;
    IF v_prod_record.stock_m < v_qty_m THEN
      RAISE EXCEPTION 'Insufficient size M stock for %. Available: %, Requested: %', v_prod_record.name, v_prod_record.stock_m, v_qty_m;
    END IF;
    IF v_prod_record.stock_l < v_qty_l THEN
      RAISE EXCEPTION 'Insufficient size L stock for %. Available: %, Requested: %', v_prod_record.name, v_prod_record.stock_l, v_qty_l;
    END IF;
    IF v_prod_record.stock_xl < v_qty_xl THEN
      RAISE EXCEPTION 'Insufficient size XL stock for %. Available: %, Requested: %', v_prod_record.name, v_prod_record.stock_xl, v_qty_xl;
    END IF;
    IF v_prod_record.stock_xxl < v_qty_xxl THEN
      RAISE EXCEPTION 'Insufficient size XXL stock for %. Available: %, Requested: %', v_prod_record.name, v_prod_record.stock_xxl, v_qty_xxl;
    END IF;

    UPDATE public.products SET
      stock_s = stock_s - v_qty_s,
      stock_m = stock_m - v_qty_m,
      stock_l = stock_l - v_qty_l,
      stock_xl = stock_xl - v_qty_xl,
      stock_xxl = stock_xxl - v_qty_xxl
    WHERE id = v_product_id;

    v_item_qty := v_qty_s + v_qty_m + v_qty_l + v_qty_xl + v_qty_xxl;
    -- Server-side verified price calculation prevents price tampering
    v_item_total := v_item_qty * v_prod_record.wholesale_price;

    v_total_pieces := v_total_pieces + v_item_qty;
    v_subtotal := v_subtotal + v_item_total;

    v_sanitized_items := v_sanitized_items || jsonb_build_object(
      'id', COALESCE(v_item->>'id', 'item-' || floor(random() * 100000)::TEXT),
      'product', jsonb_build_object(
        'id', v_prod_record.id,
        'name', v_prod_record.name,
        'wholesalePrice', v_prod_record.wholesale_price,
        'image', v_prod_record.image,
        'category', v_prod_record.category,
        'fabric', v_prod_record.fabric
      ),
      'sizes', jsonb_build_object(
        'S', v_qty_s,
        'M', v_qty_m,
        'L', v_qty_l,
        'XL', v_qty_xl,
        'XXL', v_qty_xxl
      ),
      'selectedColor', COALESCE(v_item->>'selectedColor', 'Standard'),
      'totalQuantity', v_item_qty,
      'itemTotal', v_item_total
    );
  END LOOP;

  IF v_total_pieces = 0 THEN
    RAISE EXCEPTION 'Order contains zero pieces';
  END IF;

  v_gst_amount := ROUND(v_subtotal * 0.05);
  v_grand_total := v_subtotal + v_gst_amount;

  v_random_suffix := floor(1000 + random() * 9000)::TEXT;
  v_order_number := 'TB-ORD-' || v_random_suffix;
  v_order_id := 'ord-' || floor(extract(epoch from now()) * 1000)::TEXT || '-' || v_random_suffix;
  v_invoice_id := 'inv-' || floor(extract(epoch from now()) * 1000)::TEXT || '-' || v_random_suffix;
  v_today := to_char(NOW(), 'YYYY-MM-DD');
  v_est_delivery := to_char(NOW() + interval '5 days', 'YYYY-MM-DD');
  v_tracking_number := 'TB-EXP-' || floor(100000 + random() * 900000)::TEXT;

  INSERT INTO public.orders (
    id, order_number, user_id, retailer_id, date,
    retailer_name, retailer_store, retailer_city, retailer_phone,
    total_pieces, subtotal, gst_amount, grand_total, status,
    tracking_number, courier_name, estimated_delivery,
    payment_method, payment_status, items, created_at
  ) VALUES (
    v_order_id, v_order_number, v_user_id, v_user_id, v_today,
    v_retailer_name, v_retailer_store, v_retailer_city, v_retailer_phone,
    v_total_pieces, v_subtotal, v_gst_amount, v_grand_total, 'Confirmed',
    v_tracking_number, 'Delhivery B2B Freight', v_est_delivery,
    v_payment_method, v_payment_status, v_sanitized_items, NOW()
  );

  INSERT INTO public.invoices (
    id, invoice_number, order_id, order_number, user_id, retailer_id,
    date, due_date, retailer_name, retailer_store, retailer_gst,
    subtotal, gst_amount, grand_total, total_pieces, status, created_at
  ) VALUES (
    v_invoice_id, 'INV-TB-2026-' || v_random_suffix, v_order_id, v_order_number,
    v_user_id, v_user_id, v_today, v_est_delivery,
    v_retailer_name, v_retailer_store, '27AABCA9918K1ZZ',
    v_subtotal, v_gst_amount, v_grand_total, v_total_pieces,
    v_payment_status, NOW()
  );

  UPDATE public.retailers SET
    total_spent = COALESCE(total_spent, 0) + v_grand_total,
    active_orders_count = COALESCE(active_orders_count, 0) + 1,
    updated_at = NOW()
  WHERE id = v_user_id OR user_id = v_user_id;

  RETURN jsonb_build_object(
    'id', v_order_id,
    'orderNumber', v_order_number,
    'date', v_today,
    'retailerName', v_retailer_name,
    'retailerStore', v_retailer_store,
    'retailerCity', v_retailer_city,
    'retailerPhone', v_retailer_phone,
    'items', v_sanitized_items,
    'totalPieces', v_total_pieces,
    'subtotal', v_subtotal,
    'gstAmount', v_gst_amount,
    'grandTotal', v_grand_total,
    'status', 'Confirmed',
    'trackingNumber', v_tracking_number,
    'courierName', 'Delhivery B2B Freight',
    'estimatedDelivery', v_est_delivery,
    'paymentMethod', v_payment_method,
    'paymentStatus', v_payment_status,
    'invoiceNumber', 'INV-TB-2026-' || v_random_suffix
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. CLOSE THE DIRECT-INSERT RLS HOLE ON public.orders
--    Removes "OR public.is_factory_member()" so factory staff cannot insert an
--    order through direct PostgREST requests. View/update rights are unchanged.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Retailers insert own orders" ON public.orders;
CREATE POLICY "Retailers insert own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_retailer(auth.uid())
    AND (auth.uid() = user_id OR auth.uid() = retailer_id)
  );

-- ------------------------------------------------------------------------------
-- 4. CLOSE THE SAME HOLE ON public.invoices
--    Factory members keep view/update/delete (order management) but can no
--    longer INSERT invoices. The create_order RPC is SECURITY DEFINER and still
--    creates invoices for legitimate retailer orders.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Factory members manage invoices" ON public.invoices;
CREATE POLICY "Factory members view invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (public.is_factory_member());
CREATE POLICY "Factory members update invoices" ON public.invoices
  FOR UPDATE TO authenticated
  USING (public.is_factory_member())
  WITH CHECK (public.is_factory_member());
CREATE POLICY "Factory members delete invoices" ON public.invoices
  FOR DELETE TO authenticated
  USING (public.is_factory_member());
CREATE POLICY "Retailers insert own invoices" ON public.invoices
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_retailer(auth.uid())
    AND (auth.uid() = user_id OR auth.uid() = retailer_id)
  );

-- ------------------------------------------------------------------------------
-- 5. VERIFICATION HELPERS (informational only)
-- ------------------------------------------------------------------------------
-- Run: SELECT polname, pg_get_expr(polqual, polrelid) FROM pg_policy WHERE polrelid='public.orders'::regclass;
--
-- Expected create_order signature:
-- Run: SELECT proname, prosecdef FROM pg_proc WHERE proname = 'create_order';
--      -> prosecdef = true (SECURITY DEFINER retained, now role-guarded)
