"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Trophy, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  question_fr: string;
  options_fr: string[];
  order_index: number;
}

interface QuizResult {
  question_id: string;
  user_answer: number;
  correct: boolean;
  explanation: string;
}

type Phase = "loading" | "quiz" | "result" | "error";

export default function QuizPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;
  const quizId = searchParams.get("quiz_id") ?? "";

  const [phase, setPhase] = useState<Phase>("loading");
  const [quiz, setQuiz] = useState<{ title_fr: string; pass_score: number; is_final_exam: boolean } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!quizId) { setPhase("error"); return; }
    fetch(`/api/quiz/${quizId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.error) { setPhase("error"); return; }
        setQuiz(json.quiz);
        setQuestions(json.questions);
        setPhase("quiz");
      })
      .catch(() => setPhase("error"));
  }, [quizId]);

  const selectAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const next = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: number[]) => {
    setSubmitting(true);
    const res = await fetch(`/api/quiz/${quizId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: finalAnswers }),
    });
    const json = await res.json();
    setScore(json.score);
    setPassed(json.passed);
    setResults(json.results ?? []);
    setCertificateId(json.certificate_id ?? null);
    setPhase("result");
    setSubmitting(false);
  };

  const restart = () => {
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setPhase("quiz");
  };

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-xl font-semibold">Quiz introuvable</h2>
        <Link href={`/courses/${courseSlug}`}>
          <Button variant="outline">Retour au cours</Button>
        </Link>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <Link href={`/courses/${courseSlug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Retour au cours
          </Link>
        </header>

        <div className="flex-1 flex items-start justify-center p-8">
          <div className="w-full max-w-2xl">
            {/* Score card */}
            <div className={`rounded-2xl p-8 text-center mb-8 ${passed ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"}`}>
              {passed ? (
                <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              )}
              <h1 className="text-3xl font-bold mb-2">
                {passed ? "Félicitations !" : "Essayez encore"}
              </h1>
              <p className="text-muted-foreground mb-4">
                {passed
                  ? quiz?.is_final_exam
                    ? "Vous avez réussi l'examen final !"
                    : "Vous avez réussi ce quiz !"
                  : `Score minimum requis : ${quiz?.pass_score}%`}
              </p>
              <div className="text-6xl font-black mb-2" style={{ color: passed ? "#16a34a" : "#dc2626" }}>
                {score}%
              </div>
              <Badge variant={passed ? "default" : "destructive"} className="text-sm px-4 py-1">
                {passed ? "Réussi" : "Échoué"}
              </Badge>
            </div>

            {/* Certificate CTA */}
            {passed && quiz?.is_final_exam && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-xl p-6 flex items-center gap-4 mb-6">
                <Trophy className="w-10 h-10 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold">Votre certificat est prêt !</h3>
                  <p className="text-sm text-muted-foreground">Téléchargez et partagez votre certificat d'accomplissement.</p>
                </div>
                <Link href={`/learn/${courseSlug}/certificate`}>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    Voir mon certificat
                  </Button>
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              {!passed && (
                <Button onClick={restart} variant="outline" className="gap-2 flex-1">
                  <RotateCcw className="w-4 h-4" />
                  Réessayer
                </Button>
              )}
              <Link href={`/courses/${courseSlug}`} className="flex-1">
                <Button variant={passed ? "default" : "outline"} className="w-full gap-2">
                  {passed ? "Continuer" : "Retour au cours"}
                </Button>
              </Link>
            </div>

            {/* Results breakdown */}
            <div>
              <h2 className="font-semibold text-lg mb-4">Détail des réponses</h2>
              <div className="space-y-4">
                {results.map((r, i) => {
                  const q = questions[i];
                  return (
                    <div
                      key={r.question_id}
                      className={`border rounded-xl p-4 ${r.correct ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10" : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10"}`}
                    >
                      <div className="flex items-start gap-3">
                        {r.correct ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm mb-2">{q?.question_fr}</p>
                          {q?.options_fr && (
                            <div className="space-y-1 mb-3">
                              {q.options_fr.map((opt, idx) => (
                                <div
                                  key={idx}
                                  className={`text-xs px-3 py-1.5 rounded-lg ${
                                    idx === r.user_answer && !r.correct
                                      ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                      : ""
                                  }`}
                                >
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}
                          {r.explanation && (
                            <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
                              {r.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz phase
  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <Link href={`/courses/${courseSlug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Retour au cours
        </Link>
        <span className="text-sm font-medium text-muted-foreground">
          {currentQ + 1} / {questions.length}
        </span>
      </header>

      {/* Progress */}
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((currentQ) / questions.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Quiz title */}
          <p className="text-sm text-muted-foreground mb-2 font-medium">{quiz?.title_fr}</p>

          {/* Question */}
          <h2 className="text-xl font-bold mb-6">{q.question_fr}</h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {q.options_fr.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => selectAnswer(idx)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-sm font-medium ${
                  selected === idx
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40 hover:bg-muted"
                }`}
              >
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 mr-3 text-xs font-bold shrink-0"
                  style={{ borderColor: selected === idx ? "hsl(var(--primary))" : "hsl(var(--border))" }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            ))}
          </div>

          {/* Next button */}
          <Button
            onClick={next}
            disabled={selected === null || submitting}
            className="w-full py-3 text-base"
          >
            {submitting
              ? "Calcul du score..."
              : currentQ < questions.length - 1
              ? "Question suivante"
              : "Voir les résultats"}
          </Button>
        </div>
      </div>
    </div>
  );
}
