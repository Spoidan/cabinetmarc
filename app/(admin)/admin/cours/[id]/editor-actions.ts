"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, LessonAttachment, QuizType } from "@/types/database";

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

type CoursePatch = Partial<Database["public"]["Tables"]["courses"]["Update"]>;

export async function updateCourseMeta(courseId: string, patch: CoursePatch): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { data: current } = await admin
    .from("courses")
    .select("slug")
    .eq("id", courseId)
    .maybeSingle();
  // Merge patch with is_published: false so edits are never immediately live
  const { error } = await admin.from("courses").update({ ...patch, is_published: false }).eq("id", courseId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/cours/${courseId}/editer`);
  revalidatePath("/admin/cours");
  revalidatePath("/cours");
  const slug = (patch.slug as string | undefined) ?? current?.slug;
  if (slug) revalidatePath(`/cours/${slug}`);
  return { ok: true };
}

// ----- modules
export async function createModule(courseId: string, title: string): Promise<Result<{ id: string }>> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { count } = await admin
    .from("course_modules")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);
  const { data, error } = await admin
    .from("course_modules")
    .insert({ course_id: courseId, title: title || "Nouveau module", sort_order: count ?? 0 })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Échec." };
  revalidatePath(`/admin/cours/${courseId}/editer`);
  return { ok: true, data: { id: data.id } };
}

export async function updateModule(moduleId: string, title: string, courseId: string): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("course_modules").update({ title }).eq("id", moduleId);
  if (error) return { ok: false, error: error.message };
  await admin.from("courses").update({ is_published: false }).eq("id", courseId);
  return { ok: true };
}

export async function deleteModule(moduleId: string): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("course_modules").delete().eq("id", moduleId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reorderModules(courseId: string, orderedIds: string[]): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await admin.from("course_modules").update({ sort_order: i }).eq("id", orderedIds[i]);
  }
  revalidatePath(`/admin/cours/${courseId}/editer`);
  return { ok: true };
}

export async function reorderLessons(
  moduleId: string,
  orderedIds: string[]
): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    await admin.from("course_lessons").update({ sort_order: i }).eq("id", orderedIds[i]);
  }
  // The caller knows which course this module belongs to and will revalidate.
  return { ok: true };
}

// ----- lessons
type LessonPatch = Partial<{
  title: string;
  slug: string;
  content: string;
  video_url: string | null;
  attachments: LessonAttachment[];
  duration_minutes: number | null;
  is_free_preview: boolean;
}>;

export async function createLesson(
  moduleId: string,
  patch: { title: string; slug: string }
): Promise<Result<{ id: string }>> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { count } = await admin
    .from("course_lessons")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);
  const { data, error } = await admin
    .from("course_lessons")
    .insert({
      module_id: moduleId,
      title: patch.title || "Nouvelle leçon",
      slug: patch.slug || `lecon-${Date.now()}`,
      sort_order: count ?? 0,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Échec." };
  return { ok: true, data: { id: data.id } };
}

export async function updateLesson(lessonId: string, patch: LessonPatch, courseId: string): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("course_lessons")
    .update(patch as Database["public"]["Tables"]["course_lessons"]["Update"])
    .eq("id", lessonId);
  if (error) return { ok: false, error: error.message };
  await admin.from("courses").update({ is_published: false }).eq("id", courseId);
  return { ok: true };
}

export async function deleteLesson(lessonId: string): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("course_lessons").delete().eq("id", lessonId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ----- quizzes
export async function createQuiz(
  courseId: string,
  patch: { title: string; module_id: string | null }
): Promise<Result<{ id: string }>> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("course_quizzes")
    .insert({
      course_id: courseId,
      module_id: patch.module_id,
      title: patch.title || "Nouveau quiz",
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Échec." };
  return { ok: true, data: { id: data.id } };
}

export async function updateQuiz(
  quizId: string,
  patch: Partial<{ title: string; pass_score_percent: number; module_id: string | null }>
): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("course_quizzes")
    .update(patch as Database["public"]["Tables"]["course_quizzes"]["Update"])
    .eq("id", quizId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteQuiz(quizId: string): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("course_quizzes").delete().eq("id", quizId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ----- questions / options (full replace pattern: simpler than per-field)
export type QuestionDraft = {
  id?: string;
  question: string;
  type: QuizType;
  options: Array<{ id?: string; label: string; is_correct: boolean }>;
};

export async function saveQuestions(
  quizId: string,
  questions: QuestionDraft[]
): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  // Replace all questions/options for the quiz.
  await admin.from("quiz_questions").delete().eq("quiz_id", quizId);
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const { data: inserted } = await admin
      .from("quiz_questions")
      .insert({ quiz_id: quizId, question: q.question, type: q.type, sort_order: i })
      .select("id")
      .single();
    if (!inserted) continue;
    const opts = q.options.map((o, j) => ({
      question_id: inserted.id,
      label: o.label,
      is_correct: o.is_correct,
      sort_order: j,
    }));
    if (opts.length > 0) await admin.from("quiz_options").insert(opts);
  }
  return { ok: true };
}

// ----- publish
export async function publishCourse(courseId: string): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("courses")
    .update({ is_published: true, published_at: new Date().toISOString() })
    .eq("id", courseId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/cours/${courseId}/editer`);
  revalidatePath("/admin/cours");
  revalidatePath("/cours");
  return { ok: true };
}

