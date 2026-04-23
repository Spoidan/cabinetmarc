"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Mail, ExternalLink, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

type Member = {
  id: string;
  name: string;
  role_fr: string;
  role_en: string;
  email: string | null;
  linkedin_url: string | null;
  is_active: boolean;
  order_index: number;
};

const gradients = [
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-sky-600",
];

export default function AdminTeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then(({ data }) => { setMembers(data ?? []); setLoading(false); })
      .catch(() => { toast.error("Erreur de chargement"); setLoading(false); });
  }, []);

  const toggleActive = async (m: Member) => {
    const res = await fetch("/api/admin/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, is_active: !m.is_active }),
    });
    if (res.ok) {
      setMembers((prev) => prev.map((x) => x.id === m.id ? { ...x, is_active: !m.is_active } : x));
      toast.success(m.is_active ? "Membre désactivé" : "Membre activé");
    } else {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteMember = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" de l'équipe ?`)) return;
    const res = await fetch("/api/admin/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Membre supprimé");
    } else {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Équipe</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? "Chargement..." : `${members.length} membre${members.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button className="gap-2" onClick={() => toast.info("Ajoutez des membres via Supabase ou l'API.")}>
          <Plus className="w-4 h-4" />
          Ajouter un membre
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
          Chargement de l&apos;équipe...
        </div>
      ) : members.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          Aucun membre. Ajoutez votre équipe dans Supabase.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {members.map((m, i) => (
            <div key={m.id} className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold shrink-0`}
              >
                {getInitials(m.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.role_fr}</p>
                  </div>
                  <Badge variant={m.is_active ? "emerald" : "outline"} className="text-xs shrink-0">
                    {m.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="w-7 h-7 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                      title={m.email}
                    >
                      <Mail className="w-3 h-3" />
                    </a>
                  )}
                  {m.linkedin_url && (
                    <a
                      href={m.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    className="w-7 h-7 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors ml-auto"
                    onClick={() => toggleActive(m)}
                    title={m.is_active ? "Désactiver" : "Activer"}
                  >
                    {m.is_active
                      ? <ToggleRight className="w-3 h-3 text-emerald-500" />
                      : <ToggleLeft className="w-3 h-3" />}
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                    onClick={() => deleteMember(m.id, m.name)}
                    title="Supprimer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
