import { adminListProfilesByRole } from "@/lib/admin/queries";
import { UsersTable } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Étudiants" };

export default async function AdminStudentsPage() {
  const students = await adminListProfilesByRole("student");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Étudiants</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {students.length} compte{students.length > 1 ? "s" : ""}
        </p>
      </header>
      <UsersTable profiles={students} emptyLabel="Aucun étudiant pour le moment." />
    </div>
  );
}
