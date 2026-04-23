"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const mockTeam = [
  { id: "1", name: "Dr. Laurent Ndihokubwayo", role: "Directeur & Expert Économie", email: "l.ndihokubwayo@cabinetmarc.org", initials: "LN", gradient: "from-emerald-500 to-teal-600", active: true },
  { id: "2", name: "Prof. Cécile Irakoze", role: "Directrice Pédagogique & Gestion", email: "c.irakoze@cabinetmarc.org", initials: "CI", gradient: "from-sky-500 to-blue-600", active: true },
  { id: "3", name: "Me. Patrick Ndayizeye", role: "Expert Juridique & Compliance", email: "p.ndayizeye@cabinetmarc.org", initials: "PN", gradient: "from-violet-500 to-purple-600", active: true },
  { id: "4", name: "Dr. Alice Niyonkuru", role: "Experte Statistiques & Recherche", email: "a.niyonkuru@cabinetmarc.org", initials: "AN", gradient: "from-amber-500 to-orange-600", active: true },
  { id: "5", name: "M. Eric Bigirimana", role: "Expert Entrepreneuriat", email: "e.bigirimana@cabinetmarc.org", initials: "EB", gradient: "from-rose-500 to-red-600", active: true },
  { id: "6", name: "M. David Hakizimana", role: "Expert TICs", email: "d.hakizimana@cabinetmarc.org", initials: "DH", gradient: "from-cyan-500 to-sky-600", active: false },
];

export default function AdminTeamPage() {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Équipe</h1>
          <p className="text-muted-foreground mt-1">{mockTeam.length} membres</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un membre
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {mockTeam.map(({ id, name, role, email, initials, gradient, active }) => (
          <div key={id} className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4 group hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shrink-0`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">{name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{role}</div>
                </div>
                <Badge variant={active ? "emerald" : "outline"} className="text-xs shrink-0">
                  {active ? "Actif" : "Inactif"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  className="w-7 h-7 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                  onClick={() => toast.info(`Email: ${email}`)}
                >
                  <Mail className="w-3 h-3" />
                </button>
                <button
                  className="w-7 h-7 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                  onClick={() => toast.info("LinkedIn...")}
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  className="w-7 h-7 rounded-lg bg-muted hover:bg-muted flex items-center justify-center transition-colors ml-auto"
                  onClick={() => toast.info("Édition...")}
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  className="w-7 h-7 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                  onClick={() => toast.error("Suppression...")}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
