-- Table pour tracker les notifications déjà envoyées (anti-doublon)
CREATE TABLE IF NOT EXISTS sent_notifications (
  id BIGSERIAL PRIMARY KEY,
  alert_id TEXT NOT NULL,
  department_code VARCHAR(3),
  level VARCHAR(10) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour vérifier rapidement si une alerte a déjà été envoyée
CREATE INDEX IF NOT EXISTS idx_sent_notifications_alert_id
  ON sent_notifications (alert_id);

-- Nettoyage automatique : supprimer les entrées de plus de 7 jours
-- (à exécuter via un cron Supabase ou manuellement)
-- DELETE FROM sent_notifications WHERE sent_at < NOW() - INTERVAL '7 days';

-- RLS
ALTER TABLE sent_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all from API" ON sent_notifications
  FOR ALL TO anon USING (true) WITH CHECK (true);
