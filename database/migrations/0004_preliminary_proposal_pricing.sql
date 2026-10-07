BEGIN;

ALTER TABLE irp_quote_requests
  ADD COLUMN IF NOT EXISTS pricing_snapshot jsonb;

ALTER TABLE irp_quote_requests
  ADD CONSTRAINT irp_quote_requests_pricing_snapshot_object
  CHECK (pricing_snapshot IS NULL OR jsonb_typeof(pricing_snapshot) = 'object');

CREATE INDEX IF NOT EXISTS irp_quote_requests_pricing_status_idx
  ON irp_quote_requests ((pricing_snapshot ->> 'status'));

CREATE OR REPLACE FUNCTION irp_preserve_request_snapshot() RETURNS trigger
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
    OR NEW.pricing_snapshot IS DISTINCT FROM OLD.pricing_snapshot
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'The original quote request snapshot is immutable';
  END IF;
  RETURN NEW;
END;
$$;

COMMIT;
