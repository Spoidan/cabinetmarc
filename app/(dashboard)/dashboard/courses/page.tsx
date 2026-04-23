import { auth } from "@clerk/nextjs/server";
import { BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function DashboardCoursesPage() {
  const { userId } = await auth();
  const db = getAdmin();

  const { data: enrollments } = await db
    .from("enrollments")
    .select("*, courses(id, title_fr, slug, level, category_id)")
    .eq("user_id", userId!)
    .order("enrolled_at", { ascending: false });

  // For each enrollment, get lesson progress
  const enrollmentsWithProgress = await Promise.all(
    (enrollments ?? []).map(async (enrollment) => {
      const [{ data: total }, { data: done }] = await Promise.all([
        db.from("course_lessons").select("id").eq("course_id", enrollment.course_id).eq("is_published", true),
        db.from("lesson_progress").select("id").eq("user_id", userId!).eq("course_id", enrollment.course_id),
      ]);
      const pct = total?.length ? Math.round(((done?.length ?? 0) / total.length) * 100) : 0;
      return { ...enrollment, progressPct: pct, totalLessons: total?.length ?? 0, completedLessons: done?.length ?? 0 };
    })
  );

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mes formations</h1>
        <p className="text-muted-foreground mt-1">{enrollmentsWithProgress.length} formation(s) inscrite(s)</p>
      </div>

      {enrollmentsWithProgress.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h2 className="text-lg font-semibold mb-2">Aucune formation</h2>
          <p className="text-muted-foreground text-sm mb-6">Inscrivez-vous à une formation pour commencer votre apprentissage.</p>
          <Button asChild>
            <Link href="/courses">Explorer les formations</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollmentsWithProgress.map((enrollment) => {
            const course = enrollment.courses as { title_fr: string; slug: string; level: string } | null;
            const isCompleted = enrollment.status === "completed";

            return (
              <div key={enrollment.id} className="bg-card border border-border rounded-2xl p-6 flex gap-5 hover:border-primary/30 transition-colors">
                {/* Course icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #7B3A10, #C4873A)" }}
                >
                  <BookOpen className="w-6 h-6 text-white/80" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-base">{course?.title_fr ?? "Formation"}</h3>
                    {isCompleted ? (
                      <Badge className="bg-green-500 text-white shrink-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Terminé
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">En cours</Badge>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{enrollment.completedLessons}/{enrollment.totalLessons} leçons</span>
                      <span>{enrollment.progressPct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${enrollment.progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link href={`/courses/${course?.slug}`}>
                      <Button size="sm" variant="outline">Détails</Button>
                    </Link>
                    <Link href={`/courses/${course?.slug}`}>
                      <Button size="sm" className="gap-1">
                        {isCompleted ? "Revoir" : "Continuer"}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                    {isCompleted && (
                      <Link href={`/learn/${course?.slug}/certificate`}>
                        <Button size="sm" variant="outline" className="gap-1 text-amber-600 border-amber-300 hover:bg-amber-50">
                          Certificat
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
