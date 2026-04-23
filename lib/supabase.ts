import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser client (singleton)
let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

// Server admin client (full permissions)
export function getSupabaseAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Server component client
export async function getSupabaseServerClient(cookieStore: {
  get: (name: string) => { value: string } | undefined;
  set: (name: string, value: string, options?: CookieOptions) => void;
}) {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options?: CookieOptions) {
        cookieStore.set(name, "", options);
      },
    },
  });
}

// Storage helpers
export const STORAGE_BUCKETS = {
  media: "media",
  avatars: "avatars",
} as const;

export function getPublicUrl(bucket: string, path: string): string {
  const admin = getSupabaseAdminClient();
  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
