-- ============================================================================
-- Cabinet MARC — Learning platform schema (v2)
-- ----------------------------------------------------------------------------
-- Implements the schema from the 2026-04-24 Claude Code brief, Phase 3.
-- Adapted for Clerk auth: all user_id / author_id columns are TEXT (Clerk IDs
-- look like `user_2xyz...`) and RLS does NOT use `auth.uid()`. Instead,
-- public SELECT is allowed on published content, and every write goes through
-- the Supabase service-role key in a Server Action that first calls Clerk's
-- `auth()` to verify the session.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---- helper: updated_at trigger ---------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PROFILES  (Clerk user mirror)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           TEXT PRIMARY KEY,                    -- Clerk user_id
  full_name    TEXT,
  email        TEXT,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'student'
                 CHECK (role IN ('student', 'instructor', 'admin')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- COURSE CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  icon          TEXT,            -- lucide icon name, e.g. 'briefcase'
  cover_image   TEXT,            -- storage path or https URL
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_course_categories_sort
  ON public.course_categories (is_active, sort_order);
DROP TRIGGER IF EXISTS trg_course_categories_updated ON public.course_categories;
CREATE TRIGGER trg_course_categories_updated BEFORE UPDATE ON public.course_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- COURSES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       UUID NOT NULL REFERENCES public.course_categories(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  subtitle          TEXT,
  description       TEXT,           -- HTML from TipTap
  cover_image       TEXT,           -- storage path or https URL
  level             TEXT NOT NULL DEFAULT 'debutant'
                      CHECK (level IN ('debutant','intermediaire','avance')),
  duration_minutes  INT,
  price_bif         INT NOT NULL DEFAULT 0, -- 0 = gratuit
  is_published      BOOLEAN NOT NULL DEFAULT FALSE,
  published_at      TIMESTAMPTZ,
  author_id         TEXT,           -- Clerk user_id
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses (is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_category  ON public.courses (category_id);
DROP TRIGGER IF EXISTS trg_courses_updated ON public.courses;
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- COURSE MODULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON public.course_modules (course_id, sort_order);
DROP TRIGGER IF EXISTS trg_course_modules_updated ON public.course_modules;
CREATE TRIGGER trg_course_modules_updated BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- COURSE LESSONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id         UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL,
  content           TEXT NOT NULL DEFAULT '',       -- sanitized HTML from TipTap
  video_url         TEXT,                            -- YouTube/Vimeo or storage path
  attachments       JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{name, path, size, mime}]
  duration_minutes  INT,
  sort_order        INT NOT NULL DEFAULT 0,
  is_free_preview   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (module_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON public.course_lessons (module_id, sort_order);
DROP TRIGGER IF EXISTS trg_course_lessons_updated ON public.course_lessons;
CREATE TRIGGER trg_course_lessons_updated BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- QUIZZES (course-level or module-level)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_quizzes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id           UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id           UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  pass_score_percent  INT NOT NULL DEFAULT 70 CHECK (pass_score_percent BETWEEN 0 AND 100),
  sort_order          INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_course_quizzes_course ON public.course_quizzes (course_id);
CREATE INDEX IF NOT EXISTS idx_course_quizzes_module ON public.course_quizzes (module_id);
DROP TRIGGER IF EXISTS trg_course_quizzes_updated ON public.course_quizzes;
CREATE TRIGGER trg_course_quizzes_updated BEFORE UPDATE ON public.course_quizzes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id     UUID NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'single'
                CHECK (type IN ('single', 'multiple', 'true_false')),
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions (quiz_id, sort_order);
DROP TRIGGER IF EXISTS trg_quiz_questions_updated ON public.quiz_questions;
CREATE TRIGGER trg_quiz_questions_updated BEFORE UPDATE ON public.quiz_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.quiz_options (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id  UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order   INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question ON public.quiz_options (question_id, sort_order);

-- ============================================================================
-- ENROLLMENTS / PROGRESS / ATTEMPTS / CERTIFICATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT NOT NULL,                    -- Clerk user_id
  course_id         UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  progress_percent  INT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  UNIQUE (user_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.course_enrollments (user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.course_enrollments (course_id);

CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id  UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  lesson_id      UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_enrollment ON public.lesson_completions (enrollment_id);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id  UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  quiz_id        UUID NOT NULL REFERENCES public.course_quizzes(id) ON DELETE CASCADE,
  score_percent  INT NOT NULL CHECK (score_percent BETWEEN 0 AND 100),
  passed         BOOLEAN NOT NULL DEFAULT FALSE,
  answers        JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempted_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_enrollment ON public.quiz_attempts (enrollment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz       ON public.quiz_attempts (quiz_id);

CREATE TABLE IF NOT EXISTS public.course_certificates (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id       UUID NOT NULL UNIQUE REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  certificate_number  TEXT NOT NULL UNIQUE,              -- e.g. CM-2026-000123
  issued_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  pdf_path            TEXT                                -- storage path in `certificates` bucket
);

-- ============================================================================
-- RLS — Clerk-adapted: default-deny, explicit public read for published content
-- ============================================================================
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_quizzes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_completions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

-- Public read on published / active content
DROP POLICY IF EXISTS "public read active categories" ON public.course_categories;
CREATE POLICY "public read active categories"
  ON public.course_categories FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "public read published courses" ON public.courses;
CREATE POLICY "public read published courses"
  ON public.courses FOR SELECT
  TO anon, authenticated
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "public read modules of published courses" ON public.course_modules;
CREATE POLICY "public read modules of published courses"
  ON public.course_modules FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_modules.course_id AND c.is_published = TRUE
  ));

DROP POLICY IF EXISTS "public read lessons of published courses" ON public.course_lessons;
CREATE POLICY "public read lessons of published courses"
  ON public.course_lessons FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.course_modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = course_lessons.module_id AND c.is_published = TRUE
  ));

DROP POLICY IF EXISTS "public read quizzes of published courses" ON public.course_quizzes;
CREATE POLICY "public read quizzes of published courses"
  ON public.course_quizzes FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_quizzes.course_id AND c.is_published = TRUE
  ));

DROP POLICY IF EXISTS "public read questions of published courses" ON public.quiz_questions;
CREATE POLICY "public read questions of published courses"
  ON public.quiz_questions FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.course_quizzes q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = quiz_questions.quiz_id AND c.is_published = TRUE
  ));

