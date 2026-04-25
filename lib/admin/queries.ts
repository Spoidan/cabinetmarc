import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Course = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  price_bif: number;
  level: string;
  author_id: string | null;
  category_id: string;
  category_name?: string;
  enrollments_count: number;
};

type CategoryWithCounts = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  course_count: number;
};

export async function adminDashboardStats() {
  const admin = createSupabaseAdminClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalStudents },
    { count: publishedCourses },
    { count: draftCourses },
    { count: activeEnrollments },
    { count: certificates30d },
    { count: students30d },
    { count: students60d },
    enrollmentsByDay,
    topCourses,
    recentEnrollments,
    needsAttention,
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    admin.from("courses").select("id", { count: "exact", head: true }).eq("is_published", true),
    admin.from("courses").select("id", { count: "exact", head: true }).eq("is_published", false),
    admin.from("course_enrollments").select("id", { count: "exact", head: true }).is("completed_at", null),
    admin
      .from("course_certificates")
      .select("id", { count: "exact", head: true })
      .gte("issued_at", thirtyDaysAgo),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student")
      .gte("created_at", thirtyDaysAgo),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student")
      .gte("created_at", sixtyDaysAgo)
      .lt("created_at", thirtyDaysAgo),
    admin
      .from("course_enrollments")
      .select("enrolled_at")
      .gte("enrolled_at", thirtyDaysAgo),
    admin
      .from("course_enrollments")
      .select("course_id"),
    admin
      .from("course_enrollments")
      .select("id, user_id, course_id, enrolled_at")
      .order("enrolled_at", { ascending: false })
      .limit(6),
    admin
      .from("courses")
      .select("id, title, slug, is_published, created_at, updated_at, published_at")
      .order("updated_at", { ascending: true })
      .limit(20),
  ]);

  // Bucket enrollments per day (last 30)
  const byDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of enrollmentsByDay.data ?? []) {
    const key = String(row.enrolled_at).slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  const series = [...byDay.entries()].map(([day, count]) => ({ day, count }));

  // Top 5 courses by enrollment count
  const countByCourse = new Map<string, number>();
  for (const row of topCourses.data ?? []) {
    countByCourse.set(row.course_id, (countByCourse.get(row.course_id) ?? 0) + 1);
  }
  const topIds = [...countByCourse.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topCourseIds = topIds.map(([id]) => id);
  const topCoursesRows = topCourseIds.length
    ? (
        await admin
          .from("courses")
          .select("id, title")
          .in("id", topCourseIds)
      ).data ?? []
    : [];
  const topCourseMap = new Map((topCoursesRows as { id: string; title: string }[]).map((c) => [c.id, c.title]));
  const topCoursesSeries = topIds.map(([id, count]) => ({
    name: topCourseMap.get(id) ?? "—",
    count,
  }));

  // Recent enrollments hydrate
  const recentIds = (recentEnrollments.data ?? []).map((r) => r.course_id);
  const recentUserIds = (recentEnrollments.data ?? []).map((r) => r.user_id);
  const [{ data: recentCourses }, { data: recentProfiles }] = await Promise.all([
    recentIds.length
      ? admin.from("courses").select("id, title, slug").in("id", recentIds)
      : Promise.resolve({ data: [] }),
    recentUserIds.length
      ? admin
          .from("profiles")
          .select("id, full_name, email")
          .in("id", recentUserIds)
      : Promise.resolve({ data: [] }),
  ]);
  const courseTitleById = new Map(
    ((recentCourses ?? []) as { id: string; title: string; slug: string }[]).map((c) => [c.id, c])
  );
  const profileById = new Map(
    ((recentProfiles ?? []) as { id: string; full_name: string | null; email: string | null }[]).map((p) => [p.id, p])
  );

  const recent = (recentEnrollments.data ?? []).map((row) => ({
    id: row.id,
    enrolled_at: row.enrolled_at,
    course: courseTitleById.get(row.course_id) ?? null,
    user:
      profileById.get(row.user_id) ?? { id: row.user_id, full_name: null, email: null },
  }));

  // Needs attention: drafts >14d old, or published with zero enrollments for 30d
  const cutoffDraft = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const cutoffPub = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const attention: Array<{
    id: string;
    title: string;
    slug: string;
    reason: string;
  }> = [];
  for (const c of (needsAttention.data ?? []) as Course[]) {
    if (!c.is_published && c.updated_at < cutoffDraft) {
      attention.push({ id: c.id, title: c.title, slug: c.slug, reason: "Brouillon > 14 jours" });
    } else if (c.is_published && (c.published_at ?? "") < cutoffPub) {
      const hasEnrollments = (countByCourse.get(c.id) ?? 0) > 0;
      if (!hasEnrollments) {
        attention.push({ id: c.id, title: c.title, slug: c.slug, reason: "0 inscription en 30 jours" });
      }
    }
  }

  const students30dDelta =
    (students60d ?? 0) === 0 && (students30d ?? 0) === 0
      ? 0
      : (students60d ?? 0) === 0
        ? 100
        : Math.round((((students30d ?? 0) - (students60d ?? 0)) / (students60d ?? 1)) * 100);

  return {
    totals: {
      students: totalStudents ?? 0,
      published: publishedCourses ?? 0,
      drafts: draftCourses ?? 0,
      activeEnrollments: activeEnrollments ?? 0,
      certificates30d: certificates30d ?? 0,
      students30dDelta,
    },
    series,
    topCoursesSeries,
    recent,
    attention: attention.slice(0, 8),
  };
}

/** Courses list for admin, with category name + enrollment count. */
export async function adminListCourses(): Promise<Course[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: courses }, { data: cats }, { data: enrolls }] = await Promise.all([
    admin
      .from("courses")
      .select(
        "id, title, slug, is_published, published_at, created_at, updated_at, price_bif, level, author_id, category_id"
      )
      .order("updated_at", { ascending: false }),
    admin.from("course_categories").select("id, name"),
    admin.from("course_enrollments").select("course_id"),
  ]);
  const catMap = new Map(((cats ?? []) as { id: string; name: string }[]).map((c) => [c.id, c.name]));
  const enrollMap = new Map<string, number>();
  for (const row of enrolls ?? []) {
    enrollMap.set(row.course_id, (enrollMap.get(row.course_id) ?? 0) + 1);
  }
  return ((courses ?? []) as Course[]).map((c) => ({
    ...c,
    category_name: catMap.get(c.category_id),
    enrollments_count: enrollMap.get(c.id) ?? 0,
  }));
}

