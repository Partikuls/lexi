import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Service client — uses service role key, bypasses RLS.
 * Use for admin operations: image upload, background jobs.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Auth client — uses cookies for per-request auth.
 * Use in API routes and server components that need user context.
 */
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can fail in Server Components (read-only cookies).
            // Safe to ignore — middleware handles refresh.
          }
        },
      },
    }
  );
}

/** @deprecated Use createServiceClient() or createAuthClient() instead */
export const createServerClient = createServiceClient;
