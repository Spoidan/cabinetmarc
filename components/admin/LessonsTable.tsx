"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Edit, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/format";

type Lesson = {
  id: string;
  title: string;
  slug: string;
  duration_minutes: number | null;
  is_free_preview: boolean;
  module_title: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  course_published: boolean;
};

export function LessonsTable({ lessons }: { lessons: Lesson[] }) {
  const [search, setSearch] = React.useState("");
  const [scope, setScope] = React.useState<"all" | "preview" | "paid">("all");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return lessons.filter((l) => {
      if (scope === "preview" && !l.is_free_preview) return false;
      if (scope === "paid" && l.is_free_preview) return false;
      if (
        q &&
        !`${l.title} ${l.module_title} ${l.course_title}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [lessons, search, scope]);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une leçon, un module ou un cours..."
            className="pl-9 h-9"
          />
        </div>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as typeof scope)}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm"
          aria-label="Filtrer par accès"
        >
          <option value="all">Toutes les leçons</option>
          <option value="preview">Aperçu gratuit uniquement</option>
          <option value="paid">Inscription requise</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Leçon</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Module</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Cours</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Durée</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Accès</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  {lessons.length === 0
                    ? "Aucune leçon n'a encore été créée."
                    : "Aucune leçon ne correspond à vos filtres."}
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{l.title}</p>
                    <p className="text-xs text-muted-foreground">/{l.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.module_title}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/cours/${l.course_id}/editer`}
                      className="hover:text-primary"
                    >
                      {l.course_title}
                    </Link>
                    {!l.course_published && (
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                        brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDuration(l.duration_minutes)}
                  </td>
                  <td className="px-4 py-3">
                    {l.is_free_preview ? (
                      <Badge variant="emerald">Aperçu gratuit</Badge>
                    ) : (
                      <Badge variant="outline">Inscription requise</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {l.course_published && (
                        <Link
                          href={`/cours/${l.course_slug}/apprendre/${l.slug}`}
                          target="_blank"
                          title="Aperçu"
                          aria-label="Aperçu côté étudiant"
                          className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/cours/${l.course_id}/editer`}
                        title="Éditer"
                        aria-label="Ouvrir l'éditeur"
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
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
