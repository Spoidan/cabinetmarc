"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  CircleDot,
  Settings,
  Loader2,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TipTapEditor } from "./TipTapEditor";
import { LessonAttachmentList } from "./LessonAttachmentList";
import { CoverImageUploader } from "./CoverImageUploader";
import { QuizEditor } from "./QuizEditor";
import { PublishModal } from "./PublishModal";
import { AutosavePill } from "./AutosavePill";
import { ConfirmDialog } from "./ConfirmDialog";
import { cn, slugify } from "@/lib/utils";
import { formatBIF } from "@/lib/format";
import {
  updateCourseMeta,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  reorderLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  createQuiz,
  updateQuiz,
  deleteQuiz,
} from "@/app/(admin)/admin/cours/[id]/editor-actions";
import type { CourseOutline } from "@/lib/elearning/queries";
import type { LessonAttachment } from "@/types/database";

type Selection =
  | { kind: "course" }
  | { kind: "module"; id: string }
  | { kind: "lesson"; id: string }
  | { kind: "quiz"; id: string };

type Props = {
  outline: CourseOutline;
  categories: { id: string; name: string }[];
};

export function CourseEditor({ outline, categories }: Props) {
  const router = useRouter();
  const { course, modules, finalQuizzes } = outline;

  const [selection, setSelection] = React.useState<Selection>({ kind: "course" });
  const [savedAt, setSavedAt] = React.useState<Date | null>(null);
  const [pending, setPending] = React.useState(false);
  const [previewVisitedThisSession, setPreviewVisitedThisSession] = React.useState(false);
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<
    | { kind: "module"; id: string; title: string }
    | { kind: "lesson"; id: string; title: string }
    | { kind: "quiz"; id: string; title: string }
    | null
  >(null);

  const refresh = React.useCallback(() => router.refresh(), [router]);

  const announceSaved = () => {
    setSavedAt(new Date());
    setPending(false);
  };
  const onSaveStart = () => {
    setPending(true);
  };

  const addModule = async () => {
    onSaveStart();
    const res = await createModule(course.id, "Nouveau module");
    if (!res.ok) {
      toast.error(res.error);
      setPending(false);
      return;
    }
    announceSaved();
    if (res.data) setSelection({ kind: "module", id: res.data.id });
    refresh();
  };

  const handleModuleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = modules.map((m) => m.id);
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(ids, oldIdx, newIdx);
    onSaveStart();
    const res = await reorderModules(course.id, next);
    if (!res.ok) toast.error(res.error);
    announceSaved();
    refresh();
  };

  const handleLessonDragEnd = async (moduleId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const ids = mod.lessons.map((l) => l.id);
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(ids, oldIdx, newIdx);
    onSaveStart();
    const res = await reorderLessons(moduleId, next);
    if (!res.ok) toast.error(res.error);
    announceSaved();
    refresh();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addLesson = async (moduleId: string) => {
    onSaveStart();
    const res = await createLesson(moduleId, {
      title: "Nouvelle leçon",
      slug: `lecon-${Date.now().toString(36)}`,
    });
    if (!res.ok) {
      toast.error(res.error);
      setPending(false);
      return;
    }
    announceSaved();
    if (res.data) setSelection({ kind: "lesson", id: res.data.id });
    refresh();
  };

  const addQuiz = async (moduleId: string | null) => {
    onSaveStart();
    const res = await createQuiz(course.id, {
      title: moduleId ? "Quiz de module" : "Examen final",
      module_id: moduleId,
    });
    if (!res.ok) {
      toast.error(res.error);
      setPending(false);
      return;
    }
    announceSaved();
    if (res.data) setSelection({ kind: "quiz", id: res.data.id });
    refresh();
  };

  const performDelete = async () => {
    if (!confirmDelete) return;
    onSaveStart();
    let error: string | null = null;
    if (confirmDelete.kind === "module") {
      const res = await deleteModule(confirmDelete.id);
      if (!res.ok) error = res.error;
    } else if (confirmDelete.kind === "lesson") {
      const res = await deleteLesson(confirmDelete.id);
      if (!res.ok) error = res.error;
    } else {
      const res = await deleteQuiz(confirmDelete.id);
      if (!res.ok) error = res.error;
    }
    if (error) toast.error(error);
    else toast.success("Élément supprimé.");
    setConfirmDelete(null);
    setSelection({ kind: "course" });
    announceSaved();
    refresh();
  };

  const allLessons = modules.flatMap((m) => m.lessons);
  const allQuizzes = [...modules.flatMap((m) => m.quizzes), ...finalQuizzes];

  return (
    <div className="-m-6 lg:-m-8 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] min-h-[calc(100vh-4rem)]">
      {/* Outline */}
      <aside className="border-r border-border bg-card overflow-y-auto p-3 lg:max-h-[calc(100vh-4rem)] lg:sticky lg:top-16 lg:self-start">
        <button
          type="button"
          onClick={() => setSelection({ kind: "course" })}
          className={cn(
            "w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors",
            selection.kind === "course"
              ? "bg-primary/10 text-primary"
              : "hover:bg-muted"
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="truncate">{course.title || "Métadonnées du cours"}</span>
        </button>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleModuleDragEnd}
        >
          <SortableContext
            items={modules.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="mt-4 space-y-3">
              {modules.map((mod, idx) => (
                <SortableModule
                  key={mod.id}
                  id={mod.id}
                >
                  <div className="rounded-lg border border-border bg-card">
                    <div className="flex items-center px-2 py-1.5 gap-1">
                      <SortableHandle title="Glisser pour réordonner le module" />
                      <button
                        type="button"
                        onClick={() => setSelection({ kind: "module", id: mod.id })}
                        className={cn(
                          "flex-1 text-left text-sm font-medium px-2 py-1 rounded truncate",
                          selection.kind === "module" && selection.id === mod.id
                            ? "text-primary"
                            : "hover:text-foreground"
                        )}
                      >
                        {idx + 1}. {mod.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete({ kind: "module", id: mod.id, title: mod.title })}
                        className="w-6 h-6 rounded hover:bg-destructive/10 text-destructive/80 flex items-center justify-center"
                        title="Supprimer le module"
                        aria-label="Supprimer le module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <ul className="px-2 pb-2 space-y-0.5">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handleLessonDragEnd(mod.id, e)}
                      >
                        <SortableContext
                          items={mod.lessons.map((l) => l.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {mod.lessons.map((lesson) => (
                            <SortableLessonRow
                              key={lesson.id}
                              id={lesson.id}
                            >
                              <div
                                className={cn(
                                  "flex items-center gap-1.5 rounded text-xs",
                                  selection.kind === "lesson" && selection.id === lesson.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                              >
                                <SortableHandle compact title="Glisser pour réordonner la leçon" />
                                <button
                                  type="button"
                                  onClick={() => setSelection({ kind: "lesson", id: lesson.id })}
                                  className="flex-1 flex items-center gap-2 px-1 py-1.5 text-left"
                                >
                                  <CircleDot className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{lesson.title}</span>
                                </button>
                              </div>
                            </SortableLessonRow>
                          ))}
                        </SortableContext>
                      </DndContext>
                      {mod.quizzes.map((quiz) => (
                        <li key={quiz.id}>
                          <button
                            type="button"
                            onClick={() => setSelection({ kind: "quiz", id: quiz.id })}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs",
                              selection.kind === "quiz" && selection.id === quiz.id
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <CheckCircle2 className="w-3 h-3 shrink-0 text-amber-500" />
                            <span className="truncate">Quiz — {quiz.title}</span>
                          </button>
                        </li>
                      ))}
                      <li className="grid grid-cols-2 gap-1 mt-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addLesson(mod.id)}
                          className="h-7 text-xs"
                        >
                          <Plus className="w-3 h-3" /> Leçon
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addQuiz(mod.id)}
                          className="h-7 text-xs"
                        >
                          <Plus className="w-3 h-3" /> Quiz
                        </Button>
                      </li>
                    </ul>
                  </div>
                </SortableModule>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {finalQuizzes.length > 0 && (
            <div className="rounded-lg border border-border p-2 space-y-0.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2 pb-1">
                Examen final
              </p>
              {finalQuizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  type="button"
                  onClick={() => setSelection({ kind: "quiz", id: quiz.id })}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs",
                    selection.kind === "quiz" && selection.id === quiz.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <CheckCircle2 className="w-3 h-3 shrink-0 text-amber-500" />
                  <span className="truncate">{quiz.title}</span>
                </button>
              ))}
            </div>
          )}

        <Button variant="outline" className="w-full" onClick={addModule}>
          <Plus className="w-4 h-4" /> Module
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => addQuiz(null)}>
          <Plus className="w-4 h-4" /> Quiz final
        </Button>
      </aside>

      <div className="flex flex-col">
        <div className="border-b border-border bg-card px-6 py-3 flex items-center gap-3 sticky top-16 z-10">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Link href="/admin/cours" className="hover:text-foreground">
              Cours
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium truncate max-w-xs">
              {course.title || "Sans titre"}
            </span>
          </p>
          <AutosavePill savedAt={savedAt} pending={pending} />
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              onClick={() => setPreviewVisitedThisSession(true)}
            >
              <Link href={`/admin/cours/${course.id}/apercu`} target="_blank">
                <Eye className="w-4 h-4" />
                Aperçu
              </Link>
            </Button>
            <Button
              size="sm"
              onClick={() => setPublishOpen(true)}
              disabled={course.is_published}
            >
              {course.is_published ? "Publié" : "Publier"}
            </Button>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6 overflow-y-auto">
          {selection.kind === "course" && (
            <CourseMetaPanel
              course={course}
              categories={categories}
              onSaveStart={onSaveStart}
              onSaved={announceSaved}
              onError={toast.error}
              refresh={refresh}
            />
          )}
          {selection.kind === "module" && (() => {
            const mod = modules.find((m) => m.id === selection.id);
            if (!mod) return <p className="text-muted-foreground">Module introuvable.</p>;
            return (
              <ModulePanel
                module={mod}
                onSaveStart={onSaveStart}
                onSaved={announceSaved}
                refresh={refresh}
              />
            );
          })()}
          {selection.kind === "lesson" && (() => {
            const lesson = allLessons.find((l) => l.id === selection.id);
            if (!lesson) return <p className="text-muted-foreground">Leçon introuvable.</p>;
            return (
              <LessonPanel
                lesson={lesson}
                onSaveStart={onSaveStart}
                onSaved={announceSaved}
                refresh={refresh}
                onDelete={() =>
                  setConfirmDelete({ kind: "lesson", id: lesson.id, title: lesson.title })
                }
              />
            );
          })()}
          {selection.kind === "quiz" && (() => {
            const quiz = allQuizzes.find((q) => q.id === selection.id);
            if (!quiz) return <p className="text-muted-foreground">Quiz introuvable.</p>;
            return (
              <QuizEditor
                quiz={quiz}
                onSaveStart={onSaveStart}
                onSaved={announceSaved}
                refresh={refresh}
                onDelete={() =>
                  setConfirmDelete({ kind: "quiz", id: quiz.id, title: quiz.title })
                }
              />
            );
          })()}
        </div>
      </div>

      <PublishModal
        open={publishOpen}
        onOpenChange={setPublishOpen}
        course={course}
        modules={modules}
        finalQuizzes={finalQuizzes}
        previewVisited={previewVisitedThisSession}
        onSelect={(s) => setSelection(s)}
        refresh={refresh}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Supprimer ?"
        description={
          confirmDelete
            ? `« ${confirmDelete.title} » sera supprimé définitivement.`
            : ""
        }
        confirmLabel="Supprimer"
        destructive
        onConfirm={performDelete}
      />
    </div>
  );
}

// --------- Sortable components (dnd-kit wrappers)
function SortableModule({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}

function SortableLessonRow({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </li>
  );
}

function SortableHandle({
  title,
  compact = false,
}: {
  title: string;
  compact?: boolean;
}) {
  const { listeners, attributes } = useSortable({ id: "" });
  return (
    <button
      type="button"
      {...listeners}
      {...attributes}
      title={title}
      aria-label={title}
      className={cn(
        "shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing",
        compact ? "w-4 h-4" : "w-5 h-5"
      )}
    >
      <GripVertical className={compact ? "w-4 h-4" : "w-5 h-5"} />
    </button>
  );
}

// --------- Course metadata panel
function CourseMetaPanel({
  course,
  categories,
  onSaveStart,
  onSaved,
  onError,
  refresh,
}: {
  course: CourseOutline["course"];
  categories: { id: string; name: string }[];
  onSaveStart: () => void;
  onSaved: () => void;
  onError: (msg: string) => void;
  refresh: () => void;
}) {
  const [title, setTitle] = useDebouncedField(course.title, async (v) => {
    if (!v.trim()) return;
    onSaveStart();
    const res = await updateCourseMeta(course.id, { title: v });
    if (!res.ok) onError(res.error);
    onSaved();
    refresh();
  });
  const [subtitle, setSubtitle] = useDebouncedField(course.subtitle ?? "", async (v) => {
    onSaveStart();
    await updateCourseMeta(course.id, { subtitle: v || null });
    onSaved();
  });
  const [slug, setSlug] = useDebouncedField(course.slug, async (v) => {
    if (!v.trim()) return;
    onSaveStart();
    const res = await updateCourseMeta(course.id, { slug: v });
    if (!res.ok) onError(res.error);
    onSaved();
    refresh();
  });

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="text-xl font-bold">Métadonnées du cours</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visible dans le catalogue et la page de cours.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subtitle">Sous-titre</Label>
          <Input
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <p className="text-xs text-muted-foreground">/cours/{slug}</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <SelectField
            label="Catégorie"
            value={course.category_id}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            onChange={async (v) => {
              onSaveStart();
              await updateCourseMeta(course.id, { category_id: v });
              onSaved();
              refresh();
            }}
          />
          <SelectField
            label="Niveau"
            value={course.level}
            options={[
              { value: "debutant", label: "Débutant" },
              { value: "intermediaire", label: "Intermédiaire" },
              { value: "avance", label: "Avancé" },
            ]}
            onChange={async (v) => {
              onSaveStart();
              await updateCourseMeta(course.id, {
                level: v as "debutant" | "intermediaire" | "avance",
              });
              onSaved();
              refresh();
            }}
          />
          <NumberField
            label="Durée (min)"
            value={course.duration_minutes ?? 0}
            onChange={async (v) => {
              onSaveStart();
              await updateCourseMeta(course.id, { duration_minutes: v });
              onSaved();
            }}
          />
        </div>
        <NumberField
          label={`Prix (BIF)${course.price_bif > 0 ? ` — ${formatBIF(course.price_bif)}` : " — Gratuit"}`}
          value={course.price_bif}
          onChange={async (v) => {
            onSaveStart();
            await updateCourseMeta(course.id, { price_bif: Math.max(0, v) });
            onSaved();
          }}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Image de couverture</h2>
        <CoverImageUploader courseId={course.id} initialUrl={course.cover_image} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Description</h2>
        <TipTapEditor
          initial={course.description ?? ""}
          onChange={async (html) => {
            onSaveStart();
            await updateCourseMeta(course.id, { description: html });
            onSaved();
          }}
          placeholder="Décrivez ce que les apprenants vont apprendre..."
        />
      </div>
    </div>
  );
}

function ModulePanel({
  module: mod,
  onSaveStart,
  onSaved,
  refresh,
}: {
  module: { id: string; title: string };
  onSaveStart: () => void;
  onSaved: () => void;
  refresh: () => void;
}) {
  const [title, setTitle] = useDebouncedField(mod.title, async (v) => {
    if (!v.trim()) return;
    onSaveStart();
    await updateModule(mod.id, v);
    onSaved();
    refresh();
  });
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-bold">Module</h1>
      <div className="space-y-1.5">
        <Label htmlFor="mod-title">Titre du module</Label>
        <Input id="mod-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
    </div>
  );
}

function LessonPanel({
  lesson,
  onSaveStart,
  onSaved,
  refresh,
  onDelete,
}: {
  lesson: {
    id: string;
    title: string;
    slug: string;
    content: string;
    video_url: string | null;
    attachments: LessonAttachment[];
    duration_minutes: number | null;
    is_free_preview: boolean;
  };
  onSaveStart: () => void;
  onSaved: () => void;
  refresh: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useDebouncedField(lesson.title, async (v) => {
    if (!v.trim()) return;
    onSaveStart();
    await updateLesson(lesson.id, { title: v, slug: lesson.slug || slugify(v) });
    onSaved();
    refresh();
  });
  const [slug, setSlug] = useDebouncedField(lesson.slug, async (v) => {
    if (!v.trim()) return;
    onSaveStart();
    await updateLesson(lesson.id, { slug: v });
    onSaved();
    refresh();
  });
  const [videoUrl, setVideoUrl] = useDebouncedField(lesson.video_url ?? "", async (v) => {
    onSaveStart();
    await updateLesson(lesson.id, { video_url: v.trim() ? v : null });
    onSaved();
  });
  const [duration, setDuration] = React.useState<number>(lesson.duration_minutes ?? 0);
  const [free, setFree] = React.useState(lesson.is_free_preview);

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Leçon</h1>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
          Supprimer
        </Button>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="lesson-title">Titre</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lesson-slug">Slug</Label>
            <Input
              id="lesson-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="lesson-video">Vidéo (URL YouTube/Vimeo ou chemin storage)</Label>
            <Input
              id="lesson-video"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtu.be/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lesson-duration">Durée (minutes)</Label>
            <Input
              id="lesson-duration"
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
              onBlur={async () => {
                onSaveStart();
                await updateLesson(lesson.id, { duration_minutes: duration });
                onSaved();
              }}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={free}
            onChange={async (e) => {
              setFree(e.target.checked);
              onSaveStart();
              await updateLesson(lesson.id, { is_free_preview: e.target.checked });
              onSaved();
              refresh();
            }}
            className="accent-primary"
          />
          Aperçu gratuit (visible sans inscription)
        </label>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Contenu</h2>
        <TipTapEditor
          initial={lesson.content}
          onChange={async (html) => {
            onSaveStart();
            await updateLesson(lesson.id, { content: html });
            onSaved();
          }}
          placeholder="Rédigez la leçon..."
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Pièces jointes</h2>
        <LessonAttachmentList
          lessonId={lesson.id}
          attachments={lesson.attachments}
          onChange={() => {
            onSaveStart();
            onSaved();
            refresh();
          }}
        />
      </div>
    </div>
  );
}

// ---------- shared little fields
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [v, setV] = React.useState(value);
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        min={0}
        value={v}
        onChange={(e) => setV(parseInt(e.target.value, 10) || 0)}
        onBlur={() => onChange(v)}
      />
    </div>
  );
}

function useDebouncedField(
  initial: string,
  save: (v: string) => Promise<void> | void,
  delay = 600
) {
  const [value, setValue] = React.useState(initial);
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const initialRef = React.useRef(initial);

  React.useEffect(() => {
    if (initial !== initialRef.current) {
      initialRef.current = initial;
      setValue(initial);
    }
  }, [initial]);

  React.useEffect(() => {
    if (value === initialRef.current) return;
    const t = setTimeout(() => save(valueRef.current), delay);
    return () => clearTimeout(t);
  }, [value, delay, save]);

  return [value, setValue] as const;
}

// Loader2 stub used in autosave indicator (re-export)
export { Loader2 };
