"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Heart, Users, BookOpen, Award, Calendar, CheckCircle2 } from "lucide-react";
import type { HeroContent } from "@/lib/content-defaults";

const stats = [
  { value: "500+", label: "Étudiants formés", icon: Users },
  { value: "50+", label: "Cours", icon: BookOpen },
  { value: "15+", label: "Experts", icon: Award },
  { value: "5+", label: "Années", icon: Calendar },
];

export function AboutHero({ content = {} }: { content?: HeroContent }) {
  const badge = content.badge ?? "À Propos de Cabinet MARC";
  const title = content.title ?? "Votre partenaire de confiance pour l'excellence";
  const description =
    content.description ??
    "Cabinet MARC est une institution spécialisée en conseil, formation et recherche, dédiée à l'excellence académique et professionnelle en Afrique centrale.";

  return (
    <section className="pt-32 pb-20 hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <Badge variant="default" className="mb-4 bg-white/10 text-white border-white/20">
            {badge}
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {title}
          </h1>
          <p className="text-xl text-white/60 leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16"
        >
          {stats.map(({ value, label, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{value}</div>
              <div className="text-sm text-white/50">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
