"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, Briefcase, Scale, BarChart2, Rocket, Monitor,
  ArrowRight, Clock, Users, Star, BookOpen, Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const icons = { TrendingUp, Briefcase, Scale, BarChart2, Rocket, Monitor };

const categories = [
  { slug: "all", name: "Tout", icon: "BookOpen" },
  { slug: "economie", name: "Économie", icon: "TrendingUp", gradient: "from-emerald-500 to-teal-600" },
  { slug: "gestion", name: "Gestion", icon: "Briefcase", gradient: "from-sky-500 to-blue-600" },
  { slug: "droit", name: "Droit", icon: "Scale", gradient: "from-violet-500 to-purple-600" },
  { slug: "statistiques", name: "Statistiques", icon: "BarChart2", gradient: "from-amber-500 to-orange-600" },
  { slug: "entrepreneuriat", name: "Entrepreneuriat", icon: "Rocket", gradient: "from-rose-500 to-red-600" },
  { slug: "tics", name: "TICs", icon: "Monitor", gradient: "from-cyan-500 to-sky-600" },
];

const courses = [
  { id: "1", slug: "macro-economie", category: "economie", title: "Macroéconomie Avancée", instructor: "Dr. Laurent Ndihokubwayo", duration: "40h", level: "Avancé", price: 150000, isFree: false, rating: 4.9, students: 84, gradient: "from-emerald-500 to-teal-600" },
  { id: "2", slug: "gestion-projet", category: "gestion", title: "Gestion de Projet PMI", instructor: "Prof. Cécile Irakoze", duration: "32h", level: "Intermédiaire", price: 120000, isFree: false, rating: 4.8, students: 112, gradient: "from-sky-500 to-blue-600" },
  { id: "3", slug: "droit-affaires", category: "droit", title: "Droit des Affaires en Afrique", instructor: "Me. Patrick Ndayizeye", duration: "28h", level: "Débutant", price: 100000, isFree: false, rating: 4.7, students: 67, gradient: "from-violet-500 to-purple-600" },
  { id: "4", slug: "econometrie", category: "statistiques", title: "Économétrie Appliquée", instructor: "Dr. Alice Niyonkuru", duration: "36h", level: "Avancé", price: 135000, isFree: false, rating: 4.9, students: 45, gradient: "from-amber-500 to-orange-600" },
  { id: "5", slug: "startup-africa", category: "entrepreneuriat", title: "Créer sa Startup en Afrique", instructor: "M. Eric Bigirimana", duration: "24h", level: "Débutant", price: 0, isFree: true, rating: 4.8, students: 203, gradient: "from-rose-500 to-red-600" },
  { id: "6", slug: "transformation-digitale", category: "tics", title: "Transformation Digitale", instructor: "M. David Hakizimana", duration: "30h", level: "Intermédiaire", price: 110000, isFree: false, rating: 4.7, students: 89, gradient: "from-cyan-500 to-sky-600" },
  { id: "7", slug: "micro-finance", category: "economie", title: "Microfinance & Inclusion Financière", instructor: "Dr. Laurent Ndihokubwayo", duration: "20h", level: "Intermédiaire", price: 90000, isFree: false, rating: 4.6, students: 76, gradient: "from-emerald-500 to-teal-600" },
  { id: "8", slug: "rh-strategique", category: "gestion", title: "Ressources Humaines Stratégiques", instructor: "Prof. Cécile Irakoze", duration: "26h", level: "Avancé", price: 125000, isFree: false, rating: 4.8, students: 58, gradient: "from-sky-500 to-blue-600" },
  { id: "9", slug: "data-analysis", category: "statistiques", title: "Analyse de Données avec R", instructor: "Dr. Alice Niyonkuru", duration: "40h", level: "Intermédiaire", price: 0, isFree: true, rating: 4.9, students: 156, gradient: "from-amber-500 to-orange-600" },
];

const levelColors: Record<string, string> = {
  "Débutant": "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  "Intermédiaire": "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  "Avancé": "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
};

function formatPrice(price: number): string {
  if (price === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-BI", { style: "currency", currency: "BIF", maximumFractionDigits: 0 }).format(price);
}

export function CoursesPageContent() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? courses
    : courses.filter((c) => c.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
        <div className="container mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <Badge variant="default" className="mb-4 bg-primary/10 text-primary border-primary/20">Formations</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Nos <span className="gradient-text">formations</span>
            </h1>
            <p className="text-white/60 text-lg">
              {courses.length} cours disponibles dans 6 domaines d&apos;expertise.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border bg-background sticky top-16 lg:top-20 z-30">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {categories.map(({ slug, name }) => (
              <button
                key={slug}
                onClick={() => setActiveCategory(slug)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                  activeCategory === slug
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/courses/${course.slug}`}>
                  <div className="group rounded-2xl border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden card-shine">
                    {/* Thumbnail */}
                    <div className={`h-40 bg-gradient-to-br ${course.gradient} flex items-center justify-center relative`}>
                      <BookOpen className="w-12 h-12 text-white/40" />
                      {course.isFree && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          GRATUIT
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${levelColors[course.level]}`}>
                          {course.level}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">{course.instructor}</p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {course.students}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {course.rating}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "font-bold",
                          course.isFree ? "text-emerald-600" : "text-foreground"
                        )}>
                          {formatPrice(course.price)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Aucun cours dans cette catégorie pour le moment.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
