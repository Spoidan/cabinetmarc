CREATE TABLE IF NOT EXISTS testimonials (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  rating      INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT        NOT NULL,
  is_approved BOOLEAN     DEFAULT FALSE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Only approved testimonials are publicly readable via the anon key.
-- User-scoped reads (own pending) go through service-role in API routes.
CREATE POLICY "Approved testimonials are public"
  ON testimonials FOR SELECT
  USING (is_approved = true);
