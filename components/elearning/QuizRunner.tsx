"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, CheckCircle2, X as XIcon, RotateCcw, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { submitQuizAttempt } from "@/app/(elearning)/actions";

export type QuizQuestionClient = {
  id: string;
  question: string;
  type: "single" | "multiple" | "true_false";
  options: Array<{ id: string; label: string; sort_order: number }>;
};

type Props = {
  mode: "student" | "preview";
  courseSlug: string;
  quizId: string;
  quizTitle: string;
  passScore: number;
  questions: QuizQuestionClient[];
};

type Result = Awaited<ReturnType<typeof submitQuizAttempt>>;

export function QuizRunner({
  mode,
  courseSlug,
  quizId,
  quizTitle,
  passScore,
  questions,
}: Props) {
  const router = useRouter();
  const [answers, setAnswers] = React.useState<Record<string, Set<string>>>(
    () => Object.fromEntries(questions.map((q) => [q.id, new Set<string>()]))
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<Result | null>(null);

  const setAnswer = (questionId: string, optionId: string, type: QuizQuestionClient["type"]) => {
    setAnswers((prev) => {
      const set = new Set(prev[questionId]);
      if (type === "single" || type === "true_false") {
        set.clear();
        set.add(optionId);
      } else {
        if (set.has(optionId)) set.delete(optionId);
        else set.add(optionId);
      }
      return { ...prev, [questionId]: set };
    });
  };

  const submit = async () => {
    if (mode !== "student") {
      toast("Désactivé en mode aperçu");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        courseSlug,
        quizId,
        answers: Object.fromEntries(
          Object.entries(answers).map(([qid, set]) => [qid, [...set]])
        ),
      };
      const res = await submitQuizAttempt(payload);
      if (!res.ok) {
        toast.error(res.error);
      } else if (res.data) {
        setResult(res);
        if (res.data.passed) toast.success(`Quiz réussi — ${res.data.score}%`);
        else toast.error(`Non validé — ${res.data.score}%`);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setAnswers(Object.fromEntries(questions.map((q) => [q.id, new Set<string>()])));
  };

  if (result?.ok && result.data) {
    return (
      <QuizResult
        courseSlug={courseSlug}
        quizTitle={quizTitle}
        passScore={passScore}
        score={result.data.score}
        passed={result.data.passed}
        allCoursePassed={result.data.allCoursePassed}
        perQuestion={result.data.perQuestion}
        questions={questions}
        userAnswers={answers}
        onRetry={reset}
      />
    );
  }

  const canSubmit = questions.every((q) => (answers[q.id]?.size ?? 0) > 0);

  return (
    <div className="max-w-3xl mx-auto w-full">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Quiz</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{quizTitle}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Score minimum requis : {passScore}%
        </p>
      </header>

      <ol className="space-y-8">
        {questions.map((q, idx) => (
          <li
            key={q.id}
            className="rounded-2xl border border-border bg-card p-5"
            id={`question-${q.id}`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Question {idx + 1}
                </p>
                <h2 className="text-base sm:text-lg font-semibold mt-1">{q.question}</h2>
                {q.type === "multiple" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Plusieurs réponses possibles
                  </p>
                )}
              </div>
            </div>
            <ul className="space-y-2">
              {q.options.map((opt) => {
                const selected = answers[q.id]?.has(opt.id) ?? false;
                return (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => setAnswer(q.id, opt.id, q.type)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "w-5 h-5 rounded-full border shrink-0 flex items-center justify-center",
                          q.type === "multiple" ? "rounded" : "rounded-full",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/40"
                        )}
                      >
                        {selected && <Check className="w-3 h-3" />}
                      </span>
                      <span>{opt.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      <div className="sticky bottom-4 mt-10">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {canSubmit ? "Toutes les questions sont répondues." : "Répondez à toutes les questions pour valider."}
          </p>
          <Button onClick={submit} disabled={!canSubmit || submitting || mode !== "student"}>
            {submitting ? "Envoi..." : "Valider le quiz"}
          </Button>
        </div>
      </div>

      {/* A11y helpers */}
      {mode === "student" && (
        <div className="sr-only">
          <Label htmlFor="quiz-hint">Info quiz</Label>
          <p id="quiz-hint">Cliquez sur une option pour la sélectionner, puis sur Valider.</p>
        </div>
      )}
    </div>
  );
}

function QuizResult({
  courseSlug,
  quizTitle,
  passScore,
  score,
  passed,
  allCoursePassed,
  perQuestion,
  questions,
  userAnswers,
  onRetry,
}: {
  courseSlug: string;
  quizTitle: string;
  passScore: number;
  score: number;
  passed: boolean;
  allCoursePassed: boolean;
  perQuestion: Array<{ questionId: string; correct: boolean; correctOptionIds: string[] }>;
  questions: QuizQuestionClient[];
  userAnswers: Record<string, Set<string>>;
  onRetry: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto w-full">
      <div
        className={cn(
          "rounded-2xl border p-6 mb-8 flex items-center justify-between gap-4",
          passed
            ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800"
            : "border-destructive/40 bg-destructive/5"
        )}
      >
        <div>
          <p className="text-xs uppercase tracking-widest mb-1">Résultat</p>
          <h1 className="text-3xl font-bold">{score}%</h1>
          <p className={cn("mt-1 text-sm font-medium", passed ? "text-emerald-700 dark:text-emerald-300" : "text-destructive")}>
            {passed ? `Réussi (seuil ${passScore}%)` : `Non validé (seuil ${passScore}%)`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRetry}>
            <RotateCcw className="w-4 h-4" />
            Recommencer
          </Button>
          <Button asChild>
            <Link href={`/cours/${courseSlug}`}>Continuer le cours</Link>
          </Button>
        </div>
      </div>

      {allCoursePassed && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-6 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Bravo, vous avez terminé le cours !</p>
              <p className="text-xs text-muted-foreground">Votre certificat est disponible.</p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/cours/${courseSlug}/certificat`}>Voir mon certificat</Link>
          </Button>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">Correction — {quizTitle}</h2>
      <ol className="space-y-5">
        {questions.map((q, idx) => {
          const r = perQuestion.find((p) => p.questionId === q.id);
          const correct = r?.correct ?? false;
          const correctIds = new Set(r?.correctOptionIds ?? []);
          const given = userAnswers[q.id] ?? new Set<string>();
          return (
            <li key={q.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Question {idx + 1}</p>
                  <h3 className="text-base font-semibold mt-1">{q.question}</h3>
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full border",
                    correct
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  )}
                >
                  {correct ? "Bonne réponse" : "Mauvaise réponse"}
                </span>
              </div>
              <ul className="space-y-2">
                {q.options.map((opt) => {
                  const isCorrect = correctIds.has(opt.id);
                  const wasChosen = given.has(opt.id);
                  return (
                    <li
                      key={opt.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-2.5 text-sm",
                        isCorrect
                          ? "border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-800"
                          : wasChosen
                            ? "border-destructive/40 bg-destructive/5"
                            : "border-border"
                      )}
                    >
                      {isCorrect ? (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : wasChosen ? (
                        <XIcon className="w-4 h-4 text-destructive shrink-0" />
                      ) : (
                        <span className="w-4 h-4 shrink-0" />
                      )}
                      <span>{opt.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {isCorrect ? "Réponse attendue" : wasChosen ? "Votre réponse" : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>

      {passed && !allCoursePassed && (
        <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Ce quiz est validé. Poursuivez le cours pour progresser.
        </div>
      )}
    </div>
  );
}
