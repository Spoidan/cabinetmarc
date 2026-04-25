import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Server-side Supabase client for Server Components, Server Actions, and Route Handlers.
 * Uses the anon key — only public (RLS-permitted) data is accessible.
 *
 * Auth note: this project uses Clerk, not Supabase Auth. Do not rely on `auth.uid()`
 * in RLS. For user-scoped reads or any writes, use `createSupabaseAdminClient` from
 * `./admin` after verifying the Clerk session with `auth()` from `@clerk/nextjs/server`.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
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
            // Server Components cannot set cookies; safe to ignore here.
          }
        },
      },
    }
  );
}
