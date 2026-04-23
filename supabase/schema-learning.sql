-- Cabinet MARC — Learning Platform Schema
-- Run this AFTER schema.sql

-- ===========================
-- COURSE CHAPTERS
-- ===========================
CREATE TABLE IF NOT EXISTS course_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title_fr TEXT NOT NULL,
  title_en TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- COURSE LESSONS
-- ===========================
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES course_chapters(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_fr TEXT NOT NULL DEFAULT '',
  content_en TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  duration_minutes INT NOT NULL DEFAULT 10,
  order_index INT NOT NULL DEFAULT 0,
  is_free_preview BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, slug)
);

-- ===========================
-- QUIZZES
-- ===========================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES course_chapters(id) ON DELETE CASCADE,
  title_fr TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_fr TEXT NOT NULL DEFAULT '',
  pass_score INT NOT NULL DEFAULT 70,
  is_final_exam BOOLEAN NOT NULL DEFAULT false,
  order_index INT NOT NULL DEFAULT 0
);

-- ===========================
-- QUIZ QUESTIONS
-- ===========================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_fr TEXT NOT NULL,
  question_en TEXT NOT NULL,
  options_fr TEXT[] NOT NULL DEFAULT '{}',
  options_en TEXT[] NOT NULL DEFAULT '{}',
  correct_index INT NOT NULL DEFAULT 0,
  explanation_fr TEXT NOT NULL DEFAULT '',
  explanation_en TEXT NOT NULL DEFAULT '',
  order_index INT NOT NULL DEFAULT 0
);

-- ===========================
-- ENROLLMENTS
-- ===========================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'refunded')),
  payment_id TEXT,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- ===========================
-- LESSON PROGRESS
-- ===========================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- ===========================
-- QUIZ ATTEMPTS
-- ===========================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- CERTIFICATES
-- ===========================
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- ===========================
-- DEMO PAYMENTS
-- ===========================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BIF',
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT NOT NULL DEFAULT 'demo',
  demo_card_last4 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================
-- RLS POLICIES
-- ===========================
ALTER TABLE course_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Public read for published course content
CREATE POLICY "Public read chapters" ON course_chapters FOR SELECT USING (is_published = true);
CREATE POLICY "Public read lessons" ON course_lessons FOR SELECT USING (is_published = true);
CREATE POLICY "Public read quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Public read quiz_questions" ON quiz_questions FOR SELECT USING (true);

-- Users own their data
CREATE POLICY "Users read own enrollments" ON enrollments FOR SELECT USING (true);
CREATE POLICY "Users read own progress" ON lesson_progress FOR SELECT USING (true);
CREATE POLICY "Users read own attempts" ON quiz_attempts FOR SELECT USING (true);
CREATE POLICY "Users read own certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Users read own payments" ON payments FOR SELECT USING (true);

-- ===========================
-- SAMPLE COURSE DATA
-- (requires course_categories to exist from schema.sql)
-- ===========================

-- Insert a sample course in Economics category
INSERT INTO courses (category_id, slug, title_fr, title_en, description_fr, description_en,
  long_description_fr, instructor, duration, level, price, is_free, is_featured, is_active, order_index)
SELECT
  cc.id,
  'macroeconomie-fondamentaux',
  'Macroéconomie : Les Fondamentaux',
  'Macroeconomics: The Fundamentals',
  'Maîtrisez les concepts clés de la macroéconomie : PIB, inflation, politique monétaire et croissance économique.',
  'Master the key concepts of macroeconomics: GDP, inflation, monetary policy, and economic growth.',
  'Ce cours complet vous guide à travers les fondamentaux de la macroéconomie. Vous apprendrez à analyser les grands agrégats économiques, comprendre les politiques budgétaires et monétaires, et interpréter les indicateurs économiques majeurs. Idéal pour les étudiants, économistes et professionnels souhaitant renforcer leurs bases.',
  'Dr. Laurent Ndihokubwayo',
  '12 heures',
  'beginner',
  150000,
  false,
  true,
  true,
  1
