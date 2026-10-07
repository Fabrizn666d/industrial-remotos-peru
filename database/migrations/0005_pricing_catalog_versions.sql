BEGIN;
CREATE TABLE IF NOT EXISTS irp_pricing_catalog_versions (
  id uuid PRIMARY KEY,
  version integer NOT NULL CHECK (version > 0),
  status text NOT NULL CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  published_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS irp_pricing_catalog_one_draft ON irp_pricing_catalog_versions(status) WHERE status='DRAFT';
CREATE UNIQUE INDEX IF NOT EXISTS irp_pricing_catalog_version_unique ON irp_pricing_catalog_versions(version) WHERE status IN ('PUBLISHED','ARCHIVED');
COMMIT;
