"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import type { JournalEntry } from "@/lib/types";
import { getJournalEntries } from "@/lib/storage";
import JournalCard from "@/components/JournalCard";
import Breadcrumb from "@/components/Breadcrumb";
import StateCard from "@/components/StateCard";

export default function JournalListPage() {
  const { userId, isLoaded } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;

    let isMounted = true;

    async function load() {
      setLoading(true);
      setLoadError(null);
      setEntries([]);

      if (!userId) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const e = await getJournalEntries();
        if (!isMounted) return;

        if (e.some((entry) => entry.userId !== userId)) {
          setLoadError("Account mismatch detected. Please sign out and sign back in.");
          return;
        }

        setEntries(e.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } catch {
        if (!isMounted) return;
        setLoadError("We couldn't load your journal entries right now.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [reloadKey, userId, isLoaded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-fg-muted">Loading...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-3xl">
        <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Journal" }]} />
        <StateCard
          title="Journal unavailable"
          description={loadError}
          actionLabel="Try Again"
          onAction={() => setReloadKey((value) => value + 1)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Journal" }]} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-fg mb-1">Journal</h1>
          <p className="text-fg-muted text-sm">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <Link
          href="/journal/new"
          className="text-sm px-4 py-2 rounded-md bg-btn-primary-bg text-btn-primary-fg font-medium hover:opacity-90 transition-opacity"
        >
          + New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <p className="text-fg-muted text-sm mb-4">
            Your journal is empty. Add your first training session or general note.
          </p>
          <Link
            href="/journal/new"
            className="text-sm px-4 py-2 rounded-md bg-active text-fg hover:bg-hover transition-colors border border-border-strong"
          >
            Create Entry
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <JournalCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
