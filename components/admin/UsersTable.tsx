"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RoleSelect } from "./RoleSelect";
import { formatDateFr } from "@/lib/format";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
  enrollments_count: number;
};

export function UsersTable({
  profiles,
  showEnrollments = true,
  emptyLabel,
}: {
  profiles: Profile[];
  showEnrollments?: boolean;
  emptyLabel: string;
}) {
  const [search, setSearch] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) =>
      `${p.full_name ?? ""} ${p.email ?? ""} ${p.id}`.toLowerCase().includes(q)
    );
  }, [profiles, search]);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="pl-9 h-9"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rôle</th>
              {showEnrollments && (
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Inscrit à</th>
              )}
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Inscription</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={showEnrollments ? 5 : 4} className="text-center py-12 text-muted-foreground">
                  {profiles.length === 0 ? emptyLabel : "Aucun utilisateur ne correspond à la recherche."}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    {p.full_name ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <RoleSelect userId={p.id} role={p.role as "student" | "instructor" | "admin"} />
                  </td>
                  {showEnrollments && (
                    <td className="px-4 py-3">
                      <Badge variant="outline">{p.enrollments_count} cours</Badge>
                    </td>
                  )}
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDateFr(p.created_at, "d MMM yyyy")}
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
