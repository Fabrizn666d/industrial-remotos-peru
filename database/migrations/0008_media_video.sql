ALTER TABLE irp_media_assets DROP CONSTRAINT IF EXISTS irp_media_assets_mime_type_check;
ALTER TABLE irp_media_assets DROP CONSTRAINT IF EXISTS irp_media_assets_byte_size_check;
ALTER TABLE irp_media_assets ADD CONSTRAINT irp_media_assets_mime_type_check
  CHECK (mime_type IN ('image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm'));
ALTER TABLE irp_media_assets ADD CONSTRAINT irp_media_assets_byte_size_check
  CHECK (byte_size > 0 AND byte_size <= 125829120);