// ----- uploads (client-side direct upload via signed URL)

/** Step 1: generate a short-lived signed URL the browser can PUT to directly. */
export async function createCoverUploadUrl(
  courseId: string,
  ext: string
): Promise<Result<{ signedUrl: string; path: string }>> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const path = `${courseId}/${Date.now()}.${ext.toLowerCase()}`;
  const { data, error } = await admin.storage
    .from("course-covers")
    .createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? "Impossible de créer l'URL." };
  return { ok: true, data: { signedUrl: data.signedUrl, path } };
}

/** Step 2: after the browser finishes the PUT, record the public URL in the DB. */
export async function saveCoverImageUrl(
  courseId: string,
  path: string
): Promise<Result<{ url: string }>> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { data: pub } = admin.storage.from("course-covers").getPublicUrl(path);
  await admin
    .from("courses")
    .update({ cover_image: pub.publicUrl, is_published: false })
    .eq("id", courseId);
  revalidatePath(`/admin/cours/${courseId}/editer`);
  revalidatePath("/admin/cours");
  revalidatePath("/cours");
  return { ok: true, data: { url: pub.publicUrl } };
}

export async function uploadLessonAttachment(
  lessonId: string,
  file: { name: string; type: string; size: number; bytes: ArrayBuffer }
): Promise<Result<{ attachment: LessonAttachment }>> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const path = `${lessonId}/${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
  const { error } = await admin.storage
    .from("lesson-attachments")
    .upload(path, Buffer.from(file.bytes), { contentType: file.type, upsert: false });
  if (error) return { ok: false, error: error.message };
  const attachment: LessonAttachment = {
    name: file.name,
    path,
    size: file.size,
    mime: file.type,
  };
  // Fetch and append
  const { data: lesson } = await admin
    .from("course_lessons")
    .select("attachments")
    .eq("id", lessonId)
    .maybeSingle();
  const list = Array.isArray(lesson?.attachments) ? lesson!.attachments : [];
  await admin
    .from("course_lessons")
    .update({ attachments: [...list, attachment] })
    .eq("id", lessonId);
  return { ok: true, data: { attachment } };
}

/** Step 1: generate a signed upload URL for a lesson video. */
export async function createVideoUploadUrl(
  lessonId: string,
  ext: string
): Promise<Result<{ signedUrl: string; path: string }>> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const path = `${lessonId}/${Date.now()}.${ext.toLowerCase()}`;
  const { data, error } = await admin.storage
    .from("lesson-videos")
    .createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? "Impossible de créer l'URL." };
  return { ok: true, data: { signedUrl: data.signedUrl, path } };
}

/** Step 2: after the browser finishes the PUT, record the storage path in the DB. */
export async function saveVideoPath(
  lessonId: string,
  path: string
): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("course_lessons")
    .update({ video_url: path })
    .eq("id", lessonId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function removeLessonAttachment(
  lessonId: string,
  path: string
): Promise<Result> {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { data: lesson } = await admin
    .from("course_lessons")
    .select("attachments")
    .eq("id", lessonId)
    .maybeSingle();
  const list = (Array.isArray(lesson?.attachments) ? lesson!.attachments : []) as LessonAttachment[];
  const filtered = list.filter((a) => a.path !== path);
  await admin.from("course_lessons").update({ attachments: filtered }).eq("id", lessonId);
  await admin.storage.from("lesson-attachments").remove([path]);
  return { ok: true };
}
