"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn, PlayCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enrollInCourse } from "@/app/(elearning)/actions";

type Props = {
  courseSlug: string;
  price: number;
  isSignedIn: boolean;
  isEnrolled: boolean;
};

export function EnrollButton({ courseSlug, price, isSignedIn, isEnrolled }: Props) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  if (!isSignedIn) {
    return (
      <Button size="lg" className="w-full" asChild>
        <Link href={`/connexion?redirect_url=${encodeURIComponent(`/cours/${courseSlug}`)}`}>
          <LogIn className="w-4 h-4" />
          Se connecter pour s&apos;inscrire
        </Link>
      </Button>
    );
  }

  if (isEnrolled) {
    return (
      <Button size="lg" variant="outline" disabled className="w-full">
        <Check className="w-4 h-4" />
        Déjà inscrit
      </Button>
    );
  }

  const handle = () => {
    startTransition(async () => {
      const res = await enrollInCourse(courseSlug);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Inscription réussie !");
      router.push(`/cours/${courseSlug}`);
      router.refresh();
    });
  };

  return (
    <Button size="lg" className="w-full" onClick={handle} disabled={pending}>
      <PlayCircle className="w-4 h-4" />
      {price === 0 ? "S'inscrire gratuitement" : "S'inscrire"}
    </Button>
  );
}
