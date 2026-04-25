import Link from "next/link";
import { Edit, HelpCircle } from "lucide-react";
import { adminListQuizzes } from "@/lib/admin/queries";
import { Badge } from "@/components/ui/badge";
import { QuizzesTable } from "@/components/admin/QuizzesTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Quiz" };

export default async function AdminQuizzesPage() {
  const quizzes = await adminListQuizzes();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Quiz</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vue transverse de tous les quiz et examens finaux. Pour modifier les questions, ouvrez l&apos;éditeur du cours concerné.
        </p>
      </header>
      <QuizzesTable quizzes={quizzes} />
    </div>
  );
}
