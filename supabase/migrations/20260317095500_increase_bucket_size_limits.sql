-- Increase file size limit from 10 MB to 18 MB for all storage buckets
-- Client-side compression targets < 4 MB, but we accept originals up to 18 MB as safety margin

UPDATE storage.buckets SET file_size_limit = 18874368 WHERE id = 'avatars';
UPDATE storage.buckets SET file_size_limit = 18874368 WHERE id = 'voyage-covers';
