"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setUserRole } from "@/app/(admin)/admin/actions";

type Role = "student" | "instructor" | "admin";

const LABELS: Record<Role, string> = {
  student: "Étudiant",
  instructor: "Instructeur",
  admin: "Administrateur",
};

export function RoleSelect({ userId, role }: { userId: string; role: Role }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [current, setCurrent] = React.useState<Role>(role);

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as Role;
        const previous = current;
        setCurrent(next);
        startTransition(async () => {
          const res = await setUserRole(userId, next);
          if (!res.ok) {
            setCurrent(previous);
            toast.error(res.error);
            return;
          }
          toast.success(`Rôle mis à jour : ${LABELS[next]}`);
          router.refresh();
        });
      }}
      className="h-8 px-2 rounded-lg border border-input bg-background text-xs"
      aria-label="Changer le rôle"
    >
      <option value="student">Étudiant</option>
      <option value="instructor">Instructeur</option>
      <option value="admin">Administrateur</option>
    </select>
  );
}
