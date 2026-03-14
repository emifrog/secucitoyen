import { NextResponse } from 'next/server';

export async function GET() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    return NextResponse.json(
      { error: 'VAPID public key non configurée' },
      { status: 500 }
    );
  }

  return NextResponse.json({ publicKey: vapidPublicKey });
}
