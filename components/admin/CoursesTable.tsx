"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Edit,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "./ConfirmDialog";
import { toggleCoursePublished, deleteCourse } from "@/app/(admin)/admin/actions";
import { formatBIF, formatDateFr } from "@/lib/format";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  price_bif: number;
  level: string;
  author_id: string | null;
  category_id: string;
  category_name?: string;
  enrollments_count: number;
};

type Cat = { id: string; name: string };

const LEVELS: Record<string, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export function CoursesTable({
  courses,
  categories,
}: {
  courses: CourseRow[];
  categories: Cat[];
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"updated" | "title" | "enrollments">("updated");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<{ id: string; title: string } | null>(null);

  const onSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses
      .filter((c) => {
        if (statusFilter === "published" && !c.is_published) return false;
        if (statusFilter === "draft" && c.is_published) return false;
        if (categoryFilter !== "all" && c.category_id !== categoryFilter) return false;
        if (q && !`${c.title} ${c.category_name ?? ""}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortBy === "title") return a.title.localeCompare(b.title) * dir;
        if (sortBy === "enrollments")
          return (a.enrollments_count - b.enrollments_count) * dir;
        return (
          (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * dir
        );
      });
  }, [courses, search, statusFilter, categoryFilter, sortBy, sortDir]);

  const togglePublish = async (course: CourseRow) => {
    setPendingId(course.id);
    const target = !course.is_published;
    const res = await toggleCoursePublished(course.id, target);
    setPendingId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(target ? "Cours publié." : "Cours dépublié.");
    router.refresh();
  };

  const onDelete = async () => {
    if (!confirm) return;
    setPendingId(confirm.id);
    const res = await deleteCourse(confirm.id);
    setPendingId(null);
    setConfirm(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Cours supprimé.");
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un cours..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as typeof statusFilter)
          }
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm"
          aria-label="Filtrer par statut"
        >
          <option value="all">Tous statuts</option>
          <option value="published">Publié</option>
          <option value="draft">Brouillon</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm"
          aria-label="Filtrer par catégorie"
        >
          <option value="all">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <Th label="Titre" onSort={() => onSort("title")} active={sortBy === "title"} dir={sortDir} />
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Catégorie</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Niveau</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Prix</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Statut</th>
              <Th label="Inscriptions" onSort={() => onSort("enrollments")} active={sortBy === "enrollments"} dir={sortDir} />
              <Th label="Mise à jour" onSort={() => onSort("updated")} active={sortBy === "updated"} dir={sortDir} />
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted-foreground">
                  {courses.length === 0
                    ? "Aucun cours pour le moment."
                    : "Aucun cours ne correspond à vos filtres."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">/{c.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.category_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{LEVELS[c.level] ?? c.level}</td>
                  <td className="px-4 py-3">
                    {c.price_bif === 0 ? (
                      <Badge variant="emerald">Gratuit</Badge>
                    ) : (
                      <span className="font-medium">{formatBIF(c.price_bif)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.is_published ? "emerald" : "outline"}>
                      {c.is_published ? "Publié" : "Brouillon"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.enrollments_count}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDateFr(c.updated_at, "d MMM yyyy")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn
                        title={c.is_published ? "Dépublier" : "Publier"}
                        onClick={() => togglePublish(c)}
                        loading={pendingId === c.id}
                      >
                        {c.is_published ? (
                          <ToggleRight className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </IconBtn>
                      <Link
                        href={`/cours/${c.slug}`}
                        target="_blank"
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label="Aperçu"
                        title="Aperçu"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/cours/${c.id}/editer`}
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label="Éditer"
                        title="Éditer"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <IconBtn
                        title="Supprimer"
                        onClick={() => setConfirm({ id: c.id, title: c.title })}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Supprimer ce cours ?"
        description={
          confirm
            ? `Cette action supprimera définitivement « ${confirm.title} ». Les leçons, quiz et inscriptions associés seront également supprimés.`
            : ""
        }
        confirmLabel="Supprimer"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}

function Th({
  label,
  onSort,
  active,
  dir,
}: {
  label: string;
  onSort: () => void;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
      <button
        type="button"
        onClick={onSort}
        className={`inline-flex items-center gap-1 ${active ? "text-foreground" : ""}`}
      >
        {label}
        <ArrowUpDown className={`w-3 h-3 ${active ? "" : "opacity-40"}`} />
        {active && <span className="sr-only">{dir === "asc" ? "Croissant" : "Décroissant"}</span>}
      </button>
    </th>
  );
}

function IconBtn({
  title,
  onClick,
  loading,
  children,
}: {
  title: string;
  onClick: () => void;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={title}
      aria-label={title}
      className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}
