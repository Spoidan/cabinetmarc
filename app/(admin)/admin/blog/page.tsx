"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

type Post = {
  id: string;
  slug: string;
  title_fr: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  read_time: number;
  author: { id: string; name: string } | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  "Économie":      "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Gestion":       "bg-sky-100 text-sky-700 border-sky-200",
  "Droit":         "bg-violet-100 text-violet-700 border-violet-200",
  "Statistiques":  "bg-amber-100 text-amber-700 border-amber-200",
  "Entrepreneuriat":"bg-rose-100 text-rose-700 border-rose-200",
  "TICs":          "bg-cyan-100 text-cyan-700 border-cyan-200",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then(({ data }) => setPosts(data ?? []))
      .catch(() => toast.error("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const togglePublish = async (p: Post) => {
    const res = await fetch("/api/admin/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, is_published: !p.is_published }),
    });
    if (res.ok) {
      setPosts((prev) => prev.map((x) => x.id === p.id ? { ...x, is_published: !p.is_published } : x));
      toast.success(p.is_published ? "Article dépublié" : "Article publié");
    } else toast.error("Erreur lors de la mise à jour");
  };

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`Supprimer "${title}" définitivement ?`)) return;
    const res = await fetch("/api/admin/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Article supprimé");
    } else toast.error("Erreur lors de la suppression");
  };

  const published = posts.filter((p) => p.is_published).length;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog & Articles</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Chargement…" : `${posts.length} article${posts.length !== 1 ? "s" : ""} · ${published} publié${published !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/nouveau">
            <Plus className="w-4 h-4" />
            Nouvel article
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
          Chargement des articles…
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-border">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Aucun article</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Rédigez votre premier article de blog.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/admin/blog/nouveau"><Plus className="w-4 h-4" />Nouvel article</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Titre</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Auteur</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/blog/${p.id}`} className="font-medium hover:text-primary transition-colors line-clamp-1">
                      {p.title_fr}
                    </Link>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" /> {p.read_time} min
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[p.category] ?? "bg-muted text-muted-foreground border-border"}`}>
                      {p.category || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {p.author?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                    {p.is_published && p.published_at ? formatDate(p.published_at) : formatDate(p.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.is_published ? "emerald" : "outline"} className="text-xs">
                      {p.is_published ? "Publié" : "Brouillon"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                        <Link href={`/admin/blog/${p.id}`}><Pencil className="w-3.5 h-3.5" /></Link>
                      </Button>
                      <button
                        onClick={() => togglePublish(p)}
                        className="w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center transition-colors"
                        title={p.is_published ? "Dépublier" : "Publier"}
                      >
                        {p.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => deletePost(p.id, p.title_fr)}
                        className="w-7 h-7 rounded-md hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
