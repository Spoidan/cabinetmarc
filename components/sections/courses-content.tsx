"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp, Briefcase, Scale, BarChart2, Rocket, Monitor,
  ArrowRight, Clock, Users, Star, BookOpen, Filter, Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  slug: string;
  title_fr: string;
  level: string;
  price: number;
  is_free: boolean;
  is_featured: boolean;
  categories?: { name_fr: string; slug: string } | null;
  instructor_name?: string;
  duration_hours?: number;
  enrolled_count?: number;
  rating?: number;
}

const categories = [
  { slug: "all", name: "Tout" },
  { slug: "economie", name: "Économie", gradient: "from-emerald-500 to-teal-600" },
  { slug: "gestion", name: "Gestion", gradient: "from-sky-500 to-blue-600" },
  { slug: "droit", name: "Droit", gradient: "from-violet-500 to-purple-600" },
  { slug: "statistiques", name: "Statistiques", gradient: "from-amber-500 to-orange-600" },
  { slug: "entrepreneuriat", name: "Entrepreneuriat", gradient: "from-rose-500 to-red-600" },
  { slug: "tics", name: "TICs", gradient: "from-cyan-500 to-sky-600" },
];

const categoryGradients: Record<string, string> = {
  economie: "from-emerald-500 to-teal-600",
  gestion: "from-sky-500 to-blue-600",
  droit: "from-violet-500 to-purple-600",
  statistiques: "from-amber-500 to-orange-600",
  entrepreneuriat: "from-rose-500 to-red-600",
  tics: "from-cyan-500 to-sky-600",
};

const levelColors: Record<string, string> = {
  beginner: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  intermediate: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  advanced: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
  Débutant: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  Intermédiaire: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  Avancé: "text-rose-600 bg-rose-50 dark:bg-rose-950/30",
};

const levelLabels: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
};

function formatPrice(price: number, isFree: boolean): string {
  if (isFree || price === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-BI", { style: "currency", currency: "BIF", maximumFractionDigits: 0 }).format(price);
}

export function CoursesPageContent() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/courses")
      .then((r) => r.json())
      .then((json) => {
        setCourses(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const matchCat = activeCategory === "all" || c.categories?.slug === activeCategory;
    const matchSearch = !search || c.title_fr.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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
              {loading ? "Chargement..." : `${courses.length} cours disponibles dans 6 domaines d'expertise.`}
            </p>

            {/* Search */}
            <div className="mt-6 relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/15"
              />
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Filters */}
      <section className="py-4 border-b border-border bg-background sticky top-16 lg:top-20 z-30">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
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
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
                  <div className="h-40 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((course, i) => {
                const catSlug = course.categories?.slug ?? "economie";
                const gradient = categoryGradients[catSlug] ?? "from-[#7B3A10] to-[#C4873A]";
                const levelLabel = levelLabels[course.level] ?? course.level;
                const levelColor = levelColors[course.level] ?? levelColors[levelLabel] ?? "text-muted-foreground bg-muted";

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link href={`/courses/${course.slug}`}>
                      <div className="group rounded-2xl border border-border bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden card-shine h-full flex flex-col">
                        {/* Thumbnail */}
                        <div className={`h-40 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                          <BookOpen className="w-12 h-12 text-white/30" />
                          {(course.is_free || course.price === 0) && (
                            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                              GRATUIT
                            </div>
                          )}
                          {course.is_featured && (
                            <div className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: "#7B3A10" }}>
                              ⭐ Vedette
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${levelColor}`}>
                              {levelLabel}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                            {course.title_fr}
                          </h3>
                          {course.instructor_name && (
                            <p className="text-sm text-muted-foreground mb-3">{course.instructor_name}</p>
                          )}

                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
                            {course.duration_hours && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {course.duration_hours}h
                              </span>
                            )}
                            {course.enrolled_count !== undefined && (
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" /> {course.enrolled_count}
                              </span>
                            )}
                            {course.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {course.rating}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-auto">
                            <span className={cn(
                              "font-bold",
                              (course.is_free || course.price === 0) ? "text-emerald-600" : "text-foreground"
                            )}>
                              {formatPrice(course.price, course.is_free)}
                            </span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">
                {search ? `Aucun cours pour "${search}".` : "Aucun cours dans cette catégorie pour le moment."}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