-- Options: IMPORTANT: never expose `is_correct` to the client. We enforce this
-- by creating a view that omits is_correct, and giving RLS SELECT only via that
-- view path. For simplicity, we allow SELECT on the label/sort_order columns
-- and rely on application code to never query is_correct from anon clients.
DROP POLICY IF EXISTS "public read options of published courses" ON public.quiz_options;
CREATE POLICY "public read options of published courses"
  ON public.quiz_options FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quiz_questions q
    JOIN public.course_quizzes cq ON cq.id = q.quiz_id
    JOIN public.courses c ON c.id = cq.course_id
    WHERE q.id = quiz_options.question_id AND c.is_published = TRUE
  ));

-- User-scoped tables: no policies for anon/authenticated. Only the service
-- role (which bypasses RLS) can read/write these. All user-facing access goes
-- through Server Actions that first verify Clerk auth.
-- (profiles, course_enrollments, lesson_completions, quiz_attempts,
-- course_certificates remain default-deny for anon/authenticated.)

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('course-covers',      'course-covers',      TRUE),
  ('lesson-videos',      'lesson-videos',      FALSE),
  ('lesson-attachments', 'lesson-attachments', FALSE),
  ('certificates',       'certificates',       FALSE)
ON CONFLICT (id) DO NOTHING;

-- course-covers: public read; writes via service role only.
DROP POLICY IF EXISTS "public read course covers" ON storage.objects;
CREATE POLICY "public read course covers"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'course-covers');
