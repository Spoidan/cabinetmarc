import Link from "next/link";
import { Award, Download } from "lucide-react";
import { adminListCertificates } from "@/lib/admin/queries";
import { Button } from "@/components/ui/button";
import { formatDateFr } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Certificats" };

export default async function AdminCertificatesPage() {
  const certificates = await adminListCertificates();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Certificats</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {certificates.length} certificat{certificates.length > 1 ? "s" : ""} délivré{certificates.length > 1 ? "s" : ""}
        </p>
      </header>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Numéro</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Étudiant</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Cours</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Délivré le</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  Aucun certificat délivré pour le moment.
                </td>
              </tr>
            ) : (
              certificates.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-xs">{c.certificate_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.user?.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{c.user?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {c.course ? (
                      <Link href={`/cours/${c.course.slug}`} target="_blank" className="hover:text-primary">
                        {c.course.title}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDateFr(c.issued_at, "d MMM yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.pdf_path ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/api/admin/certificats/${c.id}/download`}>
                          <Download className="w-4 h-4" />
                          PDF
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
