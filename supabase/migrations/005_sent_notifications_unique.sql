-- Idempotence du cron de notifications + purge des abonnements douteux.
--
-- 1. sent_notifications.alert_id devient UNIQUE : le cron « réclame »
--    désormais une alerte (INSERT ... ON CONFLICT DO NOTHING) AVANT d'envoyer.
--    Deux runs concurrents (retards GitHub Actions, workflow_dispatch, appel
--    manuel) ne peuvent donc plus pousser deux fois la même alerte, et un run
--    interrompu ne renvoie pas ce qui a déjà été réclamé.
-- 2. Les abonnements enregistrés avant l'allowlist anti-SSRF (lib/validation.ts)
--    peuvent viser un hôte arbitraire : on les supprime. Même liste de
--    suffixes que ALLOWED_PUSH_HOST_SUFFIXES.
-- 3. Par hygiène, le rôle `authenticated` (non utilisé) perd lui aussi tout
--    accès direct aux tables ; seul `service_role` (routes serveur) y accède.

-- Migration REJOUABLE : chaque étape est sans effet si elle a déjà été
-- appliquée (utile après une erreur réseau de l'éditeur SQL, où la requête
-- a pu s'exécuter sans que le navigateur reçoive la réponse).

-- ── 1. Dédoublonner puis contraindre ────────────────────────────────
-- Conserver la ligne la plus récente pour chaque alert_id.
DELETE FROM sent_notifications older
USING sent_notifications newer
WHERE older.alert_id = newer.alert_id
  AND older.id < newer.id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sent_notifications_alert_id_key'
      AND conrelid = 'public.sent_notifications'::regclass
  ) THEN
    ALTER TABLE sent_notifications
      ADD CONSTRAINT sent_notifications_alert_id_key UNIQUE (alert_id);
  END IF;
END $$;

-- L'index simple de la migration 002 est redondant avec la contrainte.
DROP INDEX IF EXISTS idx_sent_notifications_alert_id;

-- ── 2. Purge des endpoints hors allowlist ───────────────────────────
DELETE FROM push_subscriptions
WHERE endpoint !~* '^https://([a-z0-9-]+\.)*(push\.services\.mozilla\.com|fcm\.googleapis\.com|android\.googleapis\.com|push\.apple\.com|notify\.windows\.com|wns\.windows\.com|push\.microsoft\.com)(:[0-9]+)?/';

-- Clés ECDH au mauvais format (voir app/api/notifications/subscribe/route.ts).
DELETE FROM push_subscriptions
WHERE NOT (
  (keys->>'p256dh') ~ '^[A-Za-z0-9_-]{87,88}$'
  AND (keys->>'auth') ~ '^[A-Za-z0-9_-]{22}$'
);

-- ── 3. Révocation défensive pour authenticated ──────────────────────
REVOKE ALL ON push_subscriptions FROM authenticated;
REVOKE ALL ON sent_notifications FROM authenticated;
