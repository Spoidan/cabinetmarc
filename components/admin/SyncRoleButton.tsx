"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setUserRole } from "@/app/(admin)/admin/actions";

export function SyncRoleButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const handleSync = () => {
    startTransition(async () => {
      const res = await setUserRole(userId, "admin");
      if (res.ok) {
        toast.success("Rôle synchronisé — votre profil est maintenant admin.");
        router.refresh();
      } else {
        toast.error(res.error ?? "Erreur lors de la synchronisation.");
      }
    });
  };

  return (
    <Button size="sm" variant="outline" onClick={handleSync} disabled={pending}>
      {pending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <RefreshCw className="w-3.5 h-3.5" />
      )}
      Synchroniser le rôle
    </Button>
  );
}
