import { NextResponse } from 'next/server';

// API pour le widget d'écran d'accueil
// Fournit les données pour le widget d'urgence

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    title: 'SécuCitoyen',
    subtitle: 'Urgences',
    actions: [
      {
        label: '15 - SAMU',
        url: 'tel:15',
        icon: '🏥',
        color: '#DC2626',
      },
      {
        label: '18 - Pompiers',
        url: 'tel:18',
        icon: '🚒',
        color: '#EA580C',
      },
      {
        label: '17 - Police',
        url: 'tel:17',
        icon: '👮',
        color: '#2563EB',
      },
      {
        label: '112 - Européen',
        url: 'tel:112',
        icon: '🇪🇺',
        color: '#7C3AED',
      },
    ],
    quickLinks: [
      {
        label: 'DAE à proximité',
        url: '/defibrillateurs',
        icon: '🫀',
      },
      {
        label: 'Gestes secours',
        url: '/secours',
        icon: '🩹',
      },
    ],
    updatedAt: new Date().toISOString(),
  });
}
