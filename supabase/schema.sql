-- Cabinet MARC Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- SITE SETTINGS
-- ===========================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT NOT NULL DEFAULT 'Cabinet MARC',
  site_tagline TEXT NOT NULL DEFAULT 'Excellence en Conseil, Formation & Recherche',
  site_description TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#059669',
  secondary_color TEXT NOT NULL DEFAULT '#0A0F1E',
  accent_color TEXT NOT NULL DEFAULT '#D97706',
  font_heading TEXT NOT NULL DEFAULT 'Playfair Display',
  font_body TEXT NOT NULL DEFAULT 'Inter',
  contact_email TEXT NOT NULL DEFAULT 'info@cabinetmarc.org',
  contact_phone TEXT NOT NULL DEFAULT '+257 00 000 000',
  contact_address TEXT NOT NULL DEFAULT 'Bujumbura, Burundi',
  social_facebook TEXT,
  social_twitter TEXT,
  social_linkedin TEXT,
  social_youtube TEXT,
  google_analytics_id TEXT,
  meta_title TEXT NOT NULL DEFAULT 'Cabinet MARC | Conseil, Formation & E-Learning',
  meta_description TEXT NOT NULL DEFAULT '',
  og_image_url TEXT,
  footer_text TEXT NOT NULL DEFAULT '© 2024 Cabinet MARC. Tous droits réservés.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- HERO CONTENT
-- ===========================
CREATE TABLE IF NOT EXISTS hero_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_primary_text TEXT NOT NULL DEFAULT 'Explorer nos formations',
  cta_primary_href TEXT NOT NULL DEFAULT '/courses',
  cta_secondary_text TEXT NOT NULL DEFAULT 'En savoir plus',
  cta_secondary_href TEXT NOT NULL DEFAULT '/about',
  background_image_url TEXT,
  background_video_url TEXT,
  badge_text TEXT,
  locale TEXT NOT NULL DEFAULT 'fr',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- COURSE CATEGORIES
-- ===========================
CREATE TABLE IF NOT EXISTS course_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name_fr TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_fr TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'BookOpen',
  color TEXT NOT NULL DEFAULT '#059669',
  gradient TEXT NOT NULL DEFAULT 'from-emerald-500 to-teal-600',
  image_url TEXT,
  course_count INT NOT NULL DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- COURSES
-- ===========================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES course_categories(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title_fr TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_fr TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  long_description_fr TEXT,
  long_description_en TEXT,
  instructor TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- TEAM MEMBERS
-- ===========================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role_fr TEXT NOT NULL,
  role_en TEXT NOT NULL,
  bio_fr TEXT NOT NULL DEFAULT '',
  bio_en TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  linkedin_url TEXT,
  email TEXT,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- TESTIMONIALS
-- ===========================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL DEFAULT '',
  author_company TEXT NOT NULL DEFAULT '',
  author_image_url TEXT,
  content_fr TEXT NOT NULL,
  content_en TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- BLOG POSTS
-- ===========================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title_fr TEXT NOT NULL,
  title_en TEXT NOT NULL,
  excerpt_fr TEXT NOT NULL DEFAULT '',
  excerpt_en TEXT NOT NULL DEFAULT '',
  content_fr TEXT NOT NULL DEFAULT '',
  content_en TEXT NOT NULL DEFAULT '',
  author_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  read_time INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- NAV ITEMS
-- ===========================
CREATE TABLE IF NOT EXISTS nav_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label_fr TEXT NOT NULL,
  label_en TEXT NOT NULL,
  href TEXT NOT NULL,
  parent_id UUID REFERENCES nav_items(id) ON DELETE CASCADE,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- PAGE CONTENT
-- ===========================
CREATE TABLE IF NOT EXISTS page_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'html', 'json', 'image')),
  content TEXT NOT NULL DEFAULT '',
  locale TEXT NOT NULL DEFAULT 'fr',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_key, section_key, locale)
);

-- ===========================
-- CONTACT SUBMISSIONS
-- ===========================
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  service TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- NEWSLETTER SUBSCRIBERS
-- ===========================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  locale TEXT NOT NULL DEFAULT 'fr',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- STATS
-- ===========================
CREATE TABLE IF NOT EXISTS stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  value TEXT NOT NULL,
  label_fr TEXT NOT NULL,
  label_en TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Star',
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- ===========================
-- SEED DATA
-- ===========================

-- Site settings
INSERT INTO site_settings (site_name, site_tagline, site_description, meta_title, meta_description, footer_text, contact_email, contact_phone, contact_address)
VALUES (
  'Cabinet MARC',
  'Excellence en Conseil, Formation & Recherche',
  'Cabinet MARC est une institution spécialisée en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs, basée au Burundi.',
  'Cabinet MARC | Conseil, Formation & E-Learning au Burundi',
  'Cabinet MARC offre des services de conseil, de formation et d''e-learning de qualité supérieure en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs.',
  '© 2024 Cabinet MARC. Tous droits réservés.',
  'info@cabinetmarc.org',
  '+257 00 000 000',
  'Bujumbura, Burundi'
) ON CONFLICT DO NOTHING;

