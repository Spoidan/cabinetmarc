-- ============================================================================
-- Cabinet MARC — Learning platform seed data (no DO block, subquery-driven)
-- ----------------------------------------------------------------------------
-- 4 categories + 1 fully-built Comptabilité course (3 modules, 7 lessons,
-- 1 module quiz + 1 final exam, 5 questions each).
-- ============================================================================

-- ---- Categories ------------------------------------------------------------
INSERT INTO public.course_categories (name, slug, description, icon, is_active, sort_order) VALUES
  ('Comptabilité',       'comptabilite',        'Principes comptables, tenue des comptes, états financiers et normes OHADA.',                'calculator',     TRUE, 1),
  ('Fiscalité',          'fiscalite',           'Fiscalité des entreprises, TVA, impôts directs et obligations déclaratives au Burundi.',   'landmark',       TRUE, 2),
  ('Gestion de projet',  'gestion-de-projet',   'Méthodes, outils et bonnes pratiques pour piloter des projets de bout en bout.',           'clipboard-list', TRUE, 3),
  ('Droit des affaires', 'droit-des-affaires',  'Contrats, sociétés commerciales, droit du travail et résolution des litiges.',              'scale',          TRUE, 4)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  icon        = EXCLUDED.icon,
  is_active   = EXCLUDED.is_active,
  sort_order  = EXCLUDED.sort_order;

-- ---- Course ---------------------------------------------------------------
INSERT INTO public.courses (
  category_id, title, slug, subtitle, description, cover_image,
  level, duration_minutes, price_bif, is_published, published_at
)
SELECT
  c.id,
  'Les fondamentaux de la comptabilité OHADA',
  'fondamentaux-comptabilite-ohada',
  'Maîtrisez les bases de la comptabilité selon le Système comptable OHADA.',
  '<p>Ce cours vous guide à travers les principes fondamentaux de la comptabilité dans le contexte OHADA : enregistrement des écritures, plan comptable, journaux auxiliaires, balance et états financiers. Il est conçu pour les débutants en comptabilité comme pour les professionnels souhaitant consolider leurs bases.</p>',
  NULL,
  'debutant',
  240,
  0,
  TRUE,
  now()
FROM public.course_categories c WHERE c.slug = 'comptabilite'
ON CONFLICT (slug) DO UPDATE SET
  subtitle         = EXCLUDED.subtitle,
  description      = EXCLUDED.description,
  level            = EXCLUDED.level,
  duration_minutes = EXCLUDED.duration_minutes,
  price_bif        = EXCLUDED.price_bif,
  is_published     = EXCLUDED.is_published,
  published_at     = COALESCE(public.courses.published_at, EXCLUDED.published_at);

-- Reseed children cleanly: delete by course slug
DELETE FROM public.course_modules
  WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'fondamentaux-comptabilite-ohada');
DELETE FROM public.course_quizzes
  WHERE course_id = (SELECT id FROM public.courses WHERE slug = 'fondamentaux-comptabilite-ohada');

-- ---- Modules --------------------------------------------------------------
INSERT INTO public.course_modules (course_id, title, sort_order)
SELECT id, 'Introduction à la comptabilité OHADA', 1 FROM public.courses WHERE slug = 'fondamentaux-comptabilite-ohada';
INSERT INTO public.course_modules (course_id, title, sort_order)
SELECT id, 'Le plan comptable et les journaux',   2 FROM public.courses WHERE slug = 'fondamentaux-comptabilite-ohada';
INSERT INTO public.course_modules (course_id, title, sort_order)
SELECT id, 'La balance et les états financiers',  3 FROM public.courses WHERE slug = 'fondamentaux-comptabilite-ohada';

-- Helper view-style: looks up module id by (course slug, module sort_order)
-- Inlined as subquery in each INSERT below.

-- ---- Module 1 lessons -----------------------------------------------------
INSERT INTO public.course_lessons (module_id, title, slug, content, duration_minutes, sort_order, is_free_preview)
SELECT m.id,
  'Qu''est-ce que la comptabilité OHADA ?', 'introduction',
  '<h2>La comptabilité OHADA, en bref</h2><p>Le Système comptable OHADA (SYSCOHADA) est le référentiel comptable harmonisé applicable dans les 17 États membres de l''OHADA. Il poursuit trois objectifs principaux :</p><ul><li>Assurer la <strong>transparence</strong> financière des entreprises</li><li>Garantir la <strong>comparabilité</strong> des états financiers entre pays membres</li><li>Faciliter la <strong>prise de décision</strong> des dirigeants et investisseurs</li></ul><p>Dans ce cours, vous apprendrez à manier ses principes fondamentaux, du journal à la balance jusqu''au bilan et au compte de résultat.</p>',
  15, 1, TRUE
