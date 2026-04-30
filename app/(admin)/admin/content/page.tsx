"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Save, ExternalLink, Home, Info, Briefcase, Users, BookOpen,
  Phone, Newspaper, Loader2, RotateCcw, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  HERO_DEFAULTS,
  HOME_HERO_DEFAULTS,
  type HeroContent,
  type HomeHeroContent,
} from "@/lib/content-defaults";

/* ─── Page list ────────────────────────────────────────────────────────── */

const PAGES = [
  { key: "home",     label: "Accueil",   icon: Home,      href: "/",        description: "Page d'accueil" },
  { key: "about",    label: "À Propos",  icon: Info,      href: "/about",   description: "Présentation du cabinet" },
  { key: "services", label: "Services",  icon: Briefcase, href: "/services",description: "Nos prestations" },
  { key: "team",     label: "Équipe",    icon: Users,     href: "/team",    description: "L'équipe du cabinet" },
  { key: "blog",     label: "Blog",      icon: Newspaper, href: "/blog",    description: "Actualités & articles" },
  { key: "contact",  label: "Contact",   icon: Phone,     href: "/contact", description: "Page de contact" },
] as const;

type PageKey = (typeof PAGES)[number]["key"];

/* ─── Home hero editor ─────────────────────────────────────────────────── */

