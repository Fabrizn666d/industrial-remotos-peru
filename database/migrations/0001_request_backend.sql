BEGIN;

CREATE TABLE irp_document_counters (
  counter_year integer PRIMARY KEY CHECK (counter_year BETWEEN 2020 AND 9999),
  counter_value integer NOT NULL CHECK (counter_value BETWEEN 0 AND 9999),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE irp_quote_requests (
  id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE CHECK (code ~ '^IRP-[0-9]{4}-[0-9]{4}$'),
  public_token_hash char(64) NOT NULL UNIQUE CHECK (public_token_hash ~ '^[a-f0-9]{64}$'),
  client_submission_id uuid NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN (
    'NEW', 'IN_REVIEW', 'QUOTED', 'PROFORMA_SENT', 'CONTACTED',
    'VISIT_SCHEDULED', 'APPROVED', 'MANUFACTURING', 'INSTALLATION',
    'COMPLETED', 'REJECTED', 'ARCHIVED'
  )),
  contact_snapshot jsonb NOT NULL CHECK (jsonb_typeof(contact_snapshot) = 'object'),
  details_snapshot jsonb NOT NULL CHECK (jsonb_typeof(details_snapshot) = 'object'),
  attachment_names text[] NOT NULL DEFAULT ARRAY[]::text[],
  source text NOT NULL CHECK (source IN ('CONFIGURATOR', 'CONTACT', 'ADMIN_IMPORT')),
  original_payload jsonb NOT NULL CHECK (jsonb_typeof(original_payload) = 'object'),
  assigned_to text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CHECK (updated_at >= created_at)
);

CREATE INDEX irp_quote_requests_created_at_idx ON irp_quote_requests (created_at DESC);
CREATE INDEX irp_quote_requests_status_created_at_idx ON irp_quote_requests (status, created_at DESC);
CREATE INDEX irp_quote_requests_contact_email_idx ON irp_quote_requests ((lower(contact_snapshot ->> 'email')));

CREATE TABLE irp_quote_request_items (
  id uuid PRIMARY KEY,
  quote_request_id uuid NOT NULL REFERENCES irp_quote_requests(id) ON DELETE RESTRICT,
  position integer NOT NULL CHECK (position >= 0),
  client_item_id text,
  product_id text,
  item_name text NOT NULL CHECK (length(item_name) BETWEEN 1 AND 200),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 100),
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(configuration) = 'object'),
  notes text,
  UNIQUE (quote_request_id, position)
);

CREATE INDEX irp_quote_request_items_request_idx ON irp_quote_request_items (quote_request_id, position);

CREATE TABLE irp_activity_logs (
  id uuid PRIMARY KEY,
  actor_type text NOT NULL CHECK (actor_type IN ('SYSTEM', 'ADMIN')),
  actor_identifier text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type = 'QUOTE_REQUEST'),
  entity_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL
);

CREATE INDEX irp_activity_logs_entity_idx ON irp_activity_logs (entity_type, entity_id, created_at DESC);

CREATE FUNCTION irp_preserve_request_snapshot() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.code IS DISTINCT FROM OLD.code
    OR NEW.public_token_hash IS DISTINCT FROM OLD.public_token_hash
    OR NEW.client_submission_id IS DISTINCT FROM OLD.client_submission_id
    OR NEW.contact_snapshot IS DISTINCT FROM OLD.contact_snapshot
    OR NEW.details_snapshot IS DISTINCT FROM OLD.details_snapshot
    OR NEW.attachment_names IS DISTINCT FROM OLD.attachment_names
    OR NEW.source IS DISTINCT FROM OLD.source
    OR NEW.original_payload IS DISTINCT FROM OLD.original_payload
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'The original quote request snapshot is immutable';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER irp_quote_requests_preserve_snapshot
BEFORE UPDATE ON irp_quote_requests
FOR EACH ROW EXECUTE FUNCTION irp_preserve_request_snapshot();

CREATE FUNCTION irp_reject_immutable_record_change() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'This record is append-only';
END;
$$;

CREATE TRIGGER irp_quote_request_items_immutable
BEFORE UPDATE OR DELETE ON irp_quote_request_items
FOR EACH ROW EXECUTE FUNCTION irp_reject_immutable_record_change();

CREATE TRIGGER irp_activity_logs_append_only
BEFORE UPDATE OR DELETE ON irp_activity_logs
FOR EACH ROW EXECUTE FUNCTION irp_reject_immutable_record_change();

CREATE TRIGGER irp_quote_requests_no_delete
BEFORE DELETE ON irp_quote_requests
FOR EACH ROW EXECUTE FUNCTION irp_reject_immutable_record_change();

COMMIT;

-- Transactional number allocation used by PostgresRequestRepository:
--
-- INSERT INTO irp_document_counters (counter_year, counter_value)
-- VALUES ($1, 1)
-- ON CONFLICT (counter_year) DO UPDATE
--   SET counter_value = irp_document_counters.counter_value + 1,
--       updated_at = now()
--   WHERE irp_document_counters.counter_value < 9999
-- RETURNING counter_value;
--
-- Use the returned value to build IRP-YYYY-####, then insert the request,
-- its immutable items and the creation activity in the same transaction.
