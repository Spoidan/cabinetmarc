import { adminListCategories } from "@/lib/admin/queries";
import { NewCourseForm } from "@/components/admin/NewCourseForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nouveau cours" };

export default async function NewCoursePage() {
  const categories = await adminListCategories();
  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau cours</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Saisissez les informations de base pour créer le cours, puis utilisez l&apos;éditeur pour le construire.
        </p>
      </header>
      <NewCourseForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
