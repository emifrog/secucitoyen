import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Configurer VAPID
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@secucitoyen.fr';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface SendRequest {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  departmentCode?: string;
  level?: 'jaune' | 'orange' | 'rouge';
}

export async function POST(request: Request) {
  try {
    // Vérification simple par header (à remplacer par une auth plus robuste en production)
    const authHeader = request.headers.get('x-api-key');
    if (authHeader !== process.env.NOTIFICATIONS_API_KEY) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'VAPID keys non configurées' },
        { status: 500 }
      );
    }

    const body: SendRequest = await request.json();
    const { title, body: notifBody, icon, url, tag, departmentCode, level } = body;

    if (!title || !notifBody) {
      return NextResponse.json(
        { error: 'title et body requis' },
        { status: 400 }
      );
    }

    // Récupérer les subscriptions ciblées
    let query = supabase.from('push_subscriptions').select('*');

    if (departmentCode) {
      // Envoyer aux abonnés du département OU sans département (national)
      query = query.or(`department_code.eq.${departmentCode},department_code.is.null`);
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error('Erreur récupération subscriptions:', fetchError);
      return NextResponse.json(
        { error: 'Erreur base de données' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, message: 'Aucun abonné' });
    }

    const levelEmoji: Record<string, string> = {
      jaune: '🟡',
      orange: '🟠',
      rouge: '🔴',
    };

    const payload = JSON.stringify({
      title: level ? `${levelEmoji[level]} ${title}` : title,
      body: notifBody,
      icon: icon || '/icons/icon-192x192.svg',
      badge: '/icons/icon-72x72.svg',
      url: url || '/alertes',
      tag: tag || `alert-${Date.now()}`,
      requireInteraction: level === 'rouge',
    });

    // Envoyer à toutes les subscriptions
    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: sub.keys,
        };

        try {
          await webpush.sendNotification(pushSubscription, payload);
          sent++;
        } catch (err: unknown) {
          const error = err as { statusCode?: number };
          if (error.statusCode === 404 || error.statusCode === 410) {
            // Subscription expirée, marquer pour suppression
            expiredEndpoints.push(sub.endpoint);
          }
          failed++;
        }
      })
    );

    // Nettoyer les subscriptions expirées
    if (expiredEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
    }

    return NextResponse.json({
      sent,
      failed,
      expired: expiredEndpoints.length,
      total: subscriptions.length,
      results: results.length,
    });
  } catch (error) {
    console.error('Erreur envoi notifications:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
