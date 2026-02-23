import { v4 as uuidv4 } from "uuid";
import type { UserProfile, JournalEntry, PromotionEntry } from "./types";

const KEYS = {
  profile: "bjj_profile",
  journal: "bjj_journal_entries",
  promotions: "bjj_promotions",
} as const;

function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Profile

export async function getProfile(): Promise<UserProfile | null> {
  return getItem<UserProfile>(KEYS.profile);
}

export async function createProfile(
  data: Pick<UserProfile, "name" | "academyName"> & Partial<Pick<UserProfile, "currentBelt" | "currentStripes">>
): Promise<UserProfile> {
  const profile: UserProfile = {
    id: uuidv4(),
    name: data.name,
    academyName: data.academyName,
    currentBelt: data.currentBelt ?? "white",
    currentStripes: data.currentStripes ?? 0,
    createdAt: new Date().toISOString(),
  };
  setItem(KEYS.profile, profile);
  return profile;
}

export async function updateProfile(
  data: Partial<Pick<UserProfile, "name" | "academyName" | "currentBelt" | "currentStripes">>
): Promise<UserProfile> {
  const profile = await getProfile();
  if (!profile) throw new Error("No profile found");
  const updated = { ...profile, ...data };
  setItem(KEYS.profile, updated);
  return updated;
}

// Journal Entries

export async function getJournalEntries(): Promise<JournalEntry[]> {
  return getItem<JournalEntry[]>(KEYS.journal) ?? [];
}

export async function getJournalEntry(
  id: string
): Promise<JournalEntry | null> {
  const entries = await getJournalEntries();
  return entries.find((e) => e.id === id) ?? null;
}

export async function createJournalEntry(
  data: Pick<
    JournalEntry,
    "title" | "description" | "highlightMoves" | "whatWentRight" | "whatToImprove"
  >
): Promise<JournalEntry> {
  const profile = await getProfile();
  const now = new Date().toISOString();
  const entry: JournalEntry = {
    id: uuidv4(),
    userId: profile?.id ?? "",
    title: data.title,
    description: data.description,
    highlightMoves: data.highlightMoves,
    whatWentRight: data.whatWentRight,
    whatToImprove: data.whatToImprove,
    createdAt: now,
    updatedAt: now,
  };
  const entries = await getJournalEntries();
  entries.push(entry);
  setItem(KEYS.journal, entries);
  return entry;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const entries = await getJournalEntries();
  setItem(
    KEYS.journal,
    entries.filter((e) => e.id !== id)
  );
}

// Promotions

export async function getPromotions(): Promise<PromotionEntry[]> {
  return getItem<PromotionEntry[]>(KEYS.promotions) ?? [];
}

export async function createPromotion(
  data: Pick<PromotionEntry, "belt" | "stripes" | "date" | "notes">
): Promise<PromotionEntry> {
  const profile = await getProfile();
  const entry: PromotionEntry = {
    id: uuidv4(),
    userId: profile?.id ?? "",
    belt: data.belt,
    stripes: data.stripes,
    date: data.date,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };
  const promotions = await getPromotions();
  promotions.push(entry);
  setItem(KEYS.promotions, promotions);

  // Also update user's current belt/stripes
  if (profile) {
    await updateProfile({
      currentBelt: data.belt,
      currentStripes: data.stripes,
    });
  }

  return entry;
}
