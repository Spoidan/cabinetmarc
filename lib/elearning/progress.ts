import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Recompute and persist progress_percent for a single enrollment.
 * Returns the new percent. Optionally sets completed_at if 100% and all
 * required quizzes are passed.
 */
export async function recomputeProgress(enrollmentId: string): Promise<{
  percent: number;
  completed: boolean;
}> {
  const admin = createSupabaseAdminClient();

  const { data: enrollment } = await admin
    .from("course_enrollments")
    .select("id, course_id, completed_at")
    .eq("id", enrollmentId)
    .maybeSingle();
  if (!enrollment) return { percent: 0, completed: false };

  // Count lessons in the course
  const { data: moduleIds } = await admin
    .from("course_modules")
    .select("id")
    .eq("course_id", enrollment.course_id);

  const moduleIdList = (moduleIds ?? []).map((m) => m.id);
  if (moduleIdList.length === 0) return { percent: 0, completed: false };

  const { count: totalLessons } = await admin
    .from("course_lessons")
    .select("id", { count: "exact", head: true })
    .in("module_id", moduleIdList);

  const { count: completedLessons } = await admin
    .from("lesson_completions")
    .select("id", { count: "exact", head: true })
    .eq("enrollment_id", enrollmentId);

  const total = totalLessons ?? 0;
  const done = completedLessons ?? 0;
  const percent = total === 0 ? 0 : Math.min(100, Math.round((done / total) * 100));

  // Check all required quizzes are passed
  let allQuizzesPassed = true;
  const { data: quizzes } = await admin
    .from("course_quizzes")
    .select("id")
    .eq("course_id", enrollment.course_id);

  if (quizzes && quizzes.length > 0) {
    const { data: passes } = await admin
      .from("quiz_attempts")
      .select("quiz_id")
      .eq("enrollment_id", enrollmentId)
      .eq("passed", true);
    const passedSet = new Set((passes ?? []).map((p) => p.quiz_id));
    allQuizzesPassed = quizzes.every((q) => passedSet.has(q.id));
  }

  const completed = percent >= 100 && allQuizzesPassed;
  const completedAt = completed ? (enrollment.completed_at ?? new Date().toISOString()) : null;

  await admin
    .from("course_enrollments")
    .update({ progress_percent: percent, completed_at: completedAt })
    .eq("id", enrollmentId);

  return { percent, completed };
}

/** Generate next certificate number in the format CM-YYYY-000123 */
export async function nextCertificateNumber(): Promise<string> {
  const admin = createSupabaseAdminClient();
  const year = new Date().getFullYear();
  const prefix = `CM-${year}-`;
  const { count } = await admin
    .from("course_certificates")
    .select("id", { count: "exact", head: true })
    .like("certificate_number", `${prefix}%`);
  const seq = (count ?? 0) + 1;
  return `${prefix}${String(seq).padStart(6, "0")}`;
}
