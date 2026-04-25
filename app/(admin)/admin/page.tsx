import Link from "next/link";
import {
  Users,
  BookOpen,
  GraduationCap,
  Award,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  ClipboardList,
} from "lucide-react";
import { adminDashboardStats } from "@/lib/admin/queries";
import { formatDateFr } from "@/lib/format";
import { DashboardCharts } from "@/components/admin/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await adminDashboardStats();

  const cards = [
    {
      label: "Total étudiants",
      value: stats.totals.students.toLocaleString("fr-FR"),
      delta: stats.totals.students30dDelta,
      icon: Users,
      tint: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Cours publiés",
      value: stats.totals.published.toLocaleString("fr-FR"),
      sub: `${stats.totals.drafts} brouillons`,
      icon: BookOpen,
      tint: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Inscriptions actives",
      value: stats.totals.activeEnrollments.toLocaleString("fr-FR"),
      icon: GraduationCap,
      tint: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Certificats (30 j)",
      value: stats.totals.certificates30d.toLocaleString("fr-FR"),
      icon: Award,
      tint: "bg-violet-500/10 text-violet-600",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Vue d&apos;ensemble</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          État du catalogue, des inscriptions et des certificats.
        </p>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <article key={c.label} className="rounded-2xl border border-border bg-card p-5">
              <div className={`w-9 h-9 rounded-xl ${c.tint} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold mb-1">{c.value}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {c.label}
                {typeof c.delta === "number" && (
                  <span
                    className={`ml-2 inline-flex items-center gap-0.5 ${
                      c.delta >= 0 ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {c.delta >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {c.delta >= 0 ? "+" : ""}
                    {c.delta}% vs 30 j
                  </span>
                )}
                {c.sub && <span className="ml-2">{c.sub}</span>}
              </p>
            </article>
          );
        })}
      </section>

      <section className="grid lg:grid-cols-[2fr_1fr] gap-5">
        <DashboardCharts series={stats.series} top={stats.topCoursesSeries} />
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <article className="rounded-2xl border border-border bg-card p-5">
          <header className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Inscriptions récentes</h2>
            <Link
              href="/admin/inscriptions"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </header>
          {stats.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Aucune inscription récente.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.recent.map((row) => (
                <li key={row.id} className="py-3 flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {(row.user.full_name ?? row.user.email ?? "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {row.user.full_name ?? row.user.email ?? row.user.id.slice(0, 6)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      s&apos;est inscrit à {row.course?.title ?? "—"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDateFr(row.enrolled_at, "d MMM")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-border bg-card p-5">
          <header className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Cours à surveiller</h2>
            <Link
              href="/admin/cours"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </header>
          {stats.attention.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Tous les cours sont à jour.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {stats.attention.map((row) => (
                <li key={row.id} className="py-3 flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{row.title}</p>
                    <p className="text-xs text-muted-foreground">{row.reason}</p>
                  </div>
                  <Link
                    href={`/admin/cours/${row.id}/editer`}
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    Ouvrir
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}
