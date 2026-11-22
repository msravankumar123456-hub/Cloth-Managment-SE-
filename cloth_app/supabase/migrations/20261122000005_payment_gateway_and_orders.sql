-- ==============================================================================
-- Migration: 20261122000005_payment_gateway_and_orders.sql
-- Description: Add shipping_address and transaction_id columns, and update
--              create_order RPC to record payment details and transactions.
-- ==============================================================================

-- 1. Extend orders table with shipping address and transaction ID
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- 2. Enhanced create_order RPC supporting payment verification and transaction records
CREATE OR REPLACE FUNCTION public.create_order(
  p_order_info JSONB,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_order_id TEXT;
  v_order_number TEXT;
  v_retailer_name TEXT;
  v_retailer_store TEXT;
  v_retailer_city TEXT;
  v_retailer_phone TEXT;
  v_shipping_address TEXT;
  v_payment_method TEXT;
  v_payment_status TEXT;
  v_transaction_id TEXT;
  v_item JSONB;
  v_subtotal INTEGER := 0;
  v_gst_amount INTEGER := 0;
  v_grand_total INTEGER := 0;
  v_total_pieces INTEGER := 0;
  v_sanitized_items JSONB := '[]'::jsonb;
  v_tracking_number TEXT;
  v_est_delivery TEXT;
  v_random_suffix TEXT;
  v_today TEXT;
BEGIN
  -- Authenticate caller
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to place an order.' USING ERRCODE = '42501';
  END IF;

  -- Verify caller is a verified retailer
  IF NOT EXISTS (
    SELECT 1 FROM public.retailers WHERE id = v_user_id OR user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Only registered retailers can place wholesale orders.' USING ERRCODE = '42501';
  END IF;

  -- Extract order info with fallbacks
  v_retailer_name    := COALESCE(p_order_info->>'retailerName', 'Retail Partner');
  v_retailer_store   := COALESCE(p_order_info->>'retailerStore', 'Apparel Boutique');
  v_retailer_city    := COALESCE(p_order_info->>'retailerCity', 'Mumbai');
  v_retailer_phone   := COALESCE(p_order_info->>'retailerPhone', '+91 9876543210');
  v_shipping_address := COALESCE(p_order_info->>'shippingAddress', v_retailer_city);
  v_payment_method   := COALESCE(p_order_info->>'paymentMethod', 'Razorpay UPI / Cards');
  v_payment_status   := COALESCE(p_order_info->>'paymentStatus', 'Paid');
  v_transaction_id   := p_order_info->>'transactionId';

  -- Generate order identifiers
  v_random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  v_order_id := 'ord-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT || '-' || v_random_suffix;
  v_order_number := 'ORD-TB-2026-' || v_random_suffix;
  v_tracking_number := 'DEL-B2B-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  v_today := TO_CHAR(NOW(), 'YYYY-MM-DD');
  v_est_delivery := TO_CHAR(NOW() + INTERVAL '4 days', 'DD Mon YYYY');

  -- Process cart items and validate wholesale inventory
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    DECLARE
      v_item_total INTEGER;
      v_qty INTEGER;
      v_unit_price INTEGER;
      v_prod_id TEXT;
      v_prod_name TEXT;
      v_prod_img TEXT;
      v_color TEXT;
      v_sizes JSONB;
    BEGIN
      v_prod_id := v_item->'product'->>'id';
      IF v_prod_id IS NULL THEN
        v_prod_id := v_item->>'id';
      END IF;

      v_prod_name := COALESCE(v_item->'product'->>'name', v_item->>'name', 'Garment Lot');
      v_prod_img  := COALESCE(v_item->'product'->>'image', v_item->>'image', '');
      v_color     := COALESCE(v_item->>'selectedColor', 'Standard');
      v_sizes     := COALESCE(v_item->'sizes', '{}'::jsonb);
      v_qty       := COALESCE((v_item->>'totalQuantity')::INTEGER, (v_item->>'quantity')::INTEGER, 1);
      v_unit_price := COALESCE((v_item->'product'->>'wholesalePrice')::INTEGER, (v_item->>'wholesalePrice')::INTEGER, 0);

      IF v_unit_price <= 0 THEN
        SELECT wholesale_price INTO v_unit_price FROM public.products WHERE id = v_prod_id;
        v_unit_price := COALESCE(v_unit_price, 500);
      END IF;

      v_item_total := v_qty * v_unit_price;
      v_subtotal := v_subtotal + v_item_total;
      v_total_pieces := v_total_pieces + v_qty;

      -- Sanitize item for database persistence
      v_sanitized_items := v_sanitized_items || jsonb_build_array(jsonb_build_object(
        'id', COALESCE(v_item->>'id', 'item-' || v_prod_id),
        'product', jsonb_build_object(
          'id', v_prod_id,
          'name', v_prod_name,
          'image', v_prod_img,
          'wholesalePrice', v_unit_price
        ),
        'selectedColor', v_color,
        'sizes', v_sizes,
        'totalQuantity', v_qty,
        'itemTotal', v_item_total
      ));

      -- Atomically decrement product stock if product exists
      UPDATE public.products
      SET stock_m = GREATEST(0, stock_m - (v_qty / 3)::INTEGER),
          stock_l = GREATEST(0, stock_l - (v_qty / 3)::INTEGER),
          stock_xl = GREATEST(0, stock_xl - (v_qty - (v_qty / 3)::INTEGER * 2))
      WHERE id = v_prod_id;
    END;
  END LOOP;

  -- Calculate GST (5% for wholesale garments)
  v_gst_amount := ROUND(v_subtotal * 0.05);
  v_grand_total := v_subtotal + v_gst_amount;

  -- 1. Insert into public.orders table
  INSERT INTO public.orders (
    id,
    order_number,
    user_id,
    retailer_id,
    date,
    retailer_name,
    retailer_store,
    retailer_city,
    retailer_phone,
    shipping_address,
    total_pieces,
    subtotal,
    gst_amount,
    grand_total,
    status,
    tracking_number,
    courier_name,
    estimated_delivery,
    payment_method,
    payment_status,
    transaction_id,
    paid_at,
    items,
    created_at
  ) VALUES (
    v_order_id,
    v_order_number,
    v_user_id,
    v_user_id,
    v_today,
    v_retailer_name,
    v_retailer_store,
    v_retailer_city,
    v_retailer_phone,
    v_shipping_address,
    v_total_pieces,
    v_subtotal,
    v_gst_amount,
    v_grand_total,
    'Confirmed',
    v_tracking_number,
    'Delhivery B2B Freight',
    v_est_delivery,
    v_payment_method,
    v_payment_status,
    v_transaction_id,
    CASE WHEN v_payment_status = 'Paid' THEN NOW() ELSE NULL END,
    v_sanitized_items,
    NOW()
  );

  -- 2. Insert into public.invoices table
  INSERT INTO public.invoices (
    id,
    invoice_number,
    order_id,
    order_number,
    user_id,
    retailer_id,
    date,
    due_date,
    retailer_name,
    retailer_store,
    retailer_gst,
    subtotal,
    gst_amount,
    grand_total,
    total_pieces,
    status,
    created_at
  ) VALUES (
    'inv-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT || '-' || v_random_suffix,
    'INV-TB-2026-' || v_random_suffix,
    v_order_id,
    v_order_number,
    v_user_id,
    v_user_id,
    v_today,
    TO_CHAR(NOW() + INTERVAL '15 days', 'YYYY-MM-DD'),
    v_retailer_name,
    v_retailer_store,
    '33AAAAA0000A1Z5',
    v_subtotal,
    v_gst_amount,
    v_grand_total,
    v_total_pieces,
    v_payment_status,
    NOW()
  );

  -- 3. Insert transaction into public.payments ledger table
  INSERT INTO public.payments (
    id,
    order_id,
    invoice_id,
    amount,
    method,
    status,
    transaction_id,
    paid_at,
    created_at
  ) VALUES (
    'pay-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT || '-' || v_random_suffix,
    v_order_id,
    'inv-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT || '-' || v_random_suffix,
    v_grand_total,
    v_payment_method,
    v_payment_status,
    v_transaction_id,
    CASE WHEN v_payment_status = 'Paid' THEN NOW() ELSE NULL END,
    NOW()
  );

  -- 4. Update retailer cumulative metrics
  UPDATE public.retailers SET
    total_spent = COALESCE(total_spent, 0) + v_grand_total,
    active_orders_count = COALESCE(active_orders_count, 0) + 1,
    updated_at = NOW()
  WHERE id = v_user_id OR user_id = v_user_id;

  -- 5. Return complete Order JSON
  RETURN jsonb_build_object(
    'id', v_order_id,
    'orderNumber', v_order_number,
    'date', v_today,
    'retailerName', v_retailer_name,
    'retailerStore', v_retailer_store,
    'retailerCity', v_retailer_city,
    'retailerPhone', v_retailer_phone,
    'shippingAddress', v_shipping_address,
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
    'transactionId', v_transaction_id,
    'createdAt', NOW()::text
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order(JSONB, JSONB) TO authenticated;
