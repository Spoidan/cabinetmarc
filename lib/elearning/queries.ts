import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];
export type CourseRow = Tables["courses"]["Row"];
export type CategoryRow = Tables["course_categories"]["Row"];
export type ModuleRow = Tables["course_modules"]["Row"];
export type LessonRow = Tables["course_lessons"]["Row"];
export type QuizRow = Tables["course_quizzes"]["Row"];
export type QuestionRow = Tables["quiz_questions"]["Row"];
export type OptionRow = Tables["quiz_options"]["Row"];
export type EnrollmentRow = Tables["course_enrollments"]["Row"];
export type CompletionRow = Tables["lesson_completions"]["Row"];
export type AttemptRow = Tables["quiz_attempts"]["Row"];
export type CertificateRow = Tables["course_certificates"]["Row"];

export type CourseWithCategory = CourseRow & {
  category: Pick<CategoryRow, "id" | "name" | "slug"> | null;
};

export type CourseOutline = {
  course: CourseWithCategory;
  modules: Array<
    ModuleRow & {
      lessons: LessonRow[];
      quizzes: QuizRow[];
    }
  >;
  finalQuizzes: QuizRow[];
};

/** List all categories (public read) */
export async function listCategories(): Promise<CategoryRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("course_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[queries.listCategories]", error.message);
    return [];
  }
  return data ?? [];
}

async function hydrateCategories(
  courses: CourseRow[]
): Promise<CourseWithCategory[]> {
  if (courses.length === 0) return [];
  const supabase = await createSupabaseServerClient();
  const ids = Array.from(new Set(courses.map((c) => c.category_id)));
  const { data: cats } = await supabase
    .from("course_categories")
    .select("id, name, slug")
    .in("id", ids);
  const byId = new Map((cats ?? []).map((c) => [c.id, c]));
  return courses.map((c) => ({ ...c, category: byId.get(c.category_id) ?? null }));
}

/** List published courses with their category. Optional categorie slug filter. */
export async function listPublishedCourses(
  categorieSlug?: string
): Promise<CourseWithCategory[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (categorieSlug) {
    const { data: cat } = await supabase
      .from("course_categories")
      .select("id")
      .eq("slug", categorieSlug)
      .maybeSingle();
    if (cat?.id) query = query.eq("category_id", cat.id);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[queries.listPublishedCourses]", error.message);
    return [];
  }
  return hydrateCategories((data ?? []) as CourseRow[]);
}

/** Full course outline (modules + lessons + quizzes). */
export async function getCourseOutline(
  courseSlug: string,
  { includeDraft = false }: { includeDraft?: boolean } = {}
): Promise<CourseOutline | null> {
  const supabase = includeDraft
    ? createSupabaseAdminClient()
    : await createSupabaseServerClient();

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (error) {
    console.error("[queries.getCourseOutline:course]", error.message);
    return null;
  }
  if (!course) return null;
  if (!includeDraft && !course.is_published) return null;

  const { data: cat } = await supabase
    .from("course_categories")
    .select("id, name, slug")
    .eq("id", course.category_id)
    .maybeSingle();
  const courseWithCategory: CourseWithCategory = { ...(course as CourseRow), category: cat ?? null };

  const { data: modules } = await supabase
    .from("course_modules")
    .select("*")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  const moduleIds = (modules ?? []).map((m) => m.id);

  const [{ data: lessons }, { data: quizzes }] = await Promise.all([
    moduleIds.length === 0
      ? Promise.resolve({ data: [] as LessonRow[] })
      : supabase
          .from("course_lessons")
          .select("*")
          .in("module_id", moduleIds)
          .order("sort_order", { ascending: true }),
    supabase
      .from("course_quizzes")
      .select("*")
      .eq("course_id", course.id)
      .order("sort_order", { ascending: true }),
  ]);

  const lessonsByModule = new Map<string, LessonRow[]>();
  for (const lesson of (lessons ?? []) as LessonRow[]) {
    const list = lessonsByModule.get(lesson.module_id) ?? [];
    list.push(lesson);
    lessonsByModule.set(lesson.module_id, list);
  }

  const quizzesByModule = new Map<string, QuizRow[]>();
  const finalQuizzes: QuizRow[] = [];
  for (const quiz of (quizzes ?? []) as QuizRow[]) {
    if (quiz.module_id) {
      const list = quizzesByModule.get(quiz.module_id) ?? [];
      list.push(quiz);
      quizzesByModule.set(quiz.module_id, list);
    } else {
      finalQuizzes.push(quiz);
    }
  }

  return {
    course: courseWithCategory,
    modules: ((modules ?? []) as ModuleRow[]).map((m) => ({
      ...m,
      lessons: lessonsByModule.get(m.id) ?? [],
      quizzes: quizzesByModule.get(m.id) ?? [],
    })),
    finalQuizzes,
  };
}

