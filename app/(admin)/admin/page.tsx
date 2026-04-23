import { getSupabaseAdminClient } from "@/lib/supabase";
import { Users, BookOpen, MessageSquare, Mail, TrendingUp, Eye, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getAdminStats() {
  try {
    const supabase = getSupabaseAdminClient();
    const [courses, contacts, subscribers] = await Promise.all([
      supabase.from("courses").select("id", { count: "exact", head: true }),
      supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);
    return {
      courses: courses.count ?? 0,
      contacts: contacts.count ?? 0,
      subscribers: subscribers.count ?? 0,
    };
  } catch {
    return { courses: 0, contacts: 0, subscribers: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Formations", value: stats.courses, icon: BookOpen, href: "/admin/courses", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { label: "Messages reçus", value: stats.contacts, icon: MessageSquare, href: "/admin/content", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
    { label: "Abonnés newsletter", value: stats.subscribers, icon: Mail, href: "/admin/settings", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20" },
    { label: "Visiteurs (30j)", value: "—", icon: Eye, href: "#", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/20" },
  ];

  const quickActions = [
    { href: "/admin/courses", label: "Ajouter une formation", icon: BookOpen },
    { href: "/admin/team", label: "Gérer l'équipe", icon: Users },
    { href: "/admin/content", label: "Éditer le contenu", icon: TrendingUp },
    { href: "/admin/settings", label: "Paramètres globaux", icon: TrendingUp },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Vue d&apos;ensemble de Cabinet MARC</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, href, color, bg }) => (
          <Link key={label} href={href}>
            <div className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow group">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-2xl font-bold mb-0.5">{value}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                {label}
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-bold mb-4">Actions rapides</h2>
          <div className="space-y-2">
            {quickActions.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors text-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                {label}
                <ArrowUpRight className="w-3 h-3 ml-auto text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-bold mb-4">Dernières soumissions de contact</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center py-6">
              Les soumissions s&apos;afficheront ici une fois Supabase connecté.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/content">Voir tous les messages</Link>
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0A0F1E] to-[#0f1f3d] p-6">
        <h3 className="font-bold text-white mb-2">🚀 Configuration requise</h3>
        <p className="text-white/60 text-sm mb-4">
          Connectez Supabase et Clerk pour activer toutes les fonctionnalités d&apos;administration.
          Consultez le README pour les instructions détaillées.
        </p>
        <Button variant="outline-white" size="sm" asChild>
          <Link href="/admin/settings">Paramètres globaux</Link>
        </Button>
      </div>
    </div>
  );
}
