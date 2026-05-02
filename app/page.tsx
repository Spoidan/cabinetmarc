import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/admin";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { AboutPreview } from "@/components/sections/about-preview";
import { CourseCategories } from "@/components/sections/course-categories";
import { Testimonials } from "@/components/sections/testimonials";
import { ContactTeaser } from "@/components/sections/contact-teaser";
import { Actualite } from "@/components/sections/actualite";
import { getHomeHeroContent } from "@/lib/page-content";
import { getApprovedTestimonials, getUserOwnTestimonial, getRecentBlogPosts } from "@/lib/marketing/queries";

export const metadata: Metadata = {
  title: "Cabinet MARC | Conseil, Formation & E-Learning au Burundi",
  description:
    "Cabinet MARC — Excellence en conseil, formation professionnelle et e-learning. Spécialisé en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs au Burundi.",
};

export default async function HomePage() {
  const { userId } = await auth();
  const [isAdmin, heroContent, recentPosts, approvedTestimonials, ownTestimonial] = await Promise.all([
    isAdminUser(userId),
    getHomeHeroContent(),
    getRecentBlogPosts(3),
    getApprovedTestimonials(),
    userId ? getUserOwnTestimonial(userId) : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAdmin={isAdmin} />
      <main className="flex-1">
        <Hero content={heroContent} />
        <Stats />
        <Actualite posts={recentPosts} />
        <CourseCategories />
        <AboutPreview />
        <Testimonials
          approvedTestimonials={approvedTestimonials}
          userId={userId ?? null}
          ownTestimonial={ownTestimonial}
        />
        <ContactTeaser />
      </main>
      <Footer />
    </div>
  );
}
