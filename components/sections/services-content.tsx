"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Lightbulb, GraduationCap, Search, Monitor, CheckCircle2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "consulting",
    icon: Lightbulb,
    title: "Conseil & Expertise",
    subtitle: "Accompagnement stratégique sur mesure",
    description:
      "Notre équipe d'experts vous accompagne dans vos défis stratégiques, opérationnels et organisationnels. Nous apportons une expertise sectorielle pointue combinée à une connaissance approfondie du contexte africain.",
    features: [
      "Diagnostic organisationnel et stratégique",
      "Conseil en politique économique",
      "Accompagnement à la transformation",
      "Évaluation de projets et programmes",
      "Rédaction de rapports et études sectorielles",
    ],
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-800/30",
  },
  {
    id: "training",
    icon: GraduationCap,
    title: "Formation Professionnelle",
    subtitle: "Programmes certifiants adaptés",
    description:
      "Nos programmes de formation sont conçus pour répondre aux besoins réels du marché. Qu'il s'agisse de formations courtes ou de programmes longs, chaque contenu est actualisé et validé par des experts reconnus.",
    features: [
      "Formations certifiantes en présentiel",
      "Ateliers et séminaires thématiques",
      "Programmes intra-entreprise",
      "Coaching et mentorat individuel",
      "Certifications reconnues internationalement",
    ],
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50 dark:bg-sky-950/20",
    border: "border-sky-200 dark:border-sky-800/30",
  },
  {
    id: "research",
    icon: Search,
    title: "Recherche Appliquée",
    subtitle: "Études et analyses de haute qualité",
    description:
      "Notre département de recherche produit des études et analyses rigoureuses sur des sujets économiques, juridiques et gestionnaires. Chaque travail est conduit selon les standards méthodologiques les plus exigeants.",
    features: [
      "Études de marché et sectorielles",
      "Analyses économiques et financières",
      "Recherches juridiques et réglementaires",
      "Rapports de veille stratégique",
      "Publications académiques et policy papers",
    ],
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-950/20",
    border: "border-violet-200 dark:border-violet-800/30",
  },
  {
    id: "elearning",
    icon: Monitor,
    title: "E-Learning",
    subtitle: "Apprentissage flexible, partout et à tout moment",
    description:
      "Notre plateforme e-learning offre un accès illimité à des contenus pédagogiques de qualité supérieure. Apprenez à votre rythme, depuis n'importe où, avec le soutien de formateurs experts.",
    features: [
      "Cours en ligne interactifs",
      "Vidéos pédagogiques HD",
      "Quiz et évaluations en ligne",
      "Certificats numériques",
      "Forums d'échange et communauté",
    ],
    color: "from-cyan-500 to-sky-600",
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
    border: "border-cyan-200 dark:border-cyan-800/30",
  },
];

export function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <Badge variant="default" className="mb-4 bg-primary/10 text-primary border-primary/20">
              Nos Services
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Des services d&apos;excellence pour{" "}
              <span className="gradient-text">votre réussite</span>
            </h1>
            <p className="text-xl text-white/60 leading-relaxed">
              Cabinet MARC vous accompagne à chaque étape de votre parcours avec une gamme complète
              de services professionnels adaptés à vos besoins.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Services */}
      <section className="section-padding">
        <div className="container mx-auto space-y-20">
          {services.map(({ id, icon: Icon, title, subtitle, description, features, color, bg, border }, i) => (
            <motion.div
              key={id}
              id={id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
            >
              {/* Visual */}
              <div className={i % 2 === 1 ? "lg:col-start-2" : ""}>
                <div className={`rounded-3xl ${bg} border ${border} p-10 flex flex-col items-center text-center`}>
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-xl shadow-black/10`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{subtitle}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                    <span className="ml-1">Évalué 5/5</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={i % 2 === 1 ? "lg:col-start-1" : ""}>
                <Badge variant="navy" className="mb-4">{subtitle}</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold mb-5">{title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-8">{description}</p>
                <ul className="space-y-3 mb-8">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="group">
                  <Link href="/contact">
                    Demander un devis
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Prêt à collaborer avec nous ?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Discutons de vos besoins spécifiques et trouvons ensemble la meilleure solution pour votre organisation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">Nous contacter</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">Explorer nos formations</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
