import { adminListProfilesByRole } from "@/lib/admin/queries";
import { UsersTable } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Instructeurs" };

export default async function AdminInstructorsPage() {
  const instructors = await adminListProfilesByRole("instructor");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Instructeurs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {instructors.length} compte{instructors.length > 1 ? "s" : ""} avec le rôle instructeur. Promouvez un étudiant depuis l&apos;onglet « Étudiants ».
        </p>
      </header>
      <UsersTable
        profiles={instructors}
        showEnrollments={false}
        emptyLabel="Aucun instructeur pour le moment. Vous pouvez promouvoir un étudiant existant depuis la page Étudiants."
      />
    </div>
  );
}
