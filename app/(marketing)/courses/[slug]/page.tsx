import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  ArrowLeft, Clock, Users, Star, CheckCircle2, BookOpen, Award, Lock,
  PlayCircle, ChevronDown, ChevronRight, FileText, GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const levelLabel: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
};

async function getCourseData(slug: string, userId: string | null) {
  const db = getAdmin();

  const { data: course } = await db
    .from("courses")
    .select("*, course_categories(name_fr, gradient, color)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!course) return null;

  const [{ data: chapters }, { data: lessons }, { data: quizzes }] = await Promise.all([
    db.from("course_chapters").select("*").eq("course_id", course.id).eq("is_published", true).order("order_index"),
    db.from("course_lessons").select("id, chapter_id, slug, title_fr, duration_minutes, order_index, is_free_preview").eq("course_id", course.id).eq("is_published", true).order("order_index"),
    db.from("quizzes").select("id, chapter_id, title_fr, is_final_exam").eq("course_id", course.id),
  ]);

  let isEnrolled = false;
  let progress: string[] = [];

  if (userId) {
    const { data: enrollment } = await db
      .from("enrollments")
      .select("id, status")
      .eq("user_id", userId)
      .eq("course_id", course.id)
      .maybeSingle();
    isEnrolled = !!enrollment;

    if (isEnrolled) {
      const { data: prog } = await db
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId)
        .eq("course_id", course.id);
      progress = (prog ?? []).map((p: { lesson_id: string }) => p.lesson_id);
    }
  }

  const totalMinutes = (lessons ?? []).reduce((s, l) => s + l.duration_minutes, 0);

  return { course, chapters: chapters ?? [], lessons: lessons ?? [], quizzes: quizzes ?? [], isEnrolled, progress, totalMinutes };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = getAdmin();
  const { data: course } = await db.from("courses").select("title_fr, description_fr").eq("slug", slug).single();
  return {
    title: course?.title_fr ?? "Formation",
    description: course?.description_fr,
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { userId } = await auth();
  const data = await getCourseData(slug, userId);
  if (!data) notFound();

  const { course, chapters, lessons, quizzes, isEnrolled, progress, totalMinutes } = data;

  const firstLesson = lessons[0];
  const lastCompleted = lessons.filter(l => progress.includes(l.id)).pop();
  const nextLesson = lastCompleted
    ? lessons[lessons.findIndex(l => l.id === lastCompleted.id) + 1]
    : firstLesson;

  const progressPct = lessons.length > 0 ? Math.round((progress.length / lessons.length) * 100) : 0;
  const categoryGradient = (course.course_categories as { gradient?: string })?.gradient ?? "from-amber-600 to-orange-700";

  const getLessonsForChapter = (chapterId: string) =>
    lessons.filter(l => l.chapter_id === chapterId);

  const getQuizForChapter = (chapterId: string) =>
    quizzes.find(q => q.chapter_id === chapterId && !q.is_final_exam);

  const finalExam = quizzes.find(q => q.is_final_exam);

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="container mx-auto">
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Toutes les formations
        </Link>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* ===== MAIN CONTENT ===== */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course header */}
            <div>
              <Badge variant="default" className="mb-3 text-xs">
                {(course.course_categories as { name_fr?: string })?.name_fr ?? "Formation"}
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{course.title_fr}</h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">{course.description_fr}</p>

              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {Math.floor(totalMinutes / 60)}h{totalMinutes % 60 > 0 ? ` ${totalMinutes % 60}min` : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  {lessons.length} leçon{lessons.length > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  4.9
                </span>
                <Badge variant="outline" className="text-xs">{levelLabel[course.level] ?? course.level}</Badge>
                {course.is_free && <Badge variant="emerald" className="text-xs">Gratuit</Badge>}
              </div>

              {isEnrolled && lessons.length > 0 && (
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Votre progression</span>
                    <span className="text-sm font-bold text-primary">{progressPct}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mb-3">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {progress.length} / {lessons.length} leçons complétées
                  </p>
                </div>
              )}
            </div>

            {/* What you'll learn */}
            <div className="rounded-2xl border border-border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Ce que vous apprendrez
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Maîtriser les concepts fondamentaux",
                  "Analyser des cas pratiques réels",
                  "Appliquer les méthodes avancées",
                  "Obtenir une certification reconnue",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* About course */}
            {course.long_description_fr && (
              <div className="rounded-2xl border border-border p-6">
                <h2 className="text-xl font-bold mb-4">À propos de cette formation</h2>
                <p className="text-muted-foreground leading-relaxed">{course.long_description_fr}</p>
                {course.instructor && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                      {course.instructor.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{course.instructor}</p>
                      <p className="text-xs text-muted-foreground">Instructeur</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chapter / Lesson list */}
            <div>
              <h2 className="text-xl font-bold mb-4">Contenu de la formation</h2>
              <div className="space-y-3">
                {chapters.map((ch) => {
                  const chLessons = getLessonsForChapter(ch.id);
                  const chQuiz = getQuizForChapter(ch.id);
                  const chMinutes = chLessons.reduce((s, l) => s + l.duration_minutes, 0);
                  return (
                    <details key={ch.id} className="group rounded-xl border border-border overflow-hidden" open>
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors list-none">
                        <div className="flex items-center gap-3">
                          <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                          <span className="font-semibold text-sm">{ch.title_fr}</span>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {chLessons.length} leçon{chLessons.length > 1 ? "s" : ""} · {chMinutes}min
                        </span>
                      </summary>
                      <div className="divide-y divide-border">
                        {chLessons.map((lesson) => {
                          const done = progress.includes(lesson.id);
                          const canView = isEnrolled || lesson.is_free_preview;
                          return (
                            <div key={lesson.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors">
                              <div className="flex items-center gap-3">
                                {done ? (
                                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                ) : canView ? (
                                  <PlayCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                                ) : (
                                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                                )}
                                <span className="text-sm">{lesson.title_fr}</span>
                                {lesson.is_free_preview && (
                                  <Badge variant="emerald" className="text-xs py-0">Aperçu</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">{lesson.duration_minutes}min</span>
                                {canView && (
                                  <Link
                                    href={`/learn/${slug}/${lesson.slug}`}
                                    className="text-xs text-primary hover:underline"
                                  >
                                    {done ? "Revoir" : "Voir"}
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {chQuiz && (
                          <div className="flex items-center justify-between px-5 py-3 bg-muted/10">
                            <div className="flex items-center gap-3">
                              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                              <span className="text-sm text-amber-700 dark:text-amber-400">{chQuiz.title_fr}</span>
                            </div>
                            {isEnrolled && (
                              <Link
                                href={`/learn/${slug}/quiz?quiz=${chQuiz.id}`}
                                className="text-xs text-primary hover:underline"
                              >
                                Commencer
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}

                {finalExam && (
                  <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-sm">{finalExam.title_fr}</p>
                        <p className="text-xs text-muted-foreground">Passez l&apos;examen pour obtenir votre certificat</p>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <Link href={`/learn/${slug}/quiz?quiz=${finalExam.id}&final=true`}>
                        <Button size="sm">Passer l&apos;examen</Button>
                      </Link>
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-border overflow-hidden shadow-lg">
                {/* Course visual */}
                <div className={`h-48 bg-gradient-to-br ${categoryGradient} flex items-center justify-center`}>
                  <BookOpen className="w-16 h-16 text-white/40" />
                </div>

                <div className="p-6">
                  {/* Price */}
                  <div className="mb-4">
                    {course.is_free ? (
                      <div className="text-3xl font-bold text-emerald-600">Gratuit</div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold">
                          {Number(course.price).toLocaleString()} BIF
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Accès à vie · Certificat inclus</p>
                      </>
                    )}
                  </div>

                  {/* CTA */}
                  {isEnrolled ? (
                    <div className="space-y-2">
                      <Link href={`/learn/${slug}/${nextLesson?.slug ?? firstLesson?.slug ?? ""}`} className="block">
                        <Button className="w-full" size="lg">
                          <ChevronRight className="w-4 h-4" />
                          {progressPct > 0 ? "Continuer la formation" : "Commencer la formation"}
                        </Button>
                      </Link>
                      <p className="text-center text-xs text-muted-foreground">{progressPct}% complété</p>
                    </div>
                  ) : course.is_free ? (
                    <Link href={`/checkout/${slug}`} className="block">
                      <Button className="w-full" size="lg">
                        <GraduationCap className="w-4 h-4" />
                        S&apos;inscrire gratuitement
                      </Button>
                    </Link>
                  ) : (
                    <div className="space-y-2">
                      <Link href={`/checkout/${slug}`} className="block">
                        <Button className="w-full" size="lg">
                          S&apos;inscrire maintenant
                        </Button>
                      </Link>
                      {firstLesson?.is_free_preview && (
                        <Link href={`/learn/${slug}/${firstLesson.slug}`} className="block">
                          <Button variant="outline" className="w-full">
                            <PlayCircle className="w-4 h-4" />
                            Aperçu gratuit
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Features */}
                  <div className="mt-6 pt-5 border-t border-border space-y-3">
                    {[
                      { icon: Clock, text: `${course.duration} de contenu` },
                      { icon: BookOpen, text: `${lessons.length} leçons structurées` },
                      { icon: Award, text: "Certificat reconnu" },
                      { icon: GraduationCap, text: "Accès à vie" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Icon className="w-4 h-4 text-primary shrink-0" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
