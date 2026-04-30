"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ApiImageUploader } from "@/components/admin/ApiImageUploader";
import { TipTapEditor } from "@/components/admin/TipTapEditor";

const CATEGORIES = ["Économie", "Gestion", "Droit", "Statistiques", "Entrepreneuriat", "TICs", "Général"];

type TeamMember = { id: string; name: string };

function toSlug(title: string) {
  return title.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 80);
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [slugEdited, setSlugEdited] = useState(false);
  const [form, setForm] = useState({
    title_fr: "",
    slug: "",
    excerpt_fr: "",
    content_fr: "",
    category: "",
    author_id: "",
    read_time: 5,
    image_url: null as string | null,
    tags: "",
    is_published: false,
  });

  useEffect(() => {
    fetch("/api/admin/team").then((r) => r.json()).then(({ data }) => setTeamMembers((data ?? []).filter((m: { is_active: boolean }) => m.is_active)));
  }, []);

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = e.target.value;
    setForm((p) => ({ ...p, title_fr: t, slug: slugEdited ? p.slug : toSlug(t) }));
  };

  const save = async (publish = false) => {
    if (!form.title_fr.trim()) { toast.error("Le titre est obligatoire."); return; }
    publish ? setPublishing(true) : setSaving(true);

    const body = {
      ...form,
      slug: form.slug || toSlug(form.title_fr),
      title_en: form.title_fr,
      excerpt_en: form.excerpt_fr,
      content_en: form.content_fr,
      author_id: form.author_id || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      is_published: publish,
      read_time: Number(form.read_time),
    };

    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(publish ? "Article publié." : "Brouillon enregistré.");
      router.push("/admin/blog");
    } else {
      const json = await res.json();
      toast.error(json.error ?? "Erreur lors de l'enregistrement.");
    }
    setSaving(false);
    setPublishing(false);
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/blog"><ArrowLeft className="w-4 h-4" />Blog</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Nouvel article</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => save(false)} disabled={saving || publishing}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Enregistrement…" : "Brouillon"}
          </Button>
          <Button onClick={() => save(true)} disabled={saving || publishing}>
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            {publishing ? "Publication…" : "Publier"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Main content */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label>Titre *</Label>
            <Input
              value={form.title_fr}
              onChange={onTitleChange}
              placeholder="Titre de l'article"
              className="text-lg font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Slug (URL)</Label>
            <Input
              value={form.slug}
              onChange={(e) => { setSlugEdited(true); setField("slug")(e); }}
              placeholder="slug-de-larticle"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Généré automatiquement depuis le titre. Modifiable manuellement.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Résumé</Label>
            <textarea
              value={form.excerpt_fr}
              onChange={setField("excerpt_fr")}
              placeholder="Courte description affichée dans la liste des articles (2-3 phrases)…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Contenu</Label>
            <div className="rounded-xl border border-border overflow-hidden">
              <TipTapEditor
                initial=""
                onChange={(html) => setForm((p) => ({ ...p, content_fr: html }))}
                placeholder="Rédigez votre article ici…"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paramètres</p>

            <div className="space-y-1.5">
              <Label>Catégorie</Label>
              <select
                value={form.category}
                onChange={setField("category")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— Choisir —</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Auteur</Label>
              <select
                value={form.author_id}
                onChange={setField("author_id")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— Aucun —</option>
                {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Temps de lecture (min)</Label>
              <Input
                type="number"
                value={form.read_time}
                onChange={(e) => setForm((p) => ({ ...p, read_time: parseInt(e.target.value) || 5 }))}
                min={1}
              />
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

          {form.category && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Aperçu</p>
              <Badge variant="outline" className="text-xs">{form.category}</Badge>
              {form.title_fr && <p className="font-semibold text-sm mt-2 line-clamp-2">{form.title_fr}</p>}
              {form.excerpt_fr && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.excerpt_fr}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
