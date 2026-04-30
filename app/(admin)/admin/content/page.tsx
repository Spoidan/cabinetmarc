"use client";

import { useState, useEffect } from "react";
import {
  Save, ExternalLink, Home, Info, Briefcase, Users, BookOpen, Phone, Newspaper,
  Loader2, Type, AlignLeft, MousePointerClick, ImageIcon, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/* ─── Page definitions ────────────────────────────────────────────────── */

type PageDef = {
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
  description: string;
  sections: SectionDef[];
};

type SectionDef = {
  key: string;
  label: string;
  description: string;
  type: "hero" | "text";
};

const PAGES: PageDef[] = [
  {
    key: "home",
    label: "Accueil",
    icon: Home,
    href: "/",
    description: "Page d'accueil du site",
    sections: [
      {
        key: "hero",
        label: "Section Héro",
        description: "Le grand bandeau principal avec titre, description et boutons d'action.",
        type: "hero",
      },
    ],
  },
  {
    key: "about",
    label: "À Propos",
    icon: Info,
    href: "/about",
    description: "Présentation du cabinet",
    sections: [
      {
        key: "hero",
        label: "En-tête",
        description: "Titre et description en haut de la page À Propos.",
        type: "text",
      },
      {
        key: "mission",
        label: "Mission & Valeurs",
        description: "Texte de la section Mission, Vision et Valeurs.",
        type: "text",
      },
    ],
  },
  {
    key: "services",
    label: "Services",
    icon: Briefcase,
    href: "/services",
    description: "Nos prestations",
    sections: [
      {
        key: "hero",
        label: "En-tête",
        description: "Titre et sous-titre de la page Services.",
        type: "text",
      },
      {
        key: "description",
        label: "Description générale",
        description: "Texte d'introduction avant la liste des services.",
        type: "text",
      },
    ],
  },
  {
    key: "team",
    label: "Équipe",
    icon: Users,
    href: "/team",
    description: "L'équipe du cabinet",
    sections: [
      {
        key: "hero",
        label: "En-tête",
        description: "Titre et sous-titre de la page Équipe.",
        type: "text",
      },
    ],
  },
  {
    key: "courses",
    label: "Formations",
    icon: BookOpen,
    href: "/cours",
    description: "Catalogue de cours",
    sections: [
      {
        key: "hero",
        label: "En-tête",
        description: "Titre et description de la page Formations.",
        type: "text",
      },
    ],
  },
  {
    key: "blog",
    label: "Blog",
    icon: Newspaper,
    href: "/blog",
    description: "Actualités et articles",
    sections: [
      {
        key: "hero",
        label: "En-tête",
        description: "Titre et sous-titre de la page Blog.",
        type: "text",
      },
    ],
  },
  {
    key: "contact",
    label: "Contact",
    icon: Phone,
    href: "/contact",
    description: "Page de contact",
    sections: [
      {
        key: "hero",
        label: "En-tête",
        description: "Titre et sous-titre de la page Contact.",
        type: "text",
      },
    ],
  },
];

/* ─── Hero editor ──────────────────────────────────────────────────────── */

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

function HeroEditor() {
  const [data, setData] = useState<HeroData>({
    title: "",
    subtitle: "",
    description: "",
    cta_primary_text: "Explorer nos formations",
    cta_primary_href: "/cours",
    cta_secondary_text: "Découvrir MARC",
    cta_secondary_href: "/about",
    badge_text: "",
    locale: "fr",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/hero?locale=fr")
      .then((r) => r.json())
      .then(({ data: d }) => {
        if (d) setData(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/hero", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, locale: "fr" }),
    });
    const json = await res.json();
    if (res.ok) {
      setData(json.data);
      toast.success("Section héro mise à jour.");
    } else {
      toast.error(json.error ?? "Erreur lors de l'enregistrement.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Badge */}
      <FieldGroup icon={ImageIcon} label="Badge" description="Petite étiquette affichée au-dessus du titre.">
        <Input
          value={data.badge_text ?? ""}
          onChange={(e) => setData({ ...data, badge_text: e.target.value })}
          placeholder="Ex : Nouveau · E-Learning disponible"
        />
      </FieldGroup>

      {/* Titre + sous-titre */}
      <FieldGroup icon={Type} label="Titre principal" description="Le grand titre visible en premier sur la page.">
        <Input
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          placeholder="Ex : L'excellence académique au service de l'Afrique"
        />
      </FieldGroup>

      <FieldGroup icon={Type} label="Sous-titre" description="Ligne secondaire sous le titre principal.">
        <Input
          value={data.subtitle}
          onChange={(e) => setData({ ...data, subtitle: e.target.value })}
          placeholder="Ex : Conseil · Formation · Recherche · E-Learning"
        />
      </FieldGroup>

      <FieldGroup icon={AlignLeft} label="Description" description="Paragraphe explicatif sous le sous-titre.">
        <Textarea
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          placeholder="Ex : Cabinet MARC vous accompagne dans votre développement professionnel…"
          className="min-h-[90px] resize-none"
        />
      </FieldGroup>

      {/* CTAs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MousePointerClick className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Boutons d&apos;action</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 pl-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bouton principal</p>
            <div className="space-y-1.5">
              <Label className="text-xs">Texte</Label>
              <Input
                value={data.cta_primary_text}
                onChange={(e) => setData({ ...data, cta_primary_text: e.target.value })}
                placeholder="Explorer nos formations"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Lien</Label>
              <Input
                value={data.cta_primary_href}
                onChange={(e) => setData({ ...data, cta_primary_href: e.target.value })}
                placeholder="/cours"
              />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bouton secondaire</p>
            <div className="space-y-1.5">
              <Label className="text-xs">Texte</Label>
              <Input
                value={data.cta_secondary_text}
                onChange={(e) => setData({ ...data, cta_secondary_text: e.target.value })}
                placeholder="Découvrir MARC"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Lien</Label>
              <Input
                value={data.cta_secondary_href}
                onChange={(e) => setData({ ...data, cta_secondary_href: e.target.value })}
                placeholder="/about"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

/* ─── Text section editor ──────────────────────────────────────────────── */

function SectionEditor({
  pageKey,
  sectionKey,
  description,
}: {
  pageKey: string;
  sectionKey: string;
  description: string;
}) {
  const [content, setContent] = useState("");
  const [recordId, setRecordId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/content?page=${pageKey}&locale=fr`)
      .then((r) => r.json())
      .then(({ data: rows }) => {
        const row = (rows ?? []).find(
          (r: { section_key: string; id?: string; content: string }) =>
            r.section_key === sectionKey
        );
        setContent(row?.content ?? "");
        setRecordId(row?.id);
      })
      .finally(() => setLoading(false));
  }, [pageKey, sectionKey]);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: recordId,
        page_key: pageKey,
        section_key: sectionKey,
        locale: "fr",
        content,
        content_type: "text",
      }),
    });
    const json = await res.json();
    if (res.ok) {
      setRecordId(json.data?.id);
      toast.success("Contenu mis à jour.");
    } else {
      toast.error(json.error ?? "Erreur lors de l'enregistrement.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{description}</p>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[220px] resize-y font-sans text-sm"
        placeholder="Entrez le texte de cette section…"
      />
      <Button onClick={save} disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </div>
  );
}

/* ─── Helper: field group wrapper ──────────────────────────────────────── */

function FieldGroup({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <Label className="font-medium">{label}</Label>
      </div>
      <p className="text-xs text-muted-foreground pl-6">{description}</p>
      <div className="pl-6">{children}</div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────────── */

export default function ContentPage() {
  const [activePageKey, setActivePageKey] = useState("home");
  const [activeSectionKey, setActiveSectionKey] = useState("hero");

  const activePage = PAGES.find((p) => p.key === activePageKey)!;

  const handlePageChange = (key: string) => {
    setActivePageKey(key);
    const page = PAGES.find((p) => p.key === key)!;
    setActiveSectionKey(page.sections[0].key);
  };

  const activeSection = activePage.sections.find((s) => s.key === activeSectionKey)!;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Contenu du site</h1>
        <p className="text-muted-foreground mt-1">
          Modifiez les textes et appels à l&apos;action affichés sur chaque page.
        </p>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6 items-start">

        {/* ── Left: page list ── */}
        <nav className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pages
            </p>
          </div>
          <ul className="p-2 space-y-0.5">
            {PAGES.map(({ key, label, icon: Icon, description }) => (
              <li key={key}>
                <button
                  onClick={() => handlePageChange(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors group ${
                    activePageKey === key
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{label}</p>
                    <p className={`text-xs truncate ${activePageKey === key ? "text-primary/70" : "text-muted-foreground"}`}>
                      {description}
                    </p>
                  </div>
                  {activePageKey === key && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Right: editor ── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">

          {/* Editor header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="font-semibold">{activePage.label}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{activeSection.label}</p>
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

          {/* Section tabs — only when there are multiple sections */}
          {activePage.sections.length > 1 && (
            <div className="flex gap-1 px-4 py-2 border-b border-border overflow-x-auto bg-muted/30">
              {activePage.sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSectionKey(s.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeSectionKey === s.key
                      ? "bg-background border border-border shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Editor body */}
          <div className="p-6">
            {activeSection.type === "hero" && activePageKey === "home" ? (
              <HeroEditor key="hero-fr" />
            ) : (
              <SectionEditor
                key={`${activePageKey}-${activeSectionKey}`}
                pageKey={activePageKey}
                sectionKey={activeSectionKey}
                description={activeSection.description}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
