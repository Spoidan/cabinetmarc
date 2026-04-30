import type { Metadata } from "next";
import { TeamPageContent } from "@/components/sections/team-content";
import { getHeroContent } from "@/lib/page-content";
import { getActiveTeamMembers } from "@/lib/marketing/queries";

export const metadata: Metadata = {
  title: "Notre Équipe",
  description:
    "Rencontrez les experts de Cabinet MARC — académiciens, consultants et praticiens dédiés à votre excellence professionnelle.",
};

export default async function TeamPage() {
  const [heroContent, members] = await Promise.all([
    getHeroContent("team"),
    getActiveTeamMembers(),
  ]);
  return <TeamPageContent heroContent={heroContent} members={members} />;
}
