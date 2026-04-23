"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2, Circle, Lock, ChevronLeft, ChevronRight,
  Menu, X, BookOpen, GraduationCap, Trophy, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { marked } from "marked";

interface Lesson {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string;
  content_fr: string;
  content_en: string;
  duration_minutes: number;
  is_free_preview: boolean;
  chapter_id: string;
  course_id: string;
  order_index: number;
}

interface Chapter {
  id: string;
  title_fr: string;
  order_index: number;
}

interface Quiz {
  id: string;
  title_fr: string;
  is_final_exam: boolean;
  chapter_id: string | null;
  course_id: string;
}

interface CourseData {
  course: { id: string; title_fr: string; slug: string };
  chapters: Chapter[];
  lessons: Lesson[];
  quizzes: Quiz[];
  isEnrolled: boolean;
  progress: string[];
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;
  const lessonSlug = params.lessonSlug as string;

  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [marking, setMarking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourse = useCallback(async () => {
    const res = await fetch(`/api/courses/${courseSlug}`);
    if (!res.ok) return;
    const json = await res.json();
    setCourseData(json);
    setProgress(json.progress ?? []);
  }, [courseSlug]);

  const fetchLesson = useCallback(async () => {
    const res = await fetch(`/api/lessons/${lessonSlug}`);
    if (res.status === 403) {
      setError("Vous devez être inscrit pour accéder à cette leçon.");
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError("Leçon introuvable.");
      setLoading(false);
      return;
    }
    const json = await res.json();
    setLesson(json.lesson);
    setLoading(false);
  }, [lessonSlug]);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchCourse(), fetchLesson()]);
  }, [fetchCourse, fetchLesson]);

  const markComplete = async () => {
    if (!lesson || !courseData) return;
    setMarking(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: lesson.id, course_id: lesson.course_id }),
    });
    if (res.ok) {
      const json = await res.json();
      setProgress((p) => [...new Set([...p, lesson.id])]);
      if (json.course_completed) {
        const finalQuiz = courseData.quizzes.find((q) => q.is_final_exam);
        if (finalQuiz) {
          router.push(`/learn/${courseSlug}/quiz?quiz_id=${finalQuiz.id}`);
          return;
        }
      }
      goNext();
    }
    setMarking(false);
  };

  // Build ordered lesson list across all chapters
  const orderedLessons: Lesson[] = courseData
    ? [...courseData.lessons].sort((a, b) => {
        const ca = courseData.chapters.find((c) => c.id === a.chapter_id);
        const cb = courseData.chapters.find((c) => c.id === b.chapter_id);
        if (!ca || !cb) return 0;
        if (ca.order_index !== cb.order_index) return ca.order_index - cb.order_index;
        return a.order_index - b.order_index;
      })
    : [];

  const currentIndex = orderedLessons.findIndex((l) => l.slug === lessonSlug);
  const prevLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < orderedLessons.length - 1 ? orderedLessons[currentIndex + 1] : null;

  const goNext = () => {
    if (nextLesson) {
      router.push(`/learn/${courseSlug}/${nextLesson.slug}`);
    } else {
      // Last lesson — go to final exam if exists
      const finalQuiz = courseData?.quizzes.find((q) => q.is_final_exam);
      if (finalQuiz) {
        router.push(`/learn/${courseSlug}/quiz?quiz_id=${finalQuiz.id}`);
      }
    }
  };

  const isCompleted = (lessonId: string) => progress.includes(lessonId);
  const isCurrentLesson = (l: Lesson) => l.slug === lessonSlug;

  // Group lessons by chapter for sidebar
  const lessonsByChapter = courseData
    ? courseData.chapters
        .sort((a, b) => a.order_index - b.order_index)
        .map((ch) => ({
          chapter: ch,
          lessons: courseData.lessons
            .filter((l) => l.chapter_id === ch.id)
            .sort((a, b) => a.order_index - b.order_index),
          quiz: courseData.quizzes.find((q) => q.chapter_id === ch.id && !q.is_final_exam),
        }))
    : [];

  const finalQuiz = courseData?.quizzes.find((q) => q.is_final_exam);
  const completedCount = progress.length;
  const totalLessons = courseData?.lessons.length ?? 0;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Sidebar component
  const Sidebar = () => (
    <aside className="w-72 bg-card border-r border-border h-full overflow-y-auto flex flex-col">
      {/* Course header */}
      <div className="p-4 border-b border-border">
        <Link
          href={`/courses/${courseSlug}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-3"
        >
          <ArrowLeft className="w-3 h-3" />
          Retour au cours
        </Link>
        <h2 className="font-semibold text-sm leading-tight">
          {courseData?.course.title_fr ?? "Chargement..."}
        </h2>
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{completedCount}/{totalLessons} leçons</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chapter/lesson tree */}
      <nav className="flex-1 p-2">
        {lessonsByChapter.map(({ chapter, lessons, quiz }) => (
          <div key={chapter.id} className="mb-1">
            {/* Chapter header */}
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {chapter.title_fr}
            </div>

            {/* Lessons */}
            {lessons.map((l) => {
              const done = isCompleted(l.id);
              const current = isCurrentLesson(l);
              const locked = !courseData?.isEnrolled && !l.is_free_preview;

              return (
                <Link
                  key={l.id}
                  href={locked ? "#" : `/learn/${courseSlug}/${l.slug}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
                    current
                      ? "bg-primary/10 text-primary font-medium"
                      : done
                      ? "text-muted-foreground hover:bg-muted"
                      : locked
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {locked ? (
                    <Lock className="w-3.5 h-3.5 shrink-0 text-muted-foreground/40" />
                  ) : done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-500" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 shrink-0 text-muted-foreground/40" />
                  )}
                  <span className="truncate">{l.title_fr}</span>
                  {l.is_free_preview && !courseData?.isEnrolled && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1 ml-auto shrink-0">
                      Gratuit
                    </Badge>
                  )}
                </Link>
              );
            })}

            {/* Chapter quiz */}
            {quiz && courseData?.isEnrolled && (
              <Link
                href={`/learn/${courseSlug}/quiz?quiz_id=${quiz.id}`}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mb-0.5"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span className="truncate italic">{quiz.title_fr}</span>
              </Link>
            )}
          </div>
        ))}

        {/* Final exam */}
        {finalQuiz && courseData?.isEnrolled && (
          <div className="mt-2 border-t border-border pt-2">
            <Link
              href={`/learn/${courseSlug}/quiz?quiz_id=${finalQuiz.id}`}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              {finalQuiz.title_fr}
            </Link>
          </div>
        )}

        {/* Certificate link */}
        {progressPct === 100 && (
          <div className="mt-2 border-t border-border pt-2">
            <Link
              href={`/learn/${courseSlug}/certificate`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              Mon certificat
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">{error}</h2>
        <Link href={`/courses/${courseSlug}`}>
          <Button>Voir le cours</Button>
        </Link>
      </div>
    );
  }

  const htmlContent = lesson?.content_fr
    ? (marked.parse(lesson.content_fr) as string)
    : "";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 h-full">
            <Sidebar />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card flex items-center gap-4 px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold truncate">{lesson?.title_fr}</h1>
          </div>

          {lesson && isCompleted(lesson.id) && (
            <Badge className="bg-green-500 text-white shrink-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Complétée
            </Badge>
          )}
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Lesson content */}
            <article
              className="prose prose-neutral dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-strong:text-foreground
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-muted prose-pre:border prose-pre:border-border
                prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>

        {/* Bottom navigation */}
        <footer className="border-t border-border bg-card px-6 py-4 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            {/* Prev */}
            <div>
              {prevLesson ? (
                <Link href={`/learn/${courseSlug}/${prevLesson.slug}`}>
                  <Button variant="outline" className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Précédent</span>
                  </Button>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* Mark complete */}
            {courseData?.isEnrolled && lesson && !isCompleted(lesson.id) && (
              <Button
                onClick={markComplete}
                disabled={marking}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <CheckCircle2 className="w-4 h-4" />
                {marking ? "Enregistrement..." : "Marquer comme terminé"}
              </Button>
            )}

            {/* Next */}
            <div>
              {nextLesson ? (
                <Link href={`/learn/${courseSlug}/${nextLesson.slug}`}>
                  <Button variant="outline" className="gap-2">
                    <span className="hidden sm:inline">Suivant</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : finalQuiz && courseData?.isEnrolled ? (
                <Link href={`/learn/${courseSlug}/quiz?quiz_id=${finalQuiz.id}`}>
                  <Button className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                    <Trophy className="w-4 h-4" />
                    Examen final
                  </Button>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
