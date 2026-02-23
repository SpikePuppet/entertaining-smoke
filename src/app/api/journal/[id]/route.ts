import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api/error-response";
import { validateSameOrigin } from "@/lib/security/origin";
import { mapJournalEntryRow, type JournalEntryRow } from "@/lib/supabase/mappers";
import { createClerkSupabaseServerClient } from "@/lib/supabase/server";

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
    return errorResponse("Failed to load journal entry.", 500, error);
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

  const originValidation = validateSameOrigin(_request);
  if (!originValidation.ok) {
    return errorResponse(originValidation.message, 403);
  }

  const { id } = await context.params;
  const supabase = await createClerkSupabaseServerClient();
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return errorResponse("Failed to delete journal entry.", 500, error);
  }

  return new NextResponse(null, { status: 204 });
}
