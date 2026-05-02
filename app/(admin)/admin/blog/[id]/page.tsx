"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Eye, EyeOff, Trash2, ScanEye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ApiImageUploader } from "@/components/admin/ApiImageUploader";
import { TipTapEditor } from "@/components/admin/TipTapEditor";

const CATEGORIES = ["Économie", "Gestion", "Droit", "Statistiques", "Entrepreneuriat", "TICs", "Général"];

type TeamMember = { id: string; name: string };
type Form = {
  title_fr: string; slug: string; excerpt_fr: string; content_fr: string;
  category: string; author_id: string; read_time: number;
  image_url: string | null; tags: string; is_published: boolean;
};

export default function EditBlogPostPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState<Form>({
    title_fr: "", slug: "", excerpt_fr: "", content_fr: "",
    category: "", author_id: "", read_time: 5, image_url: null, tags: "", is_published: false,
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/blog?id=${id}`).then((r) => r.json()),
      fetch("/api/admin/team").then((r) => r.json()),
    ]).then(([{ data: post }, { data: team }]) => {
      if (post) {
        setForm({
          title_fr: post.title_fr ?? "",
          slug: post.slug ?? "",
          excerpt_fr: post.excerpt_fr ?? "",
          content_fr: post.content_fr ?? "",
          category: post.category ?? "",
          author_id: post.author_id ?? "",
          read_time: post.read_time ?? 5,
          image_url: post.image_url ?? null,
          tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
          is_published: post.is_published ?? false,
        });
      } else toast.error("Article introuvable.");
      setTeamMembers((team ?? []).filter((m: { is_active: boolean }) => m.is_active));
    }).finally(() => setLoading(false));
  }, [id]);

  const setField = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const save = async (togglePublish?: boolean) => {
    if (!form.title_fr.trim()) { toast.error("Le titre est obligatoire."); return; }
    togglePublish ? setPublishing(true) : setSaving(true);

    const newPublished = togglePublish !== undefined ? !form.is_published : form.is_published;

    const body = {
      id,
      ...form,
      title_en: form.title_fr,
      excerpt_en: form.excerpt_fr,
      content_en: form.content_fr,
      author_id: form.author_id || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      is_published: newPublished,
      read_time: Number(form.read_time),
    };

    const res = await fetch("/api/admin/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      if (togglePublish !== undefined) setForm((p) => ({ ...p, is_published: newPublished }));
      toast.success(togglePublish !== undefined ? (newPublished ? "Article publié." : "Article dépublié.") : "Article mis à jour.");
    } else {
      const json = await res.json();
      toast.error(json.error ?? "Erreur lors de l'enregistrement.");
    }
    setSaving(false);
    setPublishing(false);
  };

  const deletePost = async () => {
    if (!confirm(`Supprimer "${form.title_fr}" définitivement ?`)) return;
    const res = await fetch("/api/admin/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { toast.success("Article supprimé."); router.push("/admin/blog"); }
    else toast.error("Erreur lors de la suppression.");
  };

  if (loading) return (
    <div className="py-20 text-center text-muted-foreground">
      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />Chargement…
    </div>
  );

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/blog"><ArrowLeft className="w-4 h-4" />Blog</Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{form.title_fr || "Modifier l'article"}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={form.is_published ? "emerald" : "outline"} className="text-xs">
              {form.is_published ? "Publié" : "Brouillon"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={deletePost} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/admin/blog/${id}/apercu`, "_blank", "noopener")}
          >
            <ScanEye className="w-4 h-4" />
            Aperçu
          </Button>
          <Button variant="outline" onClick={() => save(true)} disabled={saving || publishing}>
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : form.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {publishing ? "…" : form.is_published ? "Dépublier" : "Publier"}
          </Button>
          <Button onClick={() => save()} disabled={saving || publishing}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Titre *</Label>
            <Input value={form.title_fr} onChange={setField("title_fr")} className="text-lg font-semibold" />
          </div>
          <div className="space-y-1.5">
            <Label>Slug (URL)</Label>
            <Input value={form.slug} onChange={setField("slug")} className="font-mono text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label>Résumé</Label>
            <textarea
              value={form.excerpt_fr}
              onChange={setField("excerpt_fr")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Contenu</Label>
            <div className="rounded-xl border border-border overflow-hidden">
              <TipTapEditor
                key={id}
                initial={form.content_fr}
                onChange={(html) => setForm((p) => ({ ...p, content_fr: html }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paramètres</p>
            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <select value={form.category} onChange={setField("category")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">— Choisir —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Auteur</Label>
              <select value={form.author_id} onChange={setField("author_id")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">— Aucun —</option>
                {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Temps de lecture (min)</Label>
              <Input type="number" value={form.read_time} onChange={(e) => setForm((p) => ({ ...p, read_time: parseInt(e.target.value) || 5 }))} min={1} />
            </div>
            <div className="space-y-1.5">
              <Label>Tags</Label>
              <Input value={form.tags} onChange={setField("tags")} placeholder="tag1, tag2, tag3" />
              <p className="text-xs text-muted-foreground">Séparés par des virgules.</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image de couverture</p>
            <ApiImageUploader
              uploadApiPath="/api/admin/blog/upload"
              bucket="blog-covers"
              value={form.image_url}
              onChange={(url) => setForm((p) => ({ ...p, image_url: url }))}
              aspect="landscape"
              label="Image de couverture"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
