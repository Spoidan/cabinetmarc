"use client";

import { useState, useEffect } from "react";
import { Save, Globe, Palette, Type, Share2, Search, Mail, Loader2 } from "lucide-react";
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

const headingFonts = ["Playfair Display", "Merriweather", "Lora", "Georgia", "Inter", "Roboto"];
const bodyFonts = ["Inter", "Roboto", "Open Sans", "Lato", "Source Sans Pro", "Nunito"];

type Settings = {
  id?: string;
  site_name: string;
  site_tagline: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  meta_title: string;
  meta_description: string;
  google_analytics_id: string;
  social_facebook: string;
  social_twitter: string;
  social_linkedin: string;
  social_youtube: string;
  footer_text: string;
};

const defaults: Settings = {
  site_name: "Cabinet MARC",
  site_tagline: "Excellence en Conseil, Formation & Recherche",
  site_description: "",
  contact_email: "info@cabinetmarc.org",
  contact_phone: "+257 00 000 000",
  contact_address: "Bujumbura, Burundi",
  primary_color: "#059669",
  secondary_color: "#0A0F1E",
  accent_color: "#D97706",
  font_heading: "Playfair Display",
  font_body: "Inter",
  meta_title: "Cabinet MARC | Conseil, Formation & E-Learning au Burundi",
  meta_description: "",
  google_analytics_id: "",
  social_facebook: "",
  social_twitter: "",
  social_linkedin: "",
  social_youtube: "",
  footer_text: "© 2024 Cabinet MARC. Tous droits réservés.",
};

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>(defaults);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(({ data }) => {
        if (data) setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const update = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    if (res.ok) {
      setSettings(json.data);
      toast.success("Paramètres enregistrés !");
    } else {
      toast.error(json.error ?? "Erreur lors de l'enregistrement");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Paramètres Globaux</h1>
        <p className="text-muted-foreground mt-1">Configurez l&apos;ensemble du site Cabinet MARC</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-4 space-y-1">
            {sections.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                  activeSection === key
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

        <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <Badge variant="navy">{sections.find((s) => s.key === activeSection)?.label}</Badge>
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
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

          {activeSection === "typography" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Police des titres</Label>
                <div className="grid grid-cols-2 gap-2">
                  {headingFonts.map((font) => (
                    <button
                      key={font}
                      onClick={() => update("font_heading", font)}
                      className={`px-4 py-3 rounded-xl border text-sm text-left transition-colors ${
                        settings.font_heading === font
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <Label>Police du texte courant</Label>
                <div className="grid grid-cols-2 gap-2">
                  {bodyFonts.map((font) => (
                    <button
                      key={font}
                      onClick={() => update("font_body", font)}
                      className={`px-4 py-3 rounded-xl border text-sm text-left transition-colors ${
                        settings.font_body === font
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border hover:border-primary/50 hover:bg-muted"
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "seo" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Titre méta</Label>
                <Input value={settings.meta_title} onChange={(e) => update("meta_title", e.target.value)} />
                <p className="text-xs text-muted-foreground">{settings.meta_title.length} / 60 caractères recommandés</p>
              </div>
              <div className="space-y-2">
                <Label>Description méta</Label>
                <Textarea
                  value={settings.meta_description}
                  onChange={(e) => update("meta_description", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{settings.meta_description.length} / 160 caractères recommandés</p>
              </div>
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input
                  placeholder="G-XXXXXXXXXX"
                  value={settings.google_analytics_id}
                  onChange={(e) => update("google_analytics_id", e.target.value)}
                />
              </div>
            </div>
          )}

          {activeSection === "social" && (
            <div className="space-y-5">
              {[
                { key: "social_facebook", label: "Facebook URL" },
                { key: "social_twitter", label: "Twitter / X URL" },
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
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 p-4 text-sm text-blue-700 dark:text-blue-400">
                Configurez <code>RESEND_API_KEY</code> dans vos variables d&apos;environnement Vercel pour activer l&apos;envoi d&apos;emails.
              </div>
              <div className="space-y-2">
                <Label>Email de contact (expéditeur)</Label>
                <Input value={settings.contact_email} onChange={(e) => update("contact_email", e.target.value)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
