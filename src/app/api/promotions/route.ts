import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api/error-response";
import {
  getHighestAchievedRank,
  validateCreatePromotionBody,
  type CreatePromotionBody,
} from "@/lib/promotions";
import { validateSameOrigin } from "@/lib/security/origin";
import { mapPromotionRow, type PromotionRow } from "@/lib/supabase/mappers";
import { createClerkSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const supabase = await createClerkSupabaseServerClient();
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .returns<PromotionRow[]>();

  if (error) {
    return errorResponse("Failed to load promotions.", 500, error);
  }

  return NextResponse.json(data.map(mapPromotionRow));
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const originValidation = validateSameOrigin(request);
  if (!originValidation.ok) {
    return errorResponse(originValidation.message, 403);
  }

  const body = (await request.json()) as CreatePromotionBody;
  const validation = validateCreatePromotionBody(body);

  if (!validation.ok) {
    return errorResponse(validation.message, 400);
  }

  const supabase = await createClerkSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("academy_name")
    .eq("id", userId)
    .maybeSingle<{ academy_name: string | null }>();

  if (profileError) {
    return errorResponse(
      "Failed to load profile for promotion.",
      500,
      profileError,
    );
  }

  const payload = {
    user_id: userId,
    belt: validation.normalizedRank.belt,
    stripes: validation.normalizedRank.stripes,
    date: validation.date,
    notes: validation.notes,
    academy_name: validation.academyName || profile?.academy_name || null,
  };

  const { data, error } = await supabase
    .from("promotions")
    .insert(payload)
    .select("*")
    .single<PromotionRow>();

  if (error) {
    return errorResponse("Failed to create promotion.", 500, error);
  }

  const { data: promotionRanks, error: promotionRanksError } = await supabase
    .from("promotions")
    .select("belt, stripes")
    .eq("user_id", userId);

  if (promotionRanksError) {
    return errorResponse(
      "Failed to recompute highest rank after promotion.",
      500,
      promotionRanksError,
    );
  }

  const highestRank = getHighestAchievedRank(
    promotionRanks,
    validation.normalizedRank
  );

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      current_belt: highestRank.belt,
      current_stripes: highestRank.stripes,
    })
    .eq("id", userId);

  if (profileUpdateError) {
    return errorResponse(
      "Failed to update profile after promotion.",
      500,
      profileUpdateError,
    );
  }

  return NextResponse.json(mapPromotionRow(data), { status: 201 });
}
