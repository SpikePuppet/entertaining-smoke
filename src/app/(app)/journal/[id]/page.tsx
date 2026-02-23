"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { JournalEntry } from "@/lib/types";
import { getJournalEntry, deleteJournalEntry } from "@/lib/storage";
import TipTapViewer from "@/components/TipTapViewer";
import Breadcrumb from "@/components/Breadcrumb";
import StateCard from "@/components/StateCard";

function Section({ label, content }: { label: string; content: string }) {
  if (!content || content === "<p></p>") return null;
  return (
    <div>
      <h2 className="text-sm font-medium text-fg-tertiary mb-2">{label}</h2>
      <div className="bg-surface border border-border rounded-lg p-4">
        <TipTapViewer content={content} />
      </div>
    </div>
  );
}

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
        const e = await getJournalEntry(params.id as string);
        if (!isMounted) return;
        setEntry(e);
      } catch {
        if (!isMounted) return;
        setLoadError("We couldn't load this journal entry right now.");
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
  }, [params.id, reloadKey]);

  async function handleDelete() {
    if (!entry) return;
    if (!confirm("Delete this journal entry?")) return;
    await deleteJournalEntry(entry.id);
    router.push("/journal");
  }

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
        <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Journal", href: "/journal" }]} />
        <StateCard
          title="Entry unavailable"
          description={loadError}
          actionLabel="Try Again"
          onAction={() => setReloadKey((value) => value + 1)}
        />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-3xl">
        <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Journal", href: "/journal" }]} />
        <StateCard
          title="Entry not found"
          description="This journal entry doesn't exist or is no longer available."
          actionLabel="Back to Journal"
          actionHref="/journal"
        />
      </div>
    );
  }

  const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl">
      <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Journal", href: "/journal" }, { label: entry.title }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-fg mb-2">{entry.title}</h1>
        <p className="text-sm text-fg-muted">{date}</p>
      </div>

      <div className="space-y-6">
        <Section label="Description" content={entry.description} />
        <Section label="Techniques Covered" content={entry.highlightMoves} />
        <Section label="What Went Right" content={entry.whatWentRight} />
        <Section label="What to Improve" content={entry.whatToImprove} />
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <button
          onClick={handleDelete}
          className="text-xs text-fg-dim hover:text-red-400 transition-colors"
        >
          Delete Entry
        </button>
      </div>
    </div>
  );
}
