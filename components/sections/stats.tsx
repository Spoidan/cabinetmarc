"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, Award, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

const icons = { Users, BookOpen, Award, Calendar };

const stats = [
  { value: "500+", label_fr: "Étudiants formés", icon: "Users", color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: "50+", label_fr: "Cours disponibles", icon: "BookOpen", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { value: "15+", label_fr: "Experts consultants", icon: "Award", color: "text-amber-500", bg: "bg-amber-500/10" },
  { value: "10+", label_fr: "Années d'expérience", icon: "Calendar", color: "text-purple-500", bg: "bg-purple-500/10" },
];

export function Stats() {
  return (
    <section className="py-16 bg-muted/30 border-y border-border">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const Icon = icons[stat.icon as keyof typeof icons];
            return (
              <motion.div
                key={stat.label_fr}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label_fr}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
