-- Ensure non-user primary keys are generated server-side in Postgres.
-- This covers direct Supabase inserts where Prisma client-side defaults are not applied.
ALTER TABLE "journal_entries"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

ALTER TABLE "promotions"
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
