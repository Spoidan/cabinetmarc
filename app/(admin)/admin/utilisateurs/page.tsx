import { adminListStudents } from "@/lib/admin/queries";
import { Badge } from "@/components/ui/badge";
import { formatDateFr } from "@/lib/format";
import { RoleSelect } from "@/components/admin/RoleSelect";

export const dynamic = "force-dynamic";
export const metadata = { title: "Étudiants" };

export default async function AdminStudentsPage() {
  const students = await adminListStudents();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Étudiants</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {students.length} compte{students.length > 1 ? "s" : ""}
        </p>
      </header>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rôle</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Inscrit à</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Inscription</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  Aucun étudiant pour le moment.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    {s.full_name ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{s.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <RoleSelect userId={s.id} role={s.role as "student" | "instructor" | "admin"} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{s.enrollments_count} cours</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDateFr(s.created_at, "d MMM yyyy")}
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
