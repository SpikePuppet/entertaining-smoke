import type { BeltColor } from "./types";

export interface BeltDefinition {
  color: BeltColor;
  label: string;
  hex: string;
  maxStripes: number;
}

export interface BeltRank {
  belt: BeltColor;
  stripes: number;
}

export const BELTS: BeltDefinition[] = [
  { color: "white", label: "White Belt", hex: "#F5F5F5", maxStripes: 4 },
  { color: "blue", label: "Blue Belt", hex: "#0047AB", maxStripes: 4 },
  { color: "purple", label: "Purple Belt", hex: "#6A0DAD", maxStripes: 4 },
  { color: "brown", label: "Brown Belt", hex: "#5C2E00", maxStripes: 4 },
  { color: "black", label: "Black Belt", hex: "#1A1A1A", maxStripes: 6 },
  {
    color: "coral-red-black",
    label: "Red & Black Coral Belt",
    hex: "#CC0000",
    maxStripes: 0,
  },
  {
    color: "coral-red-white",
    label: "Red & White Coral Belt",
    hex: "#CC0000",
    maxStripes: 0,
  },
  { color: "red", label: "Red Belt", hex: "#CC0000", maxStripes: 0 },
];

const BELT_PRECEDENCE = new Map<BeltColor, number>(
  BELTS.map((belt, index) => [belt.color, index])
);

export function isBeltColor(value: unknown): value is BeltColor {
  return typeof value === "string" && BELT_PRECEDENCE.has(value as BeltColor);
}

export function getBeltDefinition(belt: BeltColor): BeltDefinition {
  return BELTS.find((b) => b.color === belt) ?? BELTS[0];
}

export function normalizeBeltRank(rank: BeltRank): BeltRank {
  const maxStripes = getMaxStripes(rank.belt);
  const normalizedStripes = Math.min(Math.max(Math.floor(rank.stripes), 0), maxStripes);
  return {
    belt: rank.belt,
    stripes: normalizedStripes,
  };
}

export function compareBeltRanks(a: BeltRank, b: BeltRank): number {
  const left = normalizeBeltRank(a);
  const right = normalizeBeltRank(b);

  const leftPrecedence = BELT_PRECEDENCE.get(left.belt) ?? -1;
  const rightPrecedence = BELT_PRECEDENCE.get(right.belt) ?? -1;

  if (leftPrecedence !== rightPrecedence) {
    return leftPrecedence - rightPrecedence;
  }

  return left.stripes - right.stripes;
}

export function getHighestBeltRank(ranks: BeltRank[]): BeltRank | null {
  if (ranks.length === 0) {
    return null;
  }

  return ranks
    .map(normalizeBeltRank)
    .reduce((highest, candidate) => (compareBeltRanks(candidate, highest) > 0 ? candidate : highest));
}

export function getBeltDisplay(belt: BeltColor, stripes: number): string {
  const def = getBeltDefinition(belt);
  if (stripes === 0) return def.label;
  if (belt === "black") {
    return `${def.label} - ${stripes}${stripes === 1 ? "st" : stripes === 2 ? "nd" : stripes === 3 ? "rd" : "th"} Degree`;
  }
  return `${def.label} - ${stripes} ${stripes === 1 ? "Stripe" : "Stripes"}`;
}

export function getBeltColor(belt: BeltColor): string {
  return getBeltDefinition(belt).hex;
}

export function getMaxStripes(belt: BeltColor): number {
  return getBeltDefinition(belt).maxStripes;
}
