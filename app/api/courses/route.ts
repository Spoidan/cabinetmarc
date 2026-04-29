import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Supabase = ReturnType<typeof createClient<Database>>;

function getAdmin(): Supabase {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const admin = getAdmin();

  const { data: courses, error } = await admin
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = courses ?? [];
  if (rows.length === 0) return NextResponse.json({ data: [] });

  const catIds = Array.from(new Set(rows.map((c) => c.category_id)));
  const courseIds = rows.map((c) => c.id);

  const [{ data: cats }, { data: enrollRows }] = await Promise.all([
    admin.from("course_categories").select("id, name, slug").in("id", catIds),
    admin.from("course_enrollments").select("course_id").in("course_id", courseIds),
  ]);

  const catById = new Map((cats ?? []).map((c) => [c.id, c]));
  const enrollCount = new Map<string, number>();
  for (const e of enrollRows ?? []) {
    enrollCount.set(e.course_id, (enrollCount.get(e.course_id) ?? 0) + 1);
  }

  const data = rows.map((c) => {
    const cat = catById.get(c.category_id) ?? null;
    return {
      id: c.id,
      slug: c.slug,
      title_fr: c.title,
      level: c.level,
      price: c.price_bif,
      is_free: c.price_bif === 0,
      is_featured: false,
      categories: cat ? { name_fr: cat.name, slug: cat.slug } : null,
      duration_hours:
        c.duration_minutes != null
          ? Math.round((c.duration_minutes / 60) * 10) / 10
          : undefined,
      enrolled_count: enrollCount.get(c.id) ?? 0,
    };
  });

  return NextResponse.json({ data });
}
