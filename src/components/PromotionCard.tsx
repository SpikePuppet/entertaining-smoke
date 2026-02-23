"use client";

import type { PromotionEntry } from "@/lib/types";
import BeltBadge from "./BeltBadge";

interface PromotionCardProps {
  promotion: PromotionEntry;
  isLast?: boolean;
}

export default function PromotionCard({
  promotion,
  isLast = false,
}: PromotionCardProps) {
  const date = new Date(promotion.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex gap-4">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-zinc-600 border-2 border-zinc-500 shrink-0 mt-1.5" />
        {!isLast && <div className="w-px flex-1 bg-zinc-800 mt-1" />}
      </div>

      {/* Content */}
      <div className="pb-8 min-w-0">
        <p className="text-xs text-zinc-500 mb-2">{date}</p>
        <BeltBadge belt={promotion.belt} stripes={promotion.stripes} size="sm" />
        {promotion.notes && (
          <p className="text-sm text-zinc-400 mt-2">{promotion.notes}</p>
        )}
      </div>
    </div>
  );
}
