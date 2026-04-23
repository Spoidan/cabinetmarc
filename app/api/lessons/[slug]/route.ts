import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { userId } = getAuth(req);

  const { searchParams } = new URL(req.url);
  const course_id = searchParams.get("course_id");

  const db = getAdmin();

  let query = db
    .from("course_lessons")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true);

  if (course_id) query = query.eq("course_id", course_id);

  const { data: lesson, error } = await query.single();
  if (error || !lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  // Check enrollment for non-preview content
  let isEnrolled = false;
  if (userId) {
    const { data: enrollment } = await db
      .from("enrollments")
      .select("status")
      .eq("user_id", userId)
      .eq("course_id", lesson.course_id)
      .maybeSingle();
    isEnrolled = !!enrollment;
  }

  if (!lesson.is_free_preview && !isEnrolled) {
    return NextResponse.json({ error: "Enrollment required" }, { status: 403 });
  }

  return NextResponse.json({ lesson, isEnrolled });
}