export async function adminListCategories(): Promise<CategoryWithCounts[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: cats }, { data: courses }] = await Promise.all([
    admin
      .from("course_categories")
      .select("id, name, slug, description, icon, is_active, sort_order")
      .order("sort_order", { ascending: true }),
    admin.from("courses").select("category_id"),
  ]);
  const counts = new Map<string, number>();
  for (const row of courses ?? []) {
    counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }
  return ((cats ?? []) as Omit<CategoryWithCounts, "course_count">[]).map((c) => ({
    ...c,
    course_count: counts.get(c.id) ?? 0,
  }));
}

export type ProfileWithCount = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
  enrollments_count: number;
};

export async function adminListProfilesByRole(
  role: "student" | "instructor" | "admin",
  limit = 200
): Promise<ProfileWithCount[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: profiles }, { data: enrollments }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, email, role, avatar_url, created_at")
      .eq("role", role)
      .order("created_at", { ascending: false })
      .limit(limit),
    admin.from("course_enrollments").select("user_id"),
  ]);
  const counts = new Map<string, number>();
  for (const row of enrollments ?? []) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }
  return ((profiles ?? []) as Omit<ProfileWithCount, "enrollments_count">[]).map((p) => ({
    ...p,
    enrollments_count: counts.get(p.id) ?? 0,
  }));
}

/** @deprecated use adminListProfilesByRole("student") */
export async function adminListStudents(limit = 200) {
  return adminListProfilesByRole("student", limit);
}

export type LessonRowAdmin = {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number | null;
  is_free_preview: boolean;
  sort_order: number;
  module_id: string;
  module_title: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  course_published: boolean;
};

