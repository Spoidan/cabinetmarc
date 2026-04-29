"use client";

import { useState, useEffect } from "react";
import { Save, Eye, Globe, Home, Info, BookOpen, Phone, Newspaper, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const pages = [
  { key: "home", label: "Page d'accueil", icon: Home },
  { key: "about", label: "À Propos", icon: Info },
  { key: "courses", label: "Formations", icon: BookOpen },
  { key: "contact", label: "Contact", icon: Phone },
  { key: "blog", label: "Blog", icon: Newspaper },
];

const homeSections = [
  { key: "hero", label: "Héro" },
  { key: "stats", label: "Statistiques" },
  { key: "about", label: "À Propos" },
  { key: "categories", label: "Catégories" },
  { key: "testimonials", label: "Témoignages" },
  { key: "contact", label: "Contact" },
];

const otherSections: Record<string, Array<{ key: string; label: string }>> = {
  about: [
    { key: "hero", label: "En-tête" },
    { key: "mission", label: "Mission & Valeurs" },
  ],
  courses: [
    { key: "hero", label: "En-tête" },
    { key: "description", label: "Description" },
  ],
  contact: [
    { key: "hero", label: "En-tête" },
    { key: "info", label: "Informations" },
  ],
  blog: [
    { key: "hero", label: "En-tête" },
    { key: "description", label: "Description" },
  ],
};

type HeroData = {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  cta_primary_text: string;
  cta_primary_href: string;
  cta_secondary_text: string;
  cta_secondary_href: string;
  badge_text: string;
  locale: string;
};

function HeroEditor({ locale }: { locale: string }) {
  const [data, setData] = useState<HeroData>({
    title: "",
    subtitle: "",
    description: "",
    cta_primary_text: "Explorer nos formations",
    cta_primary_href: "/cours",
    cta_secondary_text: "En savoir plus",
    cta_secondary_href: "/about",
    badge_text: "",
    locale,
  });
  const [loadingHero, setLoadingHero] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/hero?locale=${locale}`)
      .then((r) => r.json())
      .then(({ data: d }) => {
        if (d) setData(d);
        setLoadingHero(false);
      })
      .catch(() => setLoadingHero(false));
  }, [locale]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/hero", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, locale }),
    });
    const json = await res.json();
    if (res.ok) {
      setData(json.data);
      toast.success("Section héro mise à jour !");
    } else {
      toast.error(json.error ?? "Erreur lors de l'enregistrement");
    }
    setSaving(false);
  };

  if (loadingHero) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Badge (accroche)</Label>
        <Input
          value={data.badge_text ?? ""}
          onChange={(e) => setData({ ...data, badge_text: e.target.value })}
          placeholder="Ex: Nouveau : E-Learning disponible"
        />
      </div>
      <div className="space-y-2">
        <Label>Titre principal</Label>
        <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Sous-titre</Label>
        <Input value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="min-h-[100px]"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Bouton principal — texte</Label>
          <Input value={data.cta_primary_text} onChange={(e) => setData({ ...data, cta_primary_text: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Bouton principal — lien</Label>
          <Input value={data.cta_primary_href} onChange={(e) => setData({ ...data, cta_primary_href: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Bouton secondaire — texte</Label>
          <Input value={data.cta_secondary_text} onChange={(e) => setData({ ...data, cta_secondary_text: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Bouton secondaire — lien</Label>
          <Input value={data.cta_secondary_href} onChange={(e) => setData({ ...data, cta_secondary_href: e.target.value })} />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
}

type PageContent = { id?: string; content: string };

function PageEditor({
  pageKey,
  sectionKey,
  locale,
  label,
}: {
  pageKey: string;
  sectionKey: string;
  locale: string;
  label: string;
}) {
  const [data, setData] = useState<PageContent>({ content: "" });
  const [loadingContent, setLoadingContent] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/content?page=${pageKey}&locale=${locale}`)
      .then((r) => r.json())
      .then(({ data: rows }) => {
        const row = (rows ?? []).find((r: { section_key: string }) => r.section_key === sectionKey);
        if (row) setData(row);
        else setData({ content: "" });
        setLoadingContent(false);
      })
      .catch(() => setLoadingContent(false));
  }, [pageKey, sectionKey, locale]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        page_key: pageKey,
        section_key: sectionKey,
        locale,
        content_type: "text",
      }),
    });
    const json = await res.json();
    if (res.ok) {
      setData(json.data);
      toast.success("Contenu mis à jour !");
    } else {
      toast.error(json.error ?? "Erreur lors de l'enregistrement");
    }
    setSaving(false);
  };

  if (loadingContent) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{label}</Label>
        <Textarea
          value={data.content}
          onChange={(e) => setData({ ...data, content: e.target.value })}
          className="min-h-[200px] font-mono text-sm"
          placeholder="Entrez le contenu de cette section..."
        />
        <p className="text-xs text-muted-foreground">Ce texte est affiché dans la section correspondante de votre site.</p>
      </div>
      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
}

export default function ContentPage() {
  const [activePage, setActivePage] = useState("home");
  const [activeSection, setActiveSection] = useState("hero");
  const [locale, setLocale] = useState("fr");

  const currentSections = activePage === "home" ? homeSections : (otherSections[activePage] ?? []);

  const handlePageChange = (key: string) => {
    setActivePage(key);
    setActiveSection(key === "home" ? "hero" : (otherSections[key]?.[0]?.key ?? "hero"));
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Gestion du Contenu</h1>
        <p className="text-muted-foreground mt-1">Éditez chaque section de votre site</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">Pages</p>
            {pages.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handlePageChange(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                  activePage === key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-card rounded-2xl border border-border">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <Badge variant="navy">{pages.find((p) => p.key === activePage)?.label}</Badge>
                <span className="text-sm text-muted-foreground capitalize">
                  {currentSections.find((s) => s.key === activeSection)?.label ?? activeSection}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => window.open(`/${activePage === "home" ? "" : activePage}`, "_blank")}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Voir
                </Button>
                <button
                  onClick={() => setLocale((l) => (l === "fr" ? "en" : "fr"))}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {locale.toUpperCase()}
                </button>
              </div>
            </div>

            {currentSections.length > 1 && (
              <div className="flex gap-1 p-3 border-b border-border overflow-x-auto">
                {currentSections.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveSection(s.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      activeSection === s.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            <div className="p-6">
              {activePage === "home" && activeSection === "hero" && (
                <HeroEditor key={`hero-${locale}`} locale={locale} />
              )}

              {(activePage !== "home" || activeSection !== "hero") && (
                <PageEditor
                  key={`${activePage}-${activeSection}-${locale}`}
                  pageKey={activePage}
                  sectionKey={activeSection}
                  locale={locale}
                  label={`Contenu — ${pages.find((p) => p.key === activePage)?.label} / ${currentSections.find((s) => s.key === activeSection)?.label ?? activeSection}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
