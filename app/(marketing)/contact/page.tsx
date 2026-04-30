import type { Metadata } from "next";
import { ContactContent } from "@/components/sections/contact-content";
import { getHeroContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Cabinet MARC pour vos besoins en conseil, formation ou recherche. Notre équipe répond sous 24h ouvrées.",
};

export default async function ContactPage() {
  const heroContent = await getHeroContent("contact");
  return <ContactContent heroContent={heroContent} />;
}