FROM course_categories cc WHERE cc.slug = 'economie'
ON CONFLICT (slug) DO NOTHING;

-- Insert a free sample course in Management
INSERT INTO courses (category_id, slug, title_fr, title_en, description_fr, description_en,
  long_description_fr, instructor, duration, level, price, is_free, is_featured, is_active, order_index)
SELECT
  cc.id,
  'introduction-gestion-projet',
  'Introduction à la Gestion de Projet',
  'Introduction to Project Management',
  'Découvrez les bases de la gestion de projet : planification, exécution, suivi et clôture.',
  'Discover the basics of project management: planning, execution, monitoring, and closure.',
  'Apprenez les fondamentaux de la gestion de projet avec cette introduction gratuite. Vous couvrirez le cycle de vie d''un projet, les outils de planification (Gantt, WBS), la gestion des risques et la communication avec les parties prenantes.',
  'Prof. Cécile Irakoze',
  '6 heures',
  'beginner',
  0,
  true,
  true,
  true,
  1
FROM course_categories cc WHERE cc.slug = 'gestion'
ON CONFLICT (slug) DO NOTHING;

-- Chapters for Macroéconomie course
INSERT INTO course_chapters (course_id, title_fr, title_en, order_index)
SELECT c.id, 'Introduction à la Macroéconomie', 'Introduction to Macroeconomics', 1
FROM courses c WHERE c.slug = 'macroeconomie-fondamentaux' ON CONFLICT DO NOTHING;

INSERT INTO course_chapters (course_id, title_fr, title_en, order_index)
SELECT c.id, 'Le Produit Intérieur Brut (PIB)', 'Gross Domestic Product (GDP)', 2
FROM courses c WHERE c.slug = 'macroeconomie-fondamentaux' ON CONFLICT DO NOTHING;

INSERT INTO course_chapters (course_id, title_fr, title_en, order_index)
SELECT c.id, 'Inflation et Politique Monétaire', 'Inflation and Monetary Policy', 3
FROM courses c WHERE c.slug = 'macroeconomie-fondamentaux' ON CONFLICT DO NOTHING;

INSERT INTO course_chapters (course_id, title_fr, title_en, order_index)
SELECT c.id, 'Croissance et Développement', 'Growth and Development', 4
FROM courses c WHERE c.slug = 'macroeconomie-fondamentaux' ON CONFLICT DO NOTHING;

-- Lessons for Chapter 1
INSERT INTO course_lessons (chapter_id, course_id, slug, title_fr, title_en, content_fr, content_en, duration_minutes, order_index, is_free_preview)
SELECT
  ch.id, c.id,
  'quest-ce-que-la-macroeconomie',
  'Qu''est-ce que la Macroéconomie ?',
  'What is Macroeconomics?',
  E'# Qu''est-ce que la Macroéconomie ?\n\nLa macroéconomie est la branche de l''économie qui étudie le comportement de l''économie dans son ensemble plutôt que les marchés individuels.\n\n## Les Grandes Questions\n\nLa macroéconomie cherche à répondre à des questions fondamentales :\n\n- **Pourquoi certains pays sont-ils riches et d''autres pauvres ?**\n- **Qu''est-ce qui cause les récessions et les crises économiques ?**\n- **Comment les gouvernements peuvent-ils stimuler la croissance ?**\n- **Quel est le rôle des banques centrales ?**\n\n## Les Grands Agrégats\n\nLa macroéconomie analyse des variables agrégées comme :\n\n| Indicateur | Description |\n|------------|-------------|\n| PIB | Valeur totale des biens et services produits |\n| Taux d''inflation | Variation du niveau général des prix |\n| Taux de chômage | Part de la population active sans emploi |\n| Taux d''intérêt | Coût du crédit dans l''économie |\n\n## Différence avec la Microéconomie\n\nAlors que la **microéconomie** étudie les décisions des agents individuels (ménages, entreprises), la **macroéconomie** analyse l''économie globale et les interactions entre secteurs.\n\n> 💡 **À retenir** : La macroéconomie est essentielle pour comprendre les politiques économiques des gouvernements et les décisions des banques centrales.',
  E'# What is Macroeconomics?\n\nMacroeconomics is the branch of economics that studies the behavior of the economy as a whole rather than individual markets.\n\n## The Big Questions\n\nMacroeconomics seeks to answer fundamental questions:\n\n- **Why are some countries rich and others poor?**\n- **What causes recessions and economic crises?**\n- **How can governments stimulate growth?**\n- **What is the role of central banks?**\n\n## Key Aggregates\n\nMacroeconomics analyzes aggregate variables such as GDP, inflation rate, unemployment rate, and interest rates.',
  15, 1, true
