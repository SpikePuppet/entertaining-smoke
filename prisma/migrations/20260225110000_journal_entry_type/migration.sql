ALTER TABLE "journal_entries"
  ADD COLUMN "entry_type" TEXT NOT NULL DEFAULT 'training';

ALTER TABLE "journal_entries"
  ADD CONSTRAINT "journal_entries_entry_type_check"
  CHECK ("entry_type" IN ('training', 'general'));
