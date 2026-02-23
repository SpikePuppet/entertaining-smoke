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
      className="text-xs px-3 py-1.5 rounded-md bg-active text-fg-tertiary hover:text-fg hover:bg-hover transition-colors border border-border-strong"
    >
      ✦ Random Title
    </button>
  );
}