FROM course_chapters ch
JOIN courses c ON c.id = ch.course_id
WHERE c.slug = 'macroeconomie-fondamentaux' AND ch.order_index = 1
ON CONFLICT (course_id, slug) DO NOTHING;

INSERT INTO course_lessons (chapter_id, course_id, slug, title_fr, title_en, content_fr, content_en, duration_minutes, order_index, is_free_preview)
SELECT
  ch.id, c.id,
  'les-acteurs-economiques',
  'Les Acteurs Économiques',
  'Economic Agents',
  E'# Les Acteurs Économiques\n\nDans une économie moderne, plusieurs types d''acteurs interagissent constamment.\n\n## Les Ménages\n\nLes ménages sont les consommateurs de l''économie. Ils :\n- Fournissent le travail aux entreprises\n- Consomment les biens et services produits\n- Épargnent une partie de leurs revenus\n\n## Les Entreprises\n\nLes entreprises produisent les biens et services. Elles :\n- Emploient les facteurs de production (travail, capital)\n- Investissent pour augmenter leur capacité productive\n- Paient des impôts et des salaires\n\n## L''État\n\nL''État joue un rôle régulateur et redistributeur :\n- Collecte les impôts et taxes\n- Fournit des biens publics (routes, éducation, santé)\n- Redistribue les revenus via les transferts sociaux\n\n## Le Reste du Monde\n\nL''économie internationale influence l''économie nationale via :\n- Les exportations et importations\n- Les flux de capitaux\n- Les taux de change',
  'Economic agents in a modern economy: households, firms, government, and the rest of the world.',
  20, 2, false
FROM course_chapters ch
JOIN courses c ON c.id = ch.course_id
WHERE c.slug = 'macroeconomie-fondamentaux' AND ch.order_index = 1
ON CONFLICT (course_id, slug) DO NOTHING;

INSERT INTO course_lessons (chapter_id, course_id, slug, title_fr, title_en, content_fr, content_en, duration_minutes, order_index, is_free_preview)
SELECT
  ch.id, c.id,
  'le-circuit-economique',
  'Le Circuit Économique',
  'The Economic Circuit',
  E'# Le Circuit Économique\n\nLe circuit économique représente les flux de biens, services et monnaie entre les différents acteurs.\n\n## Les Flux Réels et Monétaires\n\n**Flux réels** : biens, services, travail\n**Flux monétaires** : paiements, salaires, loyers, profits\n\n## La Loi des Débouchés de Say\n\n> "L''offre crée sa propre demande"\n\nJean-Baptiste Say affirmait que toute production génère un revenu suffisant pour acheter cette production. Cette théorie a été remise en question par Keynes.\n\n## Le Rôle de la Monnaie\n\nLa monnaie joue trois fonctions essentielles :\n1. **Intermédiaire des échanges** : facilite les transactions\n2. **Unité de compte** : permet de comparer les prix\n3. **Réserve de valeur** : permet de différer les dépenses\n\n## Quiz de Révision\n\nÀ la fin de ce chapitre, vous devrez répondre à un quiz pour tester vos connaissances sur les acteurs et le circuit économique.',
  'The economic circuit: real and monetary flows between economic agents.',
  25, 3, false
