"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { JournalEntry } from "@/lib/types";
import { getJournalEntry, deleteJournalEntry } from "@/lib/storage";
import TipTapViewer from "@/components/TipTapViewer";
import Breadcrumb from "@/components/Breadcrumb";

function Section({ label, content }: { label: string; content: string }) {
  if (!content || content === "<p></p>") return null;
  return (
    <div>
      <h2 className="text-sm font-medium text-zinc-400 mb-2">{label}</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <TipTapViewer content={content} />
      </div>
    </div>
  );
}

export default function JournalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const e = await getJournalEntry(params.id as string);
      setEntry(e);
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function handleDelete() {
    if (!entry) return;
    if (!confirm("Delete this journal entry?")) return;
    await deleteJournalEntry(entry.id);
    router.push("/journal");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-3xl">
        <p className="text-zinc-500">Entry not found.</p>
        <Link
          href="/journal"
          className="text-sm text-zinc-400 hover:text-white mt-4 inline-block"
        >
          ← Back to Journal
        </Link>
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
        <h1 className="text-2xl font-bold text-white mb-2">{entry.title}</h1>
        <p className="text-sm text-zinc-500">{date}</p>
      </div>

      <div className="space-y-6">
        <Section label="Description" content={entry.description} />
        <Section label="Techniques Covered" content={entry.highlightMoves} />
        <Section label="What Went Right" content={entry.whatWentRight} />
        <Section label="What to Improve" content={entry.whatToImprove} />
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800">
        <button
          onClick={handleDelete}
          className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
        >
          Delete Entry
        </button>
      </div>
    </div>
  );
}
