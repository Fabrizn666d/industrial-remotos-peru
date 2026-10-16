BEGIN;
CREATE TABLE IF NOT EXISTS irp_admin_workspaces (
 key text PRIMARY KEY,
 version integer NOT NULL DEFAULT 1 CHECK (version > 0),
 payload jsonb NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
