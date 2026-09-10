import { NextResponse } from 'next/server';
import { sanitizeDepartmentCode } from '@/lib/validation';
import { rateLimited } from '@/lib/rate-limit';
import { aggregateAlerts } from '@/lib/sources/aggregate';
import type { UnifiedAlert } from '@/lib/types/api-responses';

// API unifiée pour toutes les alertes : vigilance Météo-France, qualité de
// l'air, Vigicrues, estimation du risque incendie. Les sources sont appelées
// en parallèle par lib/sources/aggregate.ts (partagé avec le cron).

export type { UnifiedAlert };

export const dynamic = 'force-dynamic';
// Les sources sont appelées en parallèle (≈ 10 s au pire avec retries) ; le
// défaut Vercel Hobby (10 s) est trop juste.
export const maxDuration = 30;

function parseCoord(raw: string | null, max: number): number | undefined {
  if (raw === null) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && Math.abs(value) <= max ? value : undefined;
}

export async function GET(request: Request) {
  // Entrée publique qui déclenche un fan-out vers plusieurs APIs tierces :
  // plafond par IP (les circuit breakers protègent en aval, le cache CDN
  // ci-dessous absorbe l'essentiel du trafic).
  const limited = rateLimited(request, { key: 'alerts', limit: 60, windowMs: 60 * 1000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const lat = parseCoord(searchParams.get('lat'), 90);
  const lon = parseCoord(searchParams.get('lon'), 180);
  const deptCode = sanitizeDepartmentCode(searchParams.get('dept'));

  try {
    const result = await aggregateAlerts({ dept: deptCode, lat, lon });

    return NextResponse.json(
      {
        ...result,
        filters: {
          department: deptCode,
          coordinates: lat !== undefined && lon !== undefined ? { lat, lon } : null,
        },
      },
      {
        // Une réponse par URL (département) partagée par tous les clients
        // pendant 5 min sur le CDN, servie périmée jusqu'à 10 min de plus
        // pendant la revalidation.
        headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
      }
    );
  } catch (error) {
    console.error('Erreur API alertes unifiées:', error);

    return NextResponse.json(
      {
        alerts: [],
        count: 0,
        stats: { meteo: 0, inondation: 0, incendie: 0, pollution: 0 },
        sources: [],
        degraded: true,
        sourceStatus: {},
        updatedAt: new Date().toISOString(),
        error: 'Erreur lors de la récupération des alertes',
      },
      { status: 500 }
    );
  }
}
