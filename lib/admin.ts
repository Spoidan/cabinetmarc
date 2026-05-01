import "server-only";
import { cache } from "react";
import { auth, getAuth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { NextRequest } from "next/server";

/** Env-var super-admin list — kept as bootstrap escape hatch only. */
function envAdminIds(): string[] {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Single source of truth: a user is admin if they are in ADMIN_USER_IDS
 * OR their profiles.role = 'admin'. Cached per request via React cache().
 */
const resolveAdminRole = cache(async (userId: string): Promise<boolean> => {
  if (envAdminIds().includes(userId)) return true;
  const db = createSupabaseAdminClient();
  const { data } = await db.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "admin";
});

export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/connexion?redirect_url=%2Fadmin");
  if (!(await resolveAdminRole(userId))) redirect("/?denied=1");
  return userId;
}

export async function isAdminUser(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  return resolveAdminRole(userId);
}

/** For use in Route Handlers that receive a NextRequest. */
export async function isAdminFromRequest(req: NextRequest): Promise<boolean> {
  const { userId } = getAuth(req);
  if (!userId) return false;
  return resolveAdminRole(userId);
}
