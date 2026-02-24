"use client";

import Link from "next/link";
import type { JournalEntry } from "@/lib/types";
import { getBeltColor } from "@/lib/belts";

interface JournalCardProps {
  entry: JournalEntry;
}

function stripHtml(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]*>/g, "");
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent ?? "";
}

export default function JournalCard({
  entry,
}: JournalCardProps) {
  const plainDesc = stripHtml(entry.description);
  const truncated =
    plainDesc.length > 120 ? plainDesc.slice(0, 120) + "..." : plainDesc;
  const accentColor = getBeltColor(entry.beltAtTime);

  const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/journal/${entry.id}`} className="block group">
      <div
        className="bg-surface border border-border rounded-lg p-4 pl-5 transition-all hover:border-border-strong hover:bg-surface/80 relative overflow-hidden"
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ backgroundColor: accentColor }}
        />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-fg font-medium text-sm truncate">
              {entry.title}
            </h3>
            <p className="text-fg-muted text-xs mt-1 line-clamp-2">
              {truncated}
            </p>
          </div>
          <span className="text-xs text-fg-dim whitespace-nowrap shrink-0">
            {date}
          </span>
        </div>
      </div>
    </Link>
  );
}
