import { NextResponse } from "next/server";

export function errorResponse(
  message: string,
  status = 500,
  details?: unknown
) {
  if (status >= 500 && details !== undefined) {
    console.error(details);
  }

  return NextResponse.json({ error: message }, { status });
}
