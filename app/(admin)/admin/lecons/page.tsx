import Link from "next/link";
import { Edit, Eye, Layers } from "lucide-react";
import { adminListLessons } from "@/lib/admin/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LessonsTable } from "@/components/admin/LessonsTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Modules & Leçons" };

export default async function AdminLessonsPage() {
  const lessons = await adminListLessons();
  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modules & Leçons</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Vue transverse de toutes les leçons publiées et brouillons. Pour ajouter une leçon, ouvrez l&apos;éditeur du cours concerné.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/cours">
            <Layers className="w-4 h-4" />
            Voir les cours
          </Link>
        </Button>
      </header>
      <LessonsTable lessons={lessons} />
    </div>
  );
}
