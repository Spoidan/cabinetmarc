"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Target, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const values = [
  { icon: Target, title: "Excellence", desc: "Standards académiques les plus élevés" },
  { icon: Eye, title: "Innovation", desc: "Approches pédagogiques modernes" },
  { icon: Heart, title: "Impact", desc: "Développement durable de l'Afrique" },
];

const highlights = [
  "Expertise reconnue en Économie, Gestion & Droit",
  "Programmes adaptés au contexte africain",
  "Corps enseignant de haut niveau",
  "Certifications reconnues internationalement",
  "Partenariats avec institutions internationales",
];

export function AboutPreview() {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Main image card */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/10 aspect-[4/3]">
              <div className="absolute inset-0 hero-gradient opacity-80" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
                <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg viewBox="0 0 60 60" className="w-12 h-12" fill="none">
                    <circle cx="30" cy="30" r="28" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
                    <path d="M30 8 L30 52 M8 30 L52 30" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="30" cy="30" r="8" fill="#059669" fillOpacity="0.8"/>
                    <circle cx="30" cy="30" r="4" fill="white"/>
                  </svg>
                </div>
                <div className="text-center text-white">
                  <div className="text-4xl font-bold mb-1">10+</div>
                  <div className="text-white/70 text-sm">Années d&apos;excellence</div>
                </div>
                {/* Values row */}
                <div className="flex gap-3 flex-wrap justify-center">
                  {values.map(({ icon: Icon, title }) => (
                    <div key={title} className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      <span className="text-white/80 text-xs font-medium">{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating accent card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -bottom-6 -right-6 bg-card border border-border rounded-2xl p-4 shadow-xl max-w-[200px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-amber-500" />
                </div>
                <span className="text-sm font-semibold">Notre Mission</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Démocratiser l&apos;excellence académique en Afrique centrale
              </p>
            </motion.div>
          </motion.div>

          {/* Right: content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <Badge variant="navy" className="mb-4">À Propos de Nous</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Votre partenaire de confiance pour{" "}
              <span className="gradient-text">l&apos;excellence</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Fondé avec la vision de démocratiser l&apos;accès à l&apos;expertise académique et professionnelle
              en Afrique centrale, Cabinet MARC s&apos;est imposé comme une référence incontournable en
              matière de conseil, formation et recherche appliquée.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Notre approche unique combine rigueur académique et pragmatisme professionnel pour offrir
              des programmes parfaitement adaptés aux réalités et ambitions du continent africain.
            </p>

            {/* Highlights */}
            <ul className="space-y-3 mb-10">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>

            <Button size="lg" asChild className="group">
              <Link href="/about">
                En savoir plus
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
