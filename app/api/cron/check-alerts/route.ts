import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@secucitoyen.fr';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface AlertData {
  id: string;
  type: string;
  level: 'jaune' | 'orange' | 'rouge';
  title: string;
  description: string;
  department?: string;
  departmentCode?: string;
}

export async function GET(request: Request) {
  // Vérification : soit Vercel Cron, soit API key manuelle
  const authHeader = request.headers.get('authorization');
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  const isApiKey = request.headers.get('x-api-key') === process.env.NOTIFICATIONS_API_KEY;

  if (!isCron && !isApiKey) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'VAPID non configuré' }, { status: 500 });
  }

  try {
    // 1. Récupérer les alertes actuelles (orange et rouge uniquement)
    const baseUrl = new URL(request.url).origin;
    const alertsResponse = await fetch(`${baseUrl}/api/alerts`);
    const alertsData = await alertsResponse.json();

    const severeAlerts: AlertData[] = (alertsData.alerts || []).filter(
      (a: AlertData) => a.level === 'orange' || a.level === 'rouge'
    );

    if (severeAlerts.length === 0) {
      return NextResponse.json({ message: 'Aucune alerte sévère', sent: 0 });
    }

    // 2. Vérifier quelles alertes ont déjà été envoyées
    const alertIds = severeAlerts.map((a) => a.id);
    const { data: alreadySent } = await supabase
      .from('sent_notifications')
      .select('alert_id')
      .in('alert_id', alertIds);

    const sentIds = new Set((alreadySent || []).map((s) => s.alert_id));
    const newAlerts = severeAlerts.filter((a) => !sentIds.has(a.id));

    if (newAlerts.length === 0) {
      return NextResponse.json({ message: 'Toutes les alertes ont déjà été envoyées', sent: 0 });
    }

    // 3. Envoyer les notifications pour chaque nouvelle alerte
    let totalSent = 0;
    let totalFailed = 0;
    const expiredEndpoints: string[] = [];

    for (const alert of newAlerts) {
      // Récupérer les abonnés ciblés
      let query = supabase.from('push_subscriptions').select('*');
      if (alert.departmentCode) {
        query = query.or(`department_code.eq.${alert.departmentCode},department_code.is.null`);
      }

      const { data: subscriptions } = await query;
      if (!subscriptions || subscriptions.length === 0) continue;

      const levelEmoji: Record<string, string> = { jaune: '🟡', orange: '🟠', rouge: '🔴' };
      const payload = JSON.stringify({
        title: `${levelEmoji[alert.level]} ${alert.title}`,
        body: alert.department
          ? `${alert.description} — ${alert.department}`
          : alert.description,
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-72x72.svg',
        url: `/alertes/${alert.id}`,
        tag: `alert-${alert.id}`,
        requireInteraction: alert.level === 'rouge',
      });

      // Envoyer à chaque abonné
      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            payload
          );
          totalSent++;
        } catch (err: unknown) {
          const error = err as { statusCode?: number };
          if (error.statusCode === 404 || error.statusCode === 410) {
            expiredEndpoints.push(sub.endpoint);
          }
          totalFailed++;
        }
      }

      // Marquer l'alerte comme envoyée
      await supabase.from('sent_notifications').insert({
        alert_id: alert.id,
        department_code: alert.departmentCode || null,
        level: alert.level,
      });
    }

    // 4. Nettoyer les subscriptions expirées
    if (expiredEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
    }

    // 5. Nettoyer les anciennes notifications envoyées (> 7 jours)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('sent_notifications')
      .delete()
      .lt('sent_at', sevenDaysAgo);

    return NextResponse.json({
      newAlerts: newAlerts.length,
      sent: totalSent,
      failed: totalFailed,
      expired: expiredEndpoints.length,
    });
  } catch (error) {
    console.error('Erreur cron check-alerts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des alertes' },
      { status: 500 }
    );
  }
}
