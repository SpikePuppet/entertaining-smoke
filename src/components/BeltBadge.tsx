"use client";

import type { BeltColor } from "@/lib/types";
import { getBeltColor, getBeltDisplay } from "@/lib/belts";

interface BeltBadgeProps {
  belt: BeltColor;
  stripes: number;
  size?: "sm" | "md" | "lg";
}

export default function BeltBadge({
  belt,
  stripes,
  size = "md",
}: BeltBadgeProps) {
  const color = getBeltColor(belt);
  const label = getBeltDisplay(belt, stripes);

  const sizeClasses = {
    sm: "h-3 text-xs px-2 py-0.5",
    md: "h-4 text-sm px-3 py-1",
    lg: "h-6 text-base px-4 py-2",
  };

  const stripeDots = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  const isWhite = belt === "white";
  const isCoral = belt === "coral-red-black" || belt === "coral-red-white";

  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-sm flex items-center justify-center gap-1"
        style={{
          backgroundColor: color,
          height: size === "sm" ? 12 : size === "md" ? 18 : 26,
          width: size === "sm" ? 60 : size === "md" ? 90 : 130,
          border: isWhite ? "1px solid #555" : "none",
        }}
      >
        {!isCoral &&
          Array.from({ length: stripes }).map((_, i) => (
            <div
              key={i}
              className={`${stripeDots[size]} rounded-full`}
              style={{
                backgroundColor: belt === "black" ? "#CC0000" : "#F5F5F5",
                border:
                  belt === "white" ? "1px solid #999" : "none",
              }}
            />
          ))}
      </div>
      <span
        className={`font-medium ${
          size === "sm"
            ? "text-xs"
            : size === "md"
              ? "text-sm"
              : "text-base"
        } text-fg-secondary`}
      >
        {label}
      </span>
    </div>
  );
}
