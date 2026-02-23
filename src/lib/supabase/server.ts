import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing SUPABASE_URL environment variable.");
  }

  if (!key) {
    throw new Error(
      "Missing SUPABASE_KEY (or SUPABASE_ANON_KEY) environment variable.",
    );
  }

  return { url, key };
}

export async function createClerkSupabaseServerClient() {
  const { getToken } = await auth();
  const { url, key } = getSupabaseConfig();
  const template = process.env.CLERK_SUPABASE_JWT_TEMPLATE;

  async function resolveAccessToken() {
    if (!template) {
      return getToken();
    }

    try {
      return await getToken({ template });
    } catch (error) {
      // If a configured template does not exist, fall back to the default
      // Clerk session token used by Supabase third-party auth.
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as { status?: number }).status === 404
      ) {
        return getToken();
      }

      throw error;
    }
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    accessToken: async () => {
      const token = await resolveAccessToken();
      if (!token) {
        throw new Error("Unable to retrieve Clerk session token for Supabase.");
      }
      return token;
    },
  });
}
