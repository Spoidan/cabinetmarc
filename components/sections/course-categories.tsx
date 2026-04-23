"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp, Briefcase, Scale, BarChart2, Rocket, Monitor, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const icons = { TrendingUp, Briefcase, Scale, BarChart2, Rocket, Monitor };

const categories = [
  {
    slug: "economie",
    name: "Économie",
    description: "Microéconomie, macroéconomie, économie du développement et politiques économiques.",
    icon: "TrendingUp",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/50",
    count: 12,
  },
  {
    slug: "gestion",
    name: "Gestion",
    description: "Management stratégique, gestion de projet, ressources humaines et finance d'entreprise.",
    icon: "Briefcase",
    gradient: "from-sky-500 to-blue-600",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-800/50",
    count: 15,
  },
  {
    slug: "droit",
    name: "Droit",
    description: "Droit des affaires, droit fiscal, droit du travail et juridique international.",
    icon: "Scale",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800/50",
    count: 9,
  },
  {
    slug: "statistiques",
    name: "Statistiques",
    description: "Analyse de données, statistiques descriptives, inférentielles et économétrie.",
    icon: "BarChart2",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/50",
    count: 8,
  },
  {
    slug: "entrepreneuriat",
    name: "Entrepreneuriat",
    description: "Création d'entreprise, business plan, financement et écosystème startup.",
    icon: "Rocket",
    gradient: "from-rose-500 to-red-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800/50",
    count: 10,
  },
  {
    slug: "tics",
    name: "TICs",
    description: "Technologies de l'information, transformation numérique et compétences digitales.",
    icon: "Monitor",
    gradient: "from-cyan-500 to-sky-600",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    border: "border-cyan-200 dark:border-cyan-800/50",
    count: 11,
  },
];

export function CourseCategories() {
  return (
    <section className="section-padding bg-muted/20">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <Badge variant="navy" className="mb-4">Nos Domaines</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
            Des formations d&apos;excellence dans{" "}
            <span className="gradient-text">6 disciplines</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Chaque programme est conçu par des experts reconnus pour répondre aux exigences
            du marché africain et international.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((cat, i) => {
            const Icon = icons[cat.icon as keyof typeof icons];
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link href={`/courses?category=${cat.slug}`}>
                  <div
                    className={cn(
                      "group relative rounded-2xl border p-6 transition-all duration-300 cursor-pointer card-shine",
                      cat.bg, cat.border,
                      "hover:shadow-lg hover:-translate-y-1"
                    )}
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-5 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">{cat.description}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground bg-background/60 rounded-full px-3 py-1">
                        {cat.count} cours disponibles
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                    </div>

                    {/* Hover gradient overlay */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Button size="lg" variant="outline" asChild className="group">
            <Link href="/courses">
              Voir toutes les formations
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
