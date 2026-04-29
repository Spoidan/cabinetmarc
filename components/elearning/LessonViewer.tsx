"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Menu as MenuIcon,
  Paperclip,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type {
  CourseOutline,
  LessonRow,
  ModuleRow,
  QuizRow,
} from "@/lib/elearning/queries";
import { LessonSidebar } from "./LessonSidebar";
import { VideoPlayer } from "./VideoPlayer";
import { markLessonComplete } from "@/app/(elearning)/actions";
import { formatFileSize } from "@/lib/format";
import { cn } from "@/lib/utils";

type NavTarget =
  | { type: "lesson"; lesson: LessonRow; module: ModuleRow }
  | { type: "quiz"; quiz: QuizRow; module: ModuleRow | null };

type Props = {
  mode: "student" | "preview";
  courseSlug: string;
  outline: CourseOutline;
  currentLesson: LessonRow;
  currentModule: ModuleRow;
  lessonContentHtml: string; // sanitized
  videoSignedUrl: string | null; // for storage-hosted videos (server-signed before render)
  attachments: Array<{ name: string; path: string; size: number; mime: string; signedUrl: string | null }>;
  initialCompletedIds: string[];
  initialPassedQuizIds: string[];
  enrolled: boolean;
};

function findPrevNext(outline: CourseOutline, lessonId: string): { prev: NavTarget | null; next: NavTarget | null } {
  const seq: NavTarget[] = [];
  for (const mod of outline.modules) {
    for (const l of mod.lessons) seq.push({ type: "lesson", lesson: l, module: mod });
    for (const q of mod.quizzes) seq.push({ type: "quiz", quiz: q, module: mod });
  }
  for (const q of outline.finalQuizzes) seq.push({ type: "quiz", quiz: q, module: null });
  const idx = seq.findIndex((t) => t.type === "lesson" && t.lesson.id === lessonId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? seq[idx - 1] : null,
    next: idx < seq.length - 1 ? seq[idx + 1] : null,
  };
}

function hrefFor(courseSlug: string, target: NavTarget | null) {
  if (!target) return null;
  if (target.type === "lesson") {
    return `/cours/${courseSlug}/apprendre/${target.lesson.slug}`;
  }
  return `/cours/${courseSlug}/quiz/${target.quiz.id}`;
}

function previewHrefFor(courseId: string, target: NavTarget | null) {
  if (!target) return null;
  if (target.type === "lesson") {
    return `/admin/cours/${courseId}/apercu?lecon=${target.lesson.slug}`;
  }
  return null;
}

