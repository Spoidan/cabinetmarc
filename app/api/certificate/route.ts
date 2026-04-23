import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const course_id = searchParams.get("course_id");
  const cert_number = searchParams.get("number");

  const db = getAdmin();

  if (cert_number) {
    const { data, error } = await db
      .from("certificates")
      .select("*, courses(title_fr, title_en)")
      .eq("certificate_number", cert_number)
      .single();
    if (error || !data) return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    return NextResponse.json({ data });
  }

  let query = db.from("certificates").select("*, courses(title_fr, title_en, slug)").eq("user_id", userId);
  if (course_id) query = query.eq("course_id", course_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { course_id, user_name } = await req.json();
  const db = getAdmin();

  const { data: existing } = await db
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", course_id)
    .maybeSingle();

  if (existing) return NextResponse.json({ data: existing });

  const { data: enrollment } = await db
    .from("enrollments")
    .select("status")
    .eq("user_id", userId)
    .eq("course_id", course_id)
    .maybeSingle();

  if (!enrollment || enrollment.status !== "completed") {
    return NextResponse.json({ error: "Course not completed" }, { status: 403 });
  }

  const certNumber = `MARC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const { data: course } = await db.from("courses").select("title_fr").eq("id", course_id).single();

  const { data, error } = await db
    .from("certificates")
    .insert({
      user_id: userId,
      course_id,
      user_name: user_name ?? "Étudiant",
      course_name: course?.title_fr ?? "Formation",
      certificate_number: certNumber,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
