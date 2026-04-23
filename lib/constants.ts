export const SITE_NAME = "Cabinet MARC";
export const SITE_TAGLINE = "Excellence en Conseil, Formation & Recherche";
export const SITE_DESCRIPTION =
  "Cabinet MARC est une institution spécialisée en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs, basée au Burundi.";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://cabinetmarc.org";

export const LOCALES = ["fr", "en"] as const;
export const DEFAULT_LOCALE = "fr" as const;

export const NAV_LINKS = [
  { href: "/", label: "Accueil", label_en: "Home" },
  { href: "/about", label: "À Propos", label_en: "About" },
  { href: "/courses", label: "Formation", label_en: "Training" },
  { href: "/services", label: "Services", label_en: "Services" },
  { href: "/team", label: "Équipe", label_en: "Team" },
  { href: "/blog", label: "Blog", label_en: "Blog" },
  { href: "/contact", label: "Contact", label_en: "Contact" },
] as const;

export const COURSE_CATEGORIES = [
  {
    slug: "economie",
    name_fr: "Économie",
    name_en: "Economics",
    description_fr: "Microéconomie, macroéconomie, économie du développement et politiques économiques.",
    description_en: "Microeconomics, macroeconomics, development economics and economic policies.",
    icon: "TrendingUp",
    color: "#059669",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    slug: "gestion",
    name_fr: "Gestion",
    name_en: "Management",
    description_fr: "Management stratégique, gestion de projet, ressources humaines et finance d'entreprise.",
    description_en: "Strategic management, project management, HR and corporate finance.",
    icon: "Briefcase",
    color: "#0369A1",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    slug: "droit",
    name_fr: "Droit",
    name_en: "Law",
    description_fr: "Droit des affaires, droit fiscal, droit du travail et juridique international.",
    description_en: "Business law, tax law, labor law and international legal frameworks.",
    icon: "Scale",
    color: "#7C3AED",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    slug: "statistiques",
    name_fr: "Statistiques",
    name_en: "Statistics",
    description_fr: "Analyse de données, statistiques descriptives, inférentielles et économétrie.",
    description_en: "Data analysis, descriptive & inferential statistics, econometrics.",
    icon: "BarChart2",
    color: "#B45309",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    slug: "entrepreneuriat",
    name_fr: "Entrepreneuriat",
    name_en: "Entrepreneurship",
    description_fr: "Création d'entreprise, business plan, financement et écosystème startup.",
    description_en: "Business creation, business planning, funding and startup ecosystem.",
    icon: "Rocket",
    color: "#DC2626",
    gradient: "from-rose-500 to-red-600",
  },
  {
    slug: "tics",
    name_fr: "TICs",
    name_en: "ICTs",
    description_fr: "Technologies de l'information, transformation numérique et compétences digitales.",
    description_en: "Information technology, digital transformation and digital skills.",
    icon: "Monitor",
    color: "#0891B2",
    gradient: "from-cyan-500 to-sky-600",
  },
] as const;

export const STATS = [
  { value: "500+", label_fr: "Étudiants formés", label_en: "Students trained", icon: "Users" },
  { value: "50+", label_fr: "Cours disponibles", label_en: "Available courses", icon: "BookOpen" },
  { value: "15+", label_fr: "Experts consultants", label_en: "Expert consultants", icon: "Award" },
  { value: "10+", label_fr: "Années d'expérience", label_en: "Years of experience", icon: "Calendar" },
] as const;

export const ADMIN_ROUTES = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/content", label: "Contenu", icon: "FileText" },
  { href: "/admin/courses", label: "Formations", icon: "BookOpen" },
  { href: "/admin/team", label: "Équipe", icon: "Users" },
  { href: "/admin/media", label: "Médias", icon: "Image" },
  { href: "/admin/settings", label: "Paramètres", icon: "Settings" },
] as const;
