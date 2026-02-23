"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { UserProfile, JournalEntry } from "@/lib/types";
import { getProfile, getJournalEntries } from "@/lib/storage";
import { getBeltColor } from "@/lib/belts";
import BeltBadge from "@/components/BeltBadge";
import JournalCard from "@/components/JournalCard";
import Breadcrumb from "@/components/Breadcrumb";
import StateCard from "@/components/StateCard";

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
        const p = await getProfile();
        if (!isMounted) return;

        setProfile(p);
        if (!p) {
          setEntries([]);
          return;
        }

        const e = await getJournalEntries();
        if (!isMounted) return;
        setEntries(e.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5));
      } catch {
        if (!isMounted) return;
        setLoadError("We couldn't load your dashboard right now.");
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
        <p className="text-fg-muted">Loading...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-3xl">
        <Breadcrumb items={[{ label: "Dashboard" }]} />
        <StateCard
          title="Dashboard unavailable"
          description={loadError}
          actionLabel="Try Again"
          onAction={() => setReloadKey((value) => value + 1)}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl">
        <Breadcrumb items={[{ label: "Dashboard" }]} />
        <StateCard
          title="No profile yet"
          description="Set up your profile to start tracking sessions and promotions."
          actionLabel="Set Up Profile"
          actionHref="/profile"
        />
      </div>
    );
  }

  const accentColor = getBeltColor(profile.currentBelt);

  return (
    <div className="max-w-3xl">
      <Breadcrumb items={[{ label: "Dashboard" }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-fg mb-1">
          Welcome back, {profile.name}
        </h1>
        <p className="text-fg-muted text-sm">
          Here&apos;s your training overview.
        </p>
      </div>

      {/* Current Rank Card */}
      <div className="bg-surface border border-border rounded-lg p-6 mb-8">
        <p className="text-xs text-fg-muted uppercase tracking-wider mb-3">
          Current Rank
        </p>
        <BeltBadge
          belt={profile.currentBelt}
          stripes={profile.currentStripes}
          size="lg"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-2xl font-bold text-fg">{entries.length}</p>
          <p className="text-xs text-fg-muted mt-1">Recent Sessions</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <p className="text-2xl font-bold text-fg">
            {profile.academyName || "\u2014"}
          </p>
          <p className="text-xs text-fg-muted mt-1">Academy</p>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-fg">Recent Entries</h2>
        <Link
          href="/journal/new"
          className="text-xs px-3 py-1.5 rounded-md bg-active text-fg-secondary hover:text-fg hover:bg-hover transition-colors border border-border-strong"
        >
          + New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-fg-muted text-sm mb-4">
            No journal entries yet. Start tracking your training!
          </p>
          <Link
            href="/journal/new"
            className="text-sm px-4 py-2 rounded-md bg-active text-fg hover:bg-hover transition-colors border border-border-strong"
          >
            Create Your First Entry
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
