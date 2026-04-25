"use client";

import * as React from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { formatRelativeFr } from "@/lib/format";

export function AutosavePill({
  savedAt,
  pending,
}: {
  savedAt: Date | null;
  pending: boolean;
}) {
  // Force re-render every 30s so "il y a Xs" stays fresh
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  if (pending) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement...
      </span>
    );
  }
  if (savedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        Enregistré {formatRelativeFr(savedAt)}
      </span>
    );
  }
  return null;
}
