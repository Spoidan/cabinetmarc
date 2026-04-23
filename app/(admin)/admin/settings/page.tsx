"use client";

import { useState } from "react";
import { Save, Globe, Palette, Type, Share2, Search, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const sections = [
  { key: "general", label: "Général", icon: Globe },
  { key: "branding", label: "Marque & Couleurs", icon: Palette },
  { key: "typography", label: "Typographie", icon: Type },
  { key: "seo", label: "SEO & Méta", icon: Search },
  { key: "social", label: "Réseaux sociaux", icon: Share2 },
  { key: "email", label: "Email", icon: Mail },
];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    site_name: "Cabinet MARC",
    site_tagline: "Excellence en Conseil, Formation & Recherche",
    site_description: "Cabinet MARC est une institution spécialisée en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs.",
    contact_email: "info@cabinetmarc.org",
    contact_phone: "+257 00 000 000",
    contact_address: "Bujumbura, Burundi",
    primary_color: "#059669",
    secondary_color: "#0A0F1E",
    accent_color: "#D97706",
    meta_title: "Cabinet MARC | Conseil, Formation & E-Learning au Burundi",
    meta_description: "Excellence en conseil, formation professionnelle et e-learning...",
    google_analytics_id: "",
    social_facebook: "",
    social_twitter: "",
    social_linkedin: "",
    social_youtube: "",
    footer_text: "© 2024 Cabinet MARC. Tous droits réservés.",
    resend_from: "contact@cabinetmarc.org",
    resend_to: "info@cabinetmarc.org",
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Paramètres enregistrés !");
    setSaving(false);
  };

  const update = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Paramètres Globaux</h1>
        <p className="text-muted-foreground mt-1">Configurez l&apos;ensemble du site Cabinet MARC</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sections nav */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-4 space-y-1">
            {sections.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                  activeSection === key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings form */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <Badge variant="navy">{sections.find((s) => s.key === activeSection)?.label}</Badge>
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
              <Save className="w-3.5 h-3.5" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>

          {activeSection === "general" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Nom du site</Label>
                <Input value={settings.site_name} onChange={(e) => update("site_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Slogan</Label>
                <Input value={settings.site_tagline} onChange={(e) => update("site_tagline", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description générale</Label>
                <Textarea value={settings.site_description} onChange={(e) => update("site_description", e.target.value)} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email de contact</Label>
                  <Input value={settings.contact_email} onChange={(e) => update("contact_email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={settings.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input value={settings.contact_address} onChange={(e) => update("contact_address", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Texte du footer</Label>
                <Input value={settings.footer_text} onChange={(e) => update("footer_text", e.target.value)} />
              </div>
            </div>
          )}

          {activeSection === "branding" && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">Personnalisez les couleurs de votre site.</p>
              {[
                { key: "primary_color", label: "Couleur principale", desc: "Boutons, liens, accents" },
                { key: "secondary_color", label: "Couleur secondaire", desc: "Fonds sombres, hero" },
                { key: "accent_color", label: "Couleur d'accent", desc: "Badges dorés, highlights" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center gap-4">
                  <input
                    type="color"
                    value={(settings as Record<string, string>)[key]}
                    onChange={(e) => update(key, e.target.value)}
                    className="w-12 h-12 rounded-xl border border-border cursor-pointer"
                  />
                  <div>
                    <Label>{label}</Label>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                    <code className="text-xs text-muted-foreground">{(settings as Record<string, string>)[key]}</code>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === "seo" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Titre méta (titre par défaut)</Label>
                <Input value={settings.meta_title} onChange={(e) => update("meta_title", e.target.value)} />
                <p className="text-xs text-muted-foreground">{settings.meta_title.length} / 60 caractères</p>
              </div>
              <div className="space-y-2">
                <Label>Description méta</Label>
                <Textarea value={settings.meta_description} onChange={(e) => update("meta_description", e.target.value)} />
                <p className="text-xs text-muted-foreground">{settings.meta_description.length} / 160 caractères</p>
              </div>
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input placeholder="G-XXXXXXXXXX" value={settings.google_analytics_id} onChange={(e) => update("google_analytics_id", e.target.value)} />
              </div>
            </div>
          )}

          {activeSection === "social" && (
            <div className="space-y-5">
              {[
                { key: "social_facebook", label: "Facebook URL" },
                { key: "social_twitter", label: "Twitter/X URL" },
                { key: "social_linkedin", label: "LinkedIn URL" },
                { key: "social_youtube", label: "YouTube URL" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    placeholder="https://..."
                    value={(settings as Record<string, string>)[key]}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === "email" && (
            <div className="space-y-5">
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 p-4 text-sm text-amber-700 dark:text-amber-400">
                Configurez votre clé Resend dans le fichier <code>.env.local</code> pour activer l&apos;envoi d&apos;emails.
              </div>
              <div className="space-y-2">
                <Label>Email expéditeur</Label>
                <Input value={settings.resend_from} onChange={(e) => update("resend_from", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email destinataire (notifications)</Label>
                <Input value={settings.resend_to} onChange={(e) => update("resend_to", e.target.value)} />
              </div>
            </div>
          )}

          {(activeSection === "typography") && (
            <div className="py-12 text-center text-muted-foreground">
              <Type className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Sélection de typographie — disponible après connexion Supabase.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
