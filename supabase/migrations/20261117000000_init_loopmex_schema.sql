-- ==============================================================================
-- LOOPMEX — MIGRATION: INITIAL SCHEMA, SECURITY (RLS) & RPC FUNCTIONS
-- Idempotent, safe migration that preserves existing data on public.retailers
-- ==============================================================================

-- 1. SAFE ALTER / CREATE FOR RETAILERS TABLE
CREATE TABLE IF NOT EXISTS public.retailers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  name TEXT,
  business_name TEXT,
  gst_number TEXT DEFAULT '',
  city TEXT,
  place TEXT,
  state TEXT DEFAULT '',
  phone TEXT,
  email TEXT,
  pincode TEXT,
  address TEXT,
  shop_address TEXT,
  proof_id_type TEXT DEFAULT 'Aadhaar',
  proof_id_number TEXT DEFAULT '',
  active_orders_count INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  credit_limit INTEGER DEFAULT 200000,
  joined_date TEXT DEFAULT 'Nov 2026',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all required columns exist on retailers (safe ALTERs for existing tables)
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS gst_number TEXT DEFAULT '';
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS place TEXT;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS state TEXT DEFAULT '';
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS shop_address TEXT;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS proof_id_type TEXT DEFAULT 'Aadhaar';
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS proof_id_number TEXT DEFAULT '';
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS active_orders_count INTEGER DEFAULT 0;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS total_spent INTEGER DEFAULT 0;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS credit_limit INTEGER DEFAULT 200000;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS joined_date TEXT DEFAULT 'Nov 2026';
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Safely add foreign key constraint if missing
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

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  fabric TEXT NOT NULL,
  description TEXT,
  wholesale_price INTEGER NOT NULL,
  retail_mrp INTEGER NOT NULL,
  moq INTEGER NOT NULL DEFAULT 30,
  image TEXT NOT NULL,
  stock_s INTEGER NOT NULL DEFAULT 0,
  stock_m INTEGER NOT NULL DEFAULT 0,
  stock_l INTEGER NOT NULL DEFAULT 0,
  stock_xl INTEGER NOT NULL DEFAULT 0,
  stock_xxl INTEGER NOT NULL DEFAULT 0,
  colors TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  rating NUMERIC(3, 1) DEFAULT 4.8,
  is_featured BOOLEAN DEFAULT FALSE,
  gsm INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  retailer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  retailer_name TEXT NOT NULL,
  retailer_store TEXT NOT NULL,
  retailer_city TEXT NOT NULL,
  retailer_phone TEXT NOT NULL,
  total_pieces INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  gst_amount INTEGER NOT NULL,
  grand_total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed',
  tracking_number TEXT,
  courier_name TEXT DEFAULT 'Delhivery B2B Freight',
  dispatch_date TEXT,
  estimated_delivery TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Paid',
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  retailer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  retailer_name TEXT NOT NULL,
  retailer_store TEXT NOT NULL,
  retailer_gst TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  gst_amount INTEGER NOT NULL,
  grand_total INTEGER NOT NULL,
  total_pieces INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Paid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FACTORY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.factory_members (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'factory_member'
    CHECK (role IN ('factory_member', 'factory_admin', 'factory_staff')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. OPERATIONS TABLES (Suppliers, Inventory, Batches, Sizing, Logistics, Payments)
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  gst_number TEXT,
  category TEXT NOT NULL,
  rating NUMERIC(3, 1) DEFAULT 4.5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fabric_inventory (
  id TEXT PRIMARY KEY,
  supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
  fabric_name TEXT NOT NULL,
  type TEXT NOT NULL,
  gsm INTEGER NOT NULL,
  color TEXT NOT NULL,
  quantity_meters INTEGER NOT NULL DEFAULT 0,
  price_per_meter INTEGER NOT NULL,
  location TEXT NOT NULL,
  min_threshold INTEGER DEFAULT 100,
  last_restocked DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_runs (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  batch_number TEXT NOT NULL UNIQUE,
  quantity_planned INTEGER NOT NULL,
  quantity_completed INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  start_date DATE NOT NULL,
  end_date DATE,
  responsible_person TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.size_chart (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  size TEXT NOT NULL,
  chest_cm INTEGER,
  waist_cm INTEGER,
  hip_cm INTEGER,
  length_cm INTEGER,
  sleeve_cm INTEGER,
  shoulder_cm INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id TEXT PRIMARY KEY,
  zone_name TEXT NOT NULL,
  pincode_prefix TEXT NOT NULL,
  state TEXT NOT NULL,
  courier_partner TEXT NOT NULL,
  rate_per_kg INTEGER NOT NULL,
  estimated_days INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_id TEXT REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Helper function: Check if caller is active factory member
CREATE OR REPLACE FUNCTION public.is_factory_member(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.factory_members
    WHERE id = p_user_id AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Sync retailer field variants (name <-> first_name, city <-> place, address <-> shop_address)
CREATE OR REPLACE FUNCTION public.sync_retailer_fields()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_retailer_fields ON public.retailers;
CREATE TRIGGER trg_sync_retailer_fields
BEFORE INSERT OR UPDATE ON public.retailers
FOR EACH ROW EXECUTE FUNCTION public.sync_retailer_fields();

-- Trigger: Auto-create retailer profile row on signup via auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'retailer');
  
  -- Create retailer profile if role is retailer
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ATOMIC ORDER PLACEMENT RPC (Transaction with Stock Decrement & Price Check)
-- ==============================================================================
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

    -- Pessimistic locking to prevent race conditions & overselling
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

    -- Check stock availability
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. PRODUCTS (Public catalog read, factory full control)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Factory members manage products" ON public.products;
CREATE POLICY "Factory members manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- 2. RETAILERS (Retailers view/update own row, factory full view/edit)
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

-- 3. ORDERS (Retailers view/create own, factory full control)
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

-- 4. INVOICES (Retailers view own, factory full control)
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

-- 5. ENQUIRIES (Public create, submitter view, factory full control)
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

-- 6. FACTORY MEMBERS (Own profile read, active only)
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

-- 7. OPERATIONS TABLES (Suppliers, inventory, etc.)
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

-- ==============================================================================
-- REALTIME REPLICATION CONFIGURATION
-- ==============================================================================
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.products; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.orders; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.retailers; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.factory_members; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ==============================================================================
-- INITIAL SEED DATA (Idempotent: ON CONFLICT DO NOTHING)
-- ==============================================================================

INSERT INTO public.products (id, name, category, fabric, description, wholesale_price, retail_mrp, moq, image, stock_s, stock_m, stock_l, stock_xl, stock_xxl, colors, tags, rating, is_featured, gsm)
VALUES
  (
    'prod-1',
    'Men''s Oxford Formal Shirt',
    'Shirts',
    '100% Giza Egyptian Cotton (80s 2-Ply)',
    'Precision-tailored button-down formal shirt featuring reinforced collar stays, mother-of-pearl buttons, and wrinkle-resistant easy-iron finish. Engineered for daily corporate retail demand.',
    380,
    1499,
    40,
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
    120, 280, 340, 210, 90,
    ARRAY['Classic White', 'Sky Blue', 'Charcoal Grey', 'Navy'],
    ARRAY['Best Seller', 'Formal', 'High Margin'],
    4.9,
    TRUE,
    145
  ),
  (
    'prod-2',
    'Premium Combed Cotton T-Shirt',
    'T-Shirts',
    '220 GSM Biowash 100% Ring-Spun Cotton',
    'Heavyweight streetwear-grade blank tee with double-needle ribbed neckband and pre-shrunk organic fabric. Designed for high-volume custom merchandising and premium retail displays.',
    180,
    799,
    50,
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
    450, 680, 720, 430, 220,
    ARRAY['Onyx Black', 'Off-White', 'Muted Sage', 'Terracotta'],
    ARRAY['Volume Winner', '220 GSM', 'Wholesale Essential'],
    4.8,
    TRUE,
    220
  ),
  (
    'prod-3',
    'Classic Indigo Denim Jeans',
    'Denim',
    '13.5 oz Right-Hand Twill Stretch Denim',
    'Authentic 5-pocket straight-taper denim with brass rivets, YKK auto-lock zipper, and eco-laser wash detailing. High tensile tear-strength tested for maximum longevity.',
    620,
    2499,
    35,
    'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80',
    85, 195, 240, 160, 70,
    ARRAY['Deep Raw Indigo', 'Vintage Stonewash', 'Washed Charcoal'],
    ARRAY['High Durability', '13.5oz Twill', 'Top Retail Margin'],
    4.9,
    TRUE,
    380
  ),
  (
    'prod-4',
    'Embroidered Chanderi Women''s Kurti',
    'Kurtis',
    'Chanderi Silk Blend with Cotton Lining',
    'Artisanal festive straight-cut tunic featuring minimalist thread embroidery on neck and sleeves. Breathable inner cambric lining with side slits for comfortable all-day wear.',
    440,
    1899,
    30,
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    90, 210, 260, 180, 60,
    ARRAY['Mustard Ochre', 'Emerald Jade', 'Crimson Ruby', 'Ivory'],
    ARRAY['Festive Ready', 'Ethnic Craft', 'Fast Moving'],
    4.7,
    TRUE,
    180
  ),
  (
    'prod-5',
    'Pleated Linen Blend Trousers',
    'Trousers',
    '55% Pure European Flax Linen / 45% Cotton',
    'Relaxed tailored trousers with single front pleats, elasticated side tabs, and interior welt pockets. Summer staple offering effortless drape and breathability.',
    540,
    2199,
    30,
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80',
    60, 140, 180, 110, 40,
    ARRAY['Oatmeal Beige', 'Olive Drab', 'Midnight Navy'],
    ARRAY['Premium Linen', 'Summer Core'],
    4.8,
    FALSE,
    210
  ),
  (
    'prod-6',
    'Unstructured Travel Blazer',
    'Blazers',
    'Textured Poly-Viscose Wool-Feel Blend',
    'Featherlight deconstructed jacket without shoulder padding. Tailored patch pockets, double back vent, and wrinkle recovery for modern business travel.',
    1150,
    4999,
    20,
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
    35, 80, 95, 60, 25,
    ARRAY['Charcoal Herringbone', 'Deep Navy Blue'],
    ARRAY['Luxury Tier', 'High Value'],
    4.9,
    FALSE,
    290
  ),
  (
    'prod-7',
    'Heavyweight Boxy Fleece Hoodie',
    'T-Shirts',
    '380 GSM Brushed French Terry Fleece',
    'Thick structured pullover with kangaroo pocket, double-lined hood, and seamless drop shoulders. Tailored for premium urban boutiques and autumn drops.',
    490,
    1999,
    30,
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
    110, 220, 280, 190, 80,
    ARRAY['Heather Grey', 'Washed Black', 'Sand Dune'],
    ARRAY['380 GSM', 'Streetwear Drop'],
    4.9,
    FALSE,
    380
  ),
  (
    'prod-8',
    'Mercerized Cotton Polo Shirt',
    'Shirts',
    '60s Double Mercerized Pique Cotton',
    'Lustrous silky finish polo with knit ribbed collar that will never curl. Mother-of-pearl 3-button placket and side split hem.',
    320,
    1299,
    40,
    'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=1000&q=80',
    140, 260, 310, 190, 75,
    ARRAY['Burgundy Wine', 'Navy Blue', 'Forest Green', 'Pure White'],
    ARRAY['Mercerized Silk Touch', 'High Margin'],
    4.7,
    FALSE,
    210
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Size Chart
INSERT INTO public.size_chart (id, category, size, chest_cm, waist_cm, hip_cm, length_cm, sleeve_cm, shoulder_cm)
VALUES
  ('sz-1', 'Shirts', 'S', 92, 76, 92, 72, 62, 42),
  ('sz-2', 'Shirts', 'M', 100, 84, 100, 74, 64, 44),
  ('sz-3', 'Shirts', 'L', 108, 92, 108, 76, 66, 46),
  ('sz-4', 'Shirts', 'XL', 116, 100, 116, 78, 68, 48),
  ('sz-5', 'Shirts', 'XXL', 124, 108, 124, 80, 70, 50),
  ('sz-6', 'T-Shirts', 'S', 90, 74, 90, 68, 20, 41),
  ('sz-7', 'T-Shirts', 'M', 98, 82, 98, 70, 21, 43),
  ('sz-8', 'T-Shirts', 'L', 106, 90, 106, 72, 22, 45),
  ('sz-9', 'T-Shirts', 'XL', 114, 98, 114, 74, 23, 47),
  ('sz-10', 'T-Shirts', 'XXL', 122, 106, 122, 76, 24, 49),
  ('sz-11', 'Denim', 'S', 82, 72, 92, 102, NULL, NULL),
  ('sz-12', 'Denim', 'M', 90, 80, 100, 104, NULL, NULL),
  ('sz-13', 'Denim', 'L', 98, 88, 108, 106, NULL, NULL),
  ('sz-14', 'Denim', 'XL', 106, 96, 116, 108, NULL, NULL),
  ('sz-15', 'Denim', 'XXL', 114, 104, 124, 110, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed Shipping Zones
INSERT INTO public.shipping_zones (id, zone_name, pincode_prefix, state, courier_partner, rate_per_kg, estimated_days, is_active)
VALUES
  ('ship-1', 'Mumbai Metro', '400', 'Maharashtra', 'Delhivery B2B Freight', 45, 2, TRUE),
  ('ship-2', 'Delhi NCR', '110', 'Delhi', 'Delhivery B2B Freight', 45, 2, TRUE),
  ('ship-3', 'Bengaluru Metro', '560', 'Karnataka', 'BlueDart Express Freight', 50, 3, TRUE),
  ('ship-4', 'Surat Industrial', '395', 'Gujarat', 'Safexpress Logistics', 40, 2, TRUE),
  ('ship-5', 'Chennai Metro', '600', 'Tamil Nadu', 'Delhivery B2B Freight', 45, 3, TRUE),
  ('ship-6', 'Kolkata Metro', '700', 'West Bengal', 'Delhivery B2B Freight', 55, 4, TRUE),
  ('ship-7', 'Hyderabad Metro', '500', 'Telangana', 'BlueDart Express Freight', 50, 3, TRUE),
  ('ship-8', 'Pune Metro', '411', 'Maharashtra', 'Delhivery B2B Freight', 45, 2, TRUE)
ON CONFLICT (id) DO NOTHING;
