/**
 * Database types — hand-maintained from supabase/migrations/*.sql.
 *
 * Rebuild with `npx supabase gen types typescript --project-id <id> > types/database.ts`
 * after applying a new migration.
 *
 * Scope:
 *   - Learning platform tables (v2) from 20260424020000_learning_schema.sql
 *   - Legacy marketing tables from supabase/schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CourseLevel = "debutant" | "intermediaire" | "avance";
export type QuizType = "single" | "multiple" | "true_false";
export type UserRole = "student" | "instructor" | "admin";

export type LessonAttachment = {
  name: string;
  path: string;
  size: number;
  mime: string;
};

type NoRelationships = [];

type ProfileInsert = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: UserRole;
  created_at?: string;
  updated_at?: string;
};
type CategoryInsert = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  cover_image?: string | null;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};
type CourseInsert = {
  id?: string;
  category_id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  cover_image?: string | null;
  level?: CourseLevel;
  duration_minutes?: number | null;
  price_bif?: number;
  is_published?: boolean;
  published_at?: string | null;
  author_id?: string | null;
  created_at?: string;
  updated_at?: string;
};
type ModuleInsert = {
  id?: string;
  course_id: string;
  title: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};
type LessonInsert = {
  id?: string;
  module_id: string;
  title: string;
  slug: string;
  content?: string;
  video_url?: string | null;
  attachments?: LessonAttachment[] | Json;
  duration_minutes?: number | null;
  sort_order?: number;
  is_free_preview?: boolean;
  created_at?: string;
  updated_at?: string;
};
type QuizInsert = {
  id?: string;
  course_id: string;
  module_id?: string | null;
  title: string;
  pass_score_percent?: number;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};
type QuestionInsert = {
  id?: string;
  quiz_id: string;
  question: string;
  type?: QuizType;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};
type OptionInsert = {
  id?: string;
  question_id: string;
  label: string;
  is_correct?: boolean;
  sort_order?: number;
};
type EnrollmentInsert = {
  id?: string;
  user_id: string;
  course_id: string;
  enrolled_at?: string;
  completed_at?: string | null;
  progress_percent?: number;
};
type CompletionInsert = {
  id?: string;
  enrollment_id: string;
  lesson_id: string;
  completed_at?: string;
};
type AttemptInsert = {
  id?: string;
  enrollment_id: string;
  quiz_id: string;
  score_percent: number;
  passed?: boolean;
  answers?: Json;
  attempted_at?: string;
};
type CertificateInsert = {
  id?: string;
  enrollment_id: string;
  certificate_number: string;
  issued_at?: string;
  pdf_path?: string | null;
};

// Legacy marketing tables (schema.sql) — permissive; these aren't typed strictly.
type MarketingRow = Record<string, unknown>;

type PublicTables = {
  profiles: {
    Row: {
      id: string;
      full_name: string | null;
      email: string | null;
      avatar_url: string | null;
      role: UserRole;
      created_at: string;
      updated_at: string;
    };
    Insert: ProfileInsert;
    Update: Partial<ProfileInsert>;
    Relationships: NoRelationships;
  };
  course_categories: {
    Row: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      icon: string | null;
      cover_image: string | null;
      is_active: boolean;
      sort_order: number;
      created_at: string;
      updated_at: string;
    };
    Insert: CategoryInsert;
    Update: Partial<CategoryInsert>;
    Relationships: NoRelationships;
  };
  courses: {
    Row: {
      id: string;
      category_id: string;
      title: string;
      slug: string;
      subtitle: string | null;
      description: string | null;
      cover_image: string | null;
      level: CourseLevel;
      duration_minutes: number | null;
      price_bif: number;
      is_published: boolean;
      published_at: string | null;
      author_id: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: CourseInsert;
    Update: Partial<CourseInsert>;
    Relationships: NoRelationships;
  };
  course_modules: {
    Row: {
      id: string;
      course_id: string;
      title: string;
      sort_order: number;
      created_at: string;
      updated_at: string;
    };
    Insert: ModuleInsert;
    Update: Partial<ModuleInsert>;
    Relationships: NoRelationships;
  };
  course_lessons: {
    Row: {
      id: string;
      module_id: string;
      title: string;
      slug: string;
      content: string;
      video_url: string | null;
      attachments: LessonAttachment[];
      duration_minutes: number | null;
      sort_order: number;
      is_free_preview: boolean;
      created_at: string;
      updated_at: string;
    };
    Insert: LessonInsert;
    Update: Partial<LessonInsert>;
    Relationships: NoRelationships;
  };
  course_quizzes: {
    Row: {
      id: string;
      course_id: string;
      module_id: string | null;
      title: string;
      pass_score_percent: number;
      sort_order: number;
      created_at: string;
      updated_at: string;
    };
    Insert: QuizInsert;
    Update: Partial<QuizInsert>;
    Relationships: NoRelationships;
  };
  quiz_questions: {
    Row: {
      id: string;
      quiz_id: string;
      question: string;
      type: QuizType;
      sort_order: number;
      created_at: string;
      updated_at: string;
    };
    Insert: QuestionInsert;
    Update: Partial<QuestionInsert>;
    Relationships: NoRelationships;
  };
  quiz_options: {
    Row: {
      id: string;
      question_id: string;
      label: string;
      is_correct: boolean;
      sort_order: number;
    };
    Insert: OptionInsert;
    Update: Partial<OptionInsert>;
    Relationships: NoRelationships;
  };
  course_enrollments: {
    Row: {
      id: string;
      user_id: string;
      course_id: string;
      enrolled_at: string;
      completed_at: string | null;
      progress_percent: number;
    };
    Insert: EnrollmentInsert;
    Update: Partial<EnrollmentInsert>;
    Relationships: NoRelationships;
  };
  lesson_completions: {
    Row: {
      id: string;
      enrollment_id: string;
      lesson_id: string;
      completed_at: string;
    };
    Insert: CompletionInsert;
    Update: Partial<CompletionInsert>;
    Relationships: NoRelationships;
  };
  quiz_attempts: {
    Row: {
      id: string;
      enrollment_id: string;
      quiz_id: string;
      score_percent: number;
      passed: boolean;
      answers: Json;
      attempted_at: string;
    };
    Insert: AttemptInsert;
    Update: Partial<AttemptInsert>;
    Relationships: NoRelationships;
  };
  course_certificates: {
    Row: {
      id: string;
      enrollment_id: string;
      certificate_number: string;
      issued_at: string;
      pdf_path: string | null;
    };
    Insert: CertificateInsert;
    Update: Partial<CertificateInsert>;
    Relationships: NoRelationships;
  };
  // Legacy marketing tables — loosely typed; admin pages that query these should
  // not fail type-checking. Field names are documented in supabase/schema.sql.
  site_settings: {
    Row: MarketingRow;
    Insert: MarketingRow;
    Update: MarketingRow;
    Relationships: NoRelationships;
  };
  hero_content: {
    Row: MarketingRow;
    Insert: MarketingRow;
    Update: MarketingRow;
    Relationships: NoRelationships;
  };
  team_members: {
    Row: MarketingRow;
    Insert: MarketingRow;
    Update: MarketingRow;
    Relationships: NoRelationships;
  };
  testimonials: {
    Row: MarketingRow;
    Insert: MarketingRow;
    Update: MarketingRow;
    Relationships: NoRelationships;
  };
  blog_posts: {
    Row: MarketingRow;
    Insert: MarketingRow;
    Update: MarketingRow;
    Relationships: NoRelationships;
  };
  nav_items: {
    Row: MarketingRow;
    Insert: MarketingRow;
    Update: MarketingRow;
    Relationships: NoRelationships;
  };
  page_content: {
    Row: MarketingRow;
    Insert: MarketingRow;
    Update: MarketingRow;
    Relationships: NoRelationships;
  };
  contact_submissions: {
    Row: MarketingRow;
    Insert: MarketingRow;
    Update: MarketingRow;
    Relationships: NoRelationships;
  };
  newsletter_subscribers: {
    Row: MarketingRow;
    Insert: MarketingRow;
    Update: MarketingRow;
    Relationships: NoRelationships;
  };
  stats: {
    Row: MarketingRow;
    Insert: MarketingRow;
    Update: MarketingRow;
    Relationships: NoRelationships;
  };
};

export interface Database {
  public: {
    Tables: PublicTables;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      course_level: CourseLevel;
      quiz_type: QuizType;
      user_role: UserRole;
    };
  };
}
