import type { MetadataRoute } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://cabinetmarc.org";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/services",
    "/team",
    "/contact",
    "/blog",
    "/cours",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/cours" ? 0.9 : 0.6,
  }));

  let courses: MetadataRoute.Sitemap = [];
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("courses")
      .select("slug, updated_at")
      .eq("is_published", true);
    courses = ((data ?? []) as Array<{ slug: string; updated_at: string }>).map((c) => ({
      url: `${BASE}/cours/${c.slug}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.error("[sitemap] failed to load courses", err);
  }

  return [...staticPages, ...courses];
}
