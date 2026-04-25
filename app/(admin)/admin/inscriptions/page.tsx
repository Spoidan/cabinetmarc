import Link from "next/link";
import { adminListEnrollments } from "@/lib/admin/queries";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDateFr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inscriptions" };

export default async function AdminEnrollmentsPage() {
  const enrollments = await adminListEnrollments();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Inscriptions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {enrollments.length} inscription{enrollments.length > 1 ? "s" : ""}
        </p>
      </header>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Étudiant</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Cours</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Progression</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Inscrit le</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Statut</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  Aucune inscription pour le moment.
                </td>
              </tr>
            ) : (
              enrollments.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{e.user?.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{e.user?.email ?? e.user_id.slice(0, 12)}</p>
                  </td>
                  <td className="px-4 py-3">
                    {e.course ? (
                      <Link href={`/cours/${e.course.slug}`} target="_blank" className="hover:text-primary">
                        {e.course.title}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 w-48">
                    <div className="flex items-center gap-2">
                      <Progress value={e.progress_percent} className="flex-1" />
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {e.progress_percent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDateFr(e.enrolled_at, "d MMM yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    {e.completed_at ? (
                      <Badge variant="emerald">Terminé</Badge>
                    ) : (
                      <Badge variant="outline">En cours</Badge>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
