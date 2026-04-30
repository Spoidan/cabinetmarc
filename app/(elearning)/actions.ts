"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { recomputeProgress, nextCertificateNumber } from "@/lib/elearning/progress";

type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

/**
 * Ensure a `profiles` row exists for the current Clerk user. Called lazily on
 * first enrollment / mutation.
 */
async function ensureProfile(userId: string) {
  const admin = createSupabaseAdminClient();
  const user = await currentUser().catch(() => null);
  const fullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || null
    : null;
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const avatar = user?.imageUrl ?? null;

  await admin
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: fullName,
        email,
        avatar_url: avatar,
      },
      { onConflict: "id", ignoreDuplicates: false }
    );
}

/** Enroll the current Clerk user in a course by slug. Server Action. */
export async function enrollInCourse(courseSlug: string): Promise<ActionResult<{ enrollmentId: string }>> {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/connexion?redirect_url=${encodeURIComponent(`/cours/${courseSlug}`)}`);
  }

  const admin = createSupabaseAdminClient();

  const { data: course, error: courseErr } = await admin
    .from("courses")
    .select("id, price_bif, is_published")
    .eq("slug", courseSlug)
    .maybeSingle();
  if (courseErr || !course) return { ok: false, error: "Cours introuvable." };
  if (!course.is_published) return { ok: false, error: "Ce cours n'est pas disponible." };

  await ensureProfile(userId);

  // TODO: payment — when price_bif > 0 the brief currently asks to enroll directly.
  const { data: existing } = await admin
    .from("course_enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .maybeSingle();
  if (existing) {
    return { ok: true, data: { enrollmentId: existing.id } };
  }

  const { data: inserted, error: insertErr } = await admin
    .from("course_enrollments")
    .insert({ user_id: userId, course_id: course.id })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    return { ok: false, error: "Impossible de finaliser l'inscription." };
  }

  revalidatePath(`/cours/${courseSlug}`);
  revalidatePath("/mes-cours");
  return { ok: true, data: { enrollmentId: inserted.id } };
}

/** Mark a lesson as complete for the current user. Idempotent. */
export async function markLessonComplete(
  courseSlug: string,
  lessonId: string
): Promise<ActionResult<{ percent: number; completed: boolean }>> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Non authentifié." };

  const admin = createSupabaseAdminClient();

  // Find enrollment
  const { data: lesson } = await admin
    .from("course_lessons")
    .select("id, module_id")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return { ok: false, error: "Leçon introuvable." };

  const { data: mod } = await admin
    .from("course_modules")
    .select("course_id")
    .eq("id", lesson.module_id)
    .maybeSingle();
  const courseId = mod?.course_id;
  if (!courseId) return { ok: false, error: "Module introuvable." };

  const { data: enrollment } = await admin
    .from("course_enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!enrollment) return { ok: false, error: "Inscription requise." };

  // Idempotent insert
  await admin
    .from("lesson_completions")
    .upsert(
      { enrollment_id: enrollment.id, lesson_id: lessonId },
      { onConflict: "enrollment_id,lesson_id", ignoreDuplicates: true }
    );

  const res = await recomputeProgress(enrollment.id);
  revalidatePath(`/cours/${courseSlug}/apprendre`, "layout");
  revalidatePath("/mes-cours");
  return { ok: true, data: res };
}

/** Submit answers to a quiz. Server grades, writes attempt, returns score + per-question correctness. */
export async function submitQuizAttempt(params: {
  courseSlug: string;
  quizId: string;
  // answers: Record<questionId, optionId[]>
  answers: Record<string, string[]>;
}): Promise<
  ActionResult<{
    score: number;
    passed: boolean;
    passScore: number;
    perQuestion: Array<{ questionId: string; correct: boolean; correctOptionIds: string[] }>;
    allCoursePassed: boolean;
  }>
> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Non authentifié." };

  const admin = createSupabaseAdminClient();

  const { data: quiz } = await admin
    .from("course_quizzes")
    .select("id, course_id, pass_score_percent")
    .eq("id", params.quizId)
    .maybeSingle();
  if (!quiz) return { ok: false, error: "Quiz introuvable." };

  const { data: enrollment } = await admin
    .from("course_enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", quiz.course_id)
    .maybeSingle();
  if (!enrollment) return { ok: false, error: "Inscription requise." };

  const { data: questions } = await admin
    .from("quiz_questions")
    .select("id, type")
    .eq("quiz_id", params.quizId);

  const { data: options } = await admin
    .from("quiz_options")
    .select("id, question_id, is_correct")
    .in(
      "question_id",
      (questions ?? []).map((q) => q.id)
    );

  let correctCount = 0;
  const perQuestion: Array<{ questionId: string; correct: boolean; correctOptionIds: string[] }> = [];

  for (const q of questions ?? []) {
    const given = new Set(params.answers[q.id] ?? []);
    const correctOptions = (options ?? []).filter(
      (o) => o.question_id === q.id && o.is_correct
    );
    const correctIds = new Set(correctOptions.map((o) => o.id));
    const correctIdArr = correctOptions.map((o) => o.id);

    let isCorrect = false;
    if (q.type === "single" || q.type === "true_false") {
      isCorrect = given.size === 1 && correctIds.size === 1 &&
        [...given][0] === [...correctIds][0];
    } else {
      // multiple: need exact match of sets
      isCorrect =
        given.size === correctIds.size &&
        [...given].every((id) => correctIds.has(id));
    }

    if (isCorrect) correctCount += 1;
    perQuestion.push({ questionId: q.id, correct: isCorrect, correctOptionIds: correctIdArr });
  }

  const total = questions?.length ?? 0;
  const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);
  const passed = score >= quiz.pass_score_percent;

  await admin.from("quiz_attempts").insert({
    enrollment_id: enrollment.id,
    quiz_id: params.quizId,
    score_percent: score,
    passed,
    answers: params.answers,
  });

  const { completed } = await recomputeProgress(enrollment.id);

  // Issue certificate on completion
  if (completed) {
    await issueCertificateIfNeeded(enrollment.id);
  }

  revalidatePath(`/cours/${params.courseSlug}`, "layout");
  revalidatePath("/mes-cours");

  return {
    ok: true,
    data: {
      score,
      passed,
      passScore: quiz.pass_score_percent,
      perQuestion,
      allCoursePassed: completed,
    },
  };
}

/** Issue certificate (idempotent). Returns the certificate row or null. */
export async function issueCertificateIfNeeded(enrollmentId: string) {
  const admin = createSupabaseAdminClient();

  const { data: enrollment } = await admin
    .from("course_enrollments")
    .select("id, user_id, course_id, completed_at")
    .eq("id", enrollmentId)
    .maybeSingle();
  if (!enrollment?.completed_at) return null;

  const { data: existing } = await admin
    .from("course_certificates")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();
  if (existing) return existing;

  const [{ data: course }, { data: profile }] = await Promise.all([
    admin
      .from("courses")
      .select("title, slug")
      .eq("id", enrollment.course_id)
      .maybeSingle(),
    admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", enrollment.user_id)
      .maybeSingle(),
  ]);

  const number = await nextCertificateNumber();
  const studentName = profile?.full_name || profile?.email || "Étudiant Cabinet MARC";
  const courseTitle = course?.title ?? "Cours Cabinet MARC";

  let pdfPath: string | null = null;
  try {
    const { issueCertificatePdf } = await import("@/lib/elearning/certificate");
    pdfPath = await issueCertificatePdf({
      certificateNumber: number,
      studentName,
      courseTitle,
      completedAt: enrollment.completed_at,
    });
  } catch (err) {
    console.error("[issueCertificatePdf]", err);
  }

  const { data: inserted } = await admin
    .from("course_certificates")
    .insert({
      enrollment_id: enrollmentId,
      certificate_number: number,
      pdf_path: pdfPath,
      issued_at: new Date().toISOString(),
    })
    .select()
    .single();

  return inserted;
}

/** Create a short-lived signed URL for a private storage object. */
export async function createSignedStorageUrl(bucket: string, path: string, expiresSec = 300) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, expiresSec);
  if (error) {
    console.error("[createSignedStorageUrl]", error.message);
    return null;
  }
  return data?.signedUrl ?? null;
}
