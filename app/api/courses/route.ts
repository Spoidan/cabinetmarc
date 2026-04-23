import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const db = getAdmin();

  let query = db
    .from("courses")
    .select("id, title_fr, title_en, slug, level, price, is_free, is_featured, is_active, categories(name_fr, slug), instructor_name, duration_hours, enrolled_count, rating")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (category && category !== "all") {
    // Join via categories table
    const { data: cat } = await db.from("categories").select("id").eq("slug", category).maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: data ?? [] });
}
