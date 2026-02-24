"use client";

import type { BeltColor } from "@/lib/types";
import { getBeltColor, getBeltDisplay } from "@/lib/belts";

interface BeltBadgeProps {
  belt: BeltColor;
  stripes: number;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { height: 12, width: 60, stripeWidth: 3, stripeGap: 2, tabWidth: 22 },
  md: { height: 18, width: 90, stripeWidth: 4, stripeGap: 3, tabWidth: 30 },
  lg: { height: 26, width: 130, stripeWidth: 5, stripeGap: 3, tabWidth: 40 },
};

export default function BeltBadge({
  belt,
  stripes,
  size = "md",
}: BeltBadgeProps) {
  const color = getBeltColor(belt);
  const label = getBeltDisplay(belt, stripes);
  const s = SIZES[size];

  const isWhite = belt === "white";
  const isCoral = belt === "coral-red-black" || belt === "coral-red-white";
  const stripeColor = belt === "black" ? "#CC0000" : "#F5F5F5";

  const totalStripesWidth =
    stripes > 0 ? stripes * s.stripeWidth + (stripes - 1) * s.stripeGap : 0;

  return (
    <div className="flex items-center gap-2">
      <svg
        width={s.width}
        height={s.height}
        viewBox={`0 0 ${s.width} ${s.height}`}
        className="shrink-0"
      >
        {/* Belt body */}
        <rect
          x={0}
          y={0}
          width={s.width}
          height={s.height}
          rx={2}
          fill={color}
          stroke={isWhite ? "#999" : "none"}
          strokeWidth={isWhite ? 1 : 0}
        />

        {/* Black tab at the end where stripes go */}
        {!isCoral && stripes > 0 && (
          <>
            <rect
              x={s.width - s.tabWidth - 2}
              y={0}
              width={s.tabWidth + 2}
              height={s.height}
              rx={0}
              fill={belt === "black" ? "#333" : "#1A1A1A"}
            />
            {/* Round the right end */}
            <rect
              x={s.width - 2}
              y={0}
              width={2}
              height={s.height}
              rx={0}
              fill={color}
              stroke={isWhite ? "#999" : "none"}
              strokeWidth={isWhite ? 1 : 0}
            />
            <rect
              x={s.width - 4}
              y={0}
              width={4}
              height={s.height}
              rx={2}
              fill={color}
              stroke={isWhite ? "#999" : "none"}
              strokeWidth={isWhite ? 1 : 0}
            />

            {/* Stripes as vertical bars on the tab */}
            {Array.from({ length: stripes }).map((_, i) => {
              const stripesStartX =
                s.width -
                s.tabWidth -
                2 +
                (s.tabWidth - totalStripesWidth) / 2;
              const x = stripesStartX + i * (s.stripeWidth + s.stripeGap);
              return (
                <rect
                  key={i}
                  x={x}
                  y={0}
                  width={s.stripeWidth}
                  height={s.height}
                  fill={stripeColor}
                />
              );
            })}
          </>
        )}
      </svg>
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
