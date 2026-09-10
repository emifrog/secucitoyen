import { NextResponse } from 'next/server';
import { rateLimited } from '@/lib/rate-limit';
import { fetchDefibrillateurs } from '@/lib/sources/defibrillateurs';

// Défibrillateurs (DAE) à proximité. Logique dans lib/sources/defibrillateurs.ts.
// Aucun DAE n'est jamais inventé : amont indisponible → 503 + liste vide.

export type { Defibrillateur } from '@/lib/sources/defibrillateurs';

export const dynamic = 'force-dynamic';

// Bornes des paramètres (anti-abus : un `limit` non borné allouait autant
// d'objets que demandé ; un rayon énorme fait exploser la requête amont).
const RADIUS_MIN = 100;
const RADIUS_MAX = 10_000;
const RADIUS_DEFAULT = 2_000;
const LIMIT_MIN = 1;
const LIMIT_MAX = 50;
const LIMIT_DEFAULT = 20;

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const parsed = raw === null ? NaN : parseInt(raw, 10);
  const value = Number.isFinite(parsed) ? parsed : fallback;
  return Math.min(max, Math.max(min, value));
}

export async function GET(request: Request) {
  const limited = rateLimited(request, { key: 'dae', limit: 40, windowMs: 60 * 1000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Paramètres lat et lon requis', defibrillateurs: [] }, { status: 400 });
  }

  const latitude = Number(lat);
  const longitude = Number(lon);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return NextResponse.json({ error: 'Coordonnées invalides', defibrillateurs: [] }, { status: 400 });
  }

  const radiusMeters = clampInt(searchParams.get('radius'), RADIUS_DEFAULT, RADIUS_MIN, RADIUS_MAX);
  const maxResults = clampInt(searchParams.get('limit'), LIMIT_DEFAULT, LIMIT_MIN, LIMIT_MAX);
  const center = { lat: latitude, lon: longitude };

  const result = await fetchDefibrillateurs({ lat: latitude, lon: longitude, radiusMeters, maxResults });

  if (result.degraded) {
    return NextResponse.json(
      {
        defibrillateurs: [],
        count: 0,
        error: 'Service de localisation des DAE indisponible',
        unavailable: true,
        reason: result.error,
        searchRadius: radiusMeters,
        center,
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      defibrillateurs: result.items,
      count: result.items.length,
      totalInRadius: result.totalInRadius,
      source: result.source,
      attribution: result.attribution,
      searchRadius: radiusMeters,
      center,
    },
    { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=3600' } }
  );
}
