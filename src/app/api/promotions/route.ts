import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { BeltColor } from "@/lib/types";
import { mapPromotionRow, type PromotionRow } from "@/lib/supabase/mappers";
import { createClerkSupabaseServerClient } from "@/lib/supabase/server";

type CreatePromotionBody = {
  belt: BeltColor;
  stripes: number;
  date: string;
  notes?: string;
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
    .from("promotions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .returns<PromotionRow[]>();

  if (error) {
    return errorResponse(error.message, 500);
  }

  return NextResponse.json(data.map(mapPromotionRow));
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("Unauthorized.", 401);
  }

  const body = (await request.json()) as CreatePromotionBody;

  if (!body.belt) {
    return errorResponse("Belt is required.", 400);
  }

  if (!body.date) {
    return errorResponse("Date is required.", 400);
  }

  const supabase = await createClerkSupabaseServerClient();
  const payload = {
    user_id: userId,
    belt: body.belt,
    stripes: body.stripes,
    date: body.date,
    notes: body.notes?.trim() || null,
  };

  const { data, error } = await supabase
    .from("promotions")
    .insert(payload)
    .select("*")
    .single<PromotionRow>();

  if (error) {
    return errorResponse(error.message, 500);
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({
      current_belt: body.belt,
      current_stripes: body.stripes,
    })
    .eq("id", userId);

  if (profileUpdateError) {
    return errorResponse(profileUpdateError.message, 500);
  }

  return NextResponse.json(mapPromotionRow(data), { status: 201 });
}
