-- ==============================================================================
-- LOOPMEX — PROPOSED RLS POLICIES (PHASE 5 REVIEW)
-- File: supabase_rls_proposed.sql
--
-- DO NOT RUN THIS YET. Review it, then approve and paste into SQL Editor.
-- Goal: tighten security while keeping the app functional.
--
-- Summary of changes vs. current open ("USING (true)") policies:
--   products        → public read, factory-member write only
--   retailers       → own row read/write for retailers, all rows for factory
--   orders          → own rows for retailers (by user_id/retailer_id), all for factory
--   invoices        → own rows for retailers, all for factory
--   enquiries       → public insert, own read (by user_id), all for factory
--   factory_members → own row read/update, service-role only for inserts
--   suppliers       → factory read/write only
--   fabric_inventory→ factory read/write only
--   production_runs → factory read/write only
--   size_chart      → public read, factory write
--   shipping_zones  → public read (active only), factory write
--   payments        → own rows for retailers (via orders), all for factory
-- ==============================================================================

-- ─── HELPER: is_factory_member() ─────────────────────────────────────────────
-- (Already created by migration 20261117000001. Included here for reference.)
-- CREATE OR REPLACE FUNCTION public.is_factory_member(...) ...

-- ─── products ─────────────────────────────────────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read products"  ON public.products;
DROP POLICY IF EXISTS "Allow public write products" ON public.products;

CREATE POLICY "Products: public read"
  ON public.products FOR SELECT USING (true);                    -- anonymous OK for catalog

CREATE POLICY "Products: factory write"
  ON public.products FOR ALL TO authenticated
  USING  (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- ─── retailers ────────────────────────────────────────────────────────────────
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read retailers"  ON public.retailers;
DROP POLICY IF EXISTS "Allow public write retailers" ON public.retailers;

CREATE POLICY "Retailers: own row read"
  ON public.retailers FOR SELECT TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id OR public.is_factory_member());

CREATE POLICY "Retailers: own row insert"
  ON public.retailers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id OR public.is_factory_member());

CREATE POLICY "Retailers: own row update"
  ON public.retailers FOR UPDATE TO authenticated
  USING  (auth.uid() = id OR auth.uid() = user_id OR public.is_factory_member())
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id OR public.is_factory_member());

-- ─── orders ───────────────────────────────────────────────────────────────────
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read orders"  ON public.orders;
DROP POLICY IF EXISTS "Allow public write orders" ON public.orders;

CREATE POLICY "Orders: own rows read"
  ON public.orders FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id::uuid
    OR auth.uid() = retailer_id::uuid
    OR public.is_factory_member()
  );

CREATE POLICY "Orders: retailer insert (via RPC)"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id::uuid
    OR auth.uid() = retailer_id::uuid
    OR public.is_factory_member()
  );

CREATE POLICY "Orders: factory update status"
  ON public.orders FOR UPDATE TO authenticated
  USING  (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- ─── invoices ─────────────────────────────────────────────────────────────────
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read invoices"  ON public.invoices;
DROP POLICY IF EXISTS "Allow public write invoices" ON public.invoices;

CREATE POLICY "Invoices: own rows read"
  ON public.invoices FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id::uuid
    OR auth.uid() = retailer_id::uuid
    OR public.is_factory_member()
  );

CREATE POLICY "Invoices: factory manage"
  ON public.invoices FOR ALL TO authenticated
  USING  (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- ─── enquiries ────────────────────────────────────────────────────────────────
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read enquiries"  ON public.enquiries;
DROP POLICY IF EXISTS "Allow public write enquiries" ON public.enquiries;

CREATE POLICY "Enquiries: public insert"
  ON public.enquiries FOR INSERT WITH CHECK (true);              -- landing page form

CREATE POLICY "Enquiries: own read"
  ON public.enquiries FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR public.is_factory_member()
  );

CREATE POLICY "Enquiries: factory manage"
  ON public.enquiries FOR UPDATE TO authenticated
  USING  (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- ─── factory_members ──────────────────────────────────────────────────────────
ALTER TABLE public.factory_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Factory member can read own profile"   ON public.factory_members;
DROP POLICY IF EXISTS "Factory member can update own profile" ON public.factory_members;

CREATE POLICY "factory_members: own read"
  ON public.factory_members FOR SELECT TO authenticated
  USING (auth.uid() = id AND is_active = TRUE);

CREATE POLICY "factory_members: own update"
  ON public.factory_members FOR UPDATE TO authenticated
  USING  (auth.uid() = id AND is_active = TRUE)
  WITH CHECK (auth.uid() = id);
-- INSERT/DELETE via service-role (seed script) only — no client policy needed.

-- ─── suppliers ────────────────────────────────────────────────────────────────
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read suppliers"  ON public.suppliers;
DROP POLICY IF EXISTS "Allow public write suppliers" ON public.suppliers;

CREATE POLICY "Suppliers: factory manage"
  ON public.suppliers FOR ALL TO authenticated
  USING  (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- ─── fabric_inventory ─────────────────────────────────────────────────────────
ALTER TABLE public.fabric_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read fabric_inventory"  ON public.fabric_inventory;
DROP POLICY IF EXISTS "Allow public write fabric_inventory" ON public.fabric_inventory;

CREATE POLICY "fabric_inventory: factory manage"
  ON public.fabric_inventory FOR ALL TO authenticated
  USING  (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- ─── production_runs ──────────────────────────────────────────────────────────
ALTER TABLE public.production_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read production_runs"  ON public.production_runs;
DROP POLICY IF EXISTS "Allow public write production_runs" ON public.production_runs;

CREATE POLICY "production_runs: factory manage"
  ON public.production_runs FOR ALL TO authenticated
  USING  (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- ─── size_chart ───────────────────────────────────────────────────────────────
ALTER TABLE public.size_chart ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read size_chart"  ON public.size_chart;
DROP POLICY IF EXISTS "Allow public write size_chart" ON public.size_chart;

CREATE POLICY "size_chart: public read"
  ON public.size_chart FOR SELECT USING (true);

CREATE POLICY "size_chart: factory write"
  ON public.size_chart FOR ALL TO authenticated
  USING  (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- ─── shipping_zones ───────────────────────────────────────────────────────────
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read shipping_zones"  ON public.shipping_zones;
DROP POLICY IF EXISTS "Allow public write shipping_zones" ON public.shipping_zones;

CREATE POLICY "shipping_zones: active read"
  ON public.shipping_zones FOR SELECT
  USING (is_active = TRUE OR public.is_factory_member());

CREATE POLICY "shipping_zones: factory write"
  ON public.shipping_zones FOR ALL TO authenticated
  USING  (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- ─── payments ─────────────────────────────────────────────────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read payments"  ON public.payments;
DROP POLICY IF EXISTS "Allow public write payments" ON public.payments;

CREATE POLICY "payments: own rows read"
  ON public.payments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = payments.order_id
        AND (auth.uid() = o.user_id::uuid OR auth.uid() = o.retailer_id::uuid)
    )
    OR public.is_factory_member()
  );

CREATE POLICY "payments: factory manage"
  ON public.payments FOR ALL TO authenticated
  USING  (public.is_factory_member())
  WITH CHECK (public.is_factory_member());
