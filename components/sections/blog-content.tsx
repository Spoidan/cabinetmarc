"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, ArrowRight, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { HeroContent } from "@/lib/content-defaults";

const posts = [
  {
    slug: "economie-burundi-2024",
    title: "Perspectives économiques du Burundi en 2024",
    excerpt: "Analyse des tendances macroéconomiques, des défis structurels et des opportunités de croissance pour l'économie burundaise dans un contexte régional en mutation.",
    category: "Économie",
    author: "Dr. Laurent Ndihokubwayo",
    date: "2024-03-15",
    readTime: 8,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    slug: "management-pme-afrique",
    title: "Bonnes pratiques de management pour les PME africaines",
    excerpt: "Comment adapter les outils modernes de gestion aux réalités des petites et moyennes entreprises africaines pour améliorer leurs performances.",
    category: "Gestion",
    author: "Prof. Cécile Irakoze",
    date: "2024-02-28",
    readTime: 6,
    gradient: "from-sky-500 to-blue-600",
  },
  {
    slug: "droit-travail-reform",
    title: "La réforme du droit du travail en Afrique de l'Est",
    excerpt: "Tour d'horizon des récentes réformes législatives et leur impact sur les relations employeur-employé dans la région.",
    category: "Droit",
    author: "Me. Patrick Ndayizeye",
    date: "2024-02-10",
    readTime: 10,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    slug: "data-science-agriculture",
    title: "L'analyse de données au service de l'agriculture africaine",
    excerpt: "Comment les statistiques et l'intelligence artificielle transforment les pratiques agricoles et contribuent à la sécurité alimentaire.",
    category: "Statistiques",
    author: "Dr. Alice Niyonkuru",
    date: "2024-01-25",
    readTime: 7,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    slug: "financement-startup-afrique",
    title: "Guide du financement pour les startups africaines",
    excerpt: "Des fonds d'amorçage aux levées de fonds Series A — tout ce que vous devez savoir sur le financement de votre startup en Afrique.",
    category: "Entrepreneuriat",
    author: "M. Eric Bigirimana",
    date: "2024-01-12",
    readTime: 9,
    gradient: "from-rose-500 to-red-600",
  },
  {
    slug: "digitalisation-secteur-public",
    title: "Digitalisation du secteur public en Afrique centrale",
    excerpt: "État des lieux et perspectives de la transformation numérique des administrations publiques en Afrique centrale.",
    category: "TICs",
    author: "M. David Hakizimana",
    date: "2023-12-20",
    readTime: 8,
    gradient: "from-cyan-500 to-sky-600",
  },
];

const categoryColors: Record<string, string> = {
  "Économie": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Gestion": "text-sky-600 bg-sky-50 border-sky-200",
  "Droit": "text-violet-600 bg-violet-50 border-violet-200",
  "Statistiques": "text-amber-600 bg-amber-50 border-amber-200",
  "Entrepreneuriat": "text-rose-600 bg-rose-50 border-rose-200",
  "TICs": "text-cyan-600 bg-cyan-50 border-cyan-200",
};

export function BlogPageContent({ heroContent = {} }: { heroContent?: HeroContent }) {
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
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {title}
            </h1>
            <p className="text-white/60 text-lg">
              {description}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="section-padding">
        <div className="container mx-auto">
          {/* Featured post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link href={`/blog/${featured.slug}`}>
              <div className="group rounded-3xl border border-border bg-card overflow-hidden hover:shadow-2xl transition-all duration-300 grid lg:grid-cols-2">
                <div className={`h-64 lg:h-auto bg-gradient-to-br ${featured.gradient} flex items-center justify-center`}>
                  <div className="text-center text-white p-8">
                    <div className="text-6xl font-bold opacity-20 mb-4">01</div>
                    <Badge className="bg-white/20 text-white border-white/30">{featured.category}</Badge>
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${categoryColors[featured.category]}`}>
                      {featured.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {featured.readTime} min de lecture
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{featured.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{featured.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{featured.author}</span> · {formatDate(featured.date)}
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className={`h-36 bg-gradient-to-br ${post.gradient} flex items-center justify-center`}>
                      <span className="text-5xl font-bold text-white/20">0{i + 2}</span>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${categoryColors[post.category]}`}>
                          {post.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatDate(post.date)}</span>
                      </div>
                      <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{post.author}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime} min</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
