import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAllowedPushEndpoint, sanitizeDepartmentCode } from '@/lib/validation';
import { rateLimited } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Endpoint public : plafond strict par IP (s'abonner/désabonner est rare).
const RL = { key: 'subscribe', limit: 10, windowMs: 10 * 60 * 1000 };

// Une souscription Web Push sérialisée pèse ~300 octets ; au-delà de 4 Ko
// c'est un abus (empoisonnement de la table pour saturer le cron).
const MAX_BODY_BYTES = 4096;

// Clés ECDH d'une souscription Web Push (RFC 8291), en base64url :
// - p256dh : point P-256 non compressé, 65 octets → 87 caractères (88 avec padding)
// - auth   : secret d'authentification, 16 octets → 22 caractères
const P256DH_RE = /^[A-Za-z0-9_-]{87,88}$/;
const AUTH_RE = /^[A-Za-z0-9_-]{22}$/;

interface SubscribeRequest {
  subscription?: {
    endpoint?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
  };
  departmentCode?: unknown;
}

class PayloadTooLargeError extends Error {}

async function readBoundedJson(request: Request): Promise<unknown> {
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) throw new PayloadTooLargeError();
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new PayloadTooLargeError();
  return JSON.parse(text);
}

function hasValidKeys(
  keys: { p256dh?: unknown; auth?: unknown } | undefined
): keys is { p256dh: string; auth: string } {
  return (
    typeof keys?.p256dh === 'string' &&
    typeof keys?.auth === 'string' &&
    P256DH_RE.test(keys.p256dh) &&
    AUTH_RE.test(keys.auth)
  );
}

export async function POST(request: Request) {
  const limited = rateLimited(request, RL);
  if (limited) return limited;

  try {
    const body = (await readBoundedJson(request)) as SubscribeRequest;
    const subscription = body?.subscription;

    // Valide que l'endpoint pointe vers un service de push connu (anti-SSRF).
    if (!subscription || !isAllowedPushEndpoint(subscription.endpoint)) {
      return NextResponse.json({ error: 'Subscription invalide' }, { status: 400 });
    }

    // Les clés ECDH doivent être présentes ET au bon format : sans cela un
    // attaquant peut remplir la table de faux abonnés valides pour l'allowlist
    // et faire expirer le cron avant qu'il n'atteigne les vrais abonnés.
    if (!hasValidKeys(subscription.keys)) {
      return NextResponse.json({ error: 'Clés de subscription invalides' }, { status: 400 });
    }

    const departmentCode = typeof body.departmentCode === 'string' ? body.departmentCode : undefined;

    // Upsert la subscription dans Supabase (client admin, RLS contournée)
    const { error } = await getSupabaseAdmin()
      .from('push_subscriptions')
      .upsert(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
          department_code: sanitizeDepartmentCode(departmentCode),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

    if (error) {
      console.error('Erreur sauvegarde subscription:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: 'Corps de requête trop volumineux' }, { status: 413 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
    }
    console.error('Erreur API subscribe:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const limited = rateLimited(request, RL);
  if (limited) return limited;

  try {
    const body = (await readBoundedJson(request)) as { endpoint?: unknown };
    const endpoint = body?.endpoint;

    // Même garde que POST : seul un endpoint de push valide peut être ciblé,
    // ce qui empêche d'utiliser DELETE comme outil de suppression arbitraire.
    if (!isAllowedPushEndpoint(endpoint)) {
      return NextResponse.json({ error: 'Endpoint invalide' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Erreur suppression subscription:', error);
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return NextResponse.json({ error: 'Corps de requête trop volumineux' }, { status: 413 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
    }
    console.error('Erreur API unsubscribe:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