/** Lookup by course+lesson slug. */
export async function getLesson(
  courseSlug: string,
  lessonSlug: string,
  { includeDraft = false }: { includeDraft?: boolean } = {}
): Promise<{
  course: CourseWithCategory;
  module: ModuleRow;
  lesson: LessonRow;
} | null> {
  const outline = await getCourseOutline(courseSlug, { includeDraft });
  if (!outline) return null;
  for (const mod of outline.modules) {
    const l = mod.lessons.find((x) => x.slug === lessonSlug);
    if (l) return { course: outline.course, module: mod, lesson: l };
  }
  return null;
}

/** Flatten outline into lesson order. */
export function flattenLessons(outline: CourseOutline): LessonRow[] {
  const flat: LessonRow[] = [];
  for (const mod of outline.modules) {
    for (const lesson of mod.lessons) flat.push(lesson);
  }
  return flat;
}

/** Return quiz + questions + options (is_correct stripped) for student view. */
export async function getQuizForStudent(quizId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: quiz, error: quizErr } = await supabase
    .from("course_quizzes")
    .select("*")
    .eq("id", quizId)
    .maybeSingle();
  if (quizErr || !quiz) return null;

  const { data: questions } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("sort_order", { ascending: true });

  const { data: options } = await supabase
    .from("quiz_options")
    .select("id, question_id, label, sort_order")
    .in("question_id", (questions ?? []).map((q) => q.id))
    .order("sort_order", { ascending: true });

  return {
    quiz: quiz as QuizRow,
    questions: ((questions ?? []) as QuestionRow[]).map((q) => ({
      ...q,
      options: ((options ?? []) as Array<{ id: string; question_id: string; label: string; sort_order: number }>).filter(
        (o) => o.question_id === q.id
      ),
    })),
  };
}

/** Enrollment for a given Clerk user + course. */
export async function getEnrollment(userId: string, courseId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("course_enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) {
    console.error("[queries.getEnrollment]", error.message);
    return null;
  }
  return data as EnrollmentRow | null;
}

export async function getCompletedLessonIds(enrollmentId: string): Promise<Set<string>> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("lesson_completions")
    .select("lesson_id")
    .eq("enrollment_id", enrollmentId);
  if (error) {
    console.error("[queries.getCompletedLessonIds]", error.message);
    return new Set();
  }
  return new Set((data ?? []).map((r) => r.lesson_id));
}

export async function getPassedQuizIds(enrollmentId: string): Promise<Set<string>> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("quiz_attempts")
    .select("quiz_id, passed")
    .eq("enrollment_id", enrollmentId)
    .eq("passed", true);
  return new Set((data ?? []).map((r) => r.quiz_id));
}

export type MyCourseRow = EnrollmentRow & {
  course: {
    slug: string;
    title: string;
    subtitle: string | null;
    cover_image: string | null;
    duration_minutes: number | null;
  } | null;
  certificate: {
    enrollment_id: string;
    certificate_number: string;
    pdf_path: string | null;
  } | null;
};

/** All courses a user is enrolled in, with course metadata + certificate (if any). */
export async function listMyCourses(userId: string): Promise<MyCourseRow[]> {
  const admin = createSupabaseAdminClient();
  const { data: enrollments, error } = await admin
    .from("course_enrollments")
    .select("*")
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });
  if (error) {
    console.error("[queries.listMyCourses]", error.message);
    return [];
  }
  const list = (enrollments ?? []) as EnrollmentRow[];
  if (list.length === 0) return [];

  const courseIds = list.map((e) => e.course_id);
  const enrollmentIds = list.map((e) => e.id);
  const [{ data: courses }, { data: certs }] = await Promise.all([
    admin
      .from("courses")
      .select("id, slug, title, subtitle, cover_image, duration_minutes")
      .in("id", courseIds),
    admin
      .from("course_certificates")
      .select("enrollment_id, certificate_number, pdf_path")
      .in("enrollment_id", enrollmentIds),
  ]);

  const courseById = new Map((courses ?? []).map((c) => [c.id, c]));
  const certByEnrollment = new Map((certs ?? []).map((c) => [c.enrollment_id, c]));

  return list.map((e) => ({
    ...e,
    course: courseById.get(e.course_id) ?? null,
    certificate: certByEnrollment.get(e.id) ?? null,
  }));
}
