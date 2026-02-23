const adjectives = [
  "Sneaky",
  "Flying",
  "Invisible",
  "Relentless",
  "Smooth",
  "Explosive",
  "Slick",
  "Crafty",
  "Lightning",
  "Iron",
  "Rubber",
  "Technical",
  "Pressure",
  "Fluid",
  "Savage",
];

const techniques = [
  "Armbar",
  "Triangle",
  "Sweep",
  "Guard-Pull",
  "Berimbolo",
  "Kimura",
  "Omoplata",
  "Guillotine",
  "Loop-Choke",
  "Knee-Slice",
  "X-Guard",
  "Half-Guard",
  "Mount",
  "Back-Take",
  "Leg-Lock",
];

export function generateTitle(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const tech = techniques[Math.floor(Math.random() * techniques.length)];
  return `${adj} ${tech}`;
}
