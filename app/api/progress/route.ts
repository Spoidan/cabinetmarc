import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lesson_id, course_id } = await req.json();
  if (!lesson_id || !course_id) {
    return NextResponse.json({ error: "lesson_id and course_id required" }, { status: 400 });
  }

  const db = getAdmin();

  const { data: enrollment } = await db
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", course_id)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  const { error } = await db
    .from("lesson_progress")
    .upsert({ user_id: userId, lesson_id, course_id, completed_at: new Date().toISOString() }, {
      onConflict: "user_id,lesson_id",
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Check if all lessons completed → mark enrollment as completed
  const { data: totalLessons } = await db
    .from("course_lessons")
    .select("id")
    .eq("course_id", course_id)
    .eq("is_published", true);

  const { data: completedLessons } = await db
    .from("lesson_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", course_id);

  const allDone = (totalLessons?.length ?? 0) > 0 &&
    (completedLessons?.length ?? 0) >= (totalLessons?.length ?? 0);

  if (allDone) {
    await db
      .from("enrollments")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("course_id", course_id);
  }

  return NextResponse.json({ success: true, course_completed: allDone });
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const course_id = searchParams.get("course_id");

  const db = getAdmin();
  let query = db.from("lesson_progress").select("lesson_id").eq("user_id", userId);
  if (course_id) query = query.eq("course_id", course_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: (data ?? []).map((r: { lesson_id: string }) => r.lesson_id) });
}
