-- Create CMS storage buckets for team photos and blog cover images.
-- Both must be public so the constructed public URL in ApiImageUploader resolves.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('team-photos', 'team-photos', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('blog-covers', 'blog-covers', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow public read on both buckets.
CREATE POLICY "Public read team-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-photos');

CREATE POLICY "Public read blog-covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-covers');
