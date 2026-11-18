-- Run in the Supabase SQL Editor. This does not drop or alter existing tables.
-- Auth users and matching profile rows are created by the secured Edge Function.

CREATE TABLE IF NOT EXISTS public.factory_members (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'factory_member'
    CHECK (role = 'factory_member'),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.factory_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Factory member can read own profile" ON public.factory_members;
CREATE POLICY "Factory member can read own profile"
ON public.factory_members
FOR SELECT
TO authenticated
USING (auth.uid() = id AND is_active = TRUE AND role = 'factory_member');

DROP POLICY IF EXISTS "Factory member can update own profile" ON public.factory_members;
CREATE POLICY "Factory member can update own profile"
ON public.factory_members
FOR UPDATE
TO authenticated
USING (auth.uid() = id AND is_active = TRUE AND role = 'factory_member')
WITH CHECK (auth.uid() = id AND role = 'factory_member');

-- No client INSERT/DELETE policies: profile management is performed by the
-- Edge Function using its server-side service-role key.
