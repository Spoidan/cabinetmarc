import Link from "next/link";
import { Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatBIF } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Revenus" };

export default async function RevenueReportPage() {
  const admin = createSupabaseAdminClient();
  const { data: courses } = await admin
    .from("courses")
    .select("id, title, slug, price_bif, is_published");
  const { data: enrollments } = await admin
    .from("course_enrollments")
    .select("course_id");

  const enrollByCourse = new Map<string, number>();
  for (const e of enrollments ?? []) {
    enrollByCourse.set(e.course_id, (enrollByCourse.get(e.course_id) ?? 0) + 1);
  }

  const list = ((courses ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    price_bif: number;
    is_published: boolean;
  }>)
    .filter((c) => c.price_bif > 0)
    .map((c) => ({
      ...c,
      enrollments: enrollByCourse.get(c.id) ?? 0,
      potentialRevenue: c.price_bif * (enrollByCourse.get(c.id) ?? 0),
    }))
    .sort((a, b) => b.potentialRevenue - a.potentialRevenue);

  const totalPotential = list.reduce((s, c) => s + c.potentialRevenue, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Rapport — Revenus</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Indicateur de revenu potentiel basé sur les inscriptions et les prix publics.
        </p>
      </header>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-900/10 p-4 flex items-start gap-3">
        <Wallet className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Paiement non intégré</p>
          <p className="text-muted-foreground">
            L&apos;intégration de paiement est hors périmètre du brief 2026-04. Ces chiffres
            représentent le revenu potentiel (prix × inscriptions) plutôt que des paiements
            confirmés. Lorsque l&apos;intégration sera ajoutée, ce rapport pourra basculer sur la
            table <code className="rounded bg-background px-1 py-0.5 text-xs">payments</code>.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Cours payants" value={list.length.toLocaleString("fr-FR")} />
        <Stat
          label="Inscriptions payantes"
          value={list
            .reduce((s, c) => s + c.enrollments, 0)
            .toLocaleString("fr-FR")}
        />
        <Stat label="Revenu potentiel" value={formatBIF(totalPotential)} />
      </section>

      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <header className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Top cours payants</h2>
        </header>
        {list.length === 0 ? (
          <div className="px-5 py-10 text-sm text-muted-foreground text-center">
            <p className="mb-4">Aucun cours payant pour le moment.</p>
            <Button asChild variant="outline">
              <Link href="/admin/cours">
                Gérer les cours
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Cours</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Prix</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Inscriptions</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Revenu potentiel</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/cours/${c.slug}`} target="_blank" className="hover:text-primary">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatBIF(c.price_bif)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.enrollments}</td>
                  <td className="px-4 py-3 font-semibold">{formatBIF(c.potentialRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
