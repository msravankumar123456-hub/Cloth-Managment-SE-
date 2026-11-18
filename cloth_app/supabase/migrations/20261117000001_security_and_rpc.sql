-- ==============================================================================
-- LOOPMEX — PHASE 2 MIGRATION: SECURITY (RLS), AUTH TRIGGERS & ATOMIC RPC
-- File: supabase/migrations/20261117000001_security_and_rpc.sql
-- Idempotent: can be executed multiple times without errors.
-- ==============================================================================

-- 1. FOREIGN KEY LINK FOR RETAILERS TO AUTH.USERS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'retailers_id_fkey' AND table_name = 'retailers'
  ) THEN
    BEGIN
      ALTER TABLE public.retailers 
      ADD CONSTRAINT retailers_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;
END $$;

-- 2. FACTORY MEMBER ACCESS CHECK HELPER
CREATE OR REPLACE FUNCTION public.is_factory_member(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.factory_members
    WHERE id = p_user_id AND is_active = TRUE
  );
END;
$$;

-- 3. RETAILER PROFILE SYNC TRIGGER (Bidirectional field mapping)
CREATE OR REPLACE FUNCTION public.sync_retailer_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.name IS NULL AND NEW.first_name IS NOT NULL THEN
    NEW.name := NEW.first_name;
  ELSIF NEW.first_name IS NULL AND NEW.name IS NOT NULL THEN
    NEW.first_name := NEW.name;
  END IF;
  
  IF NEW.business_name IS NULL THEN
    NEW.business_name := COALESCE(NEW.name, NEW.first_name, 'Retail Store');
  END IF;

  IF NEW.city IS NULL AND NEW.place IS NOT NULL THEN
    NEW.city := NEW.place;
  ELSIF NEW.place IS NULL AND NEW.city IS NOT NULL THEN
    NEW.place := NEW.city;
  END IF;

  IF NEW.address IS NULL AND NEW.shop_address IS NOT NULL THEN
    NEW.address := NEW.shop_address;
  ELSIF NEW.shop_address IS NULL AND NEW.address IS NOT NULL THEN
    NEW.shop_address := NEW.address;
  END IF;

  IF NEW.user_id IS NULL THEN
    NEW.user_id := NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_retailer_fields ON public.retailers;
CREATE TRIGGER trg_sync_retailer_fields
BEFORE INSERT OR UPDATE ON public.retailers
FOR EACH ROW EXECUTE FUNCTION public.sync_retailer_fields();

-- 4. SIGNUP TRIGGER (Automatically creates retailer profile row on auth.users insert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'retailer');
  
  IF v_role = 'retailer' THEN
    INSERT INTO public.retailers (
      id,
      user_id,
      name,
      first_name,
      business_name,
      phone,
      email,
      place,
      city,
      pincode,
      address,
      shop_address,
      proof_id_type,
      proof_id_number,
      joined_date
    ) VALUES (
      NEW.id,
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'firstName', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'firstName', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'shop_name', 'Retail Buyer'),
      COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'mobile', ''),
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'place', NEW.raw_user_meta_data->>'city', ''),
      COALESCE(NEW.raw_user_meta_data->>'city', NEW.raw_user_meta_data->>'place', ''),
      COALESCE(NEW.raw_user_meta_data->>'pincode', NEW.raw_user_meta_data->>'pinCode', ''),
      COALESCE(NEW.raw_user_meta_data->>'shopAddress', NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'shopAddress', NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'proofIdType', 'Aadhaar'),
      COALESCE(NEW.raw_user_meta_data->>'proofIdNumber', ''),
      to_char(NOW(), 'Mon YYYY')
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE retailers.phone END,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. ATOMIC ORDER PLACEMENT RPC (Server-Side Price Calculation & Stock Decrement)
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
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to place an order';
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

    -- Stock check
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

    -- Decrement stock in catalog
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

  -- Insert order
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
    v_sanitized_items,
    NOW()
  );

  -- Insert invoice
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
    v_invoice_id,
    'INV-TB-2026-' || v_random_suffix,
    v_order_id,
    v_order_number,
    v_user_id,
    v_user_id,
    v_today,
    v_est_delivery,
    v_retailer_name,
    v_retailer_store,
    '27AABCA9918K1ZZ',
    v_subtotal,
    v_gst_amount,
    v_grand_total,
    v_total_pieces,
    v_payment_status,
    NOW()
  );

  -- Update retailer cumulative metrics
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

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Products: Public catalog read, factory full write
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Factory members manage products" ON public.products;
CREATE POLICY "Factory members manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- Retailers: View/update own profile, factory full view/edit
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Retailer read own profile" ON public.retailers;
CREATE POLICY "Retailer read own profile" ON public.retailers
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id OR public.is_factory_member());

