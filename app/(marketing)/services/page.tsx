import type { Metadata } from "next";
import { ServicesPage } from "@/components/sections/services-content";
import { getHeroContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Cabinet MARC offre des services de conseil stratégique, formation professionnelle, recherche appliquée et e-learning pour institutions, entreprises et professionnels.",
};

export default async function Services() {
  const heroContent = await getHeroContent("services");
  return <ServicesPage heroContent={heroContent} />;
}
