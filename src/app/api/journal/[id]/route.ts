import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mapJournalEntryRow, type JournalEntryRow } from "@/lib/supabase/mappers";
import { createClerkSupabaseServerClient } from "@/lib/supabase/server";

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const { id } = await context.params;
  const supabase = await createClerkSupabaseServerClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle<JournalEntryRow>();

  if (error) {
    return errorResponse(error.message, 500);
  }

  return NextResponse.json(data ? mapJournalEntryRow(data) : null);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const { id } = await context.params;
  const supabase = await createClerkSupabaseServerClient();
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return errorResponse(error.message, 500);
  }

  return new NextResponse(null, { status: 204 });
}
