"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[app/error.tsx]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Une erreur est survenue</h1>
        <p className="text-muted-foreground mb-8">
          Quelque chose s&apos;est mal passé. Veuillez réessayer ou revenir à l&apos;accueil.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>
            <RotateCcw className="w-4 h-4" />
            Réessayer
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="w-4 h-4" />
              Accueil
            </Link>
          </Button>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground font-mono">
            Référence : {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
