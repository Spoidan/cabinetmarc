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
  Save,
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
  const previewKey = `cm_preview_${course.id}`;
  const [previewVisitedThisSession, setPreviewVisitedThisSession] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`cm_preview_${course.id}`) === "true";
  });
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<
    | { kind: "module"; id: string; title: string }
    | { kind: "lesson"; id: string; title: string }
    | { kind: "quiz"; id: string; title: string }
    | null
  >(null);

  const saveFnRef = React.useRef<(() => Promise<void>) | null>(null);

  const registerSave = React.useCallback((fn: () => Promise<void>) => {
    saveFnRef.current = fn;
  }, []);

  const handleExplicitSave = async () => {
    if (!saveFnRef.current) return;
    const wasPublished = course.is_published;
    setPending(true);
    try {
      await saveFnRef.current();
      setSavedAt(new Date());
      if (wasPublished) {
        toast.success("Enregistré en brouillon. Cliquez sur Publier pour rendre les modifications visibles aux apprenants.");
      } else {
        toast.success("Enregistré avec succès");
      }
    } catch (err) {
      const msg = (err as Error)?.message;
      if (msg !== "validation") {
        toast.error(msg || "Erreur lors de l'enregistrement");
      }
    } finally {
      setPending(false);
    }
  };

  const refresh = React.useCallback(() => router.refresh(), [router]);

  const addModule = async () => {
    setPending(true);
    const res = await createModule(course.id, "Nouveau module");
    if (!res.ok) {
      toast.error(res.error);
      setPending(false);
      return;
    }
    setSavedAt(new Date());
    setPending(false);
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
    setPending(true);
    const res = await reorderModules(course.id, next);
    if (!res.ok) toast.error(res.error);
    setSavedAt(new Date());
    setPending(false);
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
    setPending(true);
    const res = await reorderLessons(moduleId, next);
    if (!res.ok) toast.error(res.error);
    setSavedAt(new Date());
    setPending(false);
    refresh();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addLesson = async (moduleId: string) => {
    setPending(true);
    const res = await createLesson(moduleId, {
      title: "Nouvelle leçon",
      slug: `lecon-${Date.now().toString(36)}`,
    });
    if (!res.ok) {
      toast.error(res.error);
      setPending(false);
      return;
    }
    setSavedAt(new Date());
    setPending(false);
    if (res.data) setSelection({ kind: "lesson", id: res.data.id });
    refresh();
  };

  const addQuiz = async (moduleId: string | null) => {
    setPending(true);
    const res = await createQuiz(course.id, {
      title: moduleId ? "Quiz de module" : "Examen final",
      module_id: moduleId,
    });
    if (!res.ok) {
      toast.error(res.error);
      setPending(false);
      return;
    }
    setSavedAt(new Date());
    setPending(false);
    if (res.data) setSelection({ kind: "quiz", id: res.data.id });
    refresh();
  };

  const performDelete = async () => {
    if (!confirmDelete) return;
    setPending(true);
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
    setSavedAt(new Date());
    setPending(false);
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
                <SortableModule key={mod.id} id={mod.id}>
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
                        onClick={() =>
                          setConfirmDelete({ kind: "module", id: mod.id, title: mod.title })
                        }
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
                            <SortableLessonRow key={lesson.id} id={lesson.id}>
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
                                  onClick={() =>
                                    setSelection({ kind: "lesson", id: lesson.id })
                                  }
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
          <div className="rounded-lg border border-border p-2 space-y-0.5 mt-3">
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

        <div className="mt-3 space-y-1.5">
          <Button variant="outline" className="w-full" onClick={addModule}>
            <Plus className="w-4 h-4" /> Module
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => addQuiz(null)}>
            <Plus className="w-4 h-4" /> Quiz final
          </Button>
        </div>
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
              onClick={handleExplicitSave}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Enregistrer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.setItem(previewKey, "true");
                setPreviewVisitedThisSession(true);
                window.open(`/admin/cours/${course.id}/apercu`, "_blank", "noopener");
              }}
            >
              <Eye className="w-4 h-4" />
              Aperçu
            </Button>
            <Button
              size="sm"
              onClick={() => setPublishOpen(true)}
            >
              {course.is_published ? "Mettre à jour" : "Publier"}
            </Button>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6 overflow-y-auto">
          {selection.kind === "course" && (
            <>
              <CourseMetaPanel
                course={course}
                categories={categories}
                registerSave={registerSave}
                refresh={refresh}
              />
              {modules.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center space-y-4 max-w-3xl">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">Prochaine étape : créer un module</h2>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                      Un module regroupe les leçons de votre cours. Créez au moins un module, puis ajoutez-y des leçons.
                    </p>
                  </div>
                  <Button onClick={addModule} disabled={pending} size="sm">
                    <Plus className="w-4 h-4" />
                    Ajouter le premier module
                  </Button>
                </div>
              )}
            </>
          )}
          {selection.kind === "module" &&
            (() => {
              const mod = modules.find((m) => m.id === selection.id);
              if (!mod)
                return (
                  <p className="text-muted-foreground">Module introuvable.</p>
                );
              return (
                <ModulePanel
                  module={mod}
                  courseId={course.id}
                  registerSave={registerSave}
                  refresh={refresh}
                />
              );
            })()}
          {selection.kind === "lesson" &&
            (() => {
              const lesson = allLessons.find((l) => l.id === selection.id);
              if (!lesson)
                return (
                  <p className="text-muted-foreground">Leçon introuvable.</p>
                );
              return (
                <LessonPanel
                  lesson={lesson}
                  courseId={course.id}
                  registerSave={registerSave}
                  refresh={refresh}
                  onDelete={() =>
                    setConfirmDelete({
                      kind: "lesson",
                      id: lesson.id,
                      title: lesson.title,
                    })
                  }
                />
              );
            })()}
          {selection.kind === "quiz" &&
            (() => {
              const quiz = allQuizzes.find((q) => q.id === selection.id);
              if (!quiz)
                return (
                  <p className="text-muted-foreground">Quiz introuvable.</p>
                );
              return (
                <QuizEditor
                  quiz={quiz}
                  registerSave={registerSave}
                  refresh={refresh}
                  onDelete={() =>
                    setConfirmDelete({
                      kind: "quiz",
                      id: quiz.id,
                      title: quiz.title,
                    })
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
        onPublished={() => {
          localStorage.removeItem(previewKey);
          setPreviewVisitedThisSession(false);
        }}
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

// --------- Sortable wrappers
function SortableModule({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
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
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
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
  registerSave,
  refresh,
}: {
  course: CourseOutline["course"];
  categories: { id: string; name: string }[];
  registerSave: (fn: () => Promise<void>) => void;
  refresh: () => void;
}) {
  const [title, setTitle] = React.useState(course.title);
  const [subtitle, setSubtitle] = React.useState(course.subtitle ?? "");
  const [slug, setSlug] = React.useState(course.slug);
  const [categoryId, setCategoryId] = React.useState(course.category_id);
  const [level, setLevel] = React.useState(course.level);
  const [duration, setDuration] = React.useState(course.duration_minutes ?? 0);
  const [price, setPrice] = React.useState(course.price_bif);
  const descriptionRef = React.useRef(course.description ?? "");

  const handleSave = React.useCallback(async () => {
    if (!title.trim()) {
      toast.error("Le titre est requis");
      throw new Error("validation");
    }
    if (!slug.trim()) {
      toast.error("Le slug est requis");
      throw new Error("validation");
    }
    const res = await updateCourseMeta(course.id, {
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      slug: slug.trim(),
      category_id: categoryId,
      level: level as "debutant" | "intermediaire" | "avance",
      duration_minutes: duration,
      price_bif: Math.max(0, price),
      description: descriptionRef.current,
    });
    if (!res.ok) throw new Error(res.error);
    refresh();
  }, [title, subtitle, slug, categoryId, level, duration, price, course.id, refresh]);

  React.useEffect(() => {
    registerSave(handleSave);
  }, [registerSave, handleSave]);

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
          <div className="space-y-1.5">
            <Label>Catégorie</Label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Niveau</Label>
            <select
              value={level}
              onChange={(e) =>
                setLevel(e.target.value as "debutant" | "intermediaire" | "avance")
              }
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
            >
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Durée (min)</Label>
            <Input
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{`Prix (BIF)${price > 0 ? ` — ${formatBIF(price)}` : " — Gratuit"}`}</Label>
          <Input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Image de couverture</h2>
        <CoverImageUploader courseId={course.id} initialUrl={course.cover_image} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Description</h2>
        <TipTapEditor
          initial={course.description ?? ""}
          onChange={(html) => {
            descriptionRef.current = html;
          }}
          placeholder="Décrivez ce que les apprenants vont apprendre..."
        />
      </div>
    </div>
  );
}

function ModulePanel({
  module: mod,
  courseId,
  registerSave,
  refresh,
}: {
  module: { id: string; title: string };
  courseId: string;
  registerSave: (fn: () => Promise<void>) => void;
  refresh: () => void;
}) {
  const [title, setTitle] = React.useState(mod.title);

  const handleSave = React.useCallback(async () => {
    if (!title.trim()) {
      toast.error("Le titre du module est requis");
      throw new Error("validation");
    }
    const res = await updateModule(mod.id, title.trim(), courseId);
    if (!res.ok) throw new Error(res.error);
    refresh();
  }, [title, mod.id, courseId, refresh]);

  React.useEffect(() => {
    registerSave(handleSave);
  }, [registerSave, handleSave]);

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-bold">Module</h1>
      <div className="space-y-1.5">
        <Label htmlFor="mod-title">Titre du module</Label>
        <Input
          id="mod-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
    </div>
  );
}

function LessonPanel({
  lesson,
  courseId,
  registerSave,
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
  courseId: string;
  registerSave: (fn: () => Promise<void>) => void;
  refresh: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = React.useState(lesson.title);
  const [slug, setSlug] = React.useState(lesson.slug);
  const [videoUrl, setVideoUrl] = React.useState(lesson.video_url ?? "");
  const [duration, setDuration] = React.useState(lesson.duration_minutes ?? 0);
  const [free, setFree] = React.useState(lesson.is_free_preview);
  const contentRef = React.useRef(lesson.content);

  const handleSave = React.useCallback(async () => {
    if (!title.trim()) {
      toast.error("Le titre de la leçon est requis");
      throw new Error("validation");
    }
    const res = await updateLesson(lesson.id, {
      title: title.trim(),
      slug: slug.trim() || slugify(title.trim()),
      video_url: videoUrl.trim() || null,
      duration_minutes: duration,
      is_free_preview: free,
      content: contentRef.current,
    }, courseId);
    if (!res.ok) throw new Error(res.error);
    refresh();
  }, [title, slug, videoUrl, duration, free, lesson.id, courseId, refresh]);

  React.useEffect(() => {
    registerSave(handleSave);
  }, [registerSave, handleSave]);

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
            <Label htmlFor="lesson-video">
              Vidéo (URL YouTube/Vimeo ou chemin storage)
            </Label>
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
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={free}
            onChange={(e) => setFree(e.target.checked)}
            className="accent-primary"
          />
          Aperçu gratuit (visible sans inscription)
        </label>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Contenu</h2>
        <TipTapEditor
          initial={lesson.content}
          onChange={(html) => {
            contentRef.current = html;
          }}
          placeholder="Rédigez la leçon..."
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold mb-3">Pièces jointes</h2>
        <LessonAttachmentList
          lessonId={lesson.id}
          attachments={lesson.attachments}
          onChange={() => refresh()}
        />
      </div>
    </div>
  );
}

// Loader2 stub used by other modules that import from this file
export { Loader2 };
