-- Storage bucket for log entry photos
-- Public bucket: anyone can read, only authenticated users can write to their own folder

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('log-photos', 'log-photos', true, 18874368, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- RLS: authenticated users can upload to their own folder ({user_id}/*)
CREATE POLICY "Users upload own log photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'log-photos'
  AND (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- RLS: authenticated users can update their own files
CREATE POLICY "Users update own log photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'log-photos'
  AND owner_id = (select auth.uid()::text)
);

-- RLS: authenticated users can delete their own files
CREATE POLICY "Users delete own log photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'log-photos'
  AND owner_id = (select auth.uid()::text)
);

-- RLS: public read access
CREATE POLICY "Public read log photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'log-photos');
