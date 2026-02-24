-- `prisma migrate reset` recreates the `public` schema, which removes grants
-- that Supabase roles rely on. Restore schema usage explicitly.
GRANT USAGE ON SCHEMA "public" TO anon;
GRANT USAGE ON SCHEMA "public" TO authenticated;
GRANT USAGE ON SCHEMA "public" TO service_role;
