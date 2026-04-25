import { adminListCategories } from "@/lib/admin/queries";
import { CategoriesPanel } from "@/components/admin/CategoriesPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catégories" };

export default async function AdminCategoriesPage() {
  const categories = await adminListCategories();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Catégories</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {categories.length} catégorie{categories.length > 1 ? "s" : ""} ·{" "}
          {categories.filter((c) => c.is_active).length} active(s)
        </p>
      </header>
      <CategoriesPanel categories={categories} />
    </div>
  );
}
