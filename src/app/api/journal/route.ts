import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mapJournalEntryRow, type JournalEntryRow } from "@/lib/supabase/mappers";
import { createClerkSupabaseServerClient } from "@/lib/supabase/server";

type CreateJournalEntryBody = {
  title: string;
  description?: string;
  highlightMoves?: string;
  whatWentRight?: string;
  whatToImprove?: string;
};

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

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
    return errorResponse(error.message, 500);
  }

  return NextResponse.json(data.map(mapJournalEntryRow));
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const body = (await request.json()) as CreateJournalEntryBody;

  if (!body.title?.trim()) {
    return errorResponse("Title is required.", 400);
  }

  const supabase = await createClerkSupabaseServerClient();
  const payload = {
    user_id: userId,
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
    return errorResponse(error.message, 500);
  }

  return NextResponse.json(mapJournalEntryRow(data), { status: 201 });
}
