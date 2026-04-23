"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, Eye, Pencil, Globe, Home, Info, BookOpen, Phone, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const pages = [
  { key: "home", label: "Page d'accueil", icon: Home },
  { key: "about", label: "À Propos", icon: Info },
  { key: "courses", label: "Formations", icon: BookOpen },
  { key: "contact", label: "Contact", icon: Phone },
  { key: "blog", label: "Blog", icon: Newspaper },
];

// Hero section editor
function HeroEditor() {
  const [data, setData] = useState({
    title: "L'excellence académique au service de l'Afrique",
    subtitle: "Conseil · Formation · Recherche · E-Learning",
    description: "Cabinet MARC vous accompagne dans votre développement professionnel...",
    cta_primary_text: "Explorer nos formations",
    cta_primary_href: "/courses",
    cta_secondary_text: "Découvrir MARC",
    cta_secondary_href: "/about",
    badge_text: "Nouveau : E-Learning disponible",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Section héro mise à jour !");
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Badge (accroche)</Label>
        <Input value={data.badge_text} onChange={(e) => setData({ ...data, badge_text: e.target.value })} />
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
        <Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} className="min-h-[100px]" />
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
        <Save className="w-4 h-4" />
        {saving ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
}

export default function ContentPage() {
  const [activePage, setActivePage] = useState("home");
  const [activeSection, setActiveSection] = useState("hero");

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Gestion du Contenu</h1>
        <p className="text-muted-foreground mt-1">Éditez chaque section de votre site</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Pages nav */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">Pages</p>
            {pages.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setActivePage(key); setActiveSection("hero"); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                  activePage === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          <div className="bg-card rounded-2xl border border-border">
            {/* Editor header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <Badge variant="navy">{pages.find((p) => p.key === activePage)?.label}</Badge>
                <span className="text-sm text-muted-foreground capitalize">{activeSection}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-3.5 h-3.5" />
                  Prévisualiser
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  FR / EN
                </Button>
              </div>
            </div>

            {/* Section tabs */}
            {activePage === "home" && (
              <div className="flex gap-1 p-3 border-b border-border overflow-x-auto">
                {["hero", "stats", "about", "categories", "testimonials", "contact"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSection(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      activeSection === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* Editor content */}
            <div className="p-6">
              {activePage === "home" && activeSection === "hero" && <HeroEditor />}

              {activePage === "home" && activeSection !== "hero" && (
                <div className="text-center py-12 text-muted-foreground">
                  <Pencil className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Éditeur section &quot;{activeSection}&quot;</p>
                  <p className="text-sm mt-1">Connectez Supabase pour activer l&apos;édition complète.</p>
                </div>
              )}

              {activePage !== "home" && (
                <div className="text-center py-12 text-muted-foreground">
                  <Pencil className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Éditeur de page &quot;{pages.find((p) => p.key === activePage)?.label}&quot;</p>
                  <p className="text-sm mt-1">Connectez Supabase pour activer l&apos;édition complète du contenu.</p>
                  <Button className="mt-4" variant="outline" size="sm">
                    Configurer Supabase
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
