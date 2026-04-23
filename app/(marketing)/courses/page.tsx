import type { Metadata } from "next";
import { CoursesPageContent } from "@/components/sections/courses-content";

export const metadata: Metadata = {
  title: "Formations",
  description: "Découvrez nos formations certifiantes en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs. Formations présentielles et e-learning de qualité supérieure.",
};

export default function CoursesPage() {
  return <CoursesPageContent />;
}
