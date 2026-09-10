import { NextResponse } from 'next/server';
import { rateLimited } from '@/lib/rate-limit';
import { sanitizeDepartmentCode } from '@/lib/validation';
import { fetchMeteoForets, FIRE_OFFICIAL_LINK } from '@/lib/sources/meteo-forets';

// Estimation du risque incendie de forêt (indice simplifié, non officiel).
// Logique dans lib/sources/meteo-forets.ts (partagée avec l'agrégateur).

export type { ForetRiskAlert } from '@/lib/sources/meteo-forets';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const limited = rateLimited(request, { key: 'forets', limit: 30, windowMs: 60 * 1000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const dept = sanitizeDepartmentCode(searchParams.get('dept'));

  const result = await fetchMeteoForets(dept);

  return NextResponse.json(
    {
      alerts: result.items,
      count: result.items.length,
      departementsVerifies: result.departementsVerifies,
      source: result.source,
      officialSource: FIRE_OFFICIAL_LINK,
      degraded: result.degraded,
      error: result.error,
      updatedAt: result.updatedAt,
      legend: {
        faible: { color: 'green', label: 'Risque faible' },
        modere: { color: 'yellow', label: 'Risque modéré' },
        eleve: { color: 'orange', label: 'Risque élevé' },
        tres_eleve: { color: 'red', label: 'Risque très élevé' },
        extreme: { color: 'darkred', label: 'Risque extrême' },
      },
    },
    { headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=1800' } }
  );
}