FROM course_chapters ch
JOIN courses c ON c.id = ch.course_id
WHERE c.slug = 'macroeconomie-fondamentaux' AND ch.order_index = 1
ON CONFLICT (course_id, slug) DO NOTHING;

-- Lessons for Chapter 2 (PIB)
INSERT INTO course_lessons (chapter_id, course_id, slug, title_fr, title_en, content_fr, content_en, duration_minutes, order_index, is_free_preview)
SELECT
  ch.id, c.id,
  'definition-pib',
  'Définition et Mesure du PIB',
  'GDP Definition and Measurement',
  E'# Définition et Mesure du PIB\n\nLe Produit Intérieur Brut (PIB) est la mesure la plus utilisée de la taille d''une économie.\n\n## Définition\n\n> Le PIB est la **valeur totale des biens et services finals** produits sur le territoire d''un pays **au cours d''une période donnée** (généralement un an).\n\n## Les Trois Méthodes de Calcul\n\n### 1. Méthode de la Production\nPIB = Σ Valeurs Ajoutées de toutes les entreprises\n\n### 2. Méthode des Dépenses\nPIB = C + I + G + (X - M)\n\nOù :\n- **C** = Consommation des ménages\n- **I** = Investissements des entreprises\n- **G** = Dépenses publiques\n- **X** = Exportations\n- **M** = Importations\n\n### 3. Méthode des Revenus\nPIB = Salaires + Profits + Impôts - Subventions\n\n## PIB Nominal vs PIB Réel\n\n| Type | Description |\n|------|-------------|\n| PIB Nominal | Calculé aux prix courants |\n| PIB Réel | Calculé à prix constants (corrigé de l''inflation) |\n| PIB par habitant | PIB / Population |\n\n> 📊 **Exemple** : Si le PIB nominal double mais que les prix ont aussi doublé, le PIB réel n''a pas changé et le niveau de vie est identique.',
  'GDP definition, measurement methods, and the difference between nominal and real GDP.',
  30, 1, false
FROM course_chapters ch
JOIN courses c ON c.id = ch.course_id
WHERE c.slug = 'macroeconomie-fondamentaux' AND ch.order_index = 2
ON CONFLICT (course_id, slug) DO NOTHING;

-- Quiz for Chapter 1
INSERT INTO quizzes (course_id, chapter_id, title_fr, title_en, description_fr, pass_score, is_final_exam)
SELECT
  c.id, ch.id,
  'Quiz Chapitre 1 : Introduction',
  'Chapter 1 Quiz: Introduction',
  'Testez vos connaissances sur les bases de la macroéconomie',
  70, false
FROM course_chapters ch
JOIN courses c ON c.id = ch.course_id
WHERE c.slug = 'macroeconomie-fondamentaux' AND ch.order_index = 1
ON CONFLICT DO NOTHING;

-- Quiz questions for Chapter 1
INSERT INTO quiz_questions (quiz_id, question_fr, question_en, options_fr, options_en, correct_index, explanation_fr, order_index)
SELECT
  q.id,
  'Qu''étudie principalement la macroéconomie ?',
  'What does macroeconomics primarily study?',
  ARRAY['Le comportement des consommateurs individuels', 'L''économie dans son ensemble', 'Les prix des marchés boursiers', 'Les décisions d''une seule entreprise'],
  ARRAY['The behavior of individual consumers', 'The economy as a whole', 'Stock market prices', 'Decisions of a single firm'],
  1,
  'La macroéconomie étudie l''économie dans son ensemble, contrairement à la microéconomie qui analyse les agents individuels.',
  1
