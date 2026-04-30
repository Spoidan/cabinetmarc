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
import { getHomeHeroContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Cabinet MARC | Conseil, Formation & E-Learning au Burundi",
  description:
    "Cabinet MARC — Excellence en conseil, formation professionnelle et e-learning. Spécialisé en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs au Burundi.",
};

export default async function HomePage() {
  const { userId } = await auth();
  const [isAdmin, heroContent] = await Promise.all([
    Promise.resolve(isAdminUser(userId)),
    getHomeHeroContent(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAdmin={isAdmin} />
      <main className="flex-1">
        <Hero content={heroContent} />
        <Stats />
        <AboutPreview />
        <CourseCategories />
        <Testimonials />
        <ContactTeaser />
      </main>
      <Footer />
    </div>
  );
}
