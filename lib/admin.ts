import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  if (!adminIds.includes(userId)) {
    redirect("/dashboard");
  }

  return userId;
}

export function isAdminUser(userId: string | null): boolean {
  if (!userId) return false;
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return adminIds.includes(userId);
}
