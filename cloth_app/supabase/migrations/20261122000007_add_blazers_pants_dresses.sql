-- Migration: 20261122000007_add_blazers_pants_dresses.sql
-- Description: Insert new Blazers, Pants (Trousers & Jeans), and Dresses into Supabase

INSERT INTO public.products (
  id, name, category, fabric, description, wholesale_price, retail_mrp, moq, image,
  stock_s, stock_m, stock_l, stock_xl, stock_xxl, colors, tags, rating, gsm
) VALUES
  -- 5 BLAZERS
  ('prod-13', 'Beige 2035 Contemporary WorkBlazer', 'Blazers', 'Structured Poly-Viscose Stretch Twill', 'Modern tailored work blazer in sophisticated beige. Features notch lapel, dual back vent, and interior pocketing.', 1850, 6320, 15, 'https://m.media-amazon.com/images/I/61gOkU82PJL._SL1500_.jpg', 30, 70, 85, 45, 20, ARRAY['Beige', 'Sand Khaki'], ARRAY['Work Wear', 'Tailored', 'Premium Tier'], 4.8, 280),
  ('prod-14', 'MAYKR Slim Fit Single-Breasted Black Blazer', 'Blazers', 'Poly-Rayon Business Suiting Blend', 'Single-breasted 2-button classic black formal blazer with slim fit silhouette, flap pockets, and satin inner lining.', 580, 2499, 25, 'https://m.media-amazon.com/images/I/51jM6jg3x1L._SL1400_.jpg', 50, 110, 130, 80, 40, ARRAY['Jet Black', 'Charcoal Grey'], ARRAY['Slim Fit', 'Formal Wear', 'Top Value'], 4.7, 260),
  ('prod-15', 'Men''s Navy Blue Slim Fit Business Blazer', 'Blazers', '65% Polyester / 35% Viscose Suiting Fabric', 'Crisp navy blue formal business blazer. Designed with peak lapel, horn buttons, and breathable poly lining.', 590, 2499, 25, 'https://m.media-amazon.com/images/I/616tZenyPxL._SL1400_.jpg', 45, 95, 120, 75, 35, ARRAY['Navy Blue', 'Midnight Royal'], ARRAY['Formal Suiting', 'Slim Silhouette'], 4.8, 265),
  ('prod-16', 'Pure Lambskin Leather 2-Button Tailored Blazer', 'Blazers', '100% Genuine Soft Lambskin Nappa Leather', 'Luxury genuine leather blazer coat featuring hand-buffed finish, 2-button front, notch collar, and silky viscose lining.', 3200, 12999, 10, 'https://m.media-amazon.com/images/I/710IkNn8MlL._SL1312_.jpg', 15, 35, 40, 25, 15, ARRAY['Saddle Brown', 'Vintage Tan'], ARRAY['Genuine Leather', 'Luxury Tier', 'High Margin'], 4.9, 420),
  ('prod-17', 'Colorplus Contemporary Fit Dark Red Blazer', 'Blazers', 'Poly-Wool Textured Weave', 'Premium rich burgundy blazer with structured silhouette, tailored interior pockets, and tonal button accents.', 1650, 7999, 15, 'https://m.media-amazon.com/images/I/71SQi6rxSoL._SL1500_.jpg', 25, 55, 70, 40, 20, ARRAY['Dark Wine Red', 'Burgundy'], ARRAY['Party Wear', 'Designer Tier'], 4.9, 300),

  -- 5 TROUSERS
  ('prod-18', 'Marks & Spencer Crease Resistant Slim Fit Trousers', 'Trousers', 'Active Waist Poly-Viscose with Elastane Stretch', 'Flat-front crease resistant trousers with flexible active waistband engineered for all-day comfort and sharp drape.', 520, 2499, 30, '/images/pants/pants-4.jpg', 70, 140, 160, 90, 40, ARRAY['Charcoal Black', 'Slate Grey'], ARRAY['Crease Resistant', 'Active Waist', 'M&S Tier'], 4.8, 230),
  ('prod-19', 'Peregrine by Pantaloons Men Slim Fit Trousers', 'Trousers', 'Cotton-Rich Stretch Chino Twill', 'Tailored slim trousers in washed mineral grey with slant side pockets, rear button welts, and reinforced stitching.', 460, 1899, 30, '/images/pants/pants-1.jpg', 80, 150, 170, 100, 50, ARRAY['Washed Grey', 'Stone Olive'], ARRAY['Slim Fit', 'Casual Chino'], 4.7, 220),
  ('prod-20', 'Peregrine by Pantaloons Men Whiskered Trousers', 'Trousers', 'Micro-Sanded Cotton Stretch Blend', 'Smart casual five-pocket trouser with subtle knee whiskering and comfort waist fit for versatile day-to-night styling.', 480, 1999, 30, '/images/pants/pants-3.jpg', 65, 130, 150, 95, 45, ARRAY['Charcoal Heather', 'Graphite'], ARRAY['Smart Casual', '5-Pocket'], 4.7, 240),
  ('prod-21', 'Metronaut Men Relaxed Easy Wash Trousers', 'Trousers', '100% Breathable Cotton Canvas', 'Easy-care relaxed fit trousers designed with extra room through the seat and thigh. Machine-washable with zero shrinkage.', 410, 1599, 35, '/images/pants/pants-7.jpg', 90, 180, 200, 120, 60, ARRAY['Washed Black', 'Olive Drab'], ARRAY['Relaxed Fit', 'Easy Wash', 'Daily Core'], 4.8, 210),
  ('prod-22', 'Fabripple Men Loose Fit Elastic Waist Cargo Pants', 'Trousers', 'Heavy Cotton Twill with Drawstring Waist', 'Utilitarian loose fit cargo pants featuring elastic drawcord waistband, deep flap utility pockets, and reinforced cuffs.', 490, 2199, 30, '/images/pants/pants-8.jpg', 75, 160, 180, 110, 55, ARRAY['Denim Indigo', 'Khaki Sand'], ARRAY['Cargo Loose Fit', 'Streetwear'], 4.8, 260),

  -- 4 JEANS (DENIM)
  ('prod-23', 'HERE&NOW Men Bootcut Mid-Rise Stretchable Jeans', 'Denim', '98% Cotton / 2% Spandex Indigo Denim (12 Oz)', 'Authentic 90s inspired bootcut silhouette with slight flare from the knee down. Built with premium comfort stretch denim.', 540, 2399, 25, '/images/pants/pants-5.jpg', 60, 140, 170, 95, 40, ARRAY['Mid Stone Indigo', 'Vintage Tint'], ARRAY['Bootcut Fit', 'Comfort Stretch', 'High Trend'], 4.9, 340),
  ('prod-24', 'HERE&NOW Blue Smart Light Fade Regular Jeans', 'Denim', 'Ring-Spun Cotton Denim with Subtle Enzyme Fade', 'Everyday regular fit jeans with hand-sanded whiskering and clean tonal stitching. Timeless boutique wardrobe essential.', 510, 2199, 30, '/images/pants/pants-2.jpg', 85, 170, 190, 120, 50, ARRAY['Light Blue Wash', 'Classic Indigo'], ARRAY['Light Fade', 'Regular Fit'], 4.8, 320),
  ('prod-25', 'SZN Men Classic Baggy Fit Mid-Rise Jeans', 'Denim', 'Heavy 13.5 Oz 100% Rigid Denim', 'Skater inspired wide-leg baggy fit jeans with mid-rise waist, heavy metal rivets, and clean vintage stonewash drape.', 560, 2499, 25, '/images/pants/pants-6.jpg', 70, 150, 180, 105, 45, ARRAY['Classic Dark Indigo', 'Raw Wash'], ARRAY['Baggy Fit', 'Heavy Denim', 'Boutique Hot'], 4.9, 380),
  ('prod-26', 'PODGE Men Relaxed Fit Rinsed Black Jeans', 'Denim', 'Pure Black Sulfur-Dyed Cotton Stretch Denim', 'Stay-black rinsed denim with relaxed straight leg, mid-rise contour waistband, and high colourfastness.', 530, 2299, 30, '/images/pants/pants-9.jpg', 80, 160, 175, 100, 40, ARRAY['Jet Black', 'Rinse Wash'], ARRAY['Relaxed Fit', 'Stay Black'], 4.8, 330),

  -- 8 DRESSES
  ('prod-27', 'KLOSIA Rayon Printed Anarkali Kurta & Pant Set', 'Dresses', '100% Breathable Rayon with Gold Foil Block Print', 'Flared Anarkali silhouette with matching coordinated cigarette pants and contrasting lightweight dupatta.', 380, 1499, 30, 'https://m.media-amazon.com/images/I/51JtGs04X7L._SL1099_.jpg', 90, 180, 200, 120, 60, ARRAY['Navy Floral', 'Burgundy Wine'], ARRAY['Anarkali Set', 'Festive Collection'], 4.8, 175),
  ('prod-28', 'GoSriKi Viscose Printed V-Neck Ethnic Dress Set', 'Dresses', 'Soft Liva Viscose Modal with Botanical Motif', 'V-neck elbow length sleeve ethnic dress outfit with matching trousers and sheer printed dupatta.', 350, 1399, 35, 'https://m.media-amazon.com/images/I/61Rag7PIeiL._SL1402_.jpg', 100, 200, 220, 140, 70, ARRAY['Teal Green', 'Rust Orange'], ARRAY['Ethnic Dress', 'Viscose Modal'], 4.7, 165),
  ('prod-29', 'ANNI Designer Rayon Viscose Straight Kurta Set', 'Dresses', 'High Grade Bio-Polished Rayon Viscose', 'Straight silhouette kurta dress with lace border detailing, side slits, and comfortable matching pant.', 280, 999, 40, 'https://m.media-amazon.com/images/I/61aq1nagQiL._SL1500_.jpg', 120, 240, 260, 160, 80, ARRAY['Mustard Yellow', 'Sage Green'], ARRAY['Daily Wear', 'Value Pack'], 4.7, 160),
  ('prod-30', 'Nermosa Solid Embroidered A-Line Dress Set', 'Dresses', 'Cotton Silk Blend with Intricate Yoke Threadwork', 'Elegant A-line dress featuring handcrafted Kashmiri-style embroidery on neck and sleeves.', 420, 1799, 25, 'https://m.media-amazon.com/images/I/71rjJMwzQaL._SL1500_.jpg', 75, 160, 180, 110, 50, ARRAY['Dusty Rose Pink', 'Pistachio Green'], ARRAY['Embroidered', 'A-Line'], 4.9, 190),
  ('prod-31', 'GoSriKi Viscose Printed Festive Anarkali Outfit', 'Dresses', 'Heavy Weight Spun Viscose with Zari Lace Hem', 'Rich party-wear tiered Anarkali gown with broad golden border and coordinated organza dupatta.', 480, 1999, 25, 'https://m.media-amazon.com/images/I/61jYGxbBCRL._SL1500_.jpg', 60, 140, 160, 90, 45, ARRAY['Maroon Crimson', 'Royal Navy'], ARRAY['Festive Anarkali', 'Party Drop'], 4.9, 210),
  ('prod-32', 'KZULLY Flared Indo-Western Long Maxi Gown', 'Dresses', 'Flowing Georgette with Butter-Crepe Inner Lining', 'One-piece floor-length flared Indo-Western gown with cinched elastic waist and flutter cap sleeves.', 320, 1299, 35, 'https://m.media-amazon.com/images/I/61ShDu8G-zL._SL1440_.jpg', 110, 210, 230, 130, 65, ARRAY['Emerald Green', 'Wine Red'], ARRAY['Maxi Gown', 'Indo Western'], 4.8, 150),
  ('prod-33', 'Shasmi V-Neck Puff Sleeve Party Maxi Dress', 'Dresses', 'Premium Poly-Moss Crepe with Satin Finish', 'Modern Western evening maxi dress featuring deep V-neckline, smocked waist, and structured puff shoulders.', 390, 1599, 30, 'https://m.media-amazon.com/images/I/61YMNGixhCL._SL1500_.jpg', 80, 170, 190, 115, 50, ARRAY['Forest Green', 'Midnight Black'], ARRAY['Western Maxi', 'Evening Wear'], 4.8, 180),
  ('prod-34', 'GoSriKi Straight Fit Viscose Ethnic Gown Set', 'Dresses', '100% Pure Liva Viscose', 'Clean lines and modern ethnic styling with notched neckline, straight side cut, and floral foil accents.', 360, 1449, 30, 'https://m.media-amazon.com/images/I/61+SSCQ5K7L._SL1402_.jpg', 95, 190, 210, 125, 55, ARRAY['Deep Indigo', 'Turquoise'], ARRAY['Ethnic Gown', 'Straight Cut'], 4.8, 170)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  fabric = EXCLUDED.fabric,
  description = EXCLUDED.description,
  wholesale_price = EXCLUDED.wholesale_price,
  retail_mrp = EXCLUDED.retail_mrp,
  moq = EXCLUDED.moq,
  image = EXCLUDED.image,
  stock_s = EXCLUDED.stock_s,
  stock_m = EXCLUDED.stock_m,
  stock_l = EXCLUDED.stock_l,
  stock_xl = EXCLUDED.stock_xl,
  stock_xxl = EXCLUDED.stock_xxl,
  colors = EXCLUDED.colors,
  tags = EXCLUDED.tags,
  rating = EXCLUDED.rating,
  gsm = EXCLUDED.gsm;
