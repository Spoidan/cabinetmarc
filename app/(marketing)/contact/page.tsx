import type { Metadata } from "next";
import { ContactContent } from "@/components/sections/contact-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Cabinet MARC pour vos besoins en conseil, formation ou recherche. Notre équipe répond sous 24h ouvrées.",
};

export default function ContactPage() {
  return <ContactContent />;
}
