export type BeltColor =
  | "white"
  | "blue"
  | "purple"
  | "brown"
  | "black"
  | "coral-red-black"
  | "coral-red-white"
  | "red";

export type JournalEntryType = "training" | "general";

export interface UserProfile {
  id: string;
  name: string;
  academyName?: string;
  currentBelt: BeltColor;
  currentStripes: number;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  beltAtTime: BeltColor;
  entryType: JournalEntryType;
  title: string;
  description: string;
  highlightMoves: string;
  whatWentRight: string;
  whatToImprove: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionEntry {
  id: string;
  userId: string;
  belt: BeltColor;
  stripes: number;
  date: string;
  notes?: string;
  academyName?: string;
  createdAt: string;
}
