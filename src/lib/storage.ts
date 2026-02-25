import type { JournalEntry, PromotionEntry, UserProfile } from "./types";

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const json = (await response.json()) as { error?: string };
      if (json.error) {
        message = json.error;
      }
    } catch {
      // Ignore invalid JSON error payloads.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// Profile

export async function getProfile(): Promise<UserProfile | null> {
  return request<UserProfile | null>("/api/profile", {
    method: "GET",
  });
}

export async function createProfile(
  data: Pick<UserProfile, "name" | "academyName"> & Partial<Pick<UserProfile, "currentBelt" | "currentStripes">>
): Promise<UserProfile> {
  return request<UserProfile>("/api/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProfile(
  data: Partial<Pick<UserProfile, "name" | "academyName" | "currentBelt" | "currentStripes">>
): Promise<UserProfile> {
  return request<UserProfile>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Journal Entries

export async function getJournalEntries(): Promise<JournalEntry[]> {
  return request<JournalEntry[]>("/api/journal", {
    method: "GET",
  });
}

export async function getJournalEntry(id: string): Promise<JournalEntry | null> {
  return request<JournalEntry | null>(`/api/journal/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function createJournalEntry(
  data: Pick<
    JournalEntry,
    "entryType" | "title" | "description" | "highlightMoves" | "whatWentRight" | "whatToImprove"
  >
): Promise<JournalEntry> {
  return request<JournalEntry>("/api/journal", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await request<void>(`/api/journal/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// Promotions

export async function getPromotions(): Promise<PromotionEntry[]> {
  return request<PromotionEntry[]>("/api/promotions", {
    method: "GET",
  });
}

export async function createPromotion(
  data: Pick<PromotionEntry, "belt" | "stripes" | "date" | "notes" | "academyName">
): Promise<PromotionEntry> {
  return request<PromotionEntry>("/api/promotions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
