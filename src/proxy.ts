import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isProfileRoute = createRouteMatcher(["/profile(.*)"]);
const isApiRoute = createRouteMatcher(["/(api|trpc)(.*)"]);

async function hasProfile(
  userId: string,
  getToken: (options?: { template?: string }) => Promise<string | null>
): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return true;
  }

  const template = process.env.CLERK_SUPABASE_JWT_TEMPLATE;
  let token: string | null;

  if (!template) {
    token = await getToken();
  } else {
    try {
      token = await getToken({ template });
    } catch (error) {
      // If a configured template is missing, fall back to Clerk's default session token.
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as { status?: number }).status === 404
      ) {
        token = await getToken();
      } else {
        throw error;
      }
    }
  }

  if (!token) {
    return false;
  }

  const url = new URL("/rest/v1/profiles", supabaseUrl);
  url.searchParams.set("select", "id");
  url.searchParams.set("id", `eq.${userId}`);
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.error("Failed to check profile during middleware onboarding gate.", {
        status: response.status,
        body: responseBody.slice(0, 500),
      });
      return true;
    }

    const data = (await response.json()) as unknown;
    return Array.isArray(data) && data.length > 0;
  } catch {
    console.error("Profile check failed during middleware onboarding gate.");
    return true;
  }
}

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  const { userId, getToken } = await auth();

  if (!userId) {
    return;
  }

  if (isPublicRoute(request) || isProfileRoute(request) || isApiRoute(request)) {
    return;
  }

  const profileExists = await hasProfile(userId, getToken);
  if (!profileExists) {
    const profileUrl = new URL("/profile", request.url);
    return NextResponse.redirect(profileUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
