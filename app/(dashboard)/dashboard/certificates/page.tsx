import { auth } from "@clerk/nextjs/server";
import { GraduationCap, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function DashboardCertificatesPage() {
  const { userId } = await auth();
  const db = getAdmin();

  const { data: certificates } = await db
    .from("certificates")
    .select("*, courses(title_fr, slug)")
    .eq("user_id", userId!)
    .order("issued_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Mes certificats</h1>
        <p className="text-muted-foreground mt-1">{certificates?.length ?? 0} certificat(s) obtenu(s)</p>
      </div>

      {!certificates?.length ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
          <h2 className="text-lg font-semibold mb-2">Aucun certificat</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Complétez une formation et réussissez l&apos;examen final pour obtenir votre certificat.
          </p>
          <Button asChild>
            <Link href="/courses">Explorer les formations</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certificates.map((cert) => {
            const course = cert.courses as { title_fr: string; slug: string } | null;
            const issuedDate = new Date(cert.issued_at).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            return (
              <div
                key={cert.id}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
              >
                {/* Certificate preview header */}
                <div
                  className="h-24 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #1A1A1A 0%, #3a1a08 50%, #7B3A10 100%)" }}
                >
                  <div className="text-center">
                    <div className="text-white/60 text-[10px] tracking-[0.3em] uppercase mb-1">Cabinet</div>
                    <div className="text-white font-black text-2xl tracking-[0.2em]">MARC</div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Certificat d'accomplissement</p>
                      <h3 className="font-semibold text-sm leading-tight">{course?.title_fr}</h3>
                    </div>
                    <GraduationCap className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  </div>

                  <div className="space-y-1 mb-4 text-xs text-muted-foreground">
                    <p>Délivré à : <span className="text-foreground font-medium">{cert.user_name}</span></p>
                    <p>Date : <span className="text-foreground">{issuedDate}</span></p>
                    <p className="font-mono text-[10px]">{cert.certificate_number}</p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/learn/${course?.slug}/certificate`} className="flex-1">
                      <Button size="sm" className="w-full gap-1 bg-amber-600 hover:bg-amber-700 text-white">
                        <ExternalLink className="w-3 h-3" />
                        Voir le certificat
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
