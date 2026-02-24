-- Store audit timestamps with timezone so client-local rendering is correct.
-- Existing values were written as UTC timestamps without timezone.
ALTER TABLE "profiles"
  ALTER COLUMN "created_at"
  TYPE timestamptz(3)
  USING ("created_at" AT TIME ZONE 'UTC');

ALTER TABLE "journal_entries"
  ALTER COLUMN "created_at"
  TYPE timestamptz(3)
  USING ("created_at" AT TIME ZONE 'UTC'),
  ALTER COLUMN "updated_at"
  TYPE timestamptz(3)
  USING ("updated_at" AT TIME ZONE 'UTC');

ALTER TABLE "promotions"
  ALTER COLUMN "created_at"
  TYPE timestamptz(3)
  USING ("created_at" AT TIME ZONE 'UTC');
