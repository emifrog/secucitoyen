-- Durcissement RLS : retirer tout accès direct du rôle public `anon`
-- aux tables sensibles. Ces tables ne sont désormais manipulées que par
-- les route handlers serveur via la clé `service_role` (qui contourne la RLS).
--
-- Avant ce correctif, la clé anon publique (livrée à chaque navigateur)
-- permettait de lister/modifier/supprimer tous les abonnements push
-- (fuite de vie privée + DoS) et de falsifier l'anti-doublon des alertes
-- (suppression d'alertes de sécurité). Voir migrations 001 et 002.

-- ── push_subscriptions ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow insert from API" ON push_subscriptions;
DROP POLICY IF EXISTS "Allow delete from API" ON push_subscriptions;
DROP POLICY IF EXISTS "Allow select from API" ON push_subscriptions;
DROP POLICY IF EXISTS "Allow update from API" ON push_subscriptions;

-- RLS activée + aucune politique ⇒ `anon` n'a aucun accès.
-- `service_role` contourne la RLS et conserve un accès complet.
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ── sent_notifications ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all from API" ON sent_notifications;

ALTER TABLE sent_notifications ENABLE ROW LEVEL SECURITY;

-- ── Révocation défensive des privilèges de table pour anon ──────────
-- (RLS filtre déjà les lignes, mais on retire aussi les GRANT par sécurité.)
REVOKE ALL ON push_subscriptions FROM anon;
REVOKE ALL ON sent_notifications FROM anon;
