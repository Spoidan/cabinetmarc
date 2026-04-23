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
  const db = getAdmin();

  const { data: course, error } = await db
    .from("courses")
    .select("*, course_categories(name_fr, name_en, gradient, color)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const { data: chapters } = await db
    .from("course_chapters")
    .select("id, title_fr, title_en, order_index")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("order_index");

  const { data: lessons } = await db
    .from("course_lessons")
    .select("id, chapter_id, slug, title_fr, title_en, duration_minutes, order_index, is_free_preview")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("order_index");

  const { data: quizzes } = await db
    .from("quizzes")
    .select("id, chapter_id, title_fr, is_final_exam")
    .eq("course_id", course.id);

  let isEnrolled = false;
  let progress: string[] = [];
  let enrollment = null;

  if (userId) {
    const { data: enr } = await db
      .from("enrollments")
      .select("id, status, enrolled_at, completed_at")
      .eq("user_id", userId)
      .eq("course_id", course.id)
      .maybeSingle();

    enrollment = enr;
    isEnrolled = !!enr && enr.status === "active" || enr?.status === "completed";

    if (isEnrolled) {
      const { data: prog } = await db
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .eq("course_id", course.id);
      progress = (prog ?? []).map((p: { lesson_id: string }) => p.lesson_id);
    }
  }

  const totalLessons = lessons?.length ?? 0;
  const totalMinutes = (lessons ?? []).reduce((s, l) => s + (l.duration_minutes ?? 0), 0);

  return NextResponse.json({
    course,
    chapters: chapters ?? [],
    lessons: lessons ?? [],
    quizzes: quizzes ?? [],
    isEnrolled,
    enrollment,
    progress,
    totalLessons,
    totalMinutes,
  });
}
