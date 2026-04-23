export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      site_settings: {
        Row: {
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
        };
        Insert: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
      };
      hero_content: {
        Row: {
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
        };
        Insert: Partial<Database["public"]["Tables"]["hero_content"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["hero_content"]["Row"]>;
      };
      course_categories: {
        Row: {
          id: string;
          slug: string;
          name_fr: string;
          name_en: string;
          description_fr: string;
          description_en: string;
          icon: string;
          color: string;
          gradient: string;
          image_url: string | null;
          course_count: number;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["course_categories"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["course_categories"]["Row"]>;
      };
      courses: {
        Row: {
          id: string;
          category_id: string;
          slug: string;
          title_fr: string;
          title_en: string;
          description_fr: string;
          description_en: string;
          long_description_fr: string | null;
          long_description_en: string | null;
          instructor: string;
          duration: string;
          level: string;
          image_url: string | null;
          price: number;
          is_free: boolean;
          is_featured: boolean;
          is_active: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["courses"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["courses"]["Row"]>;
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role_fr: string;
          role_en: string;
          bio_fr: string;
          bio_en: string;
          image_url: string | null;
          linkedin_url: string | null;
          email: string | null;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["team_members"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["team_members"]["Row"]>;
      };
      testimonials: {
        Row: {
          id: string;
          author_name: string;
          author_role: string;
          author_company: string;
          author_image_url: string | null;
          content_fr: string;
          content_en: string;
          rating: number;
          is_featured: boolean;
          is_active: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["testimonials"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Row"]>;
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title_fr: string;
          title_en: string;
          excerpt_fr: string;
          excerpt_en: string;
          content_fr: string;
          content_en: string;
          author_id: string | null;
          category: string;
          tags: string[];
          image_url: string | null;
          is_published: boolean;
          published_at: string | null;
          read_time: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["blog_posts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["blog_posts"]["Row"]>;
      };
      nav_items: {
        Row: {
          id: string;
          label_fr: string;
          label_en: string;
          href: string;
          parent_id: string | null;
          order_index: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["nav_items"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["nav_items"]["Row"]>;
      };
      page_content: {
        Row: {
          id: string;
          page_key: string;
          section_key: string;
          content_type: string;
          content: string;
          locale: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["page_content"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["page_content"]["Row"]>;
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          service: string | null;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contact_submissions"]["Row"], "id" | "status" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["contact_submissions"]["Row"]>;
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          locale: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["newsletter_subscribers"]["Row"], "id" | "is_active" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Row"]>;
      };
      stats: {
        Row: {
          id: string;
          value: string;
          label_fr: string;
          label_en: string;
          icon: string;
          order_index: number;
          is_active: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["stats"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["stats"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