FROM public.course_modules m
JOIN public.courses c ON c.id = m.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND m.sort_order = 1;

INSERT INTO public.course_lessons (module_id, title, slug, content, duration_minutes, sort_order, is_free_preview)
SELECT m.id,
  'Les principes comptables fondamentaux', 'principes-fondamentaux',
  '<h2>Les sept principes fondamentaux</h2><ol><li><strong>Prudence</strong> : ne pas reporter de risques sur l''avenir</li><li><strong>Permanence des méthodes</strong> : comparabilité d''un exercice à l''autre</li><li><strong>Intangibilité du bilan d''ouverture</strong></li><li><strong>Coût historique</strong></li><li><strong>Continuité de l''exploitation</strong></li><li><strong>Spécialisation des exercices</strong></li><li><strong>Transparence</strong></li></ol><p>Chacun guide une famille de décisions comptables. Un bon comptable les invoque avant de trancher un cas difficile.</p>',
  20, 2, FALSE
FROM public.course_modules m
JOIN public.courses c ON c.id = m.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND m.sort_order = 1;

-- ---- Module 2 lessons -----------------------------------------------------
INSERT INTO public.course_lessons (module_id, title, slug, content, duration_minutes, sort_order, is_free_preview)
SELECT m.id,
  'Le plan comptable SYSCOHADA', 'plan-comptable',
  '<h2>Structure du plan comptable</h2><p>Le plan comptable SYSCOHADA classe les comptes en 9 classes :</p><ul><li>Classes 1 à 5 : comptes de bilan</li><li>Classes 6 et 7 : comptes de charges et produits</li><li>Classe 8 : autres charges et produits HAO</li><li>Classe 9 : comptabilité analytique</li></ul><p>Chaque compte est identifié par un code numérique structuré qui reflète son niveau de détail.</p>',
  25, 1, FALSE
FROM public.course_modules m
JOIN public.courses c ON c.id = m.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND m.sort_order = 2;

INSERT INTO public.course_lessons (module_id, title, slug, content, duration_minutes, sort_order, is_free_preview)
SELECT m.id,
  'Les journaux auxiliaires', 'journaux-auxiliaires',
  '<h2>Organisation des journaux</h2><p>Les journaux auxiliaires organisent les écritures par nature d''opération : achats, ventes, banque, caisse, opérations diverses. Cette organisation permet de répartir le travail comptable et de faciliter la révision.</p>',
  20, 2, FALSE
FROM public.course_modules m
JOIN public.courses c ON c.id = m.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND m.sort_order = 2;

INSERT INTO public.course_lessons (module_id, title, slug, content, duration_minutes, sort_order, is_free_preview)
SELECT m.id,
  'Passer une écriture comptable', 'ecriture-comptable',
  '<h2>La partie double</h2><p>Toute écriture comptable respecte la règle de la partie double : le total des débits est égal au total des crédits. Nous passerons ensemble une dizaine d''écritures courantes (achat de marchandises, règlement client, paiement de salaires) pour ancrer le réflexe.</p>',
  30, 3, FALSE
FROM public.course_modules m
JOIN public.courses c ON c.id = m.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND m.sort_order = 2;

-- ---- Module 3 lessons -----------------------------------------------------
INSERT INTO public.course_lessons (module_id, title, slug, content, duration_minutes, sort_order, is_free_preview)
SELECT m.id,
  'Établir la balance', 'balance',
  '<h2>De la balance au bilan</h2><p>La balance est le tableau récapitulatif qui liste, pour chaque compte, les mouvements de l''exercice (débits, crédits) et le solde. Elle est la pierre angulaire de la préparation des états financiers.</p>',
  20, 1, FALSE
FROM public.course_modules m
JOIN public.courses c ON c.id = m.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND m.sort_order = 3;

INSERT INTO public.course_lessons (module_id, title, slug, content, duration_minutes, sort_order, is_free_preview)
SELECT m.id,
  'Lire un bilan et un compte de résultat', 'lire-etats-financiers',
  '<h2>Lecture des états financiers</h2><p>Nous décortiquons un bilan et un compte de résultat réels pour comprendre ce qu''ils révèlent sur la santé financière d''une entreprise. Analyse verticale, horizontale et ratios de base.</p>',
  30, 2, FALSE
