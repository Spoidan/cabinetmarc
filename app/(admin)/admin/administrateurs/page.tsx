import { adminListProfilesByRole } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { UsersTable } from "@/components/admin/UsersTable";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { SyncRoleButton } from "@/components/admin/SyncRoleButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Administrateurs" };

export default async function AdminAdminsPage() {
  const currentUserId = await requireAdmin();
  const admin = createSupabaseAdminClient();

  const [admins, { data: currentProfile }] = await Promise.all([
    adminListProfilesByRole("admin"),
    admin.from("profiles").select("id, full_name, email, role").eq("id", currentUserId).maybeSingle(),
  ]);

  const currentIsProfileAdmin = currentProfile?.role === "admin";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Administrateurs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {admins.length} administrateur{admins.length !== 1 ? "s" : ""} dans la table profiles.
        </p>
      </header>

      {/* Explanation banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-900/10 p-4 flex gap-3 text-sm">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium">Deux systèmes d&apos;accès</p>
          <p className="text-muted-foreground">
            L&apos;accès admin est accordé via la variable d&apos;environnement{" "}
            <code className="rounded bg-background px-1 py-0.5 text-xs">ADMIN_USER_IDS</code>{" "}
            (Clerk user IDs). Ce tableau reflète séparément les profils avec le rôle{" "}
            <code className="rounded bg-background px-1 py-0.5 text-xs">admin</code> dans la
            table <code className="rounded bg-background px-1 py-0.5 text-xs">profiles</code>.
            Gardez les deux synchronisés.
          </p>
        </div>
      </div>

      {/* Current user's status */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold">Votre statut</h2>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {currentIsProfileAdmin ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium">
                {currentProfile?.full_name ?? currentProfile?.email ?? currentUserId}
              </p>
              <p className="text-xs text-muted-foreground">
                Accès ADMIN_USER_IDS :{" "}
                <span className="text-emerald-600 font-medium">actif</span>
                {" · "}
                Rôle dans profiles :{" "}
                <span className={currentIsProfileAdmin ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                  {currentProfile?.role ?? "introuvable"}
                </span>
              </p>
            </div>
          </div>
          {!currentIsProfileAdmin && currentProfile && (
            <SyncRoleButton userId={currentProfile.id} />
          )}
        </div>
      </div>

      <UsersTable
        profiles={admins}
        showEnrollments={false}
        emptyLabel="Aucun profil avec le rôle admin dans la table profiles. Utilisez le bouton ci-dessus pour synchroniser votre accès."
      />
    </div>
  );
}
