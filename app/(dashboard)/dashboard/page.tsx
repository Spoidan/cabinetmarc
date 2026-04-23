import { auth, currentUser } from "@clerk/nextjs/server";
import { BookOpen, Clock, Award, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const db = getAdmin();

  // Fetch real data
  const [{ data: enrollments }, { data: certificates }, { data: progress }] = await Promise.all([
    db.from("enrollments").select("*, courses(id, title_fr, slug)").eq("user_id", userId!),
    db.from("certificates").select("id").eq("user_id", userId!),
    db.from("lesson_progress").select("id").eq("user_id", userId!),
  ]);

  const enrolledCount = enrollments?.length ?? 0;
  const certCount = certificates?.length ?? 0;
  const completedCourses = enrollments?.filter((e) => e.status === "completed").length ?? 0;
  const avgProgress = enrolledCount > 0 ? Math.round((completedCourses / enrolledCount) * 100) : 0;

  // Recent enrollments with progress
  const recentEnrollments = (enrollments ?? []).slice(0, 3);

  const stats = [
    { label: "Cours inscrits", value: String(enrolledCount), icon: BookOpen, color: "bg-blue-500/10 text-blue-600" },
    { label: "Leçons complétées", value: String(progress?.length ?? 0), icon: Clock, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Certificats obtenus", value: String(certCount), icon: Award, color: "bg-amber-500/10 text-amber-600" },
    { label: "Cours terminés", value: String(completedCourses), icon: TrendingUp, color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="max-w-5xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Bonjour, {user?.firstName ?? "cher étudiant"} !
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue dans votre espace d&apos;apprentissage Cabinet MARC.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-0.5">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* In progress courses */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold">Formations en cours</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/courses">
              Voir tout <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>

        {recentEnrollments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Aucune formation en cours.</p>
            <Link href="/courses">
              <Button size="sm" className="mt-3">Explorer les formations</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentEnrollments.map((enrollment) => {
              const courseTitle = enrollment.courses?.title_fr ?? "Formation";
              const courseSlug = enrollment.courses?.slug ?? "";
              const isCompleted = enrollment.status === "completed";

              return (
                <div key={enrollment.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #7B3A10, #C4873A)" }}>
                    <BookOpen className="w-5 h-5 text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-sm truncate">{courseTitle}</span>
                      <span className="text-xs text-muted-foreground ml-2 shrink-0">
                        {isCompleted ? "100%" : "En cours"}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary rounded-full h-1.5 transition-all"
                        style={{ width: isCompleted ? "100%" : "50%" }}
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/courses/${courseSlug}`}>
                      {isCompleted ? "Revoir" : "Continuer"}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificates CTA */}
      {certCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold mb-1">
              {certCount === 1 ? "Vous avez 1 certificat !" : `Vous avez ${certCount} certificats !`}
            </h3>
            <p className="text-muted-foreground text-sm">Consultez et partagez vos réussites.</p>
          </div>
          <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
            <Link href="/dashboard/certificates">Mes certificats</Link>
          </Button>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-2xl p-6 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #1A1A1A, #3a1a08)" }}>
        <div>
          <h3 className="font-bold text-white mb-1">Découvrir de nouvelles formations</h3>
          <p className="text-white/50 text-sm">Explorez notre catalogue de formations professionnelles</p>
        </div>
        <Button asChild className="bg-[#C4873A] hover:bg-[#b37535] text-white border-0">
          <Link href="/courses">Explorer</Link>
        </Button>
      </div>
    </div>
  );
}
