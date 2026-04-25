import type { Metadata } from "next";
import { listCategories, listPublishedCourses } from "@/lib/elearning/queries";
import { CatalogClient } from "@/components/elearning/CatalogClient";

export const metadata: Metadata = {
  title: "Cours",
  description:
    "Parcourez le catalogue complet des cours en ligne Cabinet MARC : comptabilité, fiscalité, gestion de projet, droit des affaires.",
};

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;

  const [categories, courses] = await Promise.all([
    listCategories(),
    listPublishedCourses(),
  ]);

  return (
    <CatalogClient
      courses={courses}
      categories={categories}
      initialCategorySlug={categorie ?? undefined}
    />
  );
}
