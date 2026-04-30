import type { Metadata } from "next";
import { AboutHero } from "@/components/sections/about-hero";
import { AboutMission } from "@/components/sections/about-mission";
import { getHeroContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "À Propos",
  description:
    "Découvrez Cabinet MARC, notre mission, notre vision et nos valeurs. Une institution de référence pour l'excellence académique et professionnelle en Afrique centrale.",
};

export default async function AboutPage() {
  const heroContent = await getHeroContent("about");
  return (
    <>
      <AboutHero content={heroContent} />
      <AboutMission />
    </>
  );
}
