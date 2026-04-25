import Link from "next/link";
import { adminProgressionStats } from "@/lib/admin/queries";
import { Progress } from "@/components/ui/progress";
import { ProgressBuckets } from "@/components/admin/ProgressBuckets";

export const dynamic = "force-dynamic";
export const metadata = { title: "Progression" };

export default async function ProgressionReportPage() {
  const stats = await adminProgressionStats();

  const completion =
    stats.totalEnrollments === 0 ? 0 : Math.round((stats.completed / stats.totalEnrollments) * 100);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Rapport — Progression</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Avancement des étudiants à travers le catalogue.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Étudiants inscrits" value={stats.totalStudents.toLocaleString("fr-FR")} />
        <Stat label="Inscriptions à un cours" value={stats.totalEnrollments.toLocaleString("fr-FR")} />
        <Stat label="Cours terminés" value={stats.completed.toLocaleString("fr-FR")} />
        <Stat label="Taux de complétion" value={`${completion} %`} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold mb-4">Répartition de la progression</h2>
        <ProgressBuckets buckets={stats.buckets} />
      </section>

      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <header className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Progression moyenne par cours</h2>
        </header>
        {stats.perCourse.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground text-center">
            Aucune inscription pour l&apos;instant.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Cours</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Inscriptions</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Terminés</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Progression moyenne</th>
              </tr>
            </thead>
            <tbody>
              {stats.perCourse.map((c) => (
                <tr key={c.course_id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/cours`} className="hover:text-primary">{c.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.total}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.completed}</td>
                  <td className="px-4 py-3 w-72">
                    <div className="flex items-center gap-2">
                      <Progress value={c.average} className="flex-1" />
                      <span className="text-xs text-muted-foreground w-10 text-right">{c.average} %</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
