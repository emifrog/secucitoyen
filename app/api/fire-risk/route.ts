import { NextResponse } from 'next/server';
import { rateLimited } from '@/lib/rate-limit';
import { sanitizeDepartmentCode } from '@/lib/validation';
import { fetchFireRisk } from '@/lib/sources/fire-risk';
import { FIRE_OFFICIAL_LINK } from '@/lib/sources/meteo-forets';

// Estimation ponctuelle du risque incendie (non officielle, plafonnée à
// orange). Logique dans lib/sources/fire-risk.ts.

export type { FireRiskAlert } from '@/lib/sources/fire-risk';

export const dynamic = 'force-dynamic';

function parseCoord(raw: string | null, max: number): number | undefined {
  if (raw === null) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && Math.abs(value) <= max ? value : undefined;
}

export async function GET(request: Request) {
  const limited = rateLimited(request, { key: 'fire', limit: 30, windowMs: 60 * 1000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const lat = parseCoord(searchParams.get('lat'), 90);
  const lon = parseCoord(searchParams.get('lon'), 180);
  const dept = sanitizeDepartmentCode(searchParams.get('dept'));

  const result = await fetchFireRisk({ lat, lon, dept });

  return NextResponse.json(
    {
      alerts: result.items,
      source: result.source,
      officialSource: FIRE_OFFICIAL_LINK,
      degraded: result.degraded,
      error: result.error,
      updatedAt: result.updatedAt,
    },
    { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=1800' } }
  );
}
