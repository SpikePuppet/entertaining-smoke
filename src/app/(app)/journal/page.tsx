"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { JournalEntry, UserProfile } from "@/lib/types";
import { getJournalEntries, getProfile } from "@/lib/storage";
import { getBeltColor } from "@/lib/belts";
import JournalCard from "@/components/JournalCard";
import Breadcrumb from "@/components/Breadcrumb";
import StateCard from "@/components/StateCard";

export default function JournalListPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
        const [e, p] = await Promise.all([getJournalEntries(), getProfile()]);
        if (!isMounted) return;
        setEntries(e.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        setProfile(p);
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
  }, [reloadKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Loading...</p>
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

  const accentColor = profile ? getBeltColor(profile.currentBelt) : "#F5F5F5";

  return (
    <div className="max-w-3xl">
      <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Journal" }]} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Journal</h1>
          <p className="text-zinc-500 text-sm">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <Link
          href="/journal/new"
          className="text-sm px-4 py-2 rounded-md bg-zinc-100 text-zinc-900 font-medium hover:bg-white transition-colors"
        >
          + New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-500 text-sm mb-4">
            Your journal is empty. Record your first training session!
          </p>
          <Link
            href="/journal/new"
            className="text-sm px-4 py-2 rounded-md bg-zinc-800 text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Create Entry
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
