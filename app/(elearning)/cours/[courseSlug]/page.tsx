export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Clock, GraduationCap, PlayCircle, BookOpen, Users, Check } from "lucide-react";
import { getCourseOutline, getEnrollment } from "@/lib/elearning/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { formatBIF, formatDuration } from "@/lib/format";
import { levelLabel } from "@/components/elearning/CourseCard";
import { EnrollButton } from "@/components/elearning/EnrollButton";
import { sanitizeLessonHtml } from "@/lib/elearning/sanitize";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug } = await params;
  const outline = await getCourseOutline(courseSlug);
  if (!outline) return { title: "Cours introuvable" };
  return {
    title: outline.course.title,
    description: outline.course.subtitle ?? undefined,
  };
}

export default async function CourseLandingPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const outline = await getCourseOutline(courseSlug);
  if (!outline) notFound();

  const { course, modules, finalQuizzes } = outline;

  const { userId } = await auth();
  const enrollment = userId ? await getEnrollment(userId, course.id) : null;
  const isEnrolled = Boolean(enrollment);

  let continueHref: string | null = null;
  if (enrollment) {
    const admin = createSupabaseAdminClient();
    const { data: completions } = await admin
      .from("lesson_completions")
      .select("lesson_id")
      .eq("enrollment_id", enrollment.id);
    const done = new Set((completions ?? []).map((c) => c.lesson_id));
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        if (!done.has(lesson.id)) {
          continueHref = `/cours/${courseSlug}/apprendre/${lesson.slug}`;
          break;
        }
      }
      if (continueHref) break;
    }
    if (!continueHref && modules[0]?.lessons[0]) {
      continueHref = `/cours/${courseSlug}/apprendre/${modules[0].lessons[0].slug}`;
    }
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalQuizzes =
    modules.reduce((acc, m) => acc + m.quizzes.length, 0) + finalQuizzes.length;

  return (
    <div>
      {/* Hero — light background, dark text, sidebar card */}
      <section className="bg-muted/40 border-b border-border">
        <div className="container mx-auto py-14 lg:py-20 grid lg:grid-cols-[1fr_400px] gap-10 items-start">
          <div>
            <Link
              href={`/cours?categorie=${course.category?.slug ?? ""}`}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground mb-4"
            >
              {course.category?.name ?? "Cours"}
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">{course.subtitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline">
                <GraduationCap className="w-3 h-3" />
                {levelLabel(course.level)}
              </Badge>
              {course.duration_minutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatDuration(course.duration_minutes)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {totalLessons} leçons · {totalQuizzes} quiz
              </span>
            </div>
          </div>

          {/* Sidebar card */}
          <aside className="rounded-2xl bg-card text-foreground shadow-xl overflow-hidden border border-border">
            <div className="relative aspect-[16/9] bg-muted">
              {course.cover_image ? (
                <Image
                  src={course.cover_image}
                  alt={course.title}
                  fill
                  sizes="400px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/5">
                  <GraduationCap className="w-12 h-12 text-primary/70" aria-hidden />
                </div>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-baseline gap-2">
                {course.price_bif === 0 ? (
                  <span className="text-emerald-600 font-bold text-xl">Gratuit</span>
                ) : (
                  <span className="text-xl font-bold">{formatBIF(course.price_bif)}</span>
                )}
              </div>
              {continueHref ? (
                <Button asChild size="lg" className="w-full">
                  <Link href={continueHref}>
                    <PlayCircle className="w-4 h-4" />
                    Continuer le cours
                  </Link>
                </Button>
              ) : (
                <EnrollButton
                  courseSlug={course.slug}
                  price={course.price_bif}
                  isSignedIn={Boolean(userId)}
                  isEnrolled={isEnrolled}
                />
              )}
              <p className="text-xs text-muted-foreground text-center">
                Accès immédiat · Apprentissage à votre rythme
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Tabs */}
      <section className="container mx-auto py-12">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="program">Programme</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            {course.description ? (
              <article
                className="prose prose-neutral dark:prose-invert max-w-3xl"
                dangerouslySetInnerHTML={{ __html: sanitizeLessonHtml(course.description) }}
              />
            ) : (
              <p className="text-muted-foreground">Description à venir.</p>
            )}
          </TabsContent>
          <TabsContent value="program" className="mt-6 max-w-3xl">
            <Accordion type="multiple" defaultValue={modules.map((m) => m.id)}>
              {modules.map((mod, modIndex) => (
                <AccordionItem key={mod.id} value={mod.id}>
                  <AccordionTrigger>
                    <span className="text-sm">
                      <span className="text-muted-foreground mr-2">{modIndex + 1}.</span>
                      {mod.title}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1.5">
                      {mod.lessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{lesson.title}</span>
                          {lesson.duration_minutes ? (
                            <span className="ml-auto text-xs">
                              {formatDuration(lesson.duration_minutes)}
                            </span>
                          ) : null}
                          {lesson.is_free_preview && (
                            <Badge variant="outline" className="ml-auto text-[10px]">
                              Aperçu gratuit
                            </Badge>
                          )}
                        </li>
                      ))}
                      {mod.quizzes.map((quiz) => (
                        <li key={quiz.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-3.5 h-3.5 shrink-0 text-primary" />
                          <span>Quiz — {quiz.title}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {finalQuizzes.length > 0 && (
              <div className="mt-6 rounded-2xl border border-border p-4 bg-muted/30">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Examen final
                </p>
                <ul className="space-y-1.5">
                  {finalQuizzes.map((q) => (
                    <li key={q.id} className="flex items-center gap-2 text-sm">
                      <Users className="w-3.5 h-3.5" />
                      {q.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <p className="text-muted-foreground">Les avis seront bientôt disponibles.</p>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
