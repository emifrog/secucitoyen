import { NextResponse } from 'next/server';
import { rateLimited } from '@/lib/rate-limit';
import { sanitizeDepartmentCode } from '@/lib/validation';
import { fetchAirQuality } from '@/lib/sources/air-quality';

// Qualité de l'air (indice européen via Open-Meteo). Logique dans
// lib/sources/air-quality.ts (partagée avec l'agrégateur /api/alerts).

export const dynamic = 'force-dynamic';

function parseCoord(raw: string | null, max: number): number | undefined {
  if (raw === null) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && Math.abs(value) <= max ? value : undefined;
}

export async function GET(request: Request) {
  const limited = rateLimited(request, { key: 'air', limit: 60, windowMs: 60 * 1000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const lat = parseCoord(searchParams.get('lat'), 90);
  const lon = parseCoord(searchParams.get('lon'), 180);
  const dept = sanitizeDepartmentCode(searchParams.get('dept'));

  if (lat === undefined && lon === undefined && !dept) {
    return NextResponse.json(
      { alert: null, error: 'Paramètres lat/lon ou dept requis' },
      { status: 400 }
    );
  }

  const result = await fetchAirQuality({ lat, lon, dept });

  return NextResponse.json(
    {
      alert: result.alert,
      current: result.current,
      source: result.source,
      degraded: result.degraded,
      error: result.error,
      updatedAt: result.updatedAt,
    },
    { headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate=1800' } }
  );
}
