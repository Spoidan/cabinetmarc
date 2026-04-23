"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title_fr: string;
  price: number;
  is_free: boolean;
  level: string;
}

function formatCard(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export default function CheckoutPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    fetch(`/api/courses/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.course) {
          setCourse(json.course);
          // If already enrolled, redirect
          if (json.isEnrolled) {
            const firstLesson = json.lessons?.[0];
            if (firstLesson) router.replace(`/learn/${slug}/${firstLesson.slug}`);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/payment/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id: course.id,
        card_number: cardNumber,
        card_name: cardName,
        card_expiry: cardExpiry,
        card_cvv: cardCvv,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Erreur de paiement");
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    // Redirect to first lesson after 1.5s
    setTimeout(async () => {
      const lessonsRes = await fetch(`/api/courses/${slug}`);
      const data = await lessonsRes.json();
      const first = data.lessons?.[0];
      if (first) router.push(`/learn/${slug}/${first.slug}`);
      else router.push(`/courses/${slug}`);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Inscription confirmée !</h2>
        <p className="text-muted-foreground">Redirection vers votre première leçon...</p>
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mt-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href={`/courses/${slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Retour au cours
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            Paiement sécurisé
          </div>
        </div>
      </header>

      {/* Demo banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Mode TEST</strong> — Utilisez n'importe quelle carte fictive pour tester. Aucun paiement réel ne sera effectué.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Payment form — 3 cols */}
          <div className="lg:col-span-3">
            <h1 className="text-2xl font-bold mb-6">Informations de paiement</h1>

            {/* Test hint */}
            <div className="bg-muted rounded-xl p-4 mb-6 text-sm">
              <p className="font-medium mb-1">Carte de test :</p>
              <p className="font-mono text-muted-foreground">4242 4242 4242 4242</p>
              <p className="text-muted-foreground text-xs mt-1">Expiration : 12/26 — CVV : 123 — Nom : Quelconque</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Card number */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Numéro de carte</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCard(e.target.value))}
                    className="w-full px-4 py-3 pr-12 border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono text-sm"
                    required
                  />
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Card name */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom sur la carte</label>
                <input
                  type="text"
                  placeholder="Jean Dupont"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  required
                />
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Expiration</label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full px-4 py-3 border border-border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono text-sm"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-base gap-2"
              >
                <Lock className="w-4 h-4" />
                {submitting
                  ? "Traitement en cours..."
                  : course?.is_free
                  ? "S'inscrire gratuitement"
                  : `Payer ${course?.price?.toLocaleString()} BIF`}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                En continuant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
              </p>
            </form>
          </div>

          {/* Order summary — 2 cols */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-6">
              <h2 className="font-semibold mb-4">Résumé de la commande</h2>

              {/* Course info */}
              <div className="flex gap-3 mb-4 pb-4 border-b border-border">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #7B3A10, #C4873A)" }}>
                  <span className="text-white font-bold text-sm">CM</span>
                </div>
                <div>
                  <p className="font-medium text-sm leading-tight">{course?.title_fr}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Cabinet MARC</p>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 mb-4 pb-4 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Formation</span>
                  <span>{course?.is_free ? "Gratuit" : `${course?.price?.toLocaleString()} BIF`}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{course?.is_free ? "0 BIF" : `${course?.price?.toLocaleString()} BIF`}</span>
              </div>

              {/* Features */}
              <div className="mt-6 space-y-2">
                {["Accès à vie au contenu", "Certificat d'accomplissement", "Support par email"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-4">
                <Lock className="w-3 h-3 shrink-0" />
                Paiement sécurisé SSL 256-bit
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
