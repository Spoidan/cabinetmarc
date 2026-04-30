import type { Metadata } from "next";
import { BlogPageContent } from "@/components/sections/blog-content";
import { getHeroContent } from "@/lib/page-content";
import { getPublishedBlogPosts } from "@/lib/marketing/queries";

export const metadata: Metadata = {
  title: "Blog & Ressources",
  description:
    "Actualités, analyses et ressources en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs par les experts de Cabinet MARC.",
};

export default async function BlogPage() {
  const [heroContent, posts] = await Promise.all([
    getHeroContent("blog"),
    getPublishedBlogPosts(),
  ]);
  return <BlogPageContent heroContent={heroContent} posts={posts} />;
}
