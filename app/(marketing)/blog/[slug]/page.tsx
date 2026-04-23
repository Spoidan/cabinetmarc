import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Article" };

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <div className="pt-28 pb-20">
      <div className="container mx-auto max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour au blog
        </Link>

        <Badge variant="emerald" className="mb-4">Économie</Badge>
        <h1 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight">
          Titre de l&apos;article — {params.slug}
        </h1>

        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          <span className="flex items-center gap-2"><User className="w-4 h-4" /> Dr. Laurent Ndihokubwayo</span>
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {formatDate("2024-03-15")}</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 8 min de lecture</span>
        </div>

        <div className="prose max-w-none text-foreground/80 leading-relaxed space-y-4">
          <p>Cet article sera chargé dynamiquement depuis la base de données Supabase une fois configurée.</p>
          <p>Le contenu complet apparaîtra ici avec un formatage riche incluant titres, paragraphes, listes et citations.</p>
        </div>
      </div>
    </div>
  );
}
