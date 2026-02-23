"use client";

import Link from "next/link";
import type { JournalEntry } from "@/lib/types";

interface JournalCardProps {
  entry: JournalEntry;
  accentColor?: string;
}

function stripHtml(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]*>/g, "");
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent ?? "";
}

export default function JournalCard({
  entry,
  accentColor = "#F5F5F5",
}: JournalCardProps) {
  const plainDesc = stripHtml(entry.description);
  const truncated =
    plainDesc.length > 120 ? plainDesc.slice(0, 120) + "..." : plainDesc;

  const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/journal/${entry.id}`} className="block group">
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 pl-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/80 relative overflow-hidden"
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
          style={{ backgroundColor: accentColor }}
        />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-white font-medium text-sm group-hover:text-zinc-100 truncate">
              {entry.title}
            </h3>
            <p className="text-zinc-500 text-xs mt-1 line-clamp-2">
              {truncated}
            </p>
          </div>
          <span className="text-xs text-zinc-600 whitespace-nowrap shrink-0">
            {date}
          </span>
        </div>
      </div>
    </Link>
  );
}
