"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCourse } from "@/app/(admin)/admin/actions";
import { slugify } from "@/lib/utils";

export function NewCourseForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [categoryId, setCategoryId] = React.useState(categories[0]?.id ?? "");
  const [level, setLevel] = React.useState<"debutant" | "intermediaire" | "avance">("debutant");
  const [price, setPrice] = React.useState("0");
  const [pending, startTransition] = React.useTransition();

  const computedSlug = slugTouched ? slug : slugify(title);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !computedSlug || !categoryId) {
      toast.error("Veuillez remplir titre, slug et catégorie.");
      return;
    }
    startTransition(async () => {
      const res = await createCourse({
        title: title.trim(),
        slug: computedSlug,
        category_id: categoryId,
        level,
        price_bif: Math.max(0, parseInt(price, 10) || 0),
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Cours créé.");
      if (res.id) router.push(`/admin/cours/${res.id}/editer`);
      else router.push("/admin/cours");
    });
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ex. Les fondamentaux de la fiscalité OHADA"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={computedSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="fondamentaux-fiscalite-ohada"
          required
        />
        <p className="text-xs text-muted-foreground">
          URL : /cours/{computedSlug || "..."}
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cat">Catégorie</Label>
          <select
            id="cat"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="level">Niveau</Label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value as typeof level)}
            className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
          >
            <option value="debutant">Débutant</option>
            <option value="intermediaire">Intermédiaire</option>
            <option value="avance">Avancé</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Prix (BIF)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step={100}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => history.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Création..." : "Créer et éditer"}
        </Button>
      </div>
    </form>
  );
}
