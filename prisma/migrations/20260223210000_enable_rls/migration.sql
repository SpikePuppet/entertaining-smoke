-- Re-align RLS with Clerk's Supabase integration guide:
-- use auth.jwt()->>'sub' directly for user scoping.

-- Remove previous custom RLS artifacts (safe if they do not exist).
DROP POLICY IF EXISTS "profiles_select_own" ON "profiles";
DROP POLICY IF EXISTS "profiles_insert_own" ON "profiles";
DROP POLICY IF EXISTS "profiles_update_own" ON "profiles";
DROP POLICY IF EXISTS "profiles_delete_own" ON "profiles";

DROP POLICY IF EXISTS "journal_entries_select_own" ON "journal_entries";
DROP POLICY IF EXISTS "journal_entries_insert_own" ON "journal_entries";
DROP POLICY IF EXISTS "journal_entries_update_own" ON "journal_entries";
DROP POLICY IF EXISTS "journal_entries_delete_own" ON "journal_entries";

DROP POLICY IF EXISTS "promotions_select_own" ON "promotions";
DROP POLICY IF EXISTS "promotions_insert_own" ON "promotions";
DROP POLICY IF EXISTS "promotions_update_own" ON "promotions";
DROP POLICY IF EXISTS "promotions_delete_own" ON "promotions";

ALTER TABLE "profiles"
  DROP CONSTRAINT IF EXISTS "profiles_id_clerk_user_id_check";
ALTER TABLE "journal_entries"
  DROP CONSTRAINT IF EXISTS "journal_entries_user_id_clerk_user_id_check";
ALTER TABLE "promotions"
  DROP CONSTRAINT IF EXISTS "promotions_user_id_clerk_user_id_check";

DROP FUNCTION IF EXISTS public.requesting_clerk_user_id();

-- Ensure Clerk user ID is the default owner key when rows are inserted via Supabase APIs.
ALTER TABLE "profiles"
  ALTER COLUMN "id" SET DEFAULT (auth.jwt()->>'sub');
ALTER TABLE "journal_entries"
  ALTER COLUMN "user_id" SET DEFAULT (auth.jwt()->>'sub');
ALTER TABLE "promotions"
  ALTER COLUMN "user_id" SET DEFAULT (auth.jwt()->>'sub');

-- Ensure RLS is enabled.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "promotions" ENABLE ROW LEVEL SECURITY;

-- Supabase role grants used alongside RLS policies.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "profiles" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "journal_entries" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "promotions" TO authenticated;

-- Profiles: each user can only read/write their own profile row.
CREATE POLICY "profiles_select_own"
  ON "profiles"
  FOR SELECT
  TO authenticated
  USING (((SELECT auth.jwt()->>'sub') = ("id")::text));

CREATE POLICY "profiles_insert_own"
  ON "profiles"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (((SELECT auth.jwt()->>'sub') = ("id")::text));

CREATE POLICY "profiles_update_own"
  ON "profiles"
  FOR UPDATE
  TO authenticated
  USING (((SELECT auth.jwt()->>'sub') = ("id")::text))
  WITH CHECK (((SELECT auth.jwt()->>'sub') = ("id")::text));

CREATE POLICY "profiles_delete_own"
  ON "profiles"
  FOR DELETE
  TO authenticated
  USING (((SELECT auth.jwt()->>'sub') = ("id")::text));

-- Journal entries: each user can only read/write their own rows.
CREATE POLICY "journal_entries_select_own"
  ON "journal_entries"
  FOR SELECT
  TO authenticated
  USING (((SELECT auth.jwt()->>'sub') = ("user_id")::text));

CREATE POLICY "journal_entries_insert_own"
  ON "journal_entries"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (((SELECT auth.jwt()->>'sub') = ("user_id")::text));

CREATE POLICY "journal_entries_update_own"
  ON "journal_entries"
  FOR UPDATE
  TO authenticated
  USING (((SELECT auth.jwt()->>'sub') = ("user_id")::text))
  WITH CHECK (((SELECT auth.jwt()->>'sub') = ("user_id")::text));

CREATE POLICY "journal_entries_delete_own"
  ON "journal_entries"
  FOR DELETE
  TO authenticated
  USING (((SELECT auth.jwt()->>'sub') = ("user_id")::text));

-- Promotions: each user can only read/write their own rows.
CREATE POLICY "promotions_select_own"
  ON "promotions"
  FOR SELECT
  TO authenticated
  USING (((SELECT auth.jwt()->>'sub') = ("user_id")::text));

CREATE POLICY "promotions_insert_own"
  ON "promotions"
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (((SELECT auth.jwt()->>'sub') = ("user_id")::text));

CREATE POLICY "promotions_update_own"
  ON "promotions"
  FOR UPDATE
  TO authenticated
  USING (((SELECT auth.jwt()->>'sub') = ("user_id")::text))
  WITH CHECK (((SELECT auth.jwt()->>'sub') = ("user_id")::text));

CREATE POLICY "promotions_delete_own"
  ON "promotions"
  FOR DELETE
  TO authenticated
  USING (((SELECT auth.jwt()->>'sub') = ("user_id")::text));
