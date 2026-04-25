"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, ToggleLeft, ToggleRight, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  toggleCategoryActive,
  deleteCategory,
  createCategory,
} from "@/app/(admin)/admin/actions";
import { slugify } from "@/lib/utils";

type Cat = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  course_count: number;
};

export function CategoriesPanel({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [icon, setIcon] = React.useState("book-open");
  const [pending, startTransition] = React.useTransition();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<{ id: string; name: string } | null>(null);

  const submitNew = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = slug || slugify(name);
    if (!name.trim() || !finalSlug) {
      toast.error("Nom et slug requis.");
      return;
    }
    startTransition(async () => {
      const res = await createCategory({ name: name.trim(), slug: finalSlug, icon });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Catégorie créée.");
      setName("");
      setSlug("");
      router.refresh();
    });
  };

  const onToggle = async (cat: Cat) => {
    setPendingId(cat.id);
    const res = await toggleCategoryActive(cat.id, !cat.is_active);
    setPendingId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(cat.is_active ? "Catégorie désactivée." : "Catégorie activée.");
    router.refresh();
  };

  const onDelete = async () => {
    if (!confirm) return;
    setPendingId(confirm.id);
    const res = await deleteCategory(confirm.id);
    setPendingId(null);
    setConfirm(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Catégorie supprimée.");
    router.refresh();
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Slug</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Cours</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Statut</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  Aucune catégorie.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    {c.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">/{c.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.course_count}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.is_active ? "emerald" : "outline"}>
                      {c.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onToggle(c)}
                        disabled={pendingId === c.id}
                        title={c.is_active ? "Désactiver" : "Activer"}
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"
                      >
                        {pendingId === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : c.is_active ? (
                          <ToggleRight className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirm({ id: c.id, name: c.name })}
                        title="Supprimer"
                        className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={submitNew} className="rounded-2xl border border-border bg-card p-5 h-fit space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle catégorie
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug || slugify(name)}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="icon">Icône (lucide)</Label>
          <Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} />
        </div>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Création..." : "Ajouter la catégorie"}
        </Button>
      </form>

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Supprimer cette catégorie ?"
        description={
          confirm
            ? `« ${confirm.name} » sera supprimée. Tous les cours associés seront également supprimés.`
            : ""
        }
        confirmLabel="Supprimer"
        destructive
        onConfirm={onDelete}
      />
    </div>
  );
}
