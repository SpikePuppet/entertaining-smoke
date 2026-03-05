import { describe, expect, it } from "bun:test";
import { getHighestAchievedRank, validateCreatePromotionBody } from "./promotions";

describe("validateCreatePromotionBody", () => {
  it("rejects invalid payloads", () => {
    expect(validateCreatePromotionBody({ stripes: 1, date: "2026-01-01" })).toEqual({
      ok: false,
      message: "Belt is required.",
    });

    expect(
      validateCreatePromotionBody({ belt: "pink", stripes: 1, date: "2026-01-01" })
    ).toEqual({
      ok: false,
      message: "Invalid belt.",
    });

    expect(
      validateCreatePromotionBody({ belt: "blue", stripes: -1, date: "2026-01-01" })
    ).toEqual({
      ok: false,
      message: "Stripes must be a non-negative integer.",
    });

    expect(
      validateCreatePromotionBody({ belt: "blue", stripes: 1.5, date: "2026-01-01" })
    ).toEqual({
      ok: false,
      message: "Stripes must be a non-negative integer.",
    });

    expect(validateCreatePromotionBody({ belt: "blue", stripes: 1 })).toEqual({
      ok: false,
      message: "Date is required.",
    });
  });

  it("normalizes stripes and trims text", () => {
    const result = validateCreatePromotionBody({
      belt: "red",
      stripes: 99,
      date: "2026-02-14",
      notes: "  promoted!  ",
      academyName: "  HQ  ",
    });

    expect(result).toEqual({
      ok: true,
      normalizedRank: { belt: "red", stripes: 0 },
      date: "2026-02-14",
      notes: "promoted!",
      academyName: "HQ",
    });
  });
});

describe("getHighestAchievedRank", () => {
  it("keeps purple-2 over blue-4", () => {
    const highest = getHighestAchievedRank(
      [
        { belt: "purple", stripes: 2 },
        { belt: "blue", stripes: 4 },
      ],
      { belt: "blue", stripes: 4 }
    );

    expect(highest).toEqual({ belt: "purple", stripes: 2 });
  });

  it("promotes from blue-3 to purple-0", () => {
    const highest = getHighestAchievedRank(
      [
        { belt: "blue", stripes: 3 },
        { belt: "purple", stripes: 0 },
      ],
      { belt: "purple", stripes: 0 }
    );

    expect(highest).toEqual({ belt: "purple", stripes: 0 });
  });

  it("keeps black-2 over black-1", () => {
    const highest = getHighestAchievedRank(
      [
        { belt: "black", stripes: 2 },
        { belt: "black", stripes: 1 },
      ],
      { belt: "black", stripes: 1 }
    );

    expect(highest).toEqual({ belt: "black", stripes: 2 });
  });

  it("promotes from brown-4 to black-0 regardless of ordering", () => {
    const highest = getHighestAchievedRank(
      [
        { belt: "black", stripes: 0 },
        { belt: "brown", stripes: 4 },
      ],
      { belt: "black", stripes: 0 }
    );

    expect(highest).toEqual({ belt: "black", stripes: 0 });
  });

  it("uses max rank from mixed and partially invalid history", () => {
    const highest = getHighestAchievedRank(
      [
        { belt: "blue", stripes: 2 },
        { belt: "purple", stripes: 1 },
        { belt: "black", stripes: 9 },
        { belt: "invalid", stripes: 5 },
      ],
      { belt: "blue", stripes: 2 }
    );

    expect(highest).toEqual({ belt: "black", stripes: 6 });
  });

  it("falls back to normalized new promotion when history is empty/invalid", () => {
    const highest = getHighestAchievedRank(
      [
        { belt: "not-a-belt", stripes: 4 },
        { belt: "white", stripes: -2 },
      ],
      { belt: "brown", stripes: 7 }
    );

    expect(highest).toEqual({ belt: "brown", stripes: 4 });
  });
});