-- Hero content
INSERT INTO hero_content (title, subtitle, description, cta_primary_text, cta_secondary_text, badge_text, locale)
VALUES (
  'L''excellence académique au service de l''Afrique',
  'Conseil · Formation · Recherche · E-Learning',
  'Cabinet MARC vous accompagne dans votre développement professionnel et institutionnel grâce à une expertise pointue en Économie, Gestion, Droit, Statistiques, Entrepreneuriat et TICs.',
  'Explorer nos formations',
  'En savoir plus',
  'Nouveau : E-Learning disponible',
  'fr'
) ON CONFLICT DO NOTHING;

-- Stats
INSERT INTO stats (value, label_fr, label_en, icon, order_index) VALUES
('500+', 'Étudiants formés', 'Students trained', 'Users', 1),
('50+', 'Cours disponibles', 'Available courses', 'BookOpen', 2),
('15+', 'Experts consultants', 'Expert consultants', 'Award', 3),
('10+', 'Années d''expérience', 'Years of experience', 'Calendar', 4)
ON CONFLICT DO NOTHING;

-- Course categories
INSERT INTO course_categories (slug, name_fr, name_en, description_fr, description_en, icon, color, gradient, order_index) VALUES
('economie', 'Économie', 'Economics', 'Microéconomie, macroéconomie, économie du développement et politiques économiques.', 'Microeconomics, macroeconomics, development economics and economic policies.', 'TrendingUp', '#059669', 'from-emerald-500 to-teal-600', 1),
('gestion', 'Gestion', 'Management', 'Management stratégique, gestion de projet, ressources humaines et finance d''entreprise.', 'Strategic management, project management, HR and corporate finance.', 'Briefcase', '#0369A1', 'from-sky-500 to-blue-600', 2),
('droit', 'Droit', 'Law', 'Droit des affaires, droit fiscal, droit du travail et juridique international.', 'Business law, tax law, labor law and international legal frameworks.', 'Scale', '#7C3AED', 'from-violet-500 to-purple-600', 3),
('statistiques', 'Statistiques', 'Statistics', 'Analyse de données, statistiques descriptives, inférentielles et économétrie.', 'Data analysis, descriptive and inferential statistics, econometrics.', 'BarChart2', '#B45309', 'from-amber-500 to-orange-600', 4),
('entrepreneuriat', 'Entrepreneuriat', 'Entrepreneurship', 'Création d''entreprise, business plan, financement et écosystème startup.', 'Business creation, business planning, funding and startup ecosystem.', 'Rocket', '#DC2626', 'from-rose-500 to-red-600', 5),
('tics', 'TICs', 'ICTs', 'Technologies de l''information, transformation numérique et compétences digitales.', 'Information technology, digital transformation and digital skills.', 'Monitor', '#0891B2', 'from-cyan-500 to-sky-600', 6)
ON CONFLICT (slug) DO NOTHING;

-- Nav items
INSERT INTO nav_items (label_fr, label_en, href, order_index) VALUES
('Accueil', 'Home', '/', 1),
('À Propos', 'About', '/about', 2),
('Formation', 'Training', '/courses', 3),
('Services', 'Services', '/services', 4),
('Équipe', 'Team', '/team', 5),
('Blog', 'Blog', '/blog', 6),
('Contact', 'Contact', '/contact', 7)
ON CONFLICT DO NOTHING;

-- Testimonials
INSERT INTO testimonials (author_name, author_role, author_company, content_fr, content_en, rating, is_featured, order_index) VALUES
('Amina Nkurunziza', 'Directrice Générale', 'BNR Burundi', 'Cabinet MARC a transformé notre approche de la gestion financière. Les formations sont d''une qualité exceptionnelle et parfaitement adaptées au contexte africain.', 'Cabinet MARC transformed our approach to financial management. The training is of exceptional quality and perfectly adapted to the African context.', 5, true, 1),
('Jean-Baptiste Hakizimana', 'Consultant Senior', 'Banque Mondiale', 'Une expertise remarquable en économie et statistiques. L''équipe est professionnelle, rigoureuse et toujours à l''écoute des besoins spécifiques.', 'Remarkable expertise in economics and statistics. The team is professional, rigorous and always attentive to specific needs.', 5, true, 2),
('Marie-Claire Nduwimana', 'Entrepreneure', 'TechHub Bujumbura', 'Grâce au programme Entrepreneuriat de Cabinet MARC, j''ai pu structurer et lancer mon entreprise tech avec succès. Je recommande vivement.', 'Thanks to Cabinet MARC''s Entrepreneurship program, I was able to structure and successfully launch my tech company. Highly recommended.', 5, true, 3)
ON CONFLICT DO NOTHING;

-- RLS Policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read hero_content" ON hero_content FOR SELECT USING (true);
CREATE POLICY "Public read course_categories" ON course_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Public read team_members" ON team_members FOR SELECT USING (is_active = true);
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public read blog_posts" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public read nav_items" ON nav_items FOR SELECT USING (is_active = true);
CREATE POLICY "Public read page_content" ON page_content FOR SELECT USING (true);
CREATE POLICY "Public read stats" ON stats FOR SELECT USING (is_active = true);

-- Insert contact submissions (public)
CREATE POLICY "Public insert contact_submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert newsletter_subscribers" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Public read media" ON storage.objects FOR SELECT USING (bucket_id IN ('media', 'avatars'));
