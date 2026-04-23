export interface SiteSettings {
  id: string;
  site_name: string;
  site_tagline: string;
  site_description: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_facebook: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
  social_youtube: string | null;
  google_analytics_id: string | null;
  meta_title: string;
  meta_description: string;
  og_image_url: string | null;
  footer_text: string;
  updated_at: string;
}

export interface HeroContent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cta_primary_text: string;
  cta_primary_href: string;
  cta_secondary_text: string;
  cta_secondary_href: string;
  background_image_url: string | null;
  background_video_url: string | null;
  badge_text: string | null;
  locale: string;
  updated_at: string;
}

export interface CourseCategory {
  id: string;
  slug: string;
  name: string;
  name_fr: string;
  name_en: string;
  description: string;
  description_fr: string;
  description_en: string;
  icon: string;
  color: string;
  image_url: string | null;
  course_count: number;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  title_fr: string;
  title_en: string;
  description: string;
  description_fr: string;
  description_en: string;
  long_description: string | null;
  instructor: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  image_url: string | null;
  price: number;
  is_free: boolean;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
  category?: CourseCategory;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  role_fr: string;
  role_en: string;
  bio: string;
  bio_fr: string;
  bio_en: string;
  image_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_role: string;
  author_company: string;
  author_image_url: string | null;
  content: string;
  content_fr: string;
  content_en: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  title_fr: string;
  title_en: string;
  excerpt: string;
  excerpt_fr: string;
  excerpt_en: string;
  content: string;
  content_fr: string;
  content_en: string;
  author_id: string;
  category: string;
  tags: string[];
  image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  read_time: number;
  created_at: string;
  updated_at: string;
  author?: TeamMember;
}

export interface NavItem {
  id: string;
  label: string;
  label_fr: string;
  label_en: string;
  href: string;
  parent_id: string | null;
  order_index: number;
  is_active: boolean;
  children?: NavItem[];
}

export interface PageContent {
  id: string;
  page_key: string;
  section_key: string;
  content_type: "text" | "html" | "json" | "image";
  content: string;
  locale: string;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mime_type: string;
  bucket: string;
  path: string;
  alt_text: string | null;
  created_at: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  service?: string;
}

export interface NewsletterData {
  email: string;
  name?: string;
  locale?: string;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
  label_fr: string;
  label_en: string;
  icon: string;
  order_index: number;
  is_active: boolean;
}