export async function adminListLessons(): Promise<LessonRowAdmin[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: lessons }, { data: modules }, { data: courses }] = await Promise.all([
    admin
      .from("course_lessons")
      .select("id, module_id, title, slug, duration_minutes, is_free_preview, sort_order")
      .order("sort_order", { ascending: true }),
    admin.from("course_modules").select("id, course_id, title, sort_order"),
    admin.from("courses").select("id, title, slug, is_published"),
  ]);
  const moduleById = new Map(
    ((modules ?? []) as Array<{ id: string; course_id: string; title: string; sort_order: number }>).map((m) => [m.id, m])
  );
  const courseById = new Map(
    ((courses ?? []) as Array<{ id: string; title: string; slug: string; is_published: boolean }>).map((c) => [c.id, c])
  );
  return ((lessons ?? []) as Array<{
    id: string;
    module_id: string;
    title: string;
    slug: string;
    duration_minutes: number | null;
    is_free_preview: boolean;
    sort_order: number;
  }>).map((l) => {
    const mod = moduleById.get(l.module_id);
    const course = mod ? courseById.get(mod.course_id) : null;
    return {
      id: l.id,
      title: l.title,
      slug: l.slug,
      duration_minutes: l.duration_minutes,
      is_free_preview: l.is_free_preview,
      sort_order: l.sort_order,
      module_id: l.module_id,
      module_title: mod?.title ?? "—",
      course_id: course?.id ?? "",
      course_title: course?.title ?? "—",
      course_slug: course?.slug ?? "",
      course_published: course?.is_published ?? false,
    };
  });
}

export type QuizRowAdmin = {
  id: string;
  title: string;
  pass_score_percent: number;
  module_id: string | null;
  module_title: string | null;
  course_id: string;
  course_title: string;
  course_slug: string;
  question_count: number;
  attempt_count: number;
};

export async function adminListQuizzes(): Promise<QuizRowAdmin[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: quizzes }, { data: modules }, { data: courses }, { data: questions }, { data: attempts }] =
    await Promise.all([
      admin
        .from("course_quizzes")
        .select("id, course_id, module_id, title, pass_score_percent, sort_order")
        .order("sort_order", { ascending: true }),
      admin.from("course_modules").select("id, title"),
      admin.from("courses").select("id, title, slug"),
      admin.from("quiz_questions").select("quiz_id"),
      admin.from("quiz_attempts").select("quiz_id"),
    ]);
  const moduleById = new Map(((modules ?? []) as Array<{ id: string; title: string }>).map((m) => [m.id, m]));
  const courseById = new Map(((courses ?? []) as Array<{ id: string; title: string; slug: string }>).map((c) => [c.id, c]));
  const qCount = new Map<string, number>();
  for (const r of questions ?? []) qCount.set(r.quiz_id, (qCount.get(r.quiz_id) ?? 0) + 1);
  const aCount = new Map<string, number>();
  for (const r of attempts ?? []) aCount.set(r.quiz_id, (aCount.get(r.quiz_id) ?? 0) + 1);
  return ((quizzes ?? []) as Array<{
    id: string;
    course_id: string;
    module_id: string | null;
    title: string;
    pass_score_percent: number;
    sort_order: number;
  }>).map((q) => {
    const course = courseById.get(q.course_id);
    const mod = q.module_id ? moduleById.get(q.module_id) : null;
    return {
      id: q.id,
      title: q.title,
      pass_score_percent: q.pass_score_percent,
      module_id: q.module_id,
      module_title: mod?.title ?? null,
      course_id: q.course_id,
      course_title: course?.title ?? "—",
      course_slug: course?.slug ?? "",
      question_count: qCount.get(q.id) ?? 0,
      attempt_count: aCount.get(q.id) ?? 0,
    };
  });
}

