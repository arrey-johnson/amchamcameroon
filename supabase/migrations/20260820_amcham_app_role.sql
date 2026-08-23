-- AmCham app role for Payload (safe to re-run in Supabase SQL Editor).
-- Use this login in DATABASE_URI:
--   postgresql://amcham_app.<PROJECT_REF>:<PASSWORD>@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'amcham_app') THEN
    CREATE ROLE amcham_app LOGIN PASSWORD '1234567890';
  ELSE
    ALTER ROLE amcham_app WITH LOGIN PASSWORD '1234567890';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE postgres TO amcham_app;
GRANT USAGE, CREATE ON SCHEMA public TO amcham_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO amcham_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO amcham_app;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO amcham_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO amcham_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO amcham_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO amcham_app;
