"use client";

import { motion } from "framer-motion";
import { Mail, ExternalLink, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { HeroContent } from "@/lib/content-defaults";

const team = [
  {
    name: "Dr. Laurent Ndihokubwayo",
    role: "Directeur & Expert Économie",
    bio: "Docteur en Économie, spécialisé en économie du développement et politiques macroéconomiques. 15 ans d'expérience dans le conseil aux institutions financières africaines.",
    initials: "LN",
    gradient: "from-emerald-500 to-teal-600",
    linkedin: "#",
    email: "l.ndihokubwayo@cabinetmarc.org",
  },
  {
    name: "Prof. Cécile Irakoze",
    role: "Directrice Pédagogique & Gestion",
    bio: "Professeure en Management Stratégique, ancienne consultante Banque Mondiale. Spécialiste de la transformation organisationnelle et des ressources humaines.",
    initials: "CI",
    gradient: "from-sky-500 to-blue-600",
    linkedin: "#",
    email: "c.irakoze@cabinetmarc.org",
  },
  {
    name: "Me. Patrick Ndayizeye",
    role: "Expert Juridique & Compliance",
    bio: "Avocat au Barreau du Burundi, spécialiste du droit des affaires et de la fiscalité internationale. Conseil de plusieurs multinationales opérant en Afrique centrale.",
    initials: "PN",
    gradient: "from-violet-500 to-purple-600",
    linkedin: "#",
    email: "p.ndayizeye@cabinetmarc.org",
  },
  {
    name: "Dr. Alice Niyonkuru",
    role: "Experte Statistiques & Recherche",
    bio: "Docteure en Statistiques Appliquées, spécialisée en économétrie et analyse de données. Auteure de nombreuses publications sur le développement économique africain.",
    initials: "AN",
    gradient: "from-amber-500 to-orange-600",
    linkedin: "#",
    email: "a.niyonkuru@cabinetmarc.org",
  },
  {
    name: "M. Eric Bigirimana",
    role: "Expert Entrepreneuriat & Innovation",
    bio: "Entrepreneur et mentor, fondateur de TechHub Bujumbura. Expert en création de startups, financement et développement de l'écosystème entrepreneurial africain.",
    initials: "EB",
    gradient: "from-rose-500 to-red-600",
    linkedin: "#",
    email: "e.bigirimana@cabinetmarc.org",
  },
  {
    name: "M. David Hakizimana",
    role: "Expert TICs & Transformation Digitale",
    bio: "Ingénieur en Informatique, spécialiste de la transformation numérique pour les institutions africaines. Expert certifié AWS et Microsoft Azure.",
    initials: "DH",
    gradient: "from-cyan-500 to-sky-600",
    linkedin: "#",
    email: "d.hakizimana@cabinetmarc.org",
  },
];

export function TeamPageContent({ heroContent = {} }: { heroContent?: HeroContent }) {
  const badge = heroContent.badge ?? "Notre Équipe";
  const title = heroContent.title ?? "Des experts à votre service";
  const description =
    heroContent.description ??
    "Notre équipe pluridisciplinaire réunit les meilleurs experts pour vous accompagner vers l'excellence.";

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

      {/* Team grid */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map(({ name, role, bio, initials, gradient, linkedin, email }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl border border-border bg-card hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Top gradient */}
                <div className={`h-24 bg-gradient-to-br ${gradient} relative`}>
                  <div className="absolute -bottom-8 left-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold border-4 border-card shadow-lg`}>
                      {initials}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-12 p-6">
                  <h3 className="font-bold text-lg mb-1">{name}</h3>
                  <p className="text-sm text-primary font-medium mb-4">{role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{bio}</p>

                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${email}`}
                      className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                      aria-label="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <a
                      href={linkedin}
                      className="w-9 h-9 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
                      aria-label="LinkedIn"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16 p-12 rounded-3xl bg-muted/30 border border-border"
          >
            <h2 className="text-2xl font-bold mb-3">Rejoignez notre équipe</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Vous êtes expert dans votre domaine et souhaitez contribuer à l&apos;excellence africaine ?
              Nous serions ravis de vous rencontrer.
            </p>
            <Button asChild className="group">
              <Link href="/contact">
                Nous contacter
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