FROM quizzes q
JOIN courses c ON c.id = q.course_id
WHERE c.slug = 'macroeconomie-fondamentaux' AND q.is_final_exam = false
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (quiz_id, question_fr, question_en, options_fr, options_en, correct_index, explanation_fr, order_index)
SELECT
  q.id,
  'Lequel de ces indicateurs est un agrégat macroéconomique ?',
  'Which of these is a macroeconomic aggregate?',
  ARRAY['Le prix du pain dans une boulangerie', 'Le salaire d''un fonctionnaire', 'Le taux de chômage national', 'Le profit d''une PME'],
  ARRAY['The price of bread in a bakery', 'A civil servant salary', 'The national unemployment rate', 'The profit of a small business'],
  2,
  'Le taux de chômage national est un indicateur macroéconomique car il agrège les données de toute l''économie.',
  2
FROM quizzes q
JOIN courses c ON c.id = q.course_id
WHERE c.slug = 'macroeconomie-fondamentaux' AND q.is_final_exam = false
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (quiz_id, question_fr, question_en, options_fr, options_en, correct_index, explanation_fr, order_index)
SELECT
  q.id,
  'Quelle est la principale différence entre macro et microéconomie ?',
  'What is the main difference between macro and microeconomics?',
  ARRAY['La macro utilise des mathématiques, la micro non', 'La macro étudie l''économie globale, la micro les agents individuels', 'La macro concerne uniquement les pays développés', 'Il n''y a pas de différence réelle'],
  ARRAY['Macro uses math, micro does not', 'Macro studies the whole economy, micro studies individual agents', 'Macro only concerns developed countries', 'There is no real difference'],
  1,
  'La macroéconomie analyse l''économie globale (PIB, inflation, chômage) tandis que la microéconomie étudie les comportements individuels (ménages, entreprises).',
  3
FROM quizzes q
JOIN courses c ON c.id = q.course_id
WHERE c.slug = 'macroeconomie-fondamentaux' AND q.is_final_exam = false
ON CONFLICT DO NOTHING;

-- Final exam
INSERT INTO quizzes (course_id, title_fr, title_en, description_fr, pass_score, is_final_exam)
SELECT
  c.id,
  'Examen Final — Macroéconomie Fondamentaux',
  'Final Exam — Macroeconomics Fundamentals',
  'Passez l''examen final pour obtenir votre certificat',
  75, true
FROM courses c WHERE c.slug = 'macroeconomie-fondamentaux'
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (quiz_id, question_fr, question_en, options_fr, options_en, correct_index, explanation_fr, order_index)
SELECT
  q.id,
  'Dans la formule PIB = C + I + G + (X - M), que représente "I" ?',
  'In the formula GDP = C + I + G + (X - M), what does "I" represent?',
  ARRAY['Importations', 'Investissements', 'Impôts', 'Inflation'],
  ARRAY['Imports', 'Investment', 'Income taxes', 'Inflation'],
  1,
  'Dans la méthode des dépenses, I représente les Investissements des entreprises (formation brute de capital fixe).',
  1
FROM quizzes q
JOIN courses c ON c.id = q.course_id
WHERE c.slug = 'macroeconomie-fondamentaux' AND q.is_final_exam = true
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (quiz_id, question_fr, question_en, options_fr, options_en, correct_index, explanation_fr, order_index)
SELECT
  q.id,
  'Quelle est la différence entre PIB nominal et PIB réel ?',
  'What is the difference between nominal and real GDP?',
  ARRAY['Le PIB nominal inclut les services, le réel non', 'Le PIB réel est corrigé de l''inflation, le nominal non', 'Le PIB réel est toujours supérieur au nominal', 'Il n''y a aucune différence pratique'],
  ARRAY['Nominal GDP includes services, real does not', 'Real GDP is adjusted for inflation, nominal is not', 'Real GDP is always higher than nominal', 'There is no practical difference'],
  1,
  'Le PIB réel est calculé à prix constants pour éliminer l''effet de l''inflation et mesurer la véritable croissance de la production.',
  2
FROM quizzes q
JOIN courses c ON c.id = q.course_id
WHERE c.slug = 'macroeconomie-fondamentaux' AND q.is_final_exam = true
ON CONFLICT DO NOTHING;
