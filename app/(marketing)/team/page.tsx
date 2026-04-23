import type { Metadata } from "next";
import { TeamPageContent } from "@/components/sections/team-content";

export const metadata: Metadata = {
  title: "Notre Équipe",
  description: "Rencontrez les experts de Cabinet MARC — académiciens, consultants et praticiens dédiés à votre excellence professionnelle.",
};

export default function TeamPage() {
  return <TeamPageContent />;
}
