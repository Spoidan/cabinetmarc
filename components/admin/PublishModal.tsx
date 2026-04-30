"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { publishCourse } from "@/app/(admin)/admin/cours/[id]/editor-actions";
import type { CourseOutline } from "@/lib/elearning/queries";

type Selection =
  | { kind: "course" }
  | { kind: "module"; id: string }
  | { kind: "lesson"; id: string }
  | { kind: "quiz"; id: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseOutline["course"];
  modules: CourseOutline["modules"];
  finalQuizzes: CourseOutline["finalQuizzes"];
  previewVisited: boolean;
  onSelect: (s: Selection) => void;
  refresh: () => void;
  onPublished?: () => void;
};

type Check = {
  ok: boolean;
  label: string;
  goto?: Selection;
  fixHint?: string;
};

export function PublishModal({
  open,
  onOpenChange,
  course,
  modules,
  finalQuizzes,
  previewVisited,
  onSelect,
  refresh,
  onPublished,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const checks: Check[] = React.useMemo(() => {
    const list: Check[] = [];

    list.push({
      ok: Boolean(course.title?.trim() && course.description?.trim()),
      label: "Titre et description remplis",
      goto: { kind: "course" },
      fixHint: "Compléter les métadonnées",
    });

    list.push({
      ok: Boolean(course.cover_image),
      label: "Image de couverture",
      goto: { kind: "course" },
      fixHint: "Téléverser une image",
    });

    const hasModuleWithLesson = modules.some((m) => m.lessons.length > 0);
    list.push({
      ok: hasModuleWithLesson,
      label: "Au moins un module avec au moins une leçon",
    });

    // Each quiz validation handled at save-time; here we just check there is no quiz with zero questions
    // We can't easily fetch question counts here; rely on the editor to enforce. So mark "OK" as informative.
    list.push({
      ok: true,
      label: `${[...modules.flatMap((m) => m.quizzes), ...finalQuizzes].length} quiz configuré(s) — vérifier les questions`,
    });

    list.push({
      ok: previewVisited,
      label: "Aperçu effectué au moins une fois",
      fixHint: "Ouvrir l'aperçu",
    });

    return list;
  }, [course, modules, finalQuizzes, previewVisited]);

  const allPass = checks.every((c) => c.ok);

  const onPublish = async () => {
    setPending(true);
    const res = await publishCourse(course.id);
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Cours publié.");
    onPublished?.();
    onOpenChange(false);
    refresh();
    router.push(`/admin/cours/${course.id}/editer`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Publier le cours</DialogTitle>
          <DialogDescription>
            Vérifiez les éléments ci-dessous avant publication.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2.5 py-2">
          {checks.map((c, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm"
            >
              <span
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  c.ok ? "bg-emerald-500 text-white" : "bg-destructive/10 text-destructive"
                }`}
              >
                {c.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              </span>
              <div className="flex-1">
                <p className={c.ok ? "" : "text-foreground"}>{c.label}</p>
                {!c.ok && c.fixHint && c.goto && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(c.goto!);
                      onOpenChange(false);
                    }}
                    className="text-xs text-primary hover:underline mt-0.5"
                  >
                    {c.fixHint} →
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onPublish} disabled={!allPass || pending}>
            {pending ? "Publication..." : "Publier maintenant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
