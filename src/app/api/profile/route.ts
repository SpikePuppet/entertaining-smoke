import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { BeltColor } from "@/lib/types";
import { errorResponse } from "@/lib/api/error-response";
import { validateSameOrigin } from "@/lib/security/origin";
import { mapProfileRow, type ProfileRow } from "@/lib/supabase/mappers";
import { createClerkSupabaseServerClient } from "@/lib/supabase/server";

type CreateProfileBody = {
  name: string;
  academyName?: string;
  currentBelt?: BeltColor;
  currentStripes?: number;
};

type UpdateProfileBody = Partial<
  Pick<CreateProfileBody, "name" | "academyName" | "currentBelt" | "currentStripes">
>;

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const supabase = await createClerkSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (error) {
    return errorResponse("Failed to load profile.", 500, error);
  }

  return NextResponse.json(data ? mapProfileRow(data) : null);
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

  const body = (await request.json()) as CreateProfileBody;

  if (!body.name?.trim()) {
    return errorResponse("Name is required.", 400);
  }

  const supabase = await createClerkSupabaseServerClient();
  const payload = {
    id: userId,
    name: body.name.trim(),
    academy_name: body.academyName?.trim() || null,
    current_belt: body.currentBelt ?? "white",
    current_stripes: body.currentStripes ?? 0,
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(payload)
    .select("*")
    .single<ProfileRow>();

  if (error) {
    return errorResponse("Failed to create profile.", 500, error);
  }

  const { error: promotionError } = await supabase.from("promotions").insert({
    user_id: userId,
    belt: payload.current_belt,
    stripes: payload.current_stripes,
    date: new Date().toISOString().slice(0, 10),
    notes: "Auto-created from profile creation.",
  });

  if (promotionError) {
    // Keep profile and promotion history in sync for first-time setup.
    await supabase.from("profiles").delete().eq("id", userId);
    return errorResponse("Failed to create initial promotion.", 500, promotionError);
  }

  return NextResponse.json(mapProfileRow(data), { status: 201 });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const originValidation = validateSameOrigin(request);
  if (!originValidation.ok) {
    return errorResponse(originValidation.message, 403);
  }

  const body = (await request.json()) as UpdateProfileBody;
  const updates: Record<string, unknown> = {};

  if (typeof body.name === "string") updates.name = body.name.trim();
  if (body.academyName !== undefined) updates.academy_name = body.academyName?.trim() || null;
  if (body.currentBelt !== undefined) updates.current_belt = body.currentBelt;
  if (body.currentStripes !== undefined) updates.current_stripes = body.currentStripes;

  if (Object.keys(updates).length === 0) {
    return errorResponse("No profile updates provided.", 400);
  }

  const supabase = await createClerkSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .single<ProfileRow>();

  if (error) {
    return errorResponse("Failed to update profile.", 500, error);
  }

  return NextResponse.json(mapProfileRow(data));
}
