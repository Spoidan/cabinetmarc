"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ApiImageUploader } from "@/components/admin/ApiImageUploader";

export default function NewTeamMemberPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role_fr: "",
    bio_fr: "",
    email: "",
    linkedin_url: "",
    image_url: null as string | null,
    order_index: 0,
    is_active: true,
  });

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const save = async () => {
    if (!form.name.trim() || !form.role_fr.trim()) {
      toast.error("Le nom et le rôle sont obligatoires.");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        role_en: form.role_fr,
        bio_en: form.bio_fr,
        order_index: Number(form.order_index),
      }),
    });
    if (res.ok) {
      toast.success("Membre ajouté avec succès.");
      router.push("/admin/team");
    } else {
      const json = await res.json();
      toast.error(json.error ?? "Erreur lors de l'enregistrement.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/team"><ArrowLeft className="w-4 h-4" /> Équipe</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Nouveau membre</h1>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6 items-start">
        {/* Photo */}
        <div className="space-y-2">
          <Label>Photo</Label>
          <ApiImageUploader
            uploadApiPath="/api/admin/team/upload"
            bucket="team-photos"
            value={form.image_url}
            onChange={(url) => setForm((p) => ({ ...p, image_url: url }))}
            aspect="square"
            label="Photo du membre"
          />
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nom complet *</Label>
            <Input value={form.name} onChange={set("name")} placeholder="Dr. Jean Dupont" />
          </div>
          <div className="space-y-1.5">
            <Label>Rôle / Titre *</Label>
            <Input value={form.role_fr} onChange={set("role_fr")} placeholder="Expert Économie & Conseil" />
          </div>
          <div className="space-y-1.5">
            <Label>Biographie</Label>
            <Textarea
              value={form.bio_fr}
              onChange={set("bio_fr")}
              placeholder="Décrivez le parcours, l'expertise et les spécialités de ce membre…"
              className="min-h-[100px] resize-none"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Email professionnel</Label>
              <Input value={form.email} onChange={set("email")} placeholder="nom@cabinetmarc.org" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label>URL LinkedIn</Label>
              <Input value={form.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/…" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Ordre d&apos;affichage</Label>
              <Input
                type="number"
                value={form.order_index}
                onChange={(e) => setForm((p) => ({ ...p, order_index: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">0 = premier. Les membres sont triés par ordre croissant.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Visibilité sur le site</Label>
              <div className="flex items-center gap-3 h-10">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <span className="text-sm">{form.is_active ? "Visible" : "Masqué"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
