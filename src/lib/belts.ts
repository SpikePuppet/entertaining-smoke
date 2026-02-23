import type { BeltColor } from "./types";

export interface BeltDefinition {
  color: BeltColor;
  label: string;
  hex: string;
  maxStripes: number;
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

export function getBeltDefinition(belt: BeltColor): BeltDefinition {
  return BELTS.find((b) => b.color === belt) ?? BELTS[0];
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
