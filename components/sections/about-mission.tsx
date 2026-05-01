"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Target, Eye, Heart, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const values = [
  {
    icon: Target,
    title: "Notre Mission",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    description:
      "Démocratiser l'accès à l'expertise académique et professionnelle en Afrique , en offrant des formations et services de conseil de qualité internationale.",
  },
  {
    icon: Eye,
    title: "Notre Vision",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    description:
      "Devenir l'institution de référence en Afrique francophone pour la formation professionnelle, la recherche appliquée et le conseil en économie, gestion et droit.",
  },
  {
    icon: Heart,
    title: "Nos Valeurs",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    description:
      "Excellence, Intégrité, Innovation, Impact — ces quatre piliers guident chacune de nos actions et décisions pour servir au mieux nos clients et partenaires.",
  },
];

const highlights = [
  "Fondé par des académiciens et praticiens reconnus",
  "Corps enseignant composé d'experts nationaux et internationaux",
  "Programmes alignés sur les standards internationaux",
  "Partenariats avec des universités et institutions africaines",
  "Approche pragmatique adaptée aux réalités locales",
  "Certifications reconnues par les employeurs",
];

export function AboutMission() {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        {/* Mission / Vision / Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="navy" className="mb-4 !text-black">Notre Identité</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Mission, Vision & Valeurs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cabinet MARC est animé par une ambition claire : contribuer activement au développement
            du capital humain en Afrique.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {values.map(({ icon: Icon, title, color, bg, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border p-8 bg-card hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-5`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>

        {/* Story section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="navy" className="mb-4">Notre Histoire</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              5 ans d&apos;excellence et d&apos;impact
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cabinet MARC a été fondé avec la conviction profonde que l&apos;excellence académique
              et professionnelle devait être accessible à tous les acteurs du développement
              africain. Depuis 2020, nous avons accompagné des centaines de
              professionnels, d&apos;institutions et d&apos;organisations dans leur quête d&apos;excellence.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Notre approche unique combine la rigueur académique la plus exigeante avec un
              pragmatisme professionnel ancré dans les réalités du continent. Chaque programme,
              chaque mission de conseil est pensé pour générer un impact mesurable et durable.
            </p>
            <ul className="space-y-3 mb-8">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="group">
              <Link href="/team">
                Rencontrer notre équipe
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-3xl bg-gradient-to-br from-[#0A0F1E] to-[#0f1f3d] p-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: `radial-gradient(white 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }} />
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />

              <div className="relative z-10 space-y-6">
                {[
                  { year: "2020", event: "Fondation de Cabinet MARC à Bujumbura" },
                  { year: "2021", event: "Lancement du premier programme de formation certifiante" },
                  { year: "2023", event: "Extension des services de conseil institutionnel" },
                  { year: "2025", event: "500+ professionnels accompagnés en conseil et formation" },
                  { year: "2026", event: "Lancement de la plateforme e-learning" },
                ].map(({ year, event }, i) => (
                  <div key={year} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">{year}</span>
                      </div>
                      {i < 4 && <div className="w-px h-8 bg-white/10 mt-1" />}
                    </div>
                    <div className="pt-2.5">
                      <p className="text-white/70 text-sm leading-relaxed">{event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
