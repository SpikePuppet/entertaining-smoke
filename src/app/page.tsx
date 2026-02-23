"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UserProfile, JournalEntry } from "@/lib/types";
import { getProfile, getJournalEntries } from "@/lib/storage";
import { getBeltColor } from "@/lib/belts";
import BeltBadge from "@/components/BeltBadge";
import JournalCard from "@/components/JournalCard";
import Breadcrumb from "@/components/Breadcrumb";

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const p = await getProfile();
      if (!p) {
        router.push("/profile");
        return;
      }
      setProfile(p);
      const e = await getJournalEntries();
      setEntries(e.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5));
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!profile) return null;

  const accentColor = getBeltColor(profile.currentBelt);

  return (
    <div className="max-w-3xl">
      <Breadcrumb items={[{ label: "Dashboard" }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Welcome back, {profile.name}
        </h1>
        <p className="text-zinc-500 text-sm">
          Here&apos;s your training overview.
        </p>
      </div>

      {/* Current Rank Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-white">{entries.length}</p>
          <p className="text-xs text-zinc-500 mt-1">Recent Sessions</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <p className="text-2xl font-bold text-white">
            {profile.academyName || "—"}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Academy</p>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Entries</h2>
        <Link
          href="/journal/new"
          className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
        >
          + New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <p className="text-zinc-500 text-sm mb-4">
            No journal entries yet. Start tracking your training!
          </p>
          <Link
            href="/journal/new"
            className="text-sm px-4 py-2 rounded-md bg-zinc-800 text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
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
