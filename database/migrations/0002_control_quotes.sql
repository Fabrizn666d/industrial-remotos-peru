BEGIN;

CREATE TABLE IF NOT EXISTS irp_quote_counters (
  counter_year integer PRIMARY KEY CHECK (counter_year BETWEEN 2020 AND 9999),
  counter_value integer NOT NULL CHECK (counter_value BETWEEN 0 AND 9999),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS irp_quote_product_templates (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  product_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT irp_quote_product_templates_snapshot_object CHECK (jsonb_typeof(product_snapshot) = 'object')
);

CREATE INDEX IF NOT EXISTS irp_quote_product_templates_active_name_idx
  ON irp_quote_product_templates (active, lower(name));

CREATE TABLE IF NOT EXISTS irp_control_quotes (
  id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE CHECK (code ~ '^COT-[0-9]{4}-[0-9]{4}$'),
  status text NOT NULL CHECK (status IN ('DRAFT', 'ISSUED', 'VOID')),
  revision integer NOT NULL CHECK (revision > 0),
  issue_date date NOT NULL,
  valid_until date NOT NULL,
  client_name text NOT NULL,
  client_document text NOT NULL DEFAULT '',
  project_name text NOT NULL,
  project_location text NOT NULL DEFAULT '',
  total_minor integer NOT NULL CHECK (total_minor >= 0),
  quote_snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  issued_at timestamptz,
  voided_at timestamptz,
  CONSTRAINT irp_control_quotes_snapshot_object CHECK (jsonb_typeof(quote_snapshot) = 'object')
);

CREATE INDEX IF NOT EXISTS irp_control_quotes_created_idx ON irp_control_quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS irp_control_quotes_status_created_idx ON irp_control_quotes (status, created_at DESC);
CREATE INDEX IF NOT EXISTS irp_control_quotes_client_idx ON irp_control_quotes (lower(client_name));
CREATE INDEX IF NOT EXISTS irp_control_quotes_project_idx ON irp_control_quotes (lower(project_name));

CREATE TABLE IF NOT EXISTS irp_control_quote_items (
  id uuid PRIMARY KEY,
  quote_id uuid NOT NULL REFERENCES irp_control_quotes(id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 0),
  item_snapshot jsonb NOT NULL,
  CONSTRAINT irp_control_quote_items_quote_position_unique UNIQUE (quote_id, position),
  CONSTRAINT irp_control_quote_items_snapshot_object CHECK (jsonb_typeof(item_snapshot) = 'object')
);

CREATE INDEX IF NOT EXISTS irp_control_quote_items_quote_idx
  ON irp_control_quote_items (quote_id, position);

COMMIT;

