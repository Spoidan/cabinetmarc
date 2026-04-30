export type HeroContent = {
  badge?: string;
  title?: string;
  description?: string;
};

export type HomeHeroContent = {
  badge_text?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  cta_primary_text?: string;
  cta_primary_href?: string;
  cta_secondary_text?: string;
  cta_secondary_href?: string;
};

export const HERO_DEFAULTS: Record<string, HeroContent> = {
  about: {
    badge: "À Propos de Cabinet MARC",
    title: "Votre partenaire de confiance pour l'excellence",
    description:
      "Cabinet MARC est une institution spécialisée en conseil, formation et recherche, dédiée à l'excellence académique et professionnelle en Afrique centrale.",
  },
  services: {
    badge: "Nos Services",
    title: "Des services d'excellence pour votre réussite",
    description:
      "Cabinet MARC vous accompagne à chaque étape de votre parcours avec une gamme complète de services professionnels adaptés à vos besoins.",
  },
  team: {
    badge: "Notre Équipe",
    title: "Des experts à votre service",
    description:
      "Notre équipe pluridisciplinaire réunit les meilleurs experts pour vous accompagner vers l'excellence.",
  },
  blog: {
    badge: "Blog & Ressources",
    title: "Actualités & Analyses",
    description:
      "Découvrez nos publications, analyses et ressources rédigées par nos experts.",
  },
  contact: {
    badge: "Contact",
    title: "Nous sommes à votre écoute",
    description: "Contactez-nous pour vos besoins en conseil, formation ou recherche.",
  },
};

export const HOME_HERO_DEFAULTS: HomeHeroContent = {
  badge_text: "Nouveau : E-Learning disponible",
  title: "L'excellence académique au service de l'Afrique",
  subtitle: "Conseil · Formation · Recherche · E-Learning",
  description:
    "Cabinet MARC vous accompagne dans votre développement professionnel et institutionnel grâce à une expertise pointue en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs.",
  cta_primary_text: "Explorer nos formations",
  cta_primary_href: "/cours",
  cta_secondary_text: "Découvrir MARC",
  cta_secondary_href: "/about",
};
