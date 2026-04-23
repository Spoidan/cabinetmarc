import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { AboutPreview } from "@/components/sections/about-preview";
import { CourseCategories } from "@/components/sections/course-categories";
import { Testimonials } from "@/components/sections/testimonials";
import { ContactTeaser } from "@/components/sections/contact-teaser";

export const metadata: Metadata = {
  title: "Cabinet MARC | Conseil, Formation & E-Learning au Burundi",
  description:
    "Cabinet MARC — Excellence en conseil, formation professionnelle et e-learning. Spécialisé en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs au Burundi.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
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
