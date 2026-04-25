import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminListCourses, adminListCategories } from "@/lib/admin/queries";
import { CoursesTable } from "@/components/admin/CoursesTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cours" };

export default async function AdminCoursesPage() {
  const [courses, categories] = await Promise.all([
    adminListCourses(),
    adminListCategories(),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cours</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {courses.length} cours · {courses.filter((c) => c.is_published).length} publié(s)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/cours/nouveau">
            <Plus className="w-4 h-4" />
            Nouveau cours
          </Link>
        </Button>
      </header>
      <CoursesTable courses={courses} categories={categories} />
    </div>
  );
}
