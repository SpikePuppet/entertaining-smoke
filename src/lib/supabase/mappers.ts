import type { BeltColor, JournalEntry, PromotionEntry, UserProfile } from "@/lib/types";

export type ProfileRow = {
  id: string;
  name: string;
  academy_name: string | null;
  current_belt: string;
  current_stripes: number;
  created_at: string;
};

export type JournalEntryRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  highlight_moves: string;
  what_went_right: string;
  what_to_improve: string;
  created_at: string;
  updated_at: string;
};

export type PromotionRow = {
  id: string;
  user_id: string;
  belt: string;
  stripes: number;
  date: string;
  notes: string | null;
  created_at: string;
};

export function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    academyName: row.academy_name ?? undefined,
    currentBelt: row.current_belt as BeltColor,
    currentStripes: row.current_stripes,
    createdAt: row.created_at,
  };
}

export function mapJournalEntryRow(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    highlightMoves: row.highlight_moves,
    whatWentRight: row.what_went_right,
    whatToImprove: row.what_to_improve,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPromotionRow(row: PromotionRow): PromotionEntry {
  return {
    id: row.id,
    userId: row.user_id,
    belt: row.belt as BeltColor,
    stripes: row.stripes,
    date: row.date,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}
