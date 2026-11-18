-- ==============================================================================
-- LOOPMEX — CLOTHING MANAGEMENT SYSTEM
-- Supabase PostgreSQL Database Schema & Initial Seed Data
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Click Run
-- ==============================================================================

-- 1. DROP EXISTING TABLES (Clean Slate)
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS retailers CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- 2. PRODUCTS TABLE
CREATE TABLE products (
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

-- 3. RETAILERS TABLE
CREATE TABLE retailers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  gst_number TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  active_orders_count INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  credit_limit INTEGER DEFAULT 200000,
  joined_date TEXT DEFAULT 'Jan 2026',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
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

-- 5. INVOICES TABLE
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
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

-- 6. ENQUIRIES TABLE
CREATE TABLE enquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUPPLIERS TABLE (Fabric & Trim Vendors)
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  gst_number TEXT,
  category TEXT NOT NULL, -- 'Fabric', 'Thread', 'Buttons', 'Zippers', 'Labels', 'Packaging'
  rating NUMERIC(3, 1) DEFAULT 4.5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FABRIC INVENTORY TABLE (Raw Material Stock)
CREATE TABLE fabric_inventory (
  id TEXT PRIMARY KEY,
  supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  fabric_name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Cotton', 'Denim', 'Linen', 'Silk', 'Polyester', 'Blended'
  gsm INTEGER NOT NULL,
  color TEXT NOT NULL,
  quantity_meters INTEGER NOT NULL DEFAULT 0,
  price_per_meter INTEGER NOT NULL,
  location TEXT NOT NULL, -- Warehouse bin location
  min_threshold INTEGER DEFAULT 100, -- Reorder alert level
  last_restocked DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PRODUCTION RUNS TABLE (Manufacturing Batches)
CREATE TABLE production_runs (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  batch_number TEXT NOT NULL UNIQUE,
  quantity_planned INTEGER NOT NULL,
  quantity_completed INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Scheduled', -- 'Scheduled', 'In Progress', 'Completed', 'Cancelled'
  start_date DATE NOT NULL,
  end_date DATE,
  responsible_person TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SIZE CHART TABLE (Standard Measurements)
CREATE TABLE size_chart (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL, -- 'Shirts', 'T-Shirts', 'Denim', 'Kurtis', 'Trousers', 'Blazers'
  size TEXT NOT NULL, -- 'S', 'M', 'L', 'XL', 'XXL'
  chest_cm INTEGER,
  waist_cm INTEGER,
  hip_cm INTEGER,
  length_cm INTEGER,
  sleeve_cm INTEGER,
  shoulder_cm INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SHIPPING ZONES TABLE (Delivery Pincodes & Rates)
CREATE TABLE shipping_zones (
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

-- 12. PAYMENTS TABLE (Transaction Records)
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL, -- 'UPI', 'NEFT / RTGS', 'Factory Credit (15 Days)', 'Card', 'Wallet'
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Completed', 'Failed', 'Refunded'
  transaction_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Permissive policies for public anon web access
-- ==============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public write products" ON products FOR ALL USING (true);

CREATE POLICY "Allow public read retailers" ON retailers FOR SELECT USING (true);
CREATE POLICY "Allow public write retailers" ON retailers FOR ALL USING (true);

CREATE POLICY "Allow public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public write orders" ON orders FOR ALL USING (true);

CREATE POLICY "Allow public read invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Allow public write invoices" ON invoices FOR ALL USING (true);

CREATE POLICY "Allow public read enquiries" ON enquiries FOR SELECT USING (true);
CREATE POLICY "Allow public write enquiries" ON enquiries FOR ALL USING (true);

CREATE POLICY "Allow public read suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public write suppliers" ON suppliers FOR ALL USING (true);

CREATE POLICY "Allow public read fabric_inventory" ON fabric_inventory FOR SELECT USING (true);
CREATE POLICY "Allow public write fabric_inventory" ON fabric_inventory FOR ALL USING (true);

CREATE POLICY "Allow public read production_runs" ON production_runs FOR SELECT USING (true);
CREATE POLICY "Allow public write production_runs" ON production_runs FOR ALL USING (true);

CREATE POLICY "Allow public read size_chart" ON size_chart FOR SELECT USING (true);
CREATE POLICY "Allow public write size_chart" ON size_chart FOR ALL USING (true);

CREATE POLICY "Allow public read shipping_zones" ON shipping_zones FOR SELECT USING (true);
CREATE POLICY "Allow public write shipping_zones" ON shipping_zones FOR ALL USING (true);

CREATE POLICY "Allow public read payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Allow public write payments" ON payments FOR ALL USING (true);

-- Enable Realtime on all tables
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE enquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE suppliers;
ALTER PUBLICATION supabase_realtime ADD TABLE fabric_inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE production_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE size_chart;
ALTER PUBLICATION supabase_realtime ADD TABLE shipping_zones;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;

-- ==============================================================================
-- SEED INITIAL DATA
-- ==============================================================================

-- Seed Flagship Products
INSERT INTO products (id, name, category, fabric, description, wholesale_price, retail_mrp, moq, image, stock_s, stock_m, stock_l, stock_xl, stock_xxl, colors, tags, rating, is_featured, gsm)
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
  );

-- Seed Retailers
INSERT INTO retailers (id, name, business_name, gst_number, city, state, phone, email, active_orders_count, total_spent, credit_limit, joined_date)
VALUES
  ('ret-1', 'Rajesh Sharma', 'Aura Garments & Apparels', '27AABCA1234M1Z5', 'Mumbai', 'Maharashtra', '+91 98201 44520', 'contact@auragarments.in', 2, 428000, 250000, 'Jan 2026'),
  ('ret-2', 'Ananya Deshmukh', 'Vogue Boutique Chains', '29AABCV5678K1ZP', 'Bengaluru', 'Karnataka', '+91 97412 88319', 'orders@voguechains.com', 1, 315000, 200000, 'Feb 2026'),
  ('ret-3', 'Vikram Mehta', 'Metro Threads Wholesale', '24AAACV1234F1Z8', 'Surat', 'Gujarat', '+91 94280 77119', 'procurement@metrothreads.com', 1, 185000, 150000, 'Apr 2026'),
  ('ret-4', 'Priya Sundaram', 'Sundaram Cloth Emporium', '33AABCS9912L1ZK', 'Chennai', 'Tamil Nadu', '+91 98400 33211', 'priya@sundaramtextiles.in', 0, 590000, 300000, 'Nov 2025');

-- Seed Orders
INSERT INTO orders (id, order_number, date, retailer_name, retailer_store, retailer_city, retailer_phone, total_pieces, subtotal, gst_amount, grand_total, status, tracking_number, courier_name, dispatch_date, estimated_delivery, payment_method, payment_status, notes, items)
VALUES
  (
    'ord-101',
    'TB-ORD-8941',
    '2026-10-18',
    'Rajesh Sharma',
    'Aura Garments & Apparels',
    'Mumbai, Maharashtra',
    '+91 98201 44520',
    270,
    72600,
    3630,
    76230,
    'Dispatched',
    'DEL-B2B-98471204',
    'Delhivery B2B Freight',
    '2026-10-20',
    '2026-10-23',
    'NEFT / RTGS',
    'Paid',
    'Urgent Diwali inventory restock. Packed in 50-pc double master cartons.',
    '[{"id": "item-1", "product": {"id": "prod-1", "name": "Men''s Oxford Formal Shirt", "wholesalePrice": 380, "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80"}, "sizes": {"S": 20, "M": 40, "L": 40, "XL": 20, "XXL": 0}, "selectedColor": "Classic White", "totalQuantity": 120, "itemTotal": 45600}]'::jsonb
  ),
  (
    'ord-102',
    'TB-ORD-8942',
    '2026-10-19',
    'Ananya Deshmukh',
    'Vogue Boutique Chains',
    'Bengaluru, Karnataka',
    '+91 97412 88319',
    100,
    44000,
    2200,
    46200,
    'In Production',
    'BLR-EXP-662301',
    'BlueDart Express Freight',
    NULL,
    '2026-10-25',
    'UPI',
    'Paid',
    'Color batch 44B approved. High-priority stitching unit 2.',
    '[{"id": "item-3", "product": {"id": "prod-4", "name": "Embroidered Chanderi Women''s Kurti", "wholesalePrice": 440, "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"}, "sizes": {"S": 15, "M": 30, "L": 30, "XL": 15, "XXL": 10}, "selectedColor": "Mustard Ochre", "totalQuantity": 100, "itemTotal": 44000}]'::jsonb
  );

-- Seed Invoices
INSERT INTO invoices (id, invoice_number, order_id, order_number, date, due_date, retailer_name, retailer_store, retailer_gst, subtotal, gst_amount, grand_total, total_pieces, status)
VALUES
  ('inv-101', 'INV-TB-2026-0891', 'ord-101', 'TB-ORD-8941', '2026-10-18', '2026-11-02', 'Rajesh Sharma', 'Aura Garments & Apparels', '27AABCA1234M1Z5', 72600, 3630, 76230, 270, 'Paid'),
  ('inv-102', 'INV-TB-2026-0892', 'ord-102', 'TB-ORD-8942', '2026-10-19', '2026-11-03', 'Ananya Deshmukh', 'Vogue Boutique Chains', '29AABCV5678K1ZP', 44000, 2200, 46200, 100, 'Paid'),
  ('inv-103', 'INV-TB-2026-0893', 'ord-103', 'TB-ORD-8943', '2026-10-21', '2026-11-05', 'Vikram Mehta', 'Metro Threads Wholesale', '24AAACV1234F1Z8', 43400, 2170, 45570, 70, 'Pending');

-- Seed Suppliers
INSERT INTO suppliers (id, name, contact_person, phone, email, city, state, gst_number, category, rating, is_active)
VALUES
  ('sup-1', 'Tirupur Cotton Mills Ltd.', 'Suresh Kumar', '+91 98420 11223', 'procurement@tirupurcotton.in', 'Tirupur', 'Tamil Nadu', '33AAACT9812M1Z0', 'Fabric', 4.9, TRUE),
  ('sup-2', 'Surat Denim Pvt Ltd.', 'Kiran Patel', '+91 97250 44556', 'orders@suratdenim.com', 'Surat', 'Gujarat', '24AABCS5544K1Z9', 'Fabric', 4.8, TRUE),
  ('sup-3', 'Ludhiana Thread Co.', 'Aman Singh', '+91 98760 33445', 'sales@ludhianathread.in', 'Ludhiana', 'Punjab', '03AAAAL3322L1Z5', 'Thread', 4.7, TRUE),
  ('sup-4', 'Mumbai Trims & Labels', 'Neha Desai', '+91 98200 77889', 'hello@mumbaitrims.com', 'Mumbai', 'Maharashtra', '27AAACM4455N1Z7', 'Labels', 4.6, TRUE),
  ('sup-5', 'Delhi Packaging Solutions', 'Rohit Mehta', '+91 99990 11223', 'support@delhipackaging.in', 'New Delhi', 'Delhi', '07AAACP1122Q1Z1', 'Packaging', 4.5, TRUE);

-- Seed Fabric Inventory
INSERT INTO fabric_inventory (id, supplier_id, fabric_name, type, gsm, color, quantity_meters, price_per_meter, location, min_threshold, last_restocked)
VALUES
  ('fab-1', 'sup-1', 'Giza Egyptian Cotton', 'Cotton', 145, 'Classic White', 5400, 180, 'A-01', 500, '2026-09-25'),
  ('fab-2', 'sup-1', 'Giza Egyptian Cotton', 'Cotton', 145, 'Sky Blue', 3200, 185, 'A-02', 500, '2026-09-25'),
  ('fab-3', 'sup-1', 'Giza Egyptian Cotton', 'Cotton', 145, 'Charcoal Grey', 2100, 190, 'A-03', 500, '2026-09-25'),
  ('fab-4', 'sup-2', 'Ring-Spun Cotton', 'Cotton', 220, 'Onyx Black', 8900, 120, 'B-01', 1000, '2026-10-01'),
  ('fab-5', 'sup-2', 'Ring-Spun Cotton', 'Cotton', 220, 'Off-White', 7600, 120, 'B-02', 1000, '2026-10-01'),
  ('fab-6', 'sup-2', 'Right-Hand Twill Denim', 'Denim', 380, 'Deep Raw Indigo', 3100, 350, 'C-01', 300, '2026-09-30'),
  ('fab-7', 'sup-2', 'Right-Hand Twill Denim', 'Denim', 380, 'Vintage Stonewash', 2400, 350, 'C-02', 300, '2026-09-30'),
  ('fab-8', 'sup-1', 'Chanderi Silk Blend', 'Silk', 180, 'Mustard Ochre', 1800, 450, 'D-01', 200, '2026-09-28'),
  ('fab-9', 'sup-1', 'European Flax Linen', 'Linen', 210, 'Oatmeal Beige', 2700, 280, 'E-01', 300, '2026-10-05'),
  ('fab-10', 'sup-1', 'Poly-Viscose Blend', 'Blended', 290, 'Charcoal Herringbone', 1500, 320, 'F-01', 200, '2026-09-20');

-- Seed Production Runs
INSERT INTO production_runs (id, product_id, batch_number, quantity_planned, quantity_completed, status, start_date, end_date, responsible_person, notes)
VALUES
  ('run-1', 'prod-1', 'BATCH-FW26-001', 1000, 850, 'In Progress', '2026-10-01', NULL, 'Mohan Raj', 'Diwali season priority run — Oxford shirts in all sizes'),
  ('run-2', 'prod-2', 'BATCH-FW26-002', 2000, 2000, 'Completed', '2026-09-15', '2026-09-28', 'Priya Nair', 'Fully completed — ready for dispatch'),
  ('run-3', 'prod-3', 'BATCH-FW26-003', 1500, 600, 'Scheduled', '2026-10-15', NULL, 'Arun Kumar', 'Denim jeans — indigo dye lot approved'),
  ('run-4', 'prod-4', 'BATCH-FW26-004', 800, 300, 'In Progress', '2026-10-10', NULL, 'Lakshmi Devi', 'Chanderi kurtis — festive collection embroidery pending'),
  ('run-5', 'prod-5', 'BATCH-FW26-005', 1200, 0, 'Scheduled', '2026-10-25', NULL, 'Suresh Babu', 'Linen trousers — fabric awaiting QC clearance');

-- Seed Size Chart
INSERT INTO size_chart (id, category, size, chest_cm, waist_cm, hip_cm, length_cm, sleeve_cm, shoulder_cm)
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
  ('sz-15', 'Denim', 'XXL', 114, 104, 124, 110, NULL, NULL);

-- Seed Shipping Zones
INSERT INTO shipping_zones (id, zone_name, pincode_prefix, state, courier_partner, rate_per_kg, estimated_days, is_active)
VALUES
  ('ship-1', 'Mumbai Metro', '400', 'Maharashtra', 'Delhivery B2B Freight', 45, 2, TRUE),
  ('ship-2', 'Delhi NCR', '110', 'Delhi', 'Delhivery B2B Freight', 45, 2, TRUE),
  ('ship-3', 'Bengaluru Metro', '560', 'Karnataka', 'BlueDart Express Freight', 50, 3, TRUE),
  ('ship-4', 'Surat Industrial', '395', 'Gujarat', 'Safexpress Logistics', 40, 2, TRUE),
  ('ship-5', 'Chennai Metro', '600', 'Tamil Nadu', 'Delhivery B2B Freight', 45, 3, TRUE),
  ('ship-6', 'Kolkata Metro', '700', 'West Bengal', 'Delhivery B2B Freight', 55, 4, TRUE),
  ('ship-7', 'Hyderabad Metro', '500', 'Telangana', 'BlueDart Express Freight', 50, 3, TRUE),
  ('ship-8', 'Pune Metro', '411', 'Maharashtra', 'Delhivery B2B Freight', 45, 2, TRUE);

-- Seed Payments
INSERT INTO payments (id, order_id, invoice_id, amount, method, status, transaction_id, paid_at, created_at)
VALUES
  ('pay-1', 'ord-101', 'inv-101', 76230, 'NEFT / RTGS', 'Completed', 'NEFT261018AXSB123', '2026-10-18T10:30:00Z', '2026-10-18T10:30:00Z'),
  ('pay-2', 'ord-102', 'inv-102', 46200, 'UPI', 'Completed', 'UPI261019ABCD4567', '2026-10-19T14:15:00Z', '2026-10-19T14:15:00Z'),
  ('pay-3', 'ord-103', 'inv-103', 45570, 'Factory Credit (15 Days)', 'Pending', NULL, NULL, '2026-10-21T09:00:00Z'),
  ('pay-4', 'ord-104', NULL, 71820, 'NEFT / RTGS', 'Completed', 'NEFT261012XYZ789', '2026-10-12T11:45:00Z', '2026-10-12T11:45:00Z');
