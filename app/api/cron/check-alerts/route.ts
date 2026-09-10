import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sanitizeDepartmentCode } from '@/lib/validation';
import { isValidSecret } from '@/lib/api-auth';
import { aggregateAlerts, OFFICIAL_PUSH_SOURCES } from '@/lib/sources/aggregate';
import { VIGILANCE_SOURCE } from '@/lib/sources/vigilance';
import type { UnifiedAlert } from '@/lib/types/api-responses';

// Cron de notifications (GitHub Actions toutes les 15 min) : pousse les
// vigilances orange/rouge des sources OFFICIELLES aux abonnés du département.
//
// Idempotence : chaque alerte est « réclamée » dans sent_notifications
// (UNIQUE alert_id, migration 005) AVANT l'envoi. Deux runs concurrents ne
// peuvent donc pas envoyer deux fois la même alerte, et un run interrompu ne
// renvoie pas ce qui a déjà été réclamé.

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@secucitoyen.fr';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// Envois par lots : borne la concurrence (quotas des services push) sans
// sérialiser complètement (un abonné lent ne bloque plus les autres).
const SEND_CONCURRENCY = 10;

interface PushRow {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

interface SendStats {
  sent: number;
  failed: number;
  expiredEndpoints: string[];
}

async function sendInBatches(subscriptions: PushRow[], payload: string): Promise<SendStats> {
  const stats: SendStats = { sent: 0, failed: 0, expiredEndpoints: [] };

  for (let i = 0; i < subscriptions.length; i += SEND_CONCURRENCY) {
    const batch = subscriptions.slice(i, i + SEND_CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map((sub) => webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload))
    );
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        stats.sent++;
        return;
      }
      stats.failed++;
      const statusCode = (result.reason as { statusCode?: number })?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        stats.expiredEndpoints.push(batch[index].endpoint);
      }
    });
  }

  return stats;
}

function buildPayload(alert: UnifiedAlert): string {
  const levelEmoji: Record<string, string> = { jaune: '🟡', orange: '🟠', rouge: '🔴' };
  return JSON.stringify({
    title: `${levelEmoji[alert.level] ?? ''} ${alert.title}`.trim(),
    body: alert.department ? `${alert.description} — ${alert.department}` : alert.description,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    url: `/alertes/${encodeURIComponent(alert.id)}`,
    tag: `alert-${alert.id}`,
    requireInteraction: alert.level === 'rouge',
  });
}

export async function GET(request: Request) {
  // Vérification : soit le cron (Bearer CRON_SECRET), soit la clé API manuelle
  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const isCron = isValidSecret(bearer, process.env.CRON_SECRET);
  const isApiKey = isValidSecret(
    request.headers.get('x-api-key'),
    process.env.NOTIFICATIONS_API_KEY
  );

  if (!isCron && !isApiKey) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'VAPID non configuré' }, { status: 500 });
  }

  try {
    // 1. Alertes sévères des sources officielles (appel direct, en parallèle)
    const aggregate = await aggregateAlerts({ severeOnly: true });
    const vigilanceDown = aggregate.sourceStatus[VIGILANCE_SOURCE] === 'degraded';

    const severeAlerts = aggregate.alerts.filter(
      (a) => (a.level === 'orange' || a.level === 'rouge') && OFFICIAL_PUSH_SOURCES.has(a.source)
    );

    let totalSent = 0;
    let totalFailed = 0;
    let claimed = 0;
    let alreadySent = 0;
    let skippedNoDept = 0;
    let claimErrors = 0;
    const expiredEndpoints: string[] = [];

    for (const alert of severeAlerts) {
      // Une alerte sans département n'est jamais diffusée à tous les abonnés
      // nationaux (ciblage impossible → risque de spam massif).
      const safeDept = sanitizeDepartmentCode(alert.departmentCode);
      if (!safeDept) {
        skippedNoDept++;
        continue;
      }

      // 2. Réclamer l'alerte AVANT l'envoi (insertion ignorée si déjà présente).
      const { data: inserted, error: claimError } = await supabase
        .from('sent_notifications')
        .upsert(
          { alert_id: alert.id, department_code: safeDept, level: alert.level },
          { onConflict: 'alert_id', ignoreDuplicates: true }
        )
        .select('alert_id');

      if (claimError) {
        console.error('Erreur réclamation alerte', alert.id, claimError);
        claimErrors++;
        continue;
      }
      if (!inserted || inserted.length === 0) {
        alreadySent++;
        continue;
      }
      claimed++;

      // 3. Abonnés du département + abonnés nationaux
      const { data: subscriptions, error: subsError } = await supabase
        .from('push_subscriptions')
        .select('endpoint, keys')
        .or(`department_code.eq.${safeDept},department_code.is.null`);

      if (subsError) {
        console.error('Erreur lecture abonnés', subsError);
        continue;
      }
      if (!subscriptions || subscriptions.length === 0) continue;

      const stats = await sendInBatches(subscriptions as PushRow[], buildPayload(alert));
      totalSent += stats.sent;
      totalFailed += stats.failed;
      expiredEndpoints.push(...stats.expiredEndpoints);
    }

    // 4. Nettoyer les subscriptions expirées
    if (expiredEndpoints.length > 0) {
      await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints);
    }

    // 5. Nettoyer les anciennes notifications envoyées (> 7 jours)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('sent_notifications').delete().lt('sent_at', sevenDaysAgo);

    const body = {
      severe: severeAlerts.length,
      newAlerts: claimed,
      alreadySent,
      skippedNoDept,
      claimErrors,
      sent: totalSent,
      failed: totalFailed,
      expired: expiredEndpoints.length,
      degraded: aggregate.degraded,
      sourceStatus: aggregate.sourceStatus,
      ...(vigilanceDown ? { error: 'Vigilance Météo-France indisponible' } : {}),
    };

    // Vigilance Météo-France indisponible : le travail possible a été fait,
    // mais on renvoie 502 pour que `curl -f` fasse échouer le workflow et que
    // l'incident soit visible (avant : 200 « Aucune alerte sévère »).
    return NextResponse.json(body, { status: vigilanceDown ? 502 : 200 });
  } catch (error) {
    console.error('Erreur cron check-alerts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des alertes' },
      { status: 500 }
    );
  }
}
