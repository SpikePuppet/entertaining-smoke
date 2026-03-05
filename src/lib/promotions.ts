import type { BeltColor } from "./types";
import {
  getHighestBeltRank,
  isBeltColor,
  normalizeBeltRank,
  type BeltRank,
} from "./belts";

export type CreatePromotionBody = {
  belt?: string;
  stripes?: number;
  date?: string;
  notes?: string;
  academyName?: string;
};

export type CreatePromotionValidationResult =
  | { ok: false; message: string }
  | {
      ok: true;
      normalizedRank: BeltRank;
      date: string;
      notes: string | null;
      academyName: string | null;
    };

type PromotionRankRow = {
  belt: string;
  stripes: number;
};

export function validateCreatePromotionBody(
  body: CreatePromotionBody,
): CreatePromotionValidationResult {
  if (!body.belt) {
    return { ok: false, message: "Belt is required." };
  }

  if (!isBeltColor(body.belt)) {
    return { ok: false, message: "Invalid belt." };
  }

  if (
    !Number.isInteger(body.stripes) ||
    (body.stripes != null && body.stripes < 0)
  ) {
    return { ok: false, message: "Stripes must be a non-negative integer." };
  }

  if (!body.date) {
    return { ok: false, message: "Date is required." };
  }

  const normalizedRank = normalizeBeltRank({
    belt: body.belt,
    stripes: body.stripes ?? 0,
  });

  return {
    ok: true,
    normalizedRank,
    date: body.date,
    notes: body.notes?.trim() || null,
    academyName: body.academyName?.trim() || null,
  };
}

export function getHighestAchievedRank(
  promotionRanks: PromotionRankRow[] | null,
  fallbackRank: BeltRank,
): BeltRank {
  const validPromotionRanks =
    promotionRanks
      ?.filter(
        (promotion): promotion is { belt: BeltColor; stripes: number } =>
          isBeltColor(promotion.belt) &&
          Number.isInteger(promotion.stripes) &&
          promotion.stripes >= 0,
      )
      .map((promotion) =>
        normalizeBeltRank({
          belt: promotion.belt,
          stripes: promotion.stripes,
        }),
      ) ?? [];

  return getHighestBeltRank(
    validPromotionRanks.length > 0 ? validPromotionRanks : [fallbackRank],
  ) as BeltRank;
}
