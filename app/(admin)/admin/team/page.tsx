"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

type Member = {
  id: string;
  name: string;
  role_fr: string;
  bio_fr: string;
  image_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  is_active: boolean;
  order_index: number;
};

const GRADIENTS = [
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
      .then(({ data }) => setMembers(data ?? []))
      .catch(() => toast.error("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (m: Member) => {
    const res = await fetch("/api/admin/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: m.id, is_active: !m.is_active }),
    });
    if (res.ok) {
      setMembers((prev) => prev.map((x) => x.id === m.id ? { ...x, is_active: !m.is_active } : x));
      toast.success(m.is_active ? "Membre masqué du site" : "Membre visible sur le site");
    } else toast.error("Erreur lors de la mise à jour");
  };

  const deleteMember = async (id: string, name: string) => {
    if (!confirm(`Supprimer "${name}" définitivement ?`)) return;
    const res = await fetch("/api/admin/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Membre supprimé");
    } else toast.error("Erreur lors de la suppression");
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Équipe</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Chargement…" : `${members.length} membre${members.length !== 1 ? "s" : ""} · ${members.filter(m => m.is_active).length} visible${members.filter(m => m.is_active).length !== 1 ? "s" : ""} sur le site`}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/team/nouveau">
            <Plus className="w-4 h-4" />
            Ajouter un membre
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
          Chargement de l&apos;équipe…
        </div>
      ) : members.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-border">
          <UserCircle2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">Aucun membre</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Ajoutez votre premier membre d&apos;équipe.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/admin/team/nouveau">
              <Plus className="w-4 h-4" />
              Ajouter un membre
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, i) => (
            <div
              key={m.id}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Top bar with gradient or photo */}
              <div className={`h-16 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} relative`}>
                <div className="absolute -bottom-7 left-4">
                  {m.image_url ? (
                    <div className="w-14 h-14 rounded-xl border-4 border-card shadow-md overflow-hidden bg-muted">
                      <Image src={m.image_url} alt={m.name} width={56} height={56} className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} border-4 border-card shadow-md flex items-center justify-center text-white text-lg font-bold`}>
                      {getInitials(m.name)}
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant={m.is_active ? "emerald" : "outline"} className={`text-[10px] ${m.is_active ? "text-white" : ""}`}>
                    {m.is_active ? "Visible" : "Masqué"}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="pt-10 px-4 pb-4">
                <p className="font-semibold text-sm leading-tight">{m.name}</p>
                <p className="text-xs text-primary font-medium mt-0.5 mb-3">{m.role_fr}</p>
                {m.bio_fr && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{m.bio_fr}</p>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" asChild className="h-7 px-2 text-xs flex-1">
                    <Link href={`/admin/team/${m.id}`}>
                      <Pencil className="w-3 h-3" />
                      Modifier
                    </Link>
                  </Button>
                  <button
                    onClick={() => toggleActive(m)}
                    className="w-7 h-7 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                    title={m.is_active ? "Masquer du site" : "Afficher sur le site"}
                  >
                    {m.is_active
                      ? <ToggleRight className="w-3.5 h-3.5 text-emerald-500" />
                      : <ToggleLeft className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => deleteMember(m.id, m.name)}
                    className="w-7 h-7 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
