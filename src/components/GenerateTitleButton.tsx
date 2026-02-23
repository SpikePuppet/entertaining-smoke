"use client";

import { generateTitle } from "@/lib/title-generator";

interface GenerateTitleButtonProps {
  onGenerate: (title: string) => void;
}

export default function GenerateTitleButton({
  onGenerate,
}: GenerateTitleButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onGenerate(generateTitle())}
      className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors border border-zinc-700"
    >
      ✦ Random Title
    </button>
  );
}
