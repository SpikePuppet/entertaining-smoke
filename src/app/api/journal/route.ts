import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api/error-response";
import { validateSameOrigin } from "@/lib/security/origin";
import { mapJournalEntryRow, type JournalEntryRow } from "@/lib/supabase/mappers";
import { createClerkSupabaseServerClient } from "@/lib/supabase/server";

type CreateJournalEntryBody = {
  title: string;
  description?: string;
  highlightMoves?: string;
  whatWentRight?: string;
  whatToImprove?: string;
};

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const supabase = await createClerkSupabaseServerClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<JournalEntryRow[]>();

  if (error) {
    return errorResponse("Failed to load journal entries.", 500, error);
  }

  return NextResponse.json(data.map(mapJournalEntryRow));
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

  const body = (await request.json()) as CreateJournalEntryBody;

  if (!body.title?.trim()) {
    return errorResponse("Title is required.", 400);
  }

  const supabase = await createClerkSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("current_belt")
    .eq("id", userId)
    .maybeSingle<{ current_belt: string }>();

  if (profileError) {
    return errorResponse("Failed to load profile for journal entry.", 500, profileError);
  }

  const payload = {
    user_id: userId,
    belt_at_time: profile?.current_belt ?? "white",
    title: body.title.trim(),
    description: body.description ?? "",
    highlight_moves: body.highlightMoves ?? "",
    what_went_right: body.whatWentRight ?? "",
    what_to_improve: body.whatToImprove ?? "",
  };

  const { data, error } = await supabase
    .from("journal_entries")
    .insert(payload)
    .select("*")
    .single<JournalEntryRow>();

  if (error) {
    return errorResponse("Failed to create journal entry.", 500, error);
  }

  return NextResponse.json(mapJournalEntryRow(data), { status: 201 });
}
