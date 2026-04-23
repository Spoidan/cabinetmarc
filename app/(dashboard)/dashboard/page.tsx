import { auth, currentUser } from "@clerk/nextjs/server";
import { BookOpen, Clock, Award, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await currentUser();

  const stats = [
    { label: "Cours inscrits", value: "3", icon: BookOpen, color: "bg-blue-500/10 text-blue-600" },
    { label: "Heures de formation", value: "24h", icon: Clock, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Certificats obtenus", value: "1", icon: Award, color: "bg-amber-500/10 text-amber-600" },
    { label: "Progression moyenne", value: "68%", icon: TrendingUp, color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="max-w-5xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Bonjour, {user?.firstName ?? "cher étudiant"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue dans votre espace d&apos;apprentissage Cabinet MARC.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold mb-0.5">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* In progress courses */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold">Formations en cours</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/courses">Voir tout <ArrowRight className="w-3 h-3 ml-1" /></Link>
          </Button>
        </div>
        <div className="space-y-4">
          {[
            { title: "Macroéconomie Avancée", progress: 75, category: "Économie", gradient: "from-emerald-500 to-teal-600" },
            { title: "Gestion de Projet PMI", progress: 40, category: "Gestion", gradient: "from-sky-500 to-blue-600" },
          ].map(({ title, progress, category, gradient }) => (
            <div key={title} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                <BookOpen className="w-5 h-5 text-white/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-sm truncate">{title}</span>
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className="bg-primary rounded-full h-1.5 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/courses">Continuer</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#0A0F1E] to-[#0f1f3d] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white mb-1">Découvrir de nouvelles formations</h3>
          <p className="text-white/50 text-sm">50+ cours disponibles dans 6 domaines</p>
        </div>
        <Button asChild>
          <Link href="/courses">Explorer</Link>
        </Button>
      </div>
    </div>
  );
}
