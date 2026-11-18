-- ==============================================================================
-- LOOPMEX — RETAILER SIGNUP TRIGGER + BACKFILL
-- File: supabase_retailer_trigger.sql
-- Purpose:
--   1. Create a SECURITY DEFINER trigger so every new auth.users row with
--      role='retailer' (or no role) automatically inserts a retailers profile.
--   2. Backfill any existing auth users who already signed up but have no row
--      in public.retailers.
--
-- HOW TO RUN: Paste this entire file into Supabase SQL Editor → Run
-- It is fully idempotent (safe to run more than once).
-- ==============================================================================

-- ─── 1. ENSURE retailers TABLE HAS ALL NEEDED COLUMNS ───────────────────────
-- (safe ALTERs; no-op if column already exists)
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS user_id UUID;
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
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS joined_date TEXT;
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.retailers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ─── 2. HELPER: SYNC FIELD PAIRS ON retailers ────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_retailer_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- name ↔ first_name
  IF NEW.name IS NULL AND NEW.first_name IS NOT NULL THEN
    NEW.name := NEW.first_name;
  ELSIF NEW.first_name IS NULL AND NEW.name IS NOT NULL THEN
    NEW.first_name := NEW.name;
  END IF;

  -- business_name fallback
  IF NEW.business_name IS NULL OR NEW.business_name = '' THEN
    NEW.business_name := COALESCE(NEW.name, NEW.first_name, 'Retail Store');
  END IF;

  -- city ↔ place
  IF NEW.city IS NULL AND NEW.place IS NOT NULL THEN
    NEW.city := NEW.place;
  ELSIF NEW.place IS NULL AND NEW.city IS NOT NULL THEN
    NEW.place := NEW.city;
  END IF;

  -- address ↔ shop_address
  IF NEW.address IS NULL AND NEW.shop_address IS NOT NULL THEN
    NEW.address := NEW.shop_address;
  ELSIF NEW.shop_address IS NULL AND NEW.address IS NOT NULL THEN
    NEW.shop_address := NEW.address;
  END IF;

  -- user_id mirrors id
  IF NEW.user_id IS NULL THEN
    NEW.user_id := NEW.id;
  END IF;

  -- joined_date default
  IF NEW.joined_date IS NULL THEN
    NEW.joined_date := to_char(NOW(), 'Mon YYYY');
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_retailer_fields ON public.retailers;
CREATE TRIGGER trg_sync_retailer_fields
  BEFORE INSERT OR UPDATE ON public.retailers
  FOR EACH ROW EXECUTE FUNCTION public.sync_retailer_fields();

-- ─── 3. SIGNUP TRIGGER: auto-insert retailers row on auth.users INSERT ────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'retailer');

  -- Only create a retailers row for retailer role (not factory_member, admin, etc.)
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
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'firstName',
        split_part(NEW.email, '@', 1)
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'firstName',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
      ),
      COALESCE(
        NEW.raw_user_meta_data->>'business_name',
        NEW.raw_user_meta_data->>'shop_name',
        'Retail Buyer'
      ),
      COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'mobile', ''),
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'place', NEW.raw_user_meta_data->>'city', ''),
      COALESCE(NEW.raw_user_meta_data->>'city',  NEW.raw_user_meta_data->>'place', ''),
      COALESCE(NEW.raw_user_meta_data->>'pincode', NEW.raw_user_meta_data->>'pinCode', ''),
      COALESCE(NEW.raw_user_meta_data->>'shopAddress', NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'shopAddress', NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'proofIdType', 'Aadhaar'),
      COALESCE(NEW.raw_user_meta_data->>'proofIdNumber', ''),
      to_char(NOW(), 'Mon YYYY')
    )
    ON CONFLICT (id) DO UPDATE SET
      -- update only fields that are still empty / null in DB
      email        = CASE WHEN retailers.email IS NULL OR retailers.email = ''
                     THEN EXCLUDED.email ELSE retailers.email END,
      phone        = CASE WHEN retailers.phone IS NULL OR retailers.phone = ''
                     THEN EXCLUDED.phone ELSE retailers.phone END,
      updated_at   = NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 4. RLS: ALLOW AUTHENTICATED USERS TO INSERT/READ THEIR OWN PROFILE ──────
-- (These are safe DROP IF EXISTS + CREATE; they will not break existing policies
--  with different names.)
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to read their own row
DROP POLICY IF EXISTS "Retailer reads own profile" ON public.retailers;
CREATE POLICY "Retailer reads own profile"
  ON public.retailers FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id);

-- Allow factory members to read all retailers
DROP POLICY IF EXISTS "Factory reads all retailers" ON public.retailers;
CREATE POLICY "Factory reads all retailers"
  ON public.retailers FOR SELECT
  TO authenticated
  USING (public.is_factory_member());

-- Allow retailers to insert their own profile (covers the upsert in registerRetailer)
DROP POLICY IF EXISTS "Retailer inserts own profile" ON public.retailers;
CREATE POLICY "Retailer inserts own profile"
  ON public.retailers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- Allow retailers to update their own profile
DROP POLICY IF EXISTS "Retailer updates own profile" ON public.retailers;
CREATE POLICY "Retailer updates own profile"
  ON public.retailers FOR UPDATE
  TO authenticated
  USING  (auth.uid() = id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- Allow factory to update any retailer profile
DROP POLICY IF EXISTS "Factory updates any retailer" ON public.retailers;
CREATE POLICY "Factory updates any retailer"
  ON public.retailers FOR UPDATE
  TO authenticated
  USING  (public.is_factory_member())
  WITH CHECK (public.is_factory_member());

-- ─── 5. BACKFILL: insert retailers rows for auth users that are missing them ──
-- Matches by email from auth.users → raw_user_meta_data, role = retailer or NULL.
-- ON CONFLICT DO NOTHING ensures we never overwrite existing rows.
INSERT INTO public.retailers (
  id, user_id, name, first_name, business_name, phone, email,
  place, city, pincode, address, shop_address,
  proof_id_type, proof_id_number, joined_date
)
SELECT
  u.id,
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'firstName',
    split_part(u.email, '@', 1)
  ),
  COALESCE(
    u.raw_user_meta_data->>'firstName',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ),
  COALESCE(
    u.raw_user_meta_data->>'business_name',
    u.raw_user_meta_data->>'shop_name',
    'Retail Buyer'
  ),
  COALESCE(u.raw_user_meta_data->>'phone', u.raw_user_meta_data->>'mobile', ''),
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'place', u.raw_user_meta_data->>'city', ''),
  COALESCE(u.raw_user_meta_data->>'city',  u.raw_user_meta_data->>'place', ''),
  COALESCE(u.raw_user_meta_data->>'pincode', u.raw_user_meta_data->>'pinCode', ''),
  COALESCE(u.raw_user_meta_data->>'shopAddress', u.raw_user_meta_data->>'address', ''),
  COALESCE(u.raw_user_meta_data->>'shopAddress', u.raw_user_meta_data->>'address', ''),
  COALESCE(u.raw_user_meta_data->>'proofIdType', 'Aadhaar'),
  COALESCE(u.raw_user_meta_data->>'proofIdNumber', ''),
  to_char(u.created_at, 'Mon YYYY')
FROM auth.users u
WHERE
  COALESCE(u.raw_user_meta_data->>'role', 'retailer') = 'retailer'
  AND NOT EXISTS (
    SELECT 1 FROM public.retailers r WHERE r.id = u.id
  )
ON CONFLICT (id) DO NOTHING;
