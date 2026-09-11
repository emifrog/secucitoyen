import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Client serveur (clé service_role). Contourne la RLS : à n'utiliser
 * QUE dans des route handlers côté serveur, jamais exposé au client.
 * Sert aux opérations sur push_subscriptions et sent_notifications.
 *
 * Il n'existe volontairement pas de client « anon » : le navigateur ne parle
 * jamais à Supabase (les tables sont verrouillées par la migration 004) et un
 * client public exporté invitait à un usage accidentel côté client.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!serviceRoleKey) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY manquante : requise pour les opérations serveur sur les tables protégées.'
      );
    }
    _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabaseAdmin;
}