DROP POLICY IF EXISTS "Retailer update own profile" ON public.retailers;
CREATE POLICY "Retailer update own profile" ON public.retailers
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id OR public.is_factory_member())
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id OR public.is_factory_member());

DROP POLICY IF EXISTS "Retailer insert own profile" ON public.retailers;
CREATE POLICY "Retailer insert own profile" ON public.retailers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id OR public.is_factory_member());

-- Orders: View/insert own orders, factory full control
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Retailers view own orders" ON public.orders;
CREATE POLICY "Retailers view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = retailer_id OR auth.uid() = user_id OR public.is_factory_member());

DROP POLICY IF EXISTS "Retailers insert own orders" ON public.orders;
CREATE POLICY "Retailers insert own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = retailer_id OR auth.uid() = user_id OR public.is_factory_member());

DROP POLICY IF EXISTS "Factory members update orders" ON public.orders;
CREATE POLICY "Factory members update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- Invoices: View own invoices, factory full control
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Retailers view own invoices" ON public.invoices;
CREATE POLICY "Retailers view own invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (auth.uid() = retailer_id OR auth.uid() = user_id OR public.is_factory_member());

DROP POLICY IF EXISTS "Factory members manage invoices" ON public.invoices;
CREATE POLICY "Factory members manage invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- Enquiries: Anyone can insert, submitter/factory can view
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit enquiry" ON public.enquiries;
CREATE POLICY "Anyone can submit enquiry" ON public.enquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enquiry read access" ON public.enquiries;
CREATE POLICY "Enquiry read access" ON public.enquiries
  FOR SELECT USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR public.is_factory_member()
  );

DROP POLICY IF EXISTS "Factory members manage enquiries" ON public.enquiries;
CREATE POLICY "Factory members manage enquiries" ON public.enquiries
  FOR ALL TO authenticated
  USING (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- Factory Members: Own profile read/update
ALTER TABLE public.factory_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Factory member can read own profile" ON public.factory_members;
CREATE POLICY "Factory member can read own profile" ON public.factory_members
  FOR SELECT TO authenticated
  USING (auth.uid() = id AND is_active = TRUE);

DROP POLICY IF EXISTS "Factory member can update own profile" ON public.factory_members;
CREATE POLICY "Factory member can update own profile" ON public.factory_members
  FOR UPDATE TO authenticated
  USING (auth.uid() = id AND is_active = TRUE)
  WITH CHECK (auth.uid() = id);

-- Operations tables
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Factory members manage suppliers" ON public.suppliers;
CREATE POLICY "Factory members manage suppliers" ON public.suppliers
  FOR ALL TO authenticated
  USING (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

ALTER TABLE public.fabric_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Factory members manage inventory" ON public.fabric_inventory;
CREATE POLICY "Factory members manage inventory" ON public.fabric_inventory
  FOR ALL TO authenticated
  USING (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

ALTER TABLE public.production_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Factory members manage production runs" ON public.production_runs;
CREATE POLICY "Factory members manage production runs" ON public.production_runs
  FOR ALL TO authenticated
  USING (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

ALTER TABLE public.size_chart ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view size chart" ON public.size_chart;
CREATE POLICY "Anyone can view size chart" ON public.size_chart
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Factory members manage size chart" ON public.size_chart;
CREATE POLICY "Factory members manage size chart" ON public.size_chart
  FOR ALL TO authenticated
  USING (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active shipping zones" ON public.shipping_zones;
CREATE POLICY "Anyone can view active shipping zones" ON public.shipping_zones
  FOR SELECT USING (is_active = TRUE OR public.is_factory_member());

DROP POLICY IF EXISTS "Factory members manage shipping zones" ON public.shipping_zones;
CREATE POLICY "Factory members manage shipping zones" ON public.shipping_zones
  FOR ALL TO authenticated
  USING (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Retailers view own payments" ON public.payments;
CREATE POLICY "Retailers view own payments" ON public.payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = payments.order_id 
        AND (orders.retailer_id = auth.uid() OR orders.user_id = auth.uid())
    ) OR public.is_factory_member()
  );

DROP POLICY IF EXISTS "Factory members manage payments" ON public.payments;
CREATE POLICY "Factory members manage payments" ON public.payments
  FOR ALL TO authenticated
  USING (public.is_factory_member())
  WITH CHECK (public.is_factory_member());
