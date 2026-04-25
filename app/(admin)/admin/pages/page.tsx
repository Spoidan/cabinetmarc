import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Pages" };

const PAGES = [
  { href: "/", label: "Accueil", description: "Section hero + Cours Disponibles + témoignages." },
  { href: "/about", label: "À propos", description: "Mission, vision, valeurs." },
  { href: "/services", label: "Services", description: "Conseil, formation, recherche, e-learning." },
  { href: "/team", label: "Équipe", description: "Profils des consultants." },
  { href: "/blog", label: "Actualités", description: "Articles de blog." },
  { href: "/contact", label: "Contact", description: "Formulaire de contact." },
  { href: "/privacy", label: "Confidentialité", description: "Politique de confidentialité." },
  { href: "/terms", label: "Conditions d'utilisation", description: "CGU." },
];

export default function AdminPagesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Pages</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vue d&apos;ensemble des pages marketing du site. Pour éditer le contenu textuel,
          utilisez l&apos;onglet « Actualités » (qui couvre la table page_content).
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PAGES.map((p) => (
          <article
            key={p.href}
            className="rounded-2xl border border-border bg-card p-5 flex flex-col"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="font-semibold mb-1">{p.label}</h2>
            <p className="text-sm text-muted-foreground mb-4 flex-1">{p.description}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild className="flex-1">
                <Link href={p.href} target="_blank">
                  Voir
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/admin/content">Éditer</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
