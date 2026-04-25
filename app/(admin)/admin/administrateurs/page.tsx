import { adminListProfilesByRole } from "@/lib/admin/queries";
import { UsersTable } from "@/components/admin/UsersTable";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administrateurs" };

export default async function AdminAdminsPage() {
  const admins = await adminListProfilesByRole("admin");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Administrateurs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {admins.length} administrateur{admins.length > 1 ? "s" : ""}.
        </p>
      </header>
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-900/10 p-4 flex gap-3 text-sm">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Note importante</p>
          <p className="text-muted-foreground">
            L&apos;accès administrateur est contrôlé par la variable d&apos;environnement
            <code className="mx-1 rounded bg-background px-1 py-0.5 text-xs">ADMIN_USER_IDS</code>
            (Clerk user IDs). Ce tableau reflète le rôle dans la table
            <code className="mx-1 rounded bg-background px-1 py-0.5 text-xs">profiles</code> :
            mettez les deux à jour conjointement.
          </p>
        </div>
      </div>
      <UsersTable
        profiles={admins}
        showEnrollments={false}
        emptyLabel="Aucun profil avec le rôle administrateur. (Vous y êtes peut-être par ADMIN_USER_IDS sans avoir le rôle synchronisé.)"
      />
    </div>
  );
}
