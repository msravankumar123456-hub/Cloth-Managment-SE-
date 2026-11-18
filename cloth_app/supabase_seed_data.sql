-- ==============================================================================
-- LOOPMEX — SEED DATA (Idempotent)
-- File: supabase_seed_data.sql
-- Run in Supabase SQL Editor. Uses ON CONFLICT DO NOTHING throughout.
-- No DROP / TRUNCATE. Safe to run multiple times.
-- Run AFTER the schema migrations are applied.
-- Insert order: suppliers → products → shipping_zones → size_chart →
--               fabric_inventory → production_runs → retailers (sample) →
--               orders → invoices → payments → enquiries
-- ==============================================================================

-- ─── SUPPLIERS (5) ────────────────────────────────────────────────────────────
INSERT INTO public.suppliers (id, name, contact_person, phone, email, city, state, gst_number, category, rating, is_active)
VALUES
  ('sup-1', 'Tirupur Cotton Mills Ltd.',     'Suresh Kumar',  '+91 98420 11223', 'procurement@tirupurcotton.in', 'Tirupur',   'Tamil Nadu',  '33AAACT9812M1Z0', 'Fabric',    4.9, TRUE),
  ('sup-2', 'Surat Denim Pvt Ltd.',          'Kiran Patel',   '+91 97250 44556', 'orders@suratdenim.com',       'Surat',      'Gujarat',     '24AABCS5544K1Z9', 'Fabric',    4.8, TRUE),
  ('sup-3', 'Ludhiana Thread Co.',           'Aman Singh',    '+91 98760 33445', 'sales@ludhianathread.in',     'Ludhiana',   'Punjab',      '03AAAAL3322L1Z5', 'Thread',    4.7, TRUE),
  ('sup-4', 'Mumbai Trims & Labels',         'Neha Desai',    '+91 98200 77889', 'hello@mumbaitrims.com',       'Mumbai',     'Maharashtra', '27AAACM4455N1Z7', 'Labels',    4.6, TRUE),
  ('sup-5', 'Delhi Packaging Solutions',     'Rohit Mehta',   '+91 99990 11223', 'support@delhipackaging.in',   'New Delhi',  'Delhi',       '07AAACP1122Q1Z1', 'Packaging', 4.5, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── PRODUCTS (15) ────────────────────────────────────────────────────────────
INSERT INTO public.products (id, name, category, fabric, description, wholesale_price, retail_mrp, moq, image, stock_s, stock_m, stock_l, stock_xl, stock_xxl, colors, tags, rating, is_featured, gsm)
VALUES
  ('prod-1',  'Men''s Oxford Formal Shirt',
   'Shirts',   '100% Giza Egyptian Cotton (80s 2-Ply)',
   'Button-down formal shirt with reinforced collar stays and wrinkle-resistant finish.',
   380, 1499, 40,
   'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
   120, 280, 340, 210, 90,
   ARRAY['Classic White','Sky Blue','Charcoal Grey','Navy'],
   ARRAY['Best Seller','Formal','High Margin'], 4.9, TRUE, 145),

  ('prod-2',  'Premium Combed Cotton T-Shirt',
   'T-Shirts', '220 GSM Biowash 100% Ring-Spun Cotton',
   'Heavyweight streetwear-grade blank tee with double-needle ribbed neckband.',
   180, 799, 50,
   'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
   450, 680, 720, 430, 220,
   ARRAY['Onyx Black','Off-White','Muted Sage','Terracotta'],
   ARRAY['Volume Winner','220 GSM','Wholesale Essential'], 4.8, TRUE, 220),

  ('prod-3',  'Classic Indigo Denim Jeans',
   'Denim',    '13.5 oz Right-Hand Twill Stretch Denim',
   'Authentic 5-pocket straight-taper denim with brass rivets and YKK zipper.',
   620, 2499, 35,
   'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
   85, 195, 240, 160, 70,
   ARRAY['Deep Raw Indigo','Vintage Stonewash','Washed Charcoal'],
   ARRAY['High Durability','13.5oz Twill','Top Retail Margin'], 4.9, TRUE, 380),

  ('prod-4',  'Embroidered Chanderi Women''s Kurti',
   'Kurtis',   'Chanderi Silk Blend with Cotton Lining',
   'Festive straight-cut tunic with thread embroidery and breathable cambric lining.',
   440, 1899, 30,
   'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
   90, 210, 260, 180, 60,
   ARRAY['Mustard Ochre','Emerald Jade','Crimson Ruby','Ivory'],
   ARRAY['Festive Ready','Ethnic Craft','Fast Moving'], 4.7, TRUE, 180),

  ('prod-5',  'Pleated Linen Blend Trousers',
   'Trousers', '55% Pure European Flax Linen / 45% Cotton',
   'Relaxed tailored trousers with single front pleats and interior welt pockets.',
   540, 2199, 30,
   'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
   60, 140, 180, 110, 40,
   ARRAY['Oatmeal Beige','Olive Drab','Midnight Navy'],
   ARRAY['Premium Linen','Summer Core'], 4.8, FALSE, 210),

  ('prod-6',  'Unstructured Travel Blazer',
   'Blazers',  'Textured Poly-Viscose Wool-Feel Blend',
   'Featherlight deconstructed jacket with double back vent for business travel.',
   1150, 4999, 20,
   'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
   35, 80, 95, 60, 25,
   ARRAY['Charcoal Herringbone','Deep Navy Blue'],
   ARRAY['Luxury Tier','High Value'], 4.9, FALSE, 290),

  ('prod-7',  'Heavyweight Boxy Fleece Hoodie',
   'T-Shirts', '380 GSM Brushed French Terry Fleece',
   'Thick structured pullover with kangaroo pocket and seamless drop shoulders.',
   490, 1999, 30,
   'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
   110, 220, 280, 190, 80,
   ARRAY['Heather Grey','Washed Black','Sand Dune'],
   ARRAY['380 GSM','Streetwear Drop'], 4.9, FALSE, 380),

  ('prod-8',  'Mercerized Cotton Polo Shirt',
   'Shirts',   '60s Double Mercerized Pique Cotton',
   'Lustrous silky finish polo with knit ribbed collar and pearl 3-button placket.',
   320, 1299, 40,
   'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80',
   140, 260, 310, 190, 75,
   ARRAY['Burgundy Wine','Navy Blue','Forest Green','Pure White'],
   ARRAY['Mercerized Silk Touch','High Margin'], 4.7, FALSE, 210),

  ('prod-9',  'Block-Print Cotton Kurti',
   'Kurtis',   'Soft Mulmul 100% Cotton',
   'Hand block-printed Jaipur kurti with floral motifs and three-quarter sleeves.',
   310, 1199, 30,
   'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
   100, 230, 280, 170, 50,
   ARRAY['Indigo Blue','Rust Red','Sage Green'],
   ARRAY['Artisanal','Block Print','Ethnic'], 4.6, FALSE, 100),

  ('prod-10', 'Slim-Fit Chino Trousers',
   'Trousers', '98% Cotton 2% Spandex Stretch Chino',
   'Smart casual slim chino with four-pocket styling and stretch waistband.',
   460, 1799, 30,
   'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
   70, 160, 200, 130, 45,
   ARRAY['Khaki','Dark Olive','Black'],
   ARRAY['Slim Fit','Office Casual'], 4.7, FALSE, 240),

  ('prod-11', 'Rayon Floral Maxi Dress',
   'Kurtis',   'Soft Viscose Rayon 65 GSM',
   'Flowy bohemian maxi dress with side slits and adjustable tie waist.',
   370, 1499, 30,
   'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
   80, 190, 250, 160, 55,
   ARRAY['Coral Blush','Tropical Print','Midnight Blue'],
   ARRAY['Boho','Summer','Fast Mover'], 4.5, FALSE, 65),

  ('prod-12', 'Cargo Utility Trousers',
   'Trousers', '100% Cotton Ripstop Canvas',
   'Six-pocket relaxed-fit cargo with YKK zippers and reinforced knees.',
   550, 2099, 25,
   'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
   50, 120, 160, 100, 35,
   ARRAY['Olive Green','Stone Grey','All-Black'],
   ARRAY['Utility','Outdoors','Workwear'], 4.6, FALSE, 280),

  ('prod-13', 'Cotton Striped Casual Shirt',
   'Shirts',   '100% Combed Cotton Yarn-Dyed Stripe',
   'Relaxed weekend shirt with spread collar and patch chest pocket.',
   290, 1099, 40,
   'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80',
   130, 300, 360, 220, 95,
   ARRAY['Blue White Stripe','Red Navy Stripe','Olive Cream Stripe'],
   ARRAY['Casual','Weekend','All Season'], 4.6, FALSE, 160),

  ('prod-14', 'Slim Denim Jacket',
   'Denim',    '11 oz Stretch Denim Twill',
   'Classic trucker-style jacket with contrast stitching and button-through chest pockets.',
   780, 3199, 25,
   'https://images.unsplash.com/photo-1543087903-1ac2364a7858?auto=format&fit=crop&w=800&q=80',
   45, 110, 140, 90, 30,
   ARRAY['Mid Wash Blue','Ecru Bleach','Washed Black'],
   ARRAY['Outerwear','Denim','Layering'], 4.8, FALSE, 310),

  ('prod-15', 'Pique Cotton Polo Dress',
   'Kurtis',   '200 GSM Pique Cotton',
   'Sporty polo dress with contrast ribbed collar, zip placket and A-line silhouette.',
   420, 1699, 30,
   'https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=800&q=80',
   75, 180, 230, 150, 50,
   ARRAY['Classic White','Blush Pink','Electric Blue'],
   ARRAY['Sporty','Chic','All Day'], 4.5, FALSE, 200)
ON CONFLICT (id) DO NOTHING;

-- ─── SHIPPING ZONES (5) ───────────────────────────────────────────────────────
INSERT INTO public.shipping_zones (id, zone_name, pincode_prefix, state, courier_partner, rate_per_kg, estimated_days, is_active)
VALUES
  ('ship-south', 'South India',  '6',   'Tamil Nadu / Karnataka / Kerala / AP / Telangana', 'Delhivery B2B Freight',   45, 3,  TRUE),
  ('ship-north', 'North India',  '1',   'Delhi / UP / Haryana / Punjab',                    'Delhivery B2B Freight',   45, 2,  TRUE),
  ('ship-west',  'West India',   '4',   'Maharashtra / Gujarat / Rajasthan',                'Safexpress Logistics',    40, 2,  TRUE),
  ('ship-east',  'East India',   '7',   'West Bengal / Bihar / Odisha / Assam',             'Delhivery B2B Freight',   55, 4,  TRUE),
  ('ship-export','Export Zones', '000', 'International',                                     'FedEx International',    180, 10, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ─── SIZE CHART (men + women, S–XXL) ─────────────────────────────────────────
INSERT INTO public.size_chart (id, category, size, chest_cm, waist_cm, hip_cm, length_cm, sleeve_cm, shoulder_cm)
VALUES
  -- Men's Shirts
  ('sz-sh-s',   'Shirts',   'S',   92,  76,  NULL, 72, 62, 42),
  ('sz-sh-m',   'Shirts',   'M',  100,  84,  NULL, 74, 64, 44),
  ('sz-sh-l',   'Shirts',   'L',  108,  92,  NULL, 76, 66, 46),
  ('sz-sh-xl',  'Shirts',   'XL', 116, 100,  NULL, 78, 68, 48),
  ('sz-sh-xxl', 'Shirts',   'XXL',124, 108,  NULL, 80, 70, 50),
  -- T-Shirts
  ('sz-ts-s',   'T-Shirts', 'S',   90,  74,  NULL, 68, 20, 41),
  ('sz-ts-m',   'T-Shirts', 'M',   98,  82,  NULL, 70, 21, 43),
  ('sz-ts-l',   'T-Shirts', 'L',  106,  90,  NULL, 72, 22, 45),
  ('sz-ts-xl',  'T-Shirts', 'XL', 114,  98,  NULL, 74, 23, 47),
  ('sz-ts-xxl', 'T-Shirts', 'XXL',122, 106,  NULL, 76, 24, 49),
  -- Denim (waist measurement)
  ('sz-dn-s',   'Denim',    'S',   82,  72,   92, 102, NULL, NULL),
  ('sz-dn-m',   'Denim',    'M',   90,  80,  100, 104, NULL, NULL),
  ('sz-dn-l',   'Denim',    'L',   98,  88,  108, 106, NULL, NULL),
  ('sz-dn-xl',  'Denim',    'XL', 106,  96,  116, 108, NULL, NULL),
  ('sz-dn-xxl', 'Denim',    'XXL',114, 104,  124, 110, NULL, NULL),
  -- Kurtis (women)
  ('sz-ku-s',   'Kurtis',   'S',   84,  68,   90,  44, 59, 38),
  ('sz-ku-m',   'Kurtis',   'M',   88,  72,   94,  46, 60, 39),
  ('sz-ku-l',   'Kurtis',   'L',   92,  76,   98,  47, 61, 40),
  ('sz-ku-xl',  'Kurtis',   'XL',  96,  80,  102,  48, 62, 41),
  ('sz-ku-xxl', 'Kurtis',   'XXL',100,  84,  106,  49, 63, 42),
  -- Trousers
  ('sz-tr-s',   'Trousers', 'S',   NULL, 70,   92, 100, NULL, NULL),
  ('sz-tr-m',   'Trousers', 'M',   NULL, 78,  100, 102, NULL, NULL),
  ('sz-tr-l',   'Trousers', 'L',   NULL, 86,  108, 104, NULL, NULL),
  ('sz-tr-xl',  'Trousers', 'XL',  NULL, 94,  116, 106, NULL, NULL),
  ('sz-tr-xxl', 'Trousers', 'XXL', NULL,102,  124, 108, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ─── FABRIC INVENTORY (8) ─────────────────────────────────────────────────────
INSERT INTO public.fabric_inventory (id, supplier_id, fabric_name, type, gsm, color, quantity_meters, price_per_meter, location, min_threshold, last_restocked)
VALUES
  ('fab-1', 'sup-1', 'Giza Egyptian Cotton',  'Cotton',   145, 'Classic White',      5400, 180, 'A-01', 500, '2026-09-25'),
  ('fab-2', 'sup-1', 'Giza Egyptian Cotton',  'Cotton',   145, 'Sky Blue',           3200, 185, 'A-02', 500, '2026-09-25'),
  ('fab-3', 'sup-1', 'Ring-Spun Cotton',      'Cotton',   220, 'Onyx Black',         8900, 120, 'B-01',1000, '2026-10-01'),
  ('fab-4', 'sup-2', 'Right-Hand Twill Denim','Denim',    380, 'Deep Raw Indigo',    3100, 350, 'C-01', 300, '2026-09-30'),
  ('fab-5', 'sup-2', 'Right-Hand Twill Denim','Denim',    380, 'Vintage Stonewash',  2400, 350, 'C-02', 300, '2026-09-30'),
  ('fab-6', 'sup-1', 'Chanderi Silk Blend',   'Silk',     180, 'Mustard Ochre',      1800, 450, 'D-01', 200, '2026-09-28'),
  ('fab-7', 'sup-1', 'European Flax Linen',   'Linen',    210, 'Oatmeal Beige',      2700, 280, 'E-01', 300, '2026-10-05'),
  ('fab-8', 'sup-1', 'Poly-Viscose Blend',    'Blended',  290, 'Charcoal Herringbone',1500,320, 'F-01', 200, '2026-09-20')
ON CONFLICT (id) DO NOTHING;

-- ─── SAMPLE RETAILERS (3, NOT linked to real auth users — id is TEXT) ─────────
-- NOTE: The live retailers table uses UUID primary key (linked to auth.users).
-- These sample rows use TEXT-looking UUIDs so they don't conflict with real signups.
-- They are for the factory dashboard demo view only.
INSERT INTO public.retailers (
  id, user_id, name, first_name, business_name, gst_number,
  city, place, state, phone, email,
  active_orders_count, total_spent, credit_limit, joined_date
)
VALUES
  (
    '00000000-0001-0000-0000-000000000001'::uuid,
    '00000000-0001-0000-0000-000000000001'::uuid,
    'Rajesh Sharma', 'Rajesh', 'Aura Garments & Apparels', '27AABCA1234M1Z5',
    'Mumbai', 'Mumbai', 'Maharashtra', '+91 98201 44520', 'contact@auragarments.in',
    2, 428000, 250000, 'Jan 2026'
  ),
  (
    '00000000-0002-0000-0000-000000000002'::uuid,
    '00000000-0002-0000-0000-000000000002'::uuid,
    'Ananya Deshmukh', 'Ananya', 'Vogue Boutique Chains', '29AABCV5678K1ZP',
    'Bengaluru', 'Bengaluru', 'Karnataka', '+91 97412 88319', 'orders@voguechains.com',
    1, 315000, 200000, 'Feb 2026'
  ),
  (
    '00000000-0003-0000-0000-000000000003'::uuid,
    '00000000-0003-0000-0000-000000000003'::uuid,
    'Vikram Mehta', 'Vikram', 'Metro Threads Wholesale', '24AAACV1234F1Z8',
    'Surat', 'Surat', 'Gujarat', '+91 94280 77119', 'procurement@metrothreads.com',
    1, 185000, 150000, 'Apr 2026'
  )
ON CONFLICT (id) DO NOTHING;

-- ─── ORDERS (6, linked to sample retailers) ───────────────────────────────────
INSERT INTO public.orders (
  id, order_number, date, retailer_name, retailer_store, retailer_city, retailer_phone,
  total_pieces, subtotal, gst_amount, grand_total,
  status, tracking_number, courier_name, dispatch_date, estimated_delivery,
  payment_method, payment_status, notes, items
)
VALUES
  (
    'ord-101', 'TB-ORD-8941', '2026-10-18',
    'Rajesh Sharma', 'Aura Garments & Apparels', 'Mumbai', '+91 98201 44520',
    120, 45600, 2280, 47880,
    'Dispatched', 'DEL-B2B-98471204', 'Delhivery B2B Freight',
    '2026-10-20', '2026-10-23', 'NEFT / RTGS', 'Paid',
    'Diwali restock — Oxford shirts.',
    '[{"id":"item-1","product":{"id":"prod-1","name":"Men''s Oxford Formal Shirt","wholesalePrice":380,"image":"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80","category":"Shirts","fabric":"100% Giza Egyptian Cotton"},"sizes":{"S":20,"M":40,"L":40,"XL":20,"XXL":0},"selectedColor":"Classic White","totalQuantity":120,"itemTotal":45600}]'::jsonb
  ),
  (
    'ord-102', 'TB-ORD-8942', '2026-10-19',
    'Ananya Deshmukh', 'Vogue Boutique Chains', 'Bengaluru', '+91 97412 88319',
    100, 44000, 2200, 46200,
    'In Production', 'BLR-EXP-662301', 'BlueDart Express Freight',
    NULL, '2026-10-25', 'UPI', 'Paid',
    'Festive kurtis — high priority.',
    '[{"id":"item-2","product":{"id":"prod-4","name":"Embroidered Chanderi Women''s Kurti","wholesalePrice":440,"image":"https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80","category":"Kurtis","fabric":"Chanderi Silk Blend"},"sizes":{"S":15,"M":30,"L":30,"XL":15,"XXL":10},"selectedColor":"Mustard Ochre","totalQuantity":100,"itemTotal":44000}]'::jsonb
  ),
  (
    'ord-103', 'TB-ORD-8943', '2026-10-21',
    'Vikram Mehta', 'Metro Threads Wholesale', 'Surat', '+91 94280 77119',
    70, 43400, 2170, 45570,
    'Confirmed', 'SRT-LOG-441122', 'Safexpress Logistics',
    NULL, '2026-10-28', 'Factory Credit (15 Days)', 'Pending',
    'Mixed T-shirts and denim.',
    '[{"id":"item-3","product":{"id":"prod-2","name":"Premium Combed Cotton T-Shirt","wholesalePrice":180,"image":"https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80","category":"T-Shirts","fabric":"220 GSM Ring-Spun Cotton"},"sizes":{"S":10,"M":20,"L":20,"XL":10,"XXL":5},"selectedColor":"Onyx Black","totalQuantity":65,"itemTotal":11700},{"id":"item-4","product":{"id":"prod-3","name":"Classic Indigo Denim Jeans","wholesalePrice":620,"image":"https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80","category":"Denim","fabric":"13.5 oz Denim"},"sizes":{"S":1,"M":2,"L":2,"XL":0,"XXL":0},"selectedColor":"Deep Raw Indigo","totalQuantity":5,"itemTotal":3100}]'::jsonb
  ),
  (
    'ord-104', 'TB-ORD-8944', '2026-10-22',
    'Rajesh Sharma', 'Aura Garments & Apparels', 'Mumbai', '+91 98201 44520',
    50, 27500, 1375, 28875,
    'Quality Check', 'DEL-B2B-99887766', 'Delhivery B2B Freight',
    NULL, '2026-10-30', 'UPI', 'Paid',
    NULL,
    '[{"id":"item-5","product":{"id":"prod-8","name":"Mercerized Cotton Polo Shirt","wholesalePrice":550,"image":"https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=800&q=80","category":"Shirts","fabric":"Pique Cotton"},"sizes":{"S":8,"M":15,"L":15,"XL":10,"XXL":2},"selectedColor":"Navy Blue","totalQuantity":50,"itemTotal":27500}]'::jsonb
  ),
  (
    'ord-105', 'TB-ORD-8945', '2026-11-01',
    'Ananya Deshmukh', 'Vogue Boutique Chains', 'Bengaluru', '+91 97412 88319',
    80, 23200, 1160, 24360,
    'Delivered', 'BLR-DEL-554433', 'BlueDart Express Freight',
    '2026-11-03', '2026-11-06', 'NEFT / RTGS', 'Paid',
    NULL,
    '[{"id":"item-6","product":{"id":"prod-7","name":"Heavyweight Boxy Fleece Hoodie","wholesalePrice":490,"image":"https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80","category":"T-Shirts","fabric":"380 GSM Fleece"},"sizes":{"S":10,"M":25,"L":25,"XL":15,"XXL":5},"selectedColor":"Heather Grey","totalQuantity":80,"itemTotal":39200}]'::jsonb
  ),
  (
    'ord-106', 'TB-ORD-8946', '2026-11-10',
    'Vikram Mehta', 'Metro Threads Wholesale', 'Surat', '+91 94280 77119',
    40, 15200, 760, 15960,
    'Pending', NULL, 'Delhivery B2B Freight',
    NULL, '2026-11-18', 'Factory Credit (15 Days)', 'Pending',
    'Trial order for new season.',
    '[{"id":"item-7","product":{"id":"prod-13","name":"Cotton Striped Casual Shirt","wholesalePrice":290,"image":"https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80","category":"Shirts","fabric":"Combed Cotton Stripe"},"sizes":{"S":5,"M":15,"L":15,"XL":5,"XXL":0},"selectedColor":"Blue White Stripe","totalQuantity":40,"itemTotal":11600}]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- ─── INVOICES (1 per order) ───────────────────────────────────────────────────
INSERT INTO public.invoices (id, invoice_number, order_id, order_number, date, due_date, retailer_name, retailer_store, retailer_gst, subtotal, gst_amount, grand_total, total_pieces, status)
VALUES
  ('inv-101','INV-TB-2026-0891','ord-101','TB-ORD-8941','2026-10-18','2026-11-02','Rajesh Sharma','Aura Garments & Apparels','27AABCA1234M1Z5', 45600, 2280, 47880, 120,'Paid'),
  ('inv-102','INV-TB-2026-0892','ord-102','TB-ORD-8942','2026-10-19','2026-11-03','Ananya Deshmukh','Vogue Boutique Chains','29AABCV5678K1ZP',    44000, 2200, 46200, 100,'Paid'),
  ('inv-103','INV-TB-2026-0893','ord-103','TB-ORD-8943','2026-10-21','2026-11-05','Vikram Mehta','Metro Threads Wholesale','24AAACV1234F1Z8',    43400, 2170, 45570,  70,'Pending'),
  ('inv-104','INV-TB-2026-0894','ord-104','TB-ORD-8944','2026-10-22','2026-11-06','Rajesh Sharma','Aura Garments & Apparels','27AABCA1234M1Z5', 27500, 1375, 28875,  50,'Paid'),
  ('inv-105','INV-TB-2026-0895','ord-105','TB-ORD-8945','2026-11-01','2026-11-15','Ananya Deshmukh','Vogue Boutique Chains','29AABCV5678K1ZP',   23200, 1160, 24360,  80,'Paid'),
  ('inv-106','INV-TB-2026-0896','ord-106','TB-ORD-8946','2026-11-10','2026-11-25','Vikram Mehta','Metro Threads Wholesale','24AAACV1234F1Z8',    15200,  760, 15960,  40,'Pending')
ON CONFLICT (id) DO NOTHING;

-- ─── PRODUCTION RUNS (5) ──────────────────────────────────────────────────────
INSERT INTO public.production_runs (id, product_id, batch_number, quantity_planned, quantity_completed, status, start_date, end_date, responsible_person, notes)
VALUES
  ('run-1','prod-1','TB-FW26-001',1000, 850,'In Progress', '2026-10-01', NULL,         'Mohan Raj',    'Oxford shirts — Diwali priority'),
  ('run-2','prod-2','TB-FW26-002',2000,2000,'Completed',   '2026-09-15','2026-09-28', 'Priya Nair',   'T-shirts fully completed'),
  ('run-3','prod-3','TB-FW26-003',1500, 600,'Scheduled',   '2026-10-15', NULL,         'Arun Kumar',   'Denim — indigo lot approved'),
  ('run-4','prod-4','TB-FW26-004', 800, 300,'In Progress', '2026-10-10', NULL,         'Lakshmi Devi', 'Chanderi kurtis — embroidery pending'),
  ('run-5','prod-5','TB-FW26-005',1200,   0,'Scheduled',   '2026-10-25', NULL,         'Suresh Babu',  'Linen — awaiting QC clearance')
ON CONFLICT (id) DO NOTHING;

-- ─── PAYMENTS (mixed statuses) ────────────────────────────────────────────────
INSERT INTO public.payments (id, order_id, invoice_id, amount, method, status, transaction_id, paid_at)
VALUES
  ('pay-1','ord-101','inv-101', 47880,'NEFT / RTGS',           'Completed','NEFT261018AXSB001','2026-10-18T10:30:00Z'),
  ('pay-2','ord-102','inv-102', 46200,'UPI',                   'Completed','UPI261019ABCD4567','2026-10-19T14:15:00Z'),
  ('pay-3','ord-103','inv-103', 45570,'Factory Credit (15 Days)','Pending', NULL,                NULL),
  ('pay-4','ord-104','inv-104', 28875,'UPI',                   'Completed','UPI261022WXYZ8899','2026-10-22T11:00:00Z'),
  ('pay-5','ord-105','inv-105', 24360,'NEFT / RTGS',           'Completed','NEFT261101MNOP334','2026-11-01T09:45:00Z'),
  ('pay-6','ord-106','inv-106', 15960,'Factory Credit (15 Days)','Pending', NULL,                NULL)
ON CONFLICT (id) DO NOTHING;

-- ─── ENQUIRIES (4) ────────────────────────────────────────────────────────────
INSERT INTO public.enquiries (id, name, business_name, email, phone, message)
VALUES
  ('enq-1','Priya Sundaram',   'Sundaram Cloth Emporium',  'priya@sundaramtextiles.in', '+91 98400 33211',
   'Interested in bulk order of Chanderi kurtis for the festive season. Please share your rate card for 500+ pieces.'),
  ('enq-2','Deepak Joshi',     'Joshi Fabrics Retail',     'djoshi@joshifabrics.com',   '+91 97111 55667',
   'Looking for wholesale men''s shirts and polo tees for our 3 retail outlets in Pune. What is the MOQ and lead time?'),
  ('enq-3','Meena Krishnan',   'Style Hub Boutique',       'meena@stylehub.in',          '+91 98855 22334',
   'Need 200 pieces of linen trousers in Oatmeal Beige. Can you accommodate custom labelling?'),
  ('enq-4','Rajan Agarwal',    'Rajan Wholesale Traders',  'rajan@rajantextiles.in',     '+91 94100 77889',
   'Please send your complete product catalogue and best wholesale rates for a first order of ₹5 lakh.')
ON CONFLICT (id) DO NOTHING;
