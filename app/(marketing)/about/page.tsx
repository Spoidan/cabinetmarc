import type { Metadata } from "next";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Heart, Users, BookOpen, Award, Calendar, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AboutHero } from "@/components/sections/about-hero";
import { AboutMission } from "@/components/sections/about-mission";

export const metadata: Metadata = {
  title: "À Propos",
  description: "Découvrez Cabinet MARC, notre mission, notre vision et nos valeurs. Une institution de référence pour l'excellence académique et professionnelle en Afrique centrale.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutMission />
    </>
  );
}
