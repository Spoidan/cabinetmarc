import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Users, Star, CheckCircle2, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Détail de la formation",
};

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="pt-28 pb-20">
      <div className="container mx-auto">
        {/* Back */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour aux formations
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main */}
          <div className="lg:col-span-2">
            <Badge variant="navy" className="mb-4">Économie</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Formation en cours de chargement</h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Cette page se connecte dynamiquement à la base de données Supabase pour afficher
              le contenu de la formation correspondant au slug: <code className="bg-muted px-2 py-0.5 rounded text-sm">{params.slug}</code>
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 40 heures</span>
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> 84 étudiants</span>
              <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.9/5</span>
            </div>

            <div className="rounded-2xl border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Ce que vous apprendrez</h2>
              {[
                "Maîtriser les concepts fondamentaux",
                "Appliquer les méthodes avancées",
                "Analyser des cas pratiques réels",
                "Obtenir une certification reconnue",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="rounded-2xl border border-border p-6 sticky top-28">
              <div className="h-40 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6">
                <BookOpen className="w-12 h-12 text-white/50" />
              </div>
              <div className="text-3xl font-bold mb-2">150 000 BIF</div>
              <p className="text-sm text-muted-foreground mb-6">Accès à vie · Certificat inclus</p>
              <Button className="w-full mb-3" size="lg">S&apos;inscrire maintenant</Button>
              <Button variant="outline" className="w-full" size="lg">Essai gratuit</Button>
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                {[
                  { icon: Clock, text: "40 heures de contenu" },
                  { icon: Award, text: "Certificat reconnu" },
                  { icon: Users, text: "Communauté active" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Icon className="w-4 h-4" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