export async function adminProgressionStats() {
  const admin = createSupabaseAdminClient();
  const [{ data: enrollments }, { count: totalProfiles }] = await Promise.all([
    admin
      .from("course_enrollments")
      .select("id, course_id, user_id, progress_percent, completed_at, enrolled_at"),
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
  ]);
  const list = (enrollments ?? []) as Array<{
    id: string;
    course_id: string;
    user_id: string;
    progress_percent: number;
    completed_at: string | null;
    enrolled_at: string;
  }>;

  // Buckets: 0%, 1-25%, 26-50%, 51-75%, 76-99%, 100%
  const buckets = [
    { label: "0 %", min: 0, max: 0, count: 0 },
    { label: "1-25 %", min: 1, max: 25, count: 0 },
    { label: "26-50 %", min: 26, max: 50, count: 0 },
    { label: "51-75 %", min: 51, max: 75, count: 0 },
    { label: "76-99 %", min: 76, max: 99, count: 0 },
    { label: "Terminé", min: 100, max: 100, count: 0 },
  ];
  for (const e of list) {
    const p = e.progress_percent;
    for (const b of buckets) {
      if (p >= b.min && p <= b.max) {
        b.count += 1;
        break;
      }
    }
  }

  // Per-course averages
  const byCourse = new Map<string, { sum: number; n: number; completed: number }>();
  for (const e of list) {
    const cur = byCourse.get(e.course_id) ?? { sum: 0, n: 0, completed: 0 };
    cur.sum += e.progress_percent;
    cur.n += 1;
    if (e.completed_at) cur.completed += 1;
    byCourse.set(e.course_id, cur);
  }
  const courseIds = [...byCourse.keys()];
  const { data: courses } = courseIds.length
    ? await admin.from("courses").select("id, title").in("id", courseIds)
    : { data: [] };
  const courseTitle = new Map(((courses ?? []) as Array<{ id: string; title: string }>).map((c) => [c.id, c.title]));
  const perCourse = courseIds
    .map((cid) => {
      const v = byCourse.get(cid)!;
      return {
        course_id: cid,
        title: courseTitle.get(cid) ?? "—",
        average: v.n === 0 ? 0 : Math.round(v.sum / v.n),
        completed: v.completed,
        total: v.n,
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    totalEnrollments: list.length,
    totalStudents: totalProfiles ?? 0,
    completed: list.filter((e) => e.completed_at).length,
    buckets,
    perCourse,
  };
}

export async function adminListEnrollments(limit = 100) {
  const admin = createSupabaseAdminClient();
  const { data: enrollments } = await admin
    .from("course_enrollments")
    .select("id, user_id, course_id, enrolled_at, completed_at, progress_percent")
    .order("enrolled_at", { ascending: false })
    .limit(limit);
  const list = enrollments ?? [];
  if (list.length === 0) return [];
  const courseIds = list.map((e) => e.course_id);
  const userIds = list.map((e) => e.user_id);
  const [{ data: courses }, { data: profiles }] = await Promise.all([
    admin.from("courses").select("id, title, slug").in("id", courseIds),
    admin.from("profiles").select("id, full_name, email").in("id", userIds),
  ]);
  const courseById = new Map(((courses ?? []) as Array<{ id: string; title: string; slug: string }>).map((c) => [c.id, c]));
  const profileById = new Map(((profiles ?? []) as Array<{ id: string; full_name: string | null; email: string | null }>).map((p) => [p.id, p]));
  return list.map((e) => ({
    ...e,
    course: courseById.get(e.course_id) ?? null,
    user: profileById.get(e.user_id) ?? null,
  }));
}

export async function adminListCertificates(limit = 100) {
  const admin = createSupabaseAdminClient();
  const { data: certs } = await admin
    .from("course_certificates")
    .select("id, enrollment_id, certificate_number, issued_at, pdf_path")
    .order("issued_at", { ascending: false })
    .limit(limit);
  const list = certs ?? [];
  if (list.length === 0) return [];
  const enrollmentIds = list.map((c) => c.enrollment_id);
  const { data: enrollments } = await admin
    .from("course_enrollments")
    .select("id, user_id, course_id")
    .in("id", enrollmentIds);
  const enrollmentById = new Map(((enrollments ?? []) as Array<{ id: string; user_id: string; course_id: string }>).map((e) => [e.id, e]));
  const courseIds = Array.from(new Set((enrollments ?? []).map((e) => e.course_id)));
  const userIds = Array.from(new Set((enrollments ?? []).map((e) => e.user_id)));
  const [{ data: courses }, { data: profiles }] = await Promise.all([
    admin.from("courses").select("id, title, slug").in("id", courseIds),
    admin.from("profiles").select("id, full_name, email").in("id", userIds),
  ]);
  const courseById = new Map(((courses ?? []) as Array<{ id: string; title: string; slug: string }>).map((c) => [c.id, c]));
  const profileById = new Map(((profiles ?? []) as Array<{ id: string; full_name: string | null; email: string | null }>).map((p) => [p.id, p]));
  return list.map((c) => {
    const en = enrollmentById.get(c.enrollment_id);
    return {
      ...c,
      course: en ? courseById.get(en.course_id) ?? null : null,
      user: en ? profileById.get(en.user_id) ?? null : null,
    };
  });
}
