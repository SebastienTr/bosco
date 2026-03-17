-- Storage bucket for voyage cover images
-- Public bucket: anyone can read, only authenticated users can write to their own folder

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('voyage-covers', 'voyage-covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- RLS: authenticated users can upload to their own folder ({user_id}/*)
CREATE POLICY "Users upload own voyage covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'voyage-covers'
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- RLS: authenticated users can update their own files
CREATE POLICY "Users update own voyage covers"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'voyage-covers'
  AND owner_id = (select auth.uid()::text)
);

-- RLS: authenticated users can delete their own files
CREATE POLICY "Users delete own voyage covers"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'voyage-covers'
  AND owner_id = (select auth.uid()::text)
);

-- RLS: public read access
CREATE POLICY "Public read voyage covers"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'voyage-covers');
