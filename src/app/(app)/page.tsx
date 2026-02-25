"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import type { UserProfile, JournalEntry, PromotionEntry } from "@/lib/types";
import { getProfile, getJournalEntries, getPromotions } from "@/lib/storage";
import { getBeltColor } from "@/lib/belts";
import { formatDateOnly } from "@/lib/dates";
import BeltBadge from "@/components/BeltBadge";
import JournalCard from "@/components/JournalCard";
import Breadcrumb from "@/components/Breadcrumb";
import StateCard from "@/components/StateCard";

type RecentItem =
  | { type: "journal"; entry: JournalEntry }
  | { type: "promotion"; promotion: PromotionEntry };

function getRecentItemTimestamp(item: RecentItem): number {
  const createdAt =
    item.type === "journal" ? item.entry.createdAt : item.promotion.createdAt;
  const timestamp = Date.parse(createdAt);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function PromotionRecentCard({ promotion }: { promotion: PromotionEntry }) {
  const date = formatDateOnly(promotion.date, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href="/promotions" className="block group">
      <div className="bg-surface border border-border rounded-lg p-4 pl-5 transition-all hover:border-border-strong hover:bg-surface/80 relative overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ backgroundColor: getBeltColor(promotion.belt) }}
        />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-border-strong text-fg-tertiary">
              Promotion
            </span>
            <div className="mt-1">
              <BeltBadge belt={promotion.belt} stripes={promotion.stripes} size="sm" />
            </div>
            {promotion.academyName && (
              <p className="text-fg-muted text-xs mt-2 truncate">
                {promotion.academyName}
              </p>
            )}
          </div>
          <span className="text-xs text-fg-dim whitespace-nowrap shrink-0">
            {date}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { userId, isLoaded } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isLoaded) return;

    let isMounted = true;

    async function load() {
      setLoading(true);
      setLoadError(null);
      setProfile(null);
      setRecentItems([]);

      if (!userId) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const p = await getProfile();
        if (!isMounted) return;

        if (p && p.id !== userId) {
          setLoadError("Account mismatch detected. Please sign out and sign back in.");
          return;
        }

        setProfile(p);
        if (!p) {
          setRecentItems([]);
          return;
        }

        const [entries, promotions] = await Promise.all([
          getJournalEntries(),
          getPromotions(),
        ]);
        if (!isMounted) return;

        if (
          entries.some((entry) => entry.userId !== userId) ||
          promotions.some((promotion) => promotion.userId !== userId)
        ) {
          setLoadError("Account mismatch detected. Please sign out and sign back in.");
          return;
        }

        const combined: RecentItem[] = [
          ...entries.map((entry) => ({ type: "journal" as const, entry })),
          ...promotions.map((promotion) => ({
            type: "promotion" as const,
            promotion,
          })),
        ];

        setRecentItems(
          combined
            .sort((a, b) => {
              const createdAtDiff = getRecentItemTimestamp(b) - getRecentItemTimestamp(a);
              if (createdAtDiff !== 0) return createdAtDiff;
              const aId = a.type === "journal" ? a.entry.id : a.promotion.id;
              const bId = b.type === "journal" ? b.entry.id : b.promotion.id;
              return bId.localeCompare(aId);
            })
            .slice(0, 5)
        );
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
          <p className="text-2xl font-bold text-fg">{recentItems.length}</p>
          <p className="text-xs text-fg-muted mt-1">Recent Activity</p>
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
        <div className="flex items-center gap-2">
          <Link
            href="/journal/new"
            className="text-xs px-3 py-1.5 rounded-md bg-active text-fg-secondary hover:text-fg hover:bg-hover transition-colors border border-border-strong"
          >
            + New Entry
          </Link>
          <Link
            href="/promotions/new"
            className="text-xs px-3 py-1.5 rounded-md bg-active text-fg-secondary hover:text-fg hover:bg-hover transition-colors border border-border-strong"
          >
            + New Promotion
          </Link>
        </div>
      </div>

      {recentItems.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-fg-muted text-sm mb-4">
            No entries or promotions yet. Start tracking your training and daily context.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/journal/new"
              className="text-sm px-4 py-2 rounded-md bg-active text-fg hover:bg-hover transition-colors border border-border-strong"
            >
              Create Entry
            </Link>
            <Link
              href="/promotions/new"
              className="text-sm px-4 py-2 rounded-md bg-active text-fg hover:bg-hover transition-colors border border-border-strong"
            >
              Record Promotion
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recentItems.map((item) => (
            item.type === "journal" ? (
              <JournalCard key={`journal-${item.entry.id}`} entry={item.entry} />
            ) : (
              <PromotionRecentCard
                key={`promotion-${item.promotion.id}`}
                promotion={item.promotion}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}
