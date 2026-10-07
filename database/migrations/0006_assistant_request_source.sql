BEGIN;
ALTER TABLE irp_quote_requests DROP CONSTRAINT IF EXISTS irp_quote_requests_source_check;
ALTER TABLE irp_quote_requests ADD CONSTRAINT irp_quote_requests_source_check CHECK (source IN ('CONFIGURATOR','ASSISTANT','CONTACT','ADMIN_IMPORT'));
COMMIT;
