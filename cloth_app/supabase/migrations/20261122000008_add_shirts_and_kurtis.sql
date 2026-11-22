-- Migration: 20261122000008_add_shirts_and_kurtis.sql
-- Description: Add 7 Flipkart/Myntra Shirts and 4 Amazon Kurtis/Ethnic sets

INSERT INTO public.products (
  id, name, category, fabric, description, wholesale_price, retail_mrp, moq, image,
  stock_s, stock_m, stock_l, stock_xl, stock_xxl, colors, tags, rating, gsm
) VALUES
  -- 7 SHIRTS
  ('prod-35', 'AIDAN PAUL Men Regular Fit Washed Spread Collar Casual Shirt', 'Shirts', '100% Pre-Washed Slub Cotton', 'Casual washed spread collar shirt with curved hem, chest pocket, and soft enzyme finish. Perfect for daily wear and modern boutique collections.', 450, 1899, 30, 'https://rukminim2.flixcart.com/image/480/640/xif0q/shirt/t/s/l/m-towel-aidan-paul-original-imahsyrvy3ghy2fw.jpeg', 70, 150, 170, 100, 50, ARRAY['Washed Grey', 'Charcoal'], ARRAY['Washed Cotton', 'Casual Core'], 4.8, 180),
  ('prod-36', 'SPOQUE Men Regular Fit Self Design Spread Collar Shirt', 'Shirts', 'Self-Design Jacquard Cotton', 'Subtle woven geometric self-design pattern shirt with structured spread collar, button placket, and breathable finish.', 378, 1599, 35, 'https://rukminim2.flixcart.com/image/480/640/xif0q/shirt/i/g/r/xl-warp-chex-sopani-original-imahg8fxgww5y8e9.jpeg', 80, 160, 190, 110, 55, ARRAY['Light Sky Blue', 'Ice Blue'], ARRAY['Self Design', 'Jacquard Weave'], 4.7, 175),
  ('prod-37', 'SPOQUE Men Self Design Spread Collar Maroon Casual Shirt', 'Shirts', 'Textured Dobby Cotton Weave', 'Deep maroon textured dobby shirt with fine lustrous weave, premium pearl buttons, and comfort regular fit.', 367, 1499, 35, 'https://rukminim2.flixcart.com/image/480/640/xif0q/shirt/l/q/k/l-shirt-jaqard-new-sopani-original-imahdnvrfexqxnzt.jpeg', 75, 155, 180, 105, 45, ARRAY['Rich Maroon', 'Wine Red'], ARRAY['Dobby Cotton', 'Festive Casual'], 4.7, 185),
  ('prod-38', 'SPOQUE Men Regular Fit Checkered Spread Collar Casual Shirt', 'Shirts', '100% Yarn-Dyed Check Cotton', 'Classic green checkered casual shirt featuring woven tartan squares, buttoned cuffs, and easy-iron fabric treatment.', 408, 1699, 30, 'https://rukminim2.flixcart.com/image/480/640/xif0q/shirt/j/o/8/m-braso-cheks-shirt-nofilter-original-imahr9wadajbqqdw.jpeg', 90, 180, 200, 120, 60, ARRAY['Forest Green Check', 'Olive Tartan'], ARRAY['Yarn Dyed', 'Checkered Shirt'], 4.8, 190),
  ('prod-39', 'METRONAUT Men Regular Fit Striped Spread Collar Casual Shirt', 'Shirts', 'Fine Oxford Stripe Cotton', 'Clean vertical stripe shirt in light blue and white. Engineered for smart casual office styling and boutique retail displays.', 343, 1399, 40, 'https://rukminim2.flixcart.com/image/480/640/xif0q/shirt/i/l/7/xl-sht-8002-metronaut-original-imahhsxzgqfyt5h3.jpeg', 100, 200, 220, 130, 65, ARRAY['Light Blue & White', 'Navy Stripe'], ARRAY['Vertical Stripe', 'Oxford Weave'], 4.7, 170),
  ('prod-40', 'Cahoot Men Comfort Opaque Checked Casual Shirt', 'Shirts', 'Brushed Opaque Cotton Check', 'Ultra-soft brushed cotton checked shirt with cutaway spread collar, button placket, and breathable weave.', 380, 1599, 30, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80', 80, 160, 180, 100, 50, ARRAY['Multi Check', 'Navy Rust'], ARRAY['Brushed Cotton', 'Opaque Weave'], 4.8, 195),
  ('prod-41', 'Powerlook Corduroy Check Tartan Long Sleeves Shirt', 'Shirts', '100% Fine Wale Cotton Corduroy Tartan', 'Heavyweight corduroy tartan check overshirt for men with cutaway collar, horn buttons, and curved hem.', 480, 2199, 25, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80', 65, 140, 160, 95, 40, ARRAY['Brown Tartan', 'Earth Ochre'], ARRAY['Corduroy Check', 'Autumn Drop'], 4.9, 250),

  -- 4 KURTIS
  ('prod-42', 'C J Enterprise Pure Soft Silk Festive Kurti Ensemble', 'Kurtis', 'Pure Soft Silk with Zari Embroidery', 'Traditional wedding festival ethnic tunic with intricate gold brocade borders and silky inner lining.', 549, 2499, 20, 'https://m.media-amazon.com/images/I/71p93eg96vL._SL1500_.jpg', 45, 90, 120, 70, 35, ARRAY['Crimson Red', 'Peacock Green'], ARRAY['Soft Silk', 'Wedding Festive'], 4.9, 220),
  ('prod-43', 'EthnicJunction Paithani Silk Blend Woven Kurti Set', 'Kurtis', 'Paithani Silk Blend with Metallic Border', 'Heritage Maharashtrian Paithani weave featuring ornate peacock motifs and rich zari borders.', 499, 2299, 25, 'https://m.media-amazon.com/images/I/814ysszMx2L._SL1500_.jpg', 50, 100, 130, 80, 40, ARRAY['Royal Red', 'Golden Ochre'], ARRAY['Paithani Weave', 'Heritage Ethnic'], 4.8, 210),
  ('prod-44', 'EthnicJunction Paithani Silk Royal Weave Kurti', 'Kurtis', 'Silk Blend with Intricate Border Pallu', 'Festive occasion designer ethnic tunic with contrast color border and running dupatta piece.', 499, 2299, 25, 'https://m.media-amazon.com/images/I/911yOt+Ei8L._SL1500_.jpg', 55, 110, 140, 85, 45, ARRAY['Deep Purple', 'Royal Magenta'], ARRAY['Silk Blend', 'Occasion Wear'], 4.8, 215),
  ('prod-45', 'SGF11 Women''s Kanjivaram Soft Silk Ethnic Kurti', 'Kurtis', 'Kanjivaram Soft Silk with Gold Zari', 'Lustrous South Indian Kanjivaram silk tunic with all-over botanical jaal weaving and gold tissue borders.', 499, 2399, 25, 'https://m.media-amazon.com/images/I/617YAcTci7L._SL1500_.jpg', 60, 120, 150, 90, 50, ARRAY['Emerald Green', 'Mustard Gold'], ARRAY['Kanjivaram Silk', 'Gold Zari'], 4.9, 230)

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
