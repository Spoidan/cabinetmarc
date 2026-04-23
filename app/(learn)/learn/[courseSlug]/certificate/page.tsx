"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Share2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Certificate {
  id: string;
  user_name: string;
  course_name: string;
  certificate_number: string;
  issued_at: string;
  courses?: { title_fr: string; title_en: string; slug: string };
}

export default function CertificatePage() {
  const params = useParams();
  const courseSlug = params.courseSlug as string;
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // First get course id from slug
    fetch(`/api/courses/${courseSlug}`)
      .then((r) => r.json())
      .then(async (json) => {
        if (!json.course) { setError("Cours introuvable"); setLoading(false); return; }
        const res = await fetch(`/api/certificate?course_id=${json.course.id}`);
        const data = await res.json();
        if (data.data?.length) {
          setCert(data.data[0]);
        } else {
          setError("Aucun certificat trouvé. Complétez le cours pour obtenir votre certificat.");
        }
        setLoading(false);
      })
      .catch(() => { setError("Erreur de chargement"); setLoading(false); });
  }, [courseSlug]);

  const handlePrint = () => window.print();

  const issuedDate = cert
    ? new Date(cert.issued_at).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
        <GraduationCap className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">{error}</h2>
        <Link href={`/courses/${courseSlug}`}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au cours
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar — hidden on print */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between print:hidden">
        <Link href={`/courses/${courseSlug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Retour au cours
        </Link>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Download className="w-4 h-4" />
            Imprimer / PDF
          </Button>
        </div>
      </header>

      {/* Certificate container */}
      <div className="flex items-center justify-center p-8 print:p-0 print:min-h-screen">
        {/* Certificate */}
        <div
          id="certificate"
          className="bg-white w-full max-w-3xl aspect-[297/210] relative overflow-hidden shadow-2xl rounded-2xl print:rounded-none print:shadow-none"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {/* Outer border */}
          <div className="absolute inset-3 border-4 rounded-xl" style={{ borderColor: "#7B3A10" }} />
          <div className="absolute inset-4 border rounded-xl" style={{ borderColor: "#C4873A" }} />

          {/* Corner ornaments */}
          {["top-6 left-6", "top-6 right-6", "bottom-6 left-6", "bottom-6 right-6"].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} w-8 h-8`}
              style={{
                borderColor: "#7B3A10",
                borderWidth: "2px",
                borderStyle: "solid",
                borderRadius: "2px",
                transform: i >= 2 ? "rotate(180deg)" : "none",
              }}
            />
          ))}

          {/* Background watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
            <GraduationCap style={{ width: 320, height: 320, color: "#7B3A10" }} />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-16 text-center">
            {/* Cabinet MARC header */}
            <div className="mb-2">
              <span className="text-xs tracking-[0.3em] uppercase font-sans" style={{ color: "#7B3A10" }}>
                Cabinet
              </span>
              <div className="text-3xl font-black tracking-[0.2em]" style={{ color: "#1A1A1A", fontFamily: "sans-serif" }}>
                MARC
              </div>
            </div>

            <div className="w-24 h-px my-3" style={{ backgroundColor: "#C4873A" }} />

            <p className="text-xs tracking-[0.25em] uppercase mb-4 font-sans" style={{ color: "#7B3A10" }}>
              Certificat d'Accomplissement
            </p>

            <p className="text-sm mb-3 font-sans text-gray-500">Décerné à</p>

            <h1 className="text-4xl font-bold mb-4" style={{ color: "#1A1A1A", fontFamily: "'Georgia', serif" }}>
              {cert?.user_name}
            </h1>

            <div className="w-32 h-px mb-4" style={{ backgroundColor: "#C4873A" }} />

            <p className="text-sm text-gray-500 mb-2 font-sans">pour avoir complété avec succès</p>

            <h2 className="text-xl font-bold mb-6 max-w-md" style={{ color: "#7B3A10" }}>
              {cert?.course_name}
            </h2>

            {/* Date and number */}
            <div className="flex items-end gap-12 mt-2">
              <div className="text-center">
                <div className="w-32 border-b mb-1" style={{ borderColor: "#7B3A10" }} />
                <p className="text-xs text-gray-500 font-sans">{issuedDate}</p>
                <p className="text-[10px] text-gray-400 font-sans">Date d'émission</p>
              </div>
              <div
                className="w-14 h-14 rounded-full border-4 flex flex-col items-center justify-center"
                style={{ borderColor: "#7B3A10" }}
              >
                <GraduationCap className="w-6 h-6" style={{ color: "#7B3A10" }} />
              </div>
              <div className="text-center">
                <div className="w-32 border-b mb-1" style={{ borderColor: "#7B3A10" }} />
                <p className="text-xs font-mono text-gray-500">{cert?.certificate_number}</p>
                <p className="text-[10px] text-gray-400 font-sans">N° de certificat</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share options — hidden on print */}
      <div className="print:hidden flex justify-center pb-8">
        <div className="bg-card border border-border rounded-xl px-6 py-4 flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Partagez votre réussite !</span>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/verify?number=${cert?.certificate_number}`);
          }}>
            <Share2 className="w-3 h-3" />
            Copier le lien de vérification
          </Button>
        </div>
      </div>
    </div>
  );
}