function HomeHeroEditor() {
  const [data, setData] = useState<HomeHeroContent>({ ...HOME_HERO_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/hero?locale=fr")
      .then((r) => r.json())
      .then(({ data: d }) => {
        if (d) setData({ ...HOME_HERO_DEFAULTS, ...d });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof HomeHeroContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((prev) => ({ ...prev, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/hero", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, locale: "fr" }),
    });
    if (res.ok) {
      setSaved(true);
      toast.success("Page d'accueil mise à jour.");
      setTimeout(() => setSaved(false), 3000);
    } else {
      const json = await res.json();
      toast.error(json.error ?? "Erreur lors de l'enregistrement.");
    }
    setSaving(false);
  };

  const reset = () => {
    setData({ ...HOME_HERO_DEFAULTS });
    toast.info("Champs réinitialisés aux valeurs par défaut. Cliquez sur Enregistrer pour confirmer.");
  };

  if (loading) return <EditorSkeleton />;

  return (
    <div className="space-y-8">
      <Section title="En-tête de la page">
        <Field
          label="Badge"
          hint="Petite étiquette colorée affichée au-dessus du titre."
        >
          <Input value={data.badge_text ?? ""} onChange={set("badge_text")} placeholder={HOME_HERO_DEFAULTS.badge_text} />
        </Field>
        <Field
          label="Titre principal"
          hint="Le grand titre (h1) visible en premier sur la page."
        >
          <Input value={data.title ?? ""} onChange={set("title")} placeholder={HOME_HERO_DEFAULTS.title} />
        </Field>
        <Field
          label="Sous-titre"
          hint="Ligne courte affichée sous le titre, en capitales espacées."
        >
          <Input value={data.subtitle ?? ""} onChange={set("subtitle")} placeholder={HOME_HERO_DEFAULTS.subtitle} />
        </Field>
        <Field
          label="Description"
          hint="Paragraphe explicatif sous le sous-titre."
        >
          <Textarea
            value={data.description ?? ""}
            onChange={set("description")}
            placeholder={HOME_HERO_DEFAULTS.description}
            className="min-h-[80px] resize-none"
          />
        </Field>
      </Section>

      <Section title="Boutons d'action">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bouton principal</p>
            <Field label="Texte du bouton" hint="">
              <Input value={data.cta_primary_text ?? ""} onChange={set("cta_primary_text")} placeholder={HOME_HERO_DEFAULTS.cta_primary_text} />
            </Field>
            <Field label="Lien de destination" hint="">
              <Input value={data.cta_primary_href ?? ""} onChange={set("cta_primary_href")} placeholder={HOME_HERO_DEFAULTS.cta_primary_href} />
            </Field>
          </div>
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bouton secondaire</p>
            <Field label="Texte du bouton" hint="">
              <Input value={data.cta_secondary_text ?? ""} onChange={set("cta_secondary_text")} placeholder={HOME_HERO_DEFAULTS.cta_secondary_text} />
            </Field>
            <Field label="Lien de destination" hint="">
              <Input value={data.cta_secondary_href ?? ""} onChange={set("cta_secondary_href")} placeholder={HOME_HERO_DEFAULTS.cta_secondary_href} />
            </Field>
          </div>
        </div>
      </Section>

      <ActionBar saving={saving} saved={saved} onSave={save} onReset={reset} />
    </div>
  );
}

/* ─── Generic page hero editor ─────────────────────────────────────────── */

function PageHeroEditor({ pageKey }: { pageKey: Exclude<PageKey, "home"> }) {
  const defaults = HERO_DEFAULTS[pageKey] ?? {};
  const [data, setData] = useState<HeroContent>({ ...defaults });
  const [recordId, setRecordId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/content?page=${pageKey}&locale=fr`)
      .then((r) => r.json())
      .then(({ data: rows }) => {
        const row = (rows ?? []).find(
          (r: { section_key: string }) => r.section_key === "hero"
        );
        if (row?.content) {
          try {
            const parsed = JSON.parse(row.content);
            setData({ ...defaults, ...parsed });
            setRecordId(row.id);
          } catch {
            setData({ ...defaults });
          }
        } else {
          setData({ ...defaults });
          setRecordId(undefined);
        }
      })
      .catch(() => setData({ ...defaults }))
      .finally(() => setLoading(false));
  }, [pageKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const set = (key: keyof HeroContent) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((prev) => ({ ...prev, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: recordId,
        page_key: pageKey,
        section_key: "hero",
        locale: "fr",
        content: JSON.stringify(data),
        content_type: "json",
      }),
    });
    if (res.ok) {
      const json = await res.json();
      setRecordId(json.data?.id);
      setSaved(true);
      toast.success("Contenu mis à jour.");
      setTimeout(() => setSaved(false), 3000);
    } else {
      const json = await res.json();
      toast.error(json.error ?? "Erreur lors de l'enregistrement.");
    }
    setSaving(false);
  };

  const reset = () => {
    setData({ ...defaults });
    toast.info("Champs réinitialisés aux valeurs par défaut. Cliquez sur Enregistrer pour confirmer.");
  };

  const deleteOverride = async () => {
    if (!recordId) {
      setData({ ...defaults });
      toast.info("Cette page utilise déjà les valeurs par défaut.");
      return;
    }
    const res = await fetch(`/api/content?id=${recordId}`, { method: "DELETE" });
    if (res.ok) {
      setData({ ...defaults });
      setRecordId(undefined);
      toast.success("Contenu personnalisé supprimé. Les valeurs par défaut sont restaurées.");
    } else {
      toast.error("Erreur lors de la suppression.");
    }
  };

  if (loading) return <EditorSkeleton />;

  return (
    <div className="space-y-8">
      <Section title="En-tête de la page">
        <Field
          label="Badge"
          hint="Petite étiquette colorée affichée au-dessus du titre."
        >
          <Input value={data.badge ?? ""} onChange={set("badge")} placeholder={defaults.badge} />
        </Field>
        <Field
          label="Titre principal"
          hint="Le grand titre (h1) visible en haut de la page."
        >
          <Input value={data.title ?? ""} onChange={set("title")} placeholder={defaults.title} />
        </Field>
        <Field
          label="Description"
          hint="Texte descriptif affiché sous le titre."
        >
          <Textarea
            value={data.description ?? ""}
            onChange={set("description")}
            placeholder={defaults.description}
            className="min-h-[80px] resize-none"
          />
        </Field>
      </Section>

      <ActionBar
        saving={saving}
        saved={saved}
        onSave={save}
        onReset={reset}
        onDelete={recordId ? deleteOverride : undefined}
        hasCustomContent={!!recordId}
      />
    </div>
  );
}

/* ─── Shared sub-components ─────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/40">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

function ActionBar({
  saving,
  saved,
  onSave,
  onReset,
  onDelete,
  hasCustomContent,
}: {
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  onReset: () => void;
  onDelete?: () => void;
  hasCustomContent?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button onClick={onSave} disabled={saving} className="min-w-[130px]">
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement…</>
        ) : saved ? (
          <><Check className="w-4 h-4" />Enregistré</>
        ) : (
          <><Save className="w-4 h-4" />Enregistrer</>
        )}
      </Button>
      <Button variant="outline" size="sm" onClick={onReset} disabled={saving}>
        <RotateCcw className="w-3.5 h-3.5" />
        Réinitialiser
      </Button>
      {onDelete && hasCustomContent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={saving}
          className="text-destructive hover:text-destructive ml-auto"
        >
          Supprimer le contenu personnalisé
        </Button>
      )}
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="py-16 flex items-center justify-center text-muted-foreground gap-2">
      <Loader2 className="w-5 h-5 animate-spin" />
      Chargement du contenu actuel…
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────────── */

export default function ContentPage() {
  const [activePageKey, setActivePageKey] = useState<PageKey>("home");
  const activePage = PAGES.find((p) => p.key === activePageKey)!;

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Contenu du site</h1>
        <p className="text-muted-foreground mt-1">
          Modifiez les textes affichés sur chaque page. Les modifications sont immédiatement visibles sur le site.
        </p>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6 items-start">

        {/* ── Left: page list ── */}
        <nav className="rounded-2xl border border-border bg-card overflow-hidden sticky top-6">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pages</p>
          </div>
          <ul className="p-2 space-y-0.5">
            {PAGES.map(({ key, label, icon: Icon, description }) => {
              const active = activePageKey === key;
              return (
                <li key={key}>
                  <button
                    onClick={() => setActivePageKey(key)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{label}</p>
                      <p className={cn("text-xs truncate", active ? "text-primary/70" : "text-muted-foreground")}>
                        {description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Right: editor ── */}
        <div>
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">{activePage.label}</h2>
              <p className="text-sm text-muted-foreground">{activePage.description}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(activePage.href, "_blank", "noopener")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Voir la page
            </Button>
          </div>

          {/* Editor */}
          {activePageKey === "home" ? (
            <HomeHeroEditor key="home" />
          ) : (
            <PageHeroEditor
              key={activePageKey}
              pageKey={activePageKey as Exclude<PageKey, "home">}
            />
          )}
        </div>
      </div>
    </div>
  );
}
