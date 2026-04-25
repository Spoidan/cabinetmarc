"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Circle, Lock, ChevronDown, HelpCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  CourseOutline,
  LessonRow,
  ModuleRow,
  QuizRow,
} from "@/lib/elearning/queries";

type Props = {
  courseSlug: string;
  outline: CourseOutline;
  currentLessonId: string | null;
  currentQuizId?: string | null;
  completedLessonIds: Set<string>;
  passedQuizIds: Set<string>;
  enrolled: boolean;
  mode: "student" | "preview";
};

export function LessonSidebar({
  courseSlug,
  outline,
  currentLessonId,
  currentQuizId,
  completedLessonIds,
  passedQuizIds,
  enrolled,
  mode,
}: Props) {
  const initialOpen = new Set<string>();
  for (const mod of outline.modules) {
    if (mod.lessons.some((l) => l.id === currentLessonId)) initialOpen.add(mod.id);
    if (mod.quizzes.some((q) => q.id === currentQuizId)) initialOpen.add(mod.id);
  }
  if (initialOpen.size === 0 && outline.modules[0]) initialOpen.add(outline.modules[0].id);

  const [openModules, setOpenModules] = React.useState<Set<string>>(initialOpen);

  const toggle = (id: string) =>
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <nav aria-label="Programme du cours" className="space-y-2">
      <div className="px-2 pb-3">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
          Programme
        </p>
        <p className="text-sm font-semibold truncate">{outline.course.title}</p>
      </div>
      {outline.modules.map((mod) => (
        <ModuleBlock
          key={mod.id}
          mod={mod}
          open={openModules.has(mod.id)}
          onToggle={() => toggle(mod.id)}
          courseSlug={courseSlug}
          currentLessonId={currentLessonId}
          currentQuizId={currentQuizId ?? null}
          completedLessonIds={completedLessonIds}
          passedQuizIds={passedQuizIds}
          enrolled={enrolled}
          mode={mode}
        />
      ))}
      {outline.finalQuizzes.length > 0 && (
        <div className="pt-3 space-y-1.5 border-t border-border">
          <p className="px-2 py-2 text-[11px] uppercase tracking-widest text-muted-foreground">
            Examen final
          </p>
          {outline.finalQuizzes.map((quiz) => (
            <QuizRow
              key={quiz.id}
              quiz={quiz}
              courseSlug={courseSlug}
              active={quiz.id === currentQuizId}
              passed={passedQuizIds.has(quiz.id)}
              enrolled={enrolled}
              mode={mode}
            />
          ))}
        </div>
      )}
    </nav>
  );
}

function ModuleBlock({
  mod,
  open,
  onToggle,
  courseSlug,
  currentLessonId,
  currentQuizId,
  completedLessonIds,
  passedQuizIds,
  enrolled,
  mode,
}: {
  mod: ModuleRow & { lessons: LessonRow[]; quizzes: QuizRow[] };
  open: boolean;
  onToggle: () => void;
  courseSlug: string;
  currentLessonId: string | null;
  currentQuizId: string | null;
  completedLessonIds: Set<string>;
  passedQuizIds: Set<string>;
  enrolled: boolean;
  mode: "student" | "preview";
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 px-2 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
      >
        <span className="truncate">{mod.title}</span>
        <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="mt-1 space-y-0.5">
          {mod.lessons.map((lesson) => (
            <li key={lesson.id}>
              <LessonLink
                lesson={lesson}
                courseSlug={courseSlug}
                active={lesson.id === currentLessonId}
                completed={completedLessonIds.has(lesson.id)}
                locked={mode === "student" && !enrolled && !lesson.is_free_preview}
                mode={mode}
              />
            </li>
          ))}
          {mod.quizzes.map((quiz) => (
            <li key={quiz.id}>
              <QuizRow
                quiz={quiz}
                courseSlug={courseSlug}
                active={quiz.id === currentQuizId}
                passed={passedQuizIds.has(quiz.id)}
                enrolled={enrolled}
                mode={mode}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LessonLink({
  lesson,
  courseSlug,
  active,
  completed,
  locked,
  mode,
}: {
  lesson: LessonRow;
  courseSlug: string;
  active: boolean;
  completed: boolean;
  locked: boolean;
  mode: "student" | "preview";
}) {
  const Icon = completed ? Check : active ? PlayCircle : locked ? Lock : Circle;
  const href = mode === "preview"
    ? `#lesson-${lesson.id}`
    : `/cours/${courseSlug}/apprendre/${lesson.slug}`;
  const disabled = locked && mode === "student";

  if (disabled) {
    return (
      <div
        className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-muted-foreground/70 cursor-not-allowed"
        aria-disabled
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate">{lesson.title}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors",
        active
          ? "bg-primary/10 text-primary font-semibold"
          : completed
            ? "text-foreground hover:bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={cn("w-4 h-4 shrink-0", completed && !active && "text-emerald-500")} />
      <span className="truncate">{lesson.title}</span>
      {lesson.is_free_preview && (
        <span className="ml-auto text-[10px] uppercase tracking-wider bg-accent/10 text-accent px-1.5 py-0.5 rounded">
          Aperçu
        </span>
      )}
    </Link>
  );
}

function QuizRow({
  quiz,
  courseSlug,
  active,
  passed,
  enrolled,
  mode,
}: {
  quiz: QuizRow;
  courseSlug: string;
  active: boolean;
  passed: boolean;
  enrolled: boolean;
  mode: "student" | "preview";
}) {
  const Icon = passed ? Check : HelpCircle;
  const href = mode === "preview"
    ? `#quiz-${quiz.id}`
    : `/cours/${courseSlug}/quiz/${quiz.id}`;
  const disabled = mode === "student" && !enrolled;
  if (disabled) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-muted-foreground/70 cursor-not-allowed">
        <Lock className="w-4 h-4 shrink-0" />
        <span className="truncate">{quiz.title}</span>
      </div>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors",
        active
          ? "bg-primary/10 text-primary font-semibold"
          : passed
            ? "text-foreground hover:bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Icon className={cn("w-4 h-4 shrink-0", passed && !active && "text-emerald-500")} />
      <span className="truncate">Quiz — {quiz.title}</span>
    </Link>
  );
}
