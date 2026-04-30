export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { getQuizForStudent, getEnrollment } from "@/lib/elearning/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { QuizRunner, type QuizQuestionClient } from "@/components/elearning/QuizRunner";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizPage({
  params,
}: {
  params: Promise<{ courseSlug: string; quizId: string }>;
}) {
  const { courseSlug, quizId } = await params;

  const quizData = await getQuizForStudent(quizId);
  if (!quizData) notFound();

  const { quiz, questions } = quizData;

  // Verify the course slug matches the quiz's course, and that course is published
  const admin = createSupabaseAdminClient();
  const { data: course } = await admin
    .from("courses")
    .select("id, slug, is_published")
    .eq("id", quiz.course_id)
    .maybeSingle();
  if (!course || course.slug !== courseSlug || !course.is_published) notFound();

  const { userId } = await auth();
  if (!userId) {
    redirect(`/connexion?redirect_url=${encodeURIComponent(`/cours/${courseSlug}/quiz/${quizId}`)}`);
  }
  const enrollment = await getEnrollment(userId, course.id);
  if (!enrollment) {
    redirect(`/cours/${courseSlug}`);
  }

  const clientQuestions: QuizQuestionClient[] = questions.map((q) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    options: q.options.map((o) => ({ id: o.id, label: o.label, sort_order: o.sort_order })),
  }));

  return (
    <div className="container mx-auto py-10">
      <QuizRunner
        mode="student"
        courseSlug={courseSlug}
        quizId={quizId}
        quizTitle={quiz.title}
        passScore={quiz.pass_score_percent}
        questions={clientQuestions}
      />
    </div>
  );
}
