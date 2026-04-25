"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  updateQuiz,
  saveQuestions,
  type QuestionDraft,
} from "@/app/(admin)/admin/cours/[id]/editor-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { QuizType } from "@/types/database";

type Props = {
  quiz: { id: string; title: string; pass_score_percent: number; module_id: string | null };
  onSaveStart: () => void;
  onSaved: () => void;
  refresh: () => void;
  onDelete: () => void;
};

export function QuizEditor({ quiz, onSaveStart, onSaved, refresh, onDelete }: Props) {
  const [title, setTitle] = React.useState(quiz.title);
  const [score, setScore] = React.useState(quiz.pass_score_percent);
  const [questions, setQuestions] = React.useState<QuestionDraft[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: qs } = await supabase
        .from("quiz_questions")
        .select("id, question, type, sort_order")
        .eq("quiz_id", quiz.id)
        .order("sort_order", { ascending: true });
      const ids = (qs ?? []).map((q) => q.id);
      const { data: opts } = ids.length
        ? await supabase
            .from("quiz_options")
            .select("id, question_id, label, is_correct, sort_order")
            .in("question_id", ids)
            .order("sort_order", { ascending: true })
        : { data: [] };
      if (cancelled) return;
      setQuestions(
        (qs ?? []).map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type as QuizType,
          options: ((opts ?? []) as Array<{
            id: string;
            question_id: string;
            label: string;
            is_correct: boolean;
            sort_order: number;
          }>)
            .filter((o) => o.question_id === q.id)
            .map((o) => ({ id: o.id, label: o.label, is_correct: o.is_correct })),
        }))
      );
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [quiz.id]);

  const saveTitle = async () => {
    onSaveStart();
    await updateQuiz(quiz.id, { title, pass_score_percent: score });
    onSaved();
    refresh();
  };

  const addQuestion = () => {
    setQuestions((qs) => [
      ...qs,
      {
        question: "Nouvelle question",
        type: "single",
        options: [
          { label: "Réponse A", is_correct: true },
          { label: "Réponse B", is_correct: false },
        ],
      },
    ]);
  };
  const updateQ = (i: number, patch: Partial<QuestionDraft>) =>
    setQuestions((qs) =>
      qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q))
    );
  const updateOpt = (
    qi: number,
    oi: number,
    patch: Partial<QuestionDraft["options"][number]>
  ) =>
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi
          ? {
              ...q,
              options: q.options.map((o, j) => (j === oi ? { ...o, ...patch } : o)),
            }
          : q
      )
    );
  const setSingleCorrect = (qi: number, oi: number) =>
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === qi
          ? {
              ...q,
              options: q.options.map((o, j) => ({ ...o, is_correct: j === oi })),
            }
          : q
      )
    );
  const move = (i: number, dir: -1 | 1) => {
    setQuestions((qs) => {
      const next = [...qs];
      const [q] = next.splice(i, 1);
      next.splice(i + dir, 0, q);
      return next;
    });
  };

  const persistQuestions = async () => {
    // Validate
    for (const [i, q] of questions.entries()) {
      if (q.options.length === 0) {
        toast.error(`Question ${i + 1} : ajoutez au moins une option.`);
        return;
      }
      const correct = q.options.filter((o) => o.is_correct).length;
      if ((q.type === "single" || q.type === "true_false") && correct !== 1) {
        toast.error(`Question ${i + 1} : exactement une bonne réponse requise.`);
        return;
      }
      if (q.type === "multiple" && correct < 1) {
        toast.error(`Question ${i + 1} : au moins une bonne réponse requise.`);
        return;
      }
    }
    onSaveStart();
    const res = await saveQuestions(quiz.id, questions);
    if (!res.ok) {
      toast.error(res.error);
    } else {
      toast.success("Questions enregistrées.");
    }
    onSaved();
    refresh();
  };

  if (!loaded) {
    return <p className="text-muted-foreground text-sm">Chargement du quiz...</p>;
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Quiz</h1>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
          Supprimer
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="grid sm:grid-cols-[1fr_180px] gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="quiz-title">Titre</Label>
            <Input
              id="quiz-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={saveTitle}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quiz-score">Score requis (%)</Label>
            <Input
              id="quiz-score"
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value, 10) || 0)}
              onBlur={saveTitle}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {quiz.module_id ? "Quiz de module" : "Quiz de fin de cours (examen final)"}
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <article
            key={q.id ?? `new-${qi}`}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => qi > 0 && move(qi, -1)}
                  className="text-muted-foreground hover:text-foreground"
                  title="Monter"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Question {qi + 1}</span>
                  <select
                    value={q.type}
                    onChange={(e) =>
                      updateQ(qi, { type: e.target.value as QuizType })
                    }
                    className="h-8 px-2 rounded-lg border border-input bg-background text-xs"
                  >
                    <option value="single">Choix unique</option>
                    <option value="multiple">Choix multiples</option>
                    <option value="true_false">Vrai / Faux</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))}
                    className="ml-auto text-destructive text-xs hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
                <Input
                  value={q.question}
                  onChange={(e) => updateQ(qi, { question: e.target.value })}
                  placeholder="Saisissez la question..."
                />
                <ul className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <li key={oi} className="flex items-center gap-2">
                      <input
                        type={q.type === "multiple" ? "checkbox" : "radio"}
                        name={`q-${qi}-correct`}
                        checked={opt.is_correct}
                        onChange={(e) => {
                          if (q.type === "multiple") {
                            updateOpt(qi, oi, { is_correct: e.target.checked });
                          } else {
                            setSingleCorrect(qi, oi);
                          }
                        }}
                        className="accent-primary"
                        aria-label="Bonne réponse"
                      />
                      <Input
                        value={opt.label}
                        onChange={(e) => updateOpt(qi, oi, { label: e.target.value })}
                        placeholder="Option..."
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setQuestions((qs) =>
                            qs.map((qq, ii) =>
                              ii === qi
                                ? { ...qq, options: qq.options.filter((_, j) => j !== oi) }
                                : qq
                            )
                          )
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setQuestions((qs) =>
                      qs.map((qq, ii) =>
                        ii === qi
                          ? { ...qq, options: [...qq.options, { label: "Nouvelle option", is_correct: false }] }
                          : qq
                      )
                    )
                  }
                >
                  <Plus className="w-3.5 h-3.5" /> Option
                </Button>
              </div>
            </div>
          </article>
        ))}

        <Button variant="outline" onClick={addQuestion}>
          <Plus className="w-4 h-4" /> Ajouter une question
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {questions.length} question{questions.length > 1 ? "s" : ""}
        </p>
        <Button onClick={persistQuestions}>Enregistrer les questions</Button>
      </div>
    </div>
  );
}
