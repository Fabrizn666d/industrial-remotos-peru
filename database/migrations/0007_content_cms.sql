CREATE TABLE IF NOT EXISTS irp_cms_documents (
  key text PRIMARY KEY,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  content jsonb NOT NULL CHECK (jsonb_typeof(content) = 'object'),
  updated_by text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS irp_admin_activity (
  id uuid PRIMARY KEY,
  actor text NOT NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS irp_admin_activity_created_at_idx
  ON irp_admin_activity (created_at DESC);

CREATE TABLE IF NOT EXISTS irp_media_assets (
  id uuid PRIMARY KEY,
  original_name text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp','image/avif')),
  byte_size integer NOT NULL CHECK (byte_size > 0 AND byte_size <= 12582912),
  alt text NOT NULL DEFAULT '',
  storage_name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
