import { adminListProfilesByRole } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin";
import { UsersTable } from "@/components/admin/UsersTable";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administrateurs" };

export default async function AdminAdminsPage() {
  await requireAdmin();
  const admins = await adminListProfilesByRole("admin");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Administrateurs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {admins.length} administrateur{admins.length !== 1 ? "s" : ""} actif{admins.length !== 1 ? "s" : ""}
        </p>
      </header>

      <div className="rounded-2xl border border-sky-200 bg-sky-50/60 dark:border-sky-900/40 dark:bg-sky-900/10 p-4 flex gap-3 text-sm">
        <Shield className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium">Gestion des administrateurs</p>
          <p className="text-muted-foreground">
            Pour promouvoir un utilisateur, allez dans <strong>Étudiants</strong> ou <strong>Instructeurs</strong>,
            trouvez le compte et changez son rôle en <strong>Administrateur</strong> via le sélecteur de rôle.
            L&apos;accès au panneau d&apos;administration est actif immédiatement sans modifier les variables d&apos;environnement.
          </p>
        </div>
      </div>

      <UsersTable
        profiles={admins}
        showEnrollments={false}
        emptyLabel="Aucun administrateur pour le moment."
      />
    </div>
  );
}
