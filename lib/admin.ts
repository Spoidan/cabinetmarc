import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function adminIds(): string[] {
  return (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/connexion?redirect_url=%2Fadmin");
  }

  if (!adminIds().includes(userId)) {
    redirect("/?denied=1");
  }

  return userId;
}

export function isAdminUser(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return adminIds().includes(userId);
}
