-- Track the belt snapshot used for entry accent color at entry creation time.
ALTER TABLE "journal_entries"
  ADD COLUMN "belt_at_time" TEXT;

UPDATE "journal_entries" AS "je"
SET "belt_at_time" = "p"."current_belt"
FROM "profiles" AS "p"
WHERE "je"."belt_at_time" IS NULL
  AND "je"."user_id" = "p"."id";

UPDATE "journal_entries"
SET "belt_at_time" = 'white'
WHERE "belt_at_time" IS NULL;

ALTER TABLE "journal_entries"
  ALTER COLUMN "belt_at_time" SET DEFAULT 'white',
  ALTER COLUMN "belt_at_time" SET NOT NULL;

-- Store the school/academy where a promotion happened.
ALTER TABLE "promotions"
  ADD COLUMN "academy_name" TEXT;

UPDATE "promotions" AS "pr"
SET "academy_name" = "p"."academy_name"
FROM "profiles" AS "p"
WHERE "pr"."academy_name" IS NULL
  AND "pr"."user_id" = "p"."id";
