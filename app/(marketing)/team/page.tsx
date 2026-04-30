import type { Metadata } from "next";
import { TeamPageContent } from "@/components/sections/team-content";
import { getHeroContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Notre Équipe",
  description:
    "Rencontrez les experts de Cabinet MARC — académiciens, consultants et praticiens dédiés à votre excellence professionnelle.",
};

export default async function TeamPage() {
  const heroContent = await getHeroContent("team");
  return <TeamPageContent heroContent={heroContent} />;
}
