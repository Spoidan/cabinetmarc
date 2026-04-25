-- ============================================================================
-- Cabinet MARC — Drop legacy learning platform tables
-- ----------------------------------------------------------------------------
-- Removes the bilingual (title_fr/title_en) learning tables that shipped with
-- commit 21d61bd ("feat: W3Schools-style learning platform..."). The rebuild
-- in 20260424020000_learning_schema.sql replaces them with the single-language
-- brief-spec schema.
--
-- SAFE: only drops learning-specific tables. Marketing content
-- (site_settings, hero_content, team_members, testimonials, blog_posts,
-- nav_items, page_content, contact_submissions, newsletter_subscribers, stats)
-- is preserved.
-- ============================================================================

DROP TABLE IF EXISTS public.certificates       CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts      CASCADE;
DROP TABLE IF EXISTS public.lesson_progress    CASCADE;
DROP TABLE IF EXISTS public.enrollments        CASCADE;
DROP TABLE IF EXISTS public.payments           CASCADE;
DROP TABLE IF EXISTS public.quiz_questions     CASCADE;
DROP TABLE IF EXISTS public.quizzes            CASCADE;
DROP TABLE IF EXISTS public.course_lessons     CASCADE;
DROP TABLE IF EXISTS public.course_chapters    CASCADE;
DROP TABLE IF EXISTS public.courses            CASCADE;
DROP TABLE IF EXISTS public.course_categories  CASCADE;
