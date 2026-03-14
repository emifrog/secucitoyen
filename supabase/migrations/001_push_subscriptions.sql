-- Table pour stocker les subscriptions push notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  department_code VARCHAR(3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour filtrer par département
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_department
  ON push_subscriptions (department_code);

-- Index pour recherche par endpoint (upsert)
CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint
  ON push_subscriptions (endpoint);

-- Row Level Security (RLS)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique : permettre l'insertion et la suppression depuis l'API (anon key)
CREATE POLICY "Allow insert from API" ON push_subscriptions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow delete from API" ON push_subscriptions
  FOR DELETE TO anon USING (true);

CREATE POLICY "Allow select from API" ON push_subscriptions
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow update from API" ON push_subscriptions
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
