"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createJournalEntry } from "@/lib/storage";
import TipTapEditor from "@/components/TipTapEditor";
import GenerateTitleButton from "@/components/GenerateTitleButton";
import Breadcrumb from "@/components/Breadcrumb";

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [highlightMoves, setHighlightMoves] = useState("");
  const [whatWentRight, setWhatWentRight] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const entry = await createJournalEntry({
      title: title.trim(),
      description,
      highlightMoves,
      whatWentRight,
      whatToImprove,
    });
    router.push(`/journal/${entry.id}`);
  }

  return (
    <div className="max-w-3xl">
      <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Journal", href: "/journal" }, { label: "New Entry" }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">New Journal Entry</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-300"
            >
              Title
            </label>
            <GenerateTitleButton onGenerate={setTitle} />
          </div>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this session a name..."
            required
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Description
          </label>
          <TipTapEditor
            content={description}
            onChange={setDescription}
            placeholder="What happened in today's session?"
          />
        </div>

        {/* Techniques Covered */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Techniques Covered
          </label>
          <TipTapEditor
            content={highlightMoves}
            onChange={setHighlightMoves}
            placeholder="Any techniques or moves that stood out?"
          />
        </div>

        {/* What Went Right */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            What Went Right
          </label>
          <TipTapEditor
            content={whatWentRight}
            onChange={setWhatWentRight}
            placeholder="What are you proud of from this session?"
          />
        </div>

        {/* What to Improve */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            What to Improve
          </label>
          <TipTapEditor
            content={whatToImprove}
            onChange={setWhatToImprove}
            placeholder="What do you want to work on next time?"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-sm font-medium hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Entry"}
          </button>
          <Link
            href="/journal"
            className="px-4 py-2 text-zinc-400 hover:text-white text-sm transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
