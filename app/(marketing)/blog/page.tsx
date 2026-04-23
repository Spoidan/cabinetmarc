import type { Metadata } from "next";
import { BlogPageContent } from "@/components/sections/blog-content";

export const metadata: Metadata = {
  title: "Blog & Ressources",
  description: "Actualités, analyses et ressources en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs par les experts de Cabinet MARC.",
};

export default function BlogPage() {
  return <BlogPageContent />;
}
