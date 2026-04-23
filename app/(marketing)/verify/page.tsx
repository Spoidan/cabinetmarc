import { Suspense } from "react";
import { VerifyContent } from "./verify-content";

export default function VerifyPage() {
  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="container mx-auto max-w-2xl text-center px-4">
        <Suspense fallback={<div className="text-muted-foreground">Vérification en cours...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
