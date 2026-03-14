import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface SubscribeRequest {
  subscription: PushSubscriptionJSON;
  departmentCode?: string;
}

export async function POST(request: Request) {
  try {
    const body: SubscribeRequest = await request.json();
    const { subscription, departmentCode } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Subscription invalide' },
        { status: 400 }
      );
    }

    // Upsert la subscription dans Supabase
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          department_code: departmentCode || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

    if (error) {
      console.error('Erreur sauvegarde subscription:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'enregistrement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API subscribe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint requis' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Erreur suppression subscription:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API unsubscribe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
