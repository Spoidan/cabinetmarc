import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Award, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSignedStorageUrl } from "@/app/(elearning)/actions";
import { issueCertificateIfNeeded } from "@/app/(elearning)/actions";
import { formatDateFr } from "@/lib/format";

export const metadata: Metadata = { title: "Certificat" };

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  const { userId } = await auth();
  if (!userId) {
    redirect(`/connexion?redirect_url=${encodeURIComponent(`/cours/${courseSlug}/certificat`)}`);
  }

  const admin = createSupabaseAdminClient();
  const { data: course } = await admin
    .from("courses")
    .select("id, title, slug")
    .eq("slug", courseSlug)
    .maybeSingle();
  if (!course) notFound();

  const { data: enrollment } = await admin
    .from("course_enrollments")
    .select("id, completed_at, user_id")
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .maybeSingle();

  if (!enrollment) {
    redirect(`/cours/${courseSlug}`);
  }

  if (!enrollment.completed_at) {
    return (
      <div className="container mx-auto max-w-2xl py-20 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <Award className="w-6 h-6 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Certificat non disponible</h1>
        <p className="text-muted-foreground mb-6">
          Le certificat sera disponible après l&apos;achèvement complet du cours.
        </p>
        <Button asChild variant="outline">
          <Link href={`/cours/${courseSlug}`}>
            <ArrowLeft className="w-4 h-4" />
            Retour au cours
          </Link>
        </Button>
      </div>
    );
  }

  // Issue certificate if not already
  let certificate = await (async () => {
    const { data } = await admin
      .from("course_certificates")
      .select("*")
      .eq("enrollment_id", enrollment.id)
      .maybeSingle();
    return data;
  })();

  if (!certificate) {
    certificate = await issueCertificateIfNeeded(enrollment.id);
  }

  if (!certificate) {
    return (
      <div className="container mx-auto max-w-2xl py-20 text-center">
        <p className="text-muted-foreground">
          Le certificat est en cours d&apos;émission. Revenez dans quelques instants.
        </p>
      </div>
    );
  }

  const signedUrl = certificate.pdf_path
    ? await createSignedStorageUrl("certificates", certificate.pdf_path, 15 * 60)
    : null;

  const user = await currentUser();
  const studentName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Étudiant";

  return (
    <div className="container mx-auto max-w-3xl py-14">
      <div className="text-center mb-10">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-6">
          <Award className="w-6 h-6 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Félicitations !</h1>
        <p className="text-muted-foreground mt-2">
          Votre certificat est disponible.
        </p>
      </div>

      <div className="rounded-3xl border-8 border-primary/80 bg-gradient-to-br from-background via-muted/20 to-primary/5 p-10 text-center shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-2">Le Cabinet</p>
        <p className="text-3xl font-bold mb-8">MARC</p>
        <p className="text-sm text-muted-foreground mb-2">Certificat décerné à</p>
        <p className="text-3xl font-bold text-primary mb-2">{studentName}</p>
        <div className="mx-auto w-40 h-px bg-primary/60 my-4" />
        <p className="text-sm text-muted-foreground">pour avoir complété avec succès</p>
        <p className="text-xl font-bold mb-6">« {course.title} »</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
          <div>
            <p className="uppercase tracking-wider mb-1">Numéro</p>
            <p className="font-semibold text-foreground">{certificate.certificate_number}</p>
          </div>
          <div>
            <p className="uppercase tracking-wider mb-1">Délivré le</p>
            <p className="font-semibold text-foreground">
              {formatDateFr(certificate.issued_at, "d MMMM yyyy")}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-wider mb-1">Signature</p>
            <div className="mx-auto w-24 h-px bg-foreground mt-3" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button variant="outline" asChild>
          <Link href={`/cours/${courseSlug}`}>
            <ArrowLeft className="w-4 h-4" />
            Retour au cours
          </Link>
        </Button>
        {signedUrl ? (
          <Button asChild>
            <a href={signedUrl} target="_blank" rel="noreferrer">
              <Download className="w-4 h-4" />
              Télécharger le PDF
            </a>
          </Button>
        ) : (
          <Button disabled>
            <Download className="w-4 h-4" />
            Télécharger le PDF
          </Button>
        )}
      </div>
    </div>
  );
}