export function LessonViewer({
  mode,
  courseSlug,
  outline,
  currentLesson,
  currentModule,
  lessonContentHtml,
  videoSignedUrl,
  attachments,
  initialCompletedIds,
  initialPassedQuizIds,
  enrolled,
}: Props) {
  const router = useRouter();
  const [completedIds, setCompletedIds] = React.useState<Set<string>>(
    () => new Set(initialCompletedIds)
  );
  const passedQuizIds = React.useMemo(() => new Set(initialPassedQuizIds), [initialPassedQuizIds]);
  const [pending, startTransition] = React.useTransition();

  const { prev, next } = React.useMemo(
    () => findPrevNext(outline, currentLesson.id),
    [outline, currentLesson.id]
  );

  const totalLessons = outline.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const percent = totalLessons === 0 ? 0 : Math.round((completedIds.size / totalLessons) * 100);

  const isCompleted = completedIds.has(currentLesson.id);
  const videoSrc = currentLesson.video_url
    ? /^https?:\/\//i.test(currentLesson.video_url)
      ? currentLesson.video_url
      : videoSignedUrl
    : null;

  const markDone = () => {
    if (mode !== "student") {
      toast(`Désactivé en mode aperçu`);
      return;
    }
    if (isCompleted) return;
    // optimistic
    setCompletedIds((prev) => new Set(prev).add(currentLesson.id));
    startTransition(async () => {
      const res = await markLessonComplete(courseSlug, currentLesson.id);
      if (!res.ok) {
        setCompletedIds((prev) => {
          const next = new Set(prev);
          next.delete(currentLesson.id);
          return next;
        });
        toast.error(res.error);
        return;
      }
      toast.success("Leçon terminée");
      router.refresh();
    });
  };

  const nextHref = mode === "preview"
    ? previewHrefFor(outline.course.id, next)
    : hrefFor(courseSlug, next);
  const prevHref = mode === "preview"
    ? previewHrefFor(outline.course.id, prev)
    : hrefFor(courseSlug, prev);

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block border-r border-border bg-card sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto p-3">
        <LessonSidebar
          courseSlug={courseSlug}
          outline={outline}
          currentLessonId={currentLesson.id}
          completedLessonIds={completedIds}
          passedQuizIds={passedQuizIds}
          enrolled={enrolled}
          mode={mode}
        />
      </aside>

      {/* Main */}
      <div className="min-w-0">
        <div className="px-4 sm:px-8 py-5">
          {mode === "preview" && (
            <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-amber-800 dark:text-amber-200 font-medium">
                Mode Aperçu — ce que l&apos;étudiant verra
              </span>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/admin/cours/${outline.course.id}/editer`}>
                  Revenir à l&apos;édition
                </Link>
              </Button>
            </div>
          )}
          <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-muted-foreground flex items-center gap-1.5">
            <Link href="/cours" className="hover:text-foreground">
              Cours
            </Link>
            <span>/</span>
            <Link href={`/cours/${courseSlug}`} className="hover:text-foreground truncate max-w-[14rem]">
              {outline.course.title}
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[14rem]">{currentModule.title}</span>
          </nav>

          <div className="mb-5">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${percent}%` }}
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
              <span>Progression : {percent}%</span>
              <span>{completedIds.size} / {totalLessons} leçons</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">{currentLesson.title}</h1>

          {videoSrc ? (
            <div className="mb-8">
              <VideoPlayer src={videoSrc} title={currentLesson.title} />
            </div>
          ) : null}

          <article
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: lessonContentHtml }}
          />

          {attachments.length > 0 && (
            <section className="mt-10 rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Pièces jointes
              </h2>
              <ul className="space-y-2">
                {attachments.map((att) => (
                  <li key={att.path} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{att.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(att.size)} · {att.mime}
                      </p>
                    </div>
                    {att.signedUrl ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={att.signedUrl} target="_blank" rel="noreferrer">
                          <Download className="w-4 h-4" />
                          Télécharger
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Indisponible</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-border">
            <div className="flex gap-2">
              {prevHref ? (
                <Button variant="outline" asChild>
                  <Link href={prevHref}>
                    <ArrowLeft className="w-4 h-4" />
                    Précédent
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  <ArrowLeft className="w-4 h-4" />
                  Précédent
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={isCompleted ? "outline" : "default"}
                onClick={markDone}
                disabled={pending || mode !== "student"}
                title={mode === "preview" ? "Désactivé en mode aperçu" : undefined}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Terminée
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Marquer comme terminé
                  </>
                )}
              </Button>
              {nextHref ? (
                <Button asChild>
                  <Link href={nextHref}>
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <Button disabled>
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile programme sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              "lg:hidden fixed bottom-5 right-5 z-40 h-12 rounded-full shadow-lg px-4 flex items-center gap-2 bg-foreground text-background font-medium"
            )}
            aria-label="Ouvrir le programme"
          >
            <MenuIcon className="w-4 h-4" />
            Programme
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[85vw] max-w-sm p-4 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Programme</SheetTitle>
          </SheetHeader>
          <div className="mt-3">
            <LessonSidebar
              courseSlug={courseSlug}
              outline={outline}
              currentLessonId={currentLesson.id}
              completedLessonIds={completedIds}
              passedQuizIds={passedQuizIds}
              enrolled={enrolled}
              mode={mode}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
