"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    author: "Amina Nkurunziza",
    role: "Directrice Générale",
    company: "BNR Burundi",
    content:
      "Cabinet MARC a transformé notre approche de la gestion financière. Les formations sont d'une qualité exceptionnelle et parfaitement adaptées au contexte africain. Je recommande vivement.",
    rating: 5,
    initials: "AN",
    color: "from-emerald-500 to-teal-600",
  },
  {
    author: "Jean-Baptiste Hakizimana",
    role: "Consultant Senior",
    company: "Banque Mondiale",
    content:
      "Une expertise remarquable en économie et statistiques. L'équipe est professionnelle, rigoureuse et toujours à l'écoute des besoins spécifiques. Cabinet MARC est un partenaire de choix.",
    rating: 5,
    initials: "JH",
    color: "from-sky-500 to-blue-600",
  },
  {
    author: "Marie-Claire Nduwimana",
    role: "Entrepreneure",
    company: "TechHub Bujumbura",
    content:
      "Grâce au programme Entrepreneuriat de Cabinet MARC, j'ai pu structurer et lancer mon entreprise tech avec succès. Une expérience d'apprentissage transformatrice.",
    rating: 5,
    initials: "MN",
    color: "from-violet-500 to-purple-600",
  },
  {
    author: "Pierre Ntirampeba",
    role: "Directeur Financier",
    company: "BRARUDI",
    content:
      "La formation en statistiques et économétrie m'a fourni des outils pratiques immédiatement applicables. L'excellence pédagogique de Cabinet MARC est incomparable.",
    rating: 5,
    initials: "PN",
    color: "from-amber-500 to-orange-600",
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="section-padding bg-[#0A0F1E] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <Badge variant="default" className="mb-4 bg-primary/10 text-primary border-primary/20">
            Témoignages
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5 text-white">
            Ce que disent{" "}
            <span className="gradient-text">nos clients</span>
          </h2>
          <p className="text-white/50 leading-relaxed">
            La satisfaction de nos clients est notre plus grande récompense.
          </p>
        </motion.div>

        {/* Featured testimonial */}
        <div className="max-w-3xl mx-auto mb-12">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 relative"
          >
            <Quote className="absolute top-8 right-8 w-12 h-12 text-primary/20" />
            <div className="flex gap-1 mb-6">
              {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <blockquote className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 italic">
              &ldquo;{testimonials[activeIndex].content}&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${testimonials[activeIndex].color} flex items-center justify-center text-white font-bold text-sm`}>
                {testimonials[activeIndex].initials}
              </div>
              <div>
                <div className="text-white font-semibold">{testimonials[activeIndex].author}</div>
                <div className="text-white/50 text-sm">
                  {testimonials[activeIndex].role} — {testimonials[activeIndex].company}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Thumbnails */}
        <div className="flex justify-center gap-3 flex-wrap">
          {testimonials.map((t, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200",
                i === activeIndex
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-transparent border-white/5 text-white/40 hover:border-white/15 hover:text-white/60"
              )}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                {t.initials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-medium">{t.author}</div>
                <div className="text-xs opacity-60">{t.company}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === activeIndex ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