FROM public.course_modules m
JOIN public.courses c ON c.id = m.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND m.sort_order = 3;

-- ---- Quizzes --------------------------------------------------------------
-- Module 2 quiz (sort_order 1 = module quiz)
INSERT INTO public.course_quizzes (course_id, module_id, title, pass_score_percent, sort_order)
SELECT c.id, m.id, 'Quiz — Le plan comptable et les journaux', 70, 1
FROM public.courses c
JOIN public.course_modules m ON m.course_id = c.id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND m.sort_order = 2;

-- Final exam (sort_order 99, no module_id)
INSERT INTO public.course_quizzes (course_id, module_id, title, pass_score_percent, sort_order)
SELECT id, NULL, 'Examen final — Fondamentaux OHADA', 75, 99
FROM public.courses WHERE slug = 'fondamentaux-comptabilite-ohada';

-- ---- Module-quiz questions + options --------------------------------------
-- Q1
INSERT INTO public.quiz_questions (quiz_id, question, type, sort_order)
SELECT q.id, 'Combien de classes comptables existe-t-il dans le plan SYSCOHADA ?', 'single', 1
FROM public.course_quizzes q JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 1;
INSERT INTO public.quiz_options (question_id, label, is_correct, sort_order)
SELECT qq.id, label, is_correct, sort_order FROM (VALUES
  ('7 classes',  FALSE, 1),
  ('9 classes',  TRUE,  2),
  ('10 classes', FALSE, 3),
  ('12 classes', FALSE, 4)
) AS o(label, is_correct, sort_order)
CROSS JOIN (
  SELECT qq.id FROM public.quiz_questions qq
  JOIN public.course_quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 1 AND qq.sort_order = 1
) qq;

-- Q2
INSERT INTO public.quiz_questions (quiz_id, question, type, sort_order)
SELECT q.id, 'La règle de la partie double impose que, dans toute écriture, le total des débits soit égal au total des crédits.', 'true_false', 2
FROM public.course_quizzes q JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 1;
INSERT INTO public.quiz_options (question_id, label, is_correct, sort_order)
SELECT qq.id, label, is_correct, sort_order FROM (VALUES
  ('Vrai', TRUE, 1),
  ('Faux', FALSE, 2)
) AS o(label, is_correct, sort_order)
CROSS JOIN (
  SELECT qq.id FROM public.quiz_questions qq
  JOIN public.course_quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 1 AND qq.sort_order = 2
) qq;

-- Q3
INSERT INTO public.quiz_questions (quiz_id, question, type, sort_order)
SELECT q.id, 'Parmi ces journaux, lesquels sont des journaux auxiliaires usuels ? (plusieurs réponses)', 'multiple', 3
FROM public.course_quizzes q JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 1;
INSERT INTO public.quiz_options (question_id, label, is_correct, sort_order)
SELECT qq.id, label, is_correct, sort_order FROM (VALUES
  ('Journal des achats', TRUE,  1),
  ('Journal des ventes', TRUE,  2),
  ('Journal du patron',  FALSE, 3),
  ('Journal de banque',  TRUE,  4)
) AS o(label, is_correct, sort_order)
CROSS JOIN (
  SELECT qq.id FROM public.quiz_questions qq
  JOIN public.course_quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 1 AND qq.sort_order = 3
) qq;

-- Q4
INSERT INTO public.quiz_questions (quiz_id, question, type, sort_order)
SELECT q.id, 'Les classes 6 et 7 du plan comptable regroupent…', 'single', 4
FROM public.course_quizzes q JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 1;
INSERT INTO public.quiz_options (question_id, label, is_correct, sort_order)
SELECT qq.id, label, is_correct, sort_order FROM (VALUES
  ('Les actifs et passifs',     FALSE, 1),
  ('Les capitaux propres',      FALSE, 2),
  ('Les charges et produits',   TRUE,  3),
  ('Les comptes de trésorerie', FALSE, 4)
) AS o(label, is_correct, sort_order)
CROSS JOIN (
  SELECT qq.id FROM public.quiz_questions qq
  JOIN public.course_quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 1 AND qq.sort_order = 4
) qq;

