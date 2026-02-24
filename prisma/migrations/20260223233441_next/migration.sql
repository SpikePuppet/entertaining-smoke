-- AlterTable
ALTER TABLE "journal_entries" ALTER COLUMN "id" SET DEFAULT (gen_random_uuid())::text,
ALTER COLUMN "user_id" SET DEFAULT (current_setting('request.jwt.claims', true)::json ->> 'sub');

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "id" SET DEFAULT (current_setting('request.jwt.claims', true)::json ->> 'sub');

-- AlterTable
ALTER TABLE "promotions" ALTER COLUMN "id" SET DEFAULT (gen_random_uuid())::text,
ALTER COLUMN "user_id" SET DEFAULT (current_setting('request.jwt.claims', true)::json ->> 'sub');
