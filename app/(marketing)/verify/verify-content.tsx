"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, GraduationCap } from "lucide-react";

interface CertData {
  user_name: string;
  course_name: string;
  certificate_number: string;
  issued_at: string;
  courses?: { title_fr: string };
}

export function VerifyContent() {
  const searchParams = useSearchParams();
  const number = searchParams.get("number");
  const [cert, setCert] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!number) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/certificate?number=${encodeURIComponent(number)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setCert(json.data);
        else setNotFound(true);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [number]);

  if (loading) return <div className="text-muted-foreground">Vérification en cours...</div>;

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold">Certificat introuvable</h1>
        <p className="text-muted-foreground">Le numéro <code className="font-mono text-sm bg-muted px-2 py-1 rounded">{number}</code> ne correspond à aucun certificat émis par le Cabinet MARC.</p>
      </div>
    );
  }

  const issuedDate = cert ? new Date(cert.issued_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-1">Certificat authentique</h1>
        <p className="text-muted-foreground">Ce certificat a été émis par le Cabinet MARC et est authentique.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 w-full text-left space-y-4">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <GraduationCap className="w-8 h-8 text-amber-500" />
          <div>
            <p className="text-xs text-muted-foreground">Cabinet MARC</p>
            <p className="font-bold">Certificat d&apos;Accomplissement</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Titulaire</p>
            <p className="font-semibold">{cert?.user_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Formation</p>
            <p className="font-semibold">{cert?.course_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Date d&apos;émission</p>
            <p className="font-semibold">{issuedDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Numéro de certificat</p>
            <p className="font-mono text-sm">{cert?.certificate_number}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
