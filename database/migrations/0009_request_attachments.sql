BEGIN;

CREATE TABLE irp_request_attachments (
  id uuid PRIMARY KEY,
  draft_id uuid NOT NULL,
  quote_request_id uuid REFERENCES irp_quote_requests(id) ON DELETE RESTRICT,
  original_name text NOT NULL CHECK (length(original_name) BETWEEN 1 AND 240),
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp','image/avif')),
  byte_size integer NOT NULL CHECK (byte_size > 0 AND byte_size <= 8388608),
  storage_name text NOT NULL UNIQUE,
  token_hash char(64) NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX irp_request_attachments_request_idx ON irp_request_attachments (quote_request_id);
CREATE INDEX irp_request_attachments_draft_idx ON irp_request_attachments (draft_id, created_at DESC);

COMMIT;
