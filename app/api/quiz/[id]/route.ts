import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAdmin();

  const { data: quiz, error } = await db
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const { data: questions } = await db
    .from("quiz_questions")
    .select("id, question_fr, question_en, options_fr, options_en, order_index")
    .eq("quiz_id", id)
    .order("order_index");

  return NextResponse.json({ quiz, questions: questions ?? [] });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { answers } = await req.json();
  const db = getAdmin();

  const { data: quiz } = await db.from("quizzes").select("*").eq("id", id).single();
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const { data: questions } = await db
    .from("quiz_questions")
    .select("id, correct_index, explanation_fr")
    .eq("quiz_id", id)
    .order("order_index");

  if (!questions?.length) return NextResponse.json({ error: "No questions" }, { status: 400 });

  const results = questions.map((q: { id: string; correct_index: number; explanation_fr: string }, i: number) => {
    const userAnswer = answers[i] ?? -1;
    const correct = userAnswer === q.correct_index;
    return { question_id: q.id, user_answer: userAnswer, correct, explanation: q.explanation_fr };
  });

  const correctCount = results.filter((r: { correct: boolean }) => r.correct).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= quiz.pass_score;

  await db.from("quiz_attempts").insert({
    user_id: userId,
    quiz_id: id,
    score,
    passed,
    answers: results,
  });

  // If final exam passed → issue certificate
  let certificateId = null;
  if (quiz.is_final_exam && passed) {
    const { data: existingCert } = await db
      .from("certificates")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", quiz.course_id)
      .maybeSingle();

    if (!existingCert) {
      const certNumber = `MARC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const { data: course } = await db
        .from("courses")
        .select("title_fr")
        .eq("id", quiz.course_id)
        .single();

      const { data: cert } = await db
        .from("certificates")
        .insert({
          user_id: userId,
          course_id: quiz.course_id,
          user_name: "Étudiant Cabinet MARC",
          course_name: course?.title_fr ?? "Formation Cabinet MARC",
          certificate_number: certNumber,
        })
        .select()
        .single();

      certificateId = cert?.id;
    } else {
      certificateId = existingCert.id;
    }
  }

  return NextResponse.json({ score, passed, results, certificate_id: certificateId });
}
