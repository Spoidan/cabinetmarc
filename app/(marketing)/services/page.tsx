import type { Metadata } from "next";
import { ServicesPage } from "@/components/sections/services-content";

export const metadata: Metadata = {
  title: "Services",
  description: "Cabinet MARC offre des services de conseil stratégique, formation professionnelle, recherche appliquée et e-learning pour institutions, entreprises et professionnels.",
};

export default function Services() {
  return <ServicesPage />;
}
