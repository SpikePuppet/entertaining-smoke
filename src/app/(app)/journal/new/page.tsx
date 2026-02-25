"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createJournalEntry } from "@/lib/storage";
import TipTapEditor from "@/components/TipTapEditor";
import GenerateTitleButton from "@/components/GenerateTitleButton";
import Breadcrumb from "@/components/Breadcrumb";
import type { JournalEntryType } from "@/lib/types";

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [entryType, setEntryType] = useState<JournalEntryType>("training");
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
    const isGeneralEntry = entryType === "general";
    const entry = await createJournalEntry({
      entryType,
      title: title.trim(),
      description,
      highlightMoves: isGeneralEntry ? "" : highlightMoves,
      whatWentRight: isGeneralEntry ? "" : whatWentRight,
      whatToImprove: isGeneralEntry ? "" : whatToImprove,
    });
    router.push(`/journal/${entry.id}`);
  }

  return (
    <div className="max-w-3xl">
      <Breadcrumb items={[{ label: "Dashboard", href: "/" }, { label: "Journal", href: "/journal" }, { label: "New Entry" }]} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-fg">New Journal Entry</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-fg-secondary mb-2">Entry Type</label>
          <div className="inline-flex gap-2 rounded-lg border border-border p-1 bg-surface">
            <button
              type="button"
              onClick={() => setEntryType("training")}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                entryType === "training"
                  ? "bg-btn-primary-bg text-btn-primary-fg"
                  : "text-fg-secondary hover:text-fg hover:bg-hover"
              }`}
            >
              Training
            </button>
            <button
              type="button"
              onClick={() => setEntryType("general")}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                entryType === "general"
                  ? "bg-btn-primary-bg text-btn-primary-fg"
                  : "text-fg-secondary hover:text-fg hover:bg-hover"
              }`}
            >
              General
            </button>
          </div>
          <p className="text-xs text-fg-muted mt-2 min-h-[2rem]">
            {entryType === "training"
              ? "Use the structured format for class and drilling sessions."
              : "Use this for daily thoughts, recovery notes, and context around your training."}
          </p>
        </div>

        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-2 min-h-[2rem]">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-fg-secondary"
            >
              Title
            </label>
            {entryType === "training" && <GenerateTitleButton onGenerate={setTitle} />}
          </div>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={entryType === "training" ? "Give this session a name..." : "Give this entry a name..."}
            required
            className="w-full px-3 py-2 bg-surface border border-border-strong rounded-lg text-fg text-sm placeholder:text-fg-dim focus:outline-none focus:border-border-focus transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-fg-secondary mb-2">
            {entryType === "training" ? "Description" : "Entry"}
          </label>
          <TipTapEditor
            content={description}
            onChange={setDescription}
            placeholder={
              entryType === "training"
                ? "What happened in today's session?"
                : "What's on your mind today? Add context like recovery, injuries, or anything that affected training."
            }
          />
        </div>

        {entryType === "training" && (
          <>
            {/* Techniques Covered */}
            <div>
              <label className="block text-sm font-medium text-fg-secondary mb-2">
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
              <label className="block text-sm font-medium text-fg-secondary mb-2">
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
              <label className="block text-sm font-medium text-fg-secondary mb-2">
                What to Improve
              </label>
              <TipTapEditor
                content={whatToImprove}
                onChange={setWhatToImprove}
                placeholder="What do you want to work on next time?"
              />
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="px-4 py-2 bg-btn-primary-bg text-btn-primary-fg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Entry"}
          </button>
          <Link
            href="/journal"
            className="px-4 py-2 text-fg-tertiary hover:text-fg text-sm transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
