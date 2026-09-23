CREATE TABLE IF NOT EXISTS consumer_complaints (
  id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE,
  client_submission_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'RECEIVED',
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT consumer_complaints_status_check CHECK (status IN ('RECEIVED', 'IN_REVIEW', 'ANSWERED', 'CLOSED'))
);

CREATE INDEX IF NOT EXISTS consumer_complaints_created_at_idx
  ON consumer_complaints (created_at DESC);
