"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { HeroContent } from "@/lib/content-defaults";
import type { BlogPost } from "@/lib/marketing/queries";

const CATEGORY_GRADIENTS: Record<string, string> = {
  "Économie":       "from-emerald-500 to-teal-600",
  "Gestion":        "from-sky-500 to-blue-600",
  "Droit":          "from-violet-500 to-purple-600",
  "Statistiques":   "from-amber-500 to-orange-600",
  "Entrepreneuriat":"from-rose-500 to-red-600",
  "TICs":           "from-cyan-500 to-sky-600",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Économie":       "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Gestion":        "text-sky-600 bg-sky-50 border-sky-200",
  "Droit":          "text-violet-600 bg-violet-50 border-violet-200",
  "Statistiques":   "text-amber-600 bg-amber-50 border-amber-200",
  "Entrepreneuriat":"text-rose-600 bg-rose-50 border-rose-200",
  "TICs":           "text-cyan-600 bg-cyan-50 border-cyan-200",
};

function getCategoryGradient(cat: string) {
  return CATEGORY_GRADIENTS[cat] ?? "from-slate-500 to-gray-600";
}

export function BlogPageContent({
  heroContent = {},
  posts = [],
}: {
  heroContent?: HeroContent;
  posts?: BlogPost[];
}) {
  const badge = heroContent.badge ?? "Blog & Ressources";
  const title = heroContent.title ?? "Actualités & Analyses";
  const description =
    heroContent.description ??
    "Découvrez nos publications, analyses et ressources rédigées par nos experts.";

  const featured = posts[0];
  const rest = posts.slice(1);

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
            <Badge variant="default" className="mb-4 bg-white/10 text-white border-white/20">{badge}</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{title}</h1>
            <p className="text-white/60 text-lg">{description}</p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="section-padding">
        <div className="container mx-auto">
          {posts.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun article publié pour le moment.</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                  <Link href={`/blog/${featured.slug}`}>
                    <div className="group rounded-3xl border border-border bg-card overflow-hidden hover:shadow-2xl transition-all duration-300 grid lg:grid-cols-2">
                      <div className={`h-64 lg:h-auto relative ${featured.image_url ? "" : `bg-gradient-to-br ${getCategoryGradient(featured.category)}`} flex items-center justify-center`}>
                        {featured.image_url ? (
                          <Image src={featured.image_url} alt={featured.title_fr} fill sizes="640px" className="object-cover" />
                        ) : (
                          <div className="text-center text-white p-8">
                            <div className="text-6xl font-bold opacity-20 mb-4">01</div>
                            <Badge className="bg-white/20 text-white border-white/30">{featured.category}</Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[featured.category] ?? "bg-muted text-muted-foreground border-border"}`}>
                            {featured.category}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {featured.read_time} min
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{featured.title_fr}</h2>
                        <p className="text-muted-foreground leading-relaxed mb-6">{featured.excerpt_fr}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {featured.author_name && <span className="font-medium text-foreground">{featured.author_name} · </span>}
                            {formatDate(featured.published_at ?? featured.created_at)}
                          </div>
                          <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                          <div className={`h-36 relative ${post.image_url ? "" : `bg-gradient-to-br ${getCategoryGradient(post.category)}`} flex items-center justify-center`}>
                            {post.image_url ? (
                              <Image src={post.image_url} alt={post.title_fr} fill sizes="400px" className="object-cover" />
                            ) : (
                              <span className="text-5xl font-bold text-white/20">0{i + 2}</span>
                            )}
                          </div>
                          <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${CATEGORY_COLORS[post.category] ?? "bg-muted text-muted-foreground border-border"}`}>
                                {post.category}
                              </span>
                              <span className="text-xs text-muted-foreground">{formatDate(post.published_at ?? post.created_at)}</span>
                            </div>
                            <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title_fr}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-4">{post.excerpt_fr}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{post.author_name ?? ""}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.read_time} min</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