-- Q5
INSERT INTO public.quiz_questions (quiz_id, question, type, sort_order)
SELECT q.id, 'Le principe de prudence consiste à anticiper les pertes probables et à ne pas anticiper les gains.', 'true_false', 5
FROM public.course_quizzes q JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 1;
INSERT INTO public.quiz_options (question_id, label, is_correct, sort_order)
SELECT qq.id, label, is_correct, sort_order FROM (VALUES
  ('Vrai', TRUE, 1),
  ('Faux', FALSE, 2)
) AS o(label, is_correct, sort_order)
CROSS JOIN (
  SELECT qq.id FROM public.quiz_questions qq
  JOIN public.course_quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 1 AND qq.sort_order = 5
) qq;

-- ---- Final-exam questions + options ---------------------------------------
-- F1
INSERT INTO public.quiz_questions (quiz_id, question, type, sort_order)
SELECT q.id, 'Le système comptable OHADA est applicable dans combien d''États membres ?', 'single', 1
FROM public.course_quizzes q JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 99;
INSERT INTO public.quiz_options (question_id, label, is_correct, sort_order)
SELECT qq.id, label, is_correct, sort_order FROM (VALUES
  ('10', FALSE, 1),
  ('14', FALSE, 2),
  ('17', TRUE,  3),
  ('22', FALSE, 4)
) AS o(label, is_correct, sort_order)
CROSS JOIN (
  SELECT qq.id FROM public.quiz_questions qq
  JOIN public.course_quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 99 AND qq.sort_order = 1
) qq;

-- F2
INSERT INTO public.quiz_questions (quiz_id, question, type, sort_order)
SELECT q.id, 'La balance présente, pour chaque compte, les mouvements de la période et le solde.', 'true_false', 2
FROM public.course_quizzes q JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 99;
INSERT INTO public.quiz_options (question_id, label, is_correct, sort_order)
SELECT qq.id, label, is_correct, sort_order FROM (VALUES
  ('Vrai', TRUE, 1),
  ('Faux', FALSE, 2)
) AS o(label, is_correct, sort_order)
CROSS JOIN (
  SELECT qq.id FROM public.quiz_questions qq
  JOIN public.course_quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 99 AND qq.sort_order = 2
) qq;

-- F3
INSERT INTO public.quiz_questions (quiz_id, question, type, sort_order)
SELECT q.id, 'Quels documents font partie des états financiers annuels ? (plusieurs réponses)', 'multiple', 3
FROM public.course_quizzes q JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 99;
INSERT INTO public.quiz_options (question_id, label, is_correct, sort_order)
SELECT qq.id, label, is_correct, sort_order FROM (VALUES
  ('Le bilan',              TRUE,  1),
  ('Le compte de résultat', TRUE,  2),
  ('Le journal général',    FALSE, 3),
  ('L''état annexé',        TRUE,  4)
) AS o(label, is_correct, sort_order)
CROSS JOIN (
  SELECT qq.id FROM public.quiz_questions qq
  JOIN public.course_quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 99 AND qq.sort_order = 3
) qq;

-- F4
INSERT INTO public.quiz_questions (quiz_id, question, type, sort_order)
SELECT q.id, 'Le principe du coût historique impose d''enregistrer les biens à leur valeur de marché à la date de clôture.', 'true_false', 4
FROM public.course_quizzes q JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 99;
INSERT INTO public.quiz_options (question_id, label, is_correct, sort_order)
SELECT qq.id, label, is_correct, sort_order FROM (VALUES
  ('Vrai', FALSE, 1),
  ('Faux', TRUE, 2)
) AS o(label, is_correct, sort_order)
CROSS JOIN (
  SELECT qq.id FROM public.quiz_questions qq
  JOIN public.course_quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 99 AND qq.sort_order = 4
) qq;

-- F5
INSERT INTO public.quiz_questions (quiz_id, question, type, sort_order)
SELECT q.id, 'Lequel de ces comptes est un compte de bilan (actif) ?', 'single', 5
FROM public.course_quizzes q JOIN public.courses c ON c.id = q.course_id
WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 99;
INSERT INTO public.quiz_options (question_id, label, is_correct, sort_order)
SELECT qq.id, label, is_correct, sort_order FROM (VALUES
  ('Ventes de marchandises',      FALSE, 1),
  ('Clients',                     TRUE,  2),
  ('Achat de matières premières', FALSE, 3),
  ('Rémunérations du personnel',  FALSE, 4)
) AS o(label, is_correct, sort_order)
CROSS JOIN (
  SELECT qq.id FROM public.quiz_questions qq
  JOIN public.course_quizzes q ON q.id = qq.quiz_id
  JOIN public.courses c ON c.id = q.course_id
  WHERE c.slug = 'fondamentaux-comptabilite-ohada' AND q.sort_order = 99 AND qq.sort_order = 5
) qq;
