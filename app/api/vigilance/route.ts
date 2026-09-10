import { NextResponse } from 'next/server';
import { sanitizeDepartmentCode } from '@/lib/validation';
import { rateLimited } from '@/lib/rate-limit';
import { fetchVigilance } from '@/lib/sources/vigilance';

// Vigilance Météo-France par département. Logique dans lib/sources/vigilance.ts
// (partagée avec l'agrégateur /api/alerts et le cron).

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const limited = rateLimited(request, { key: 'vigilance', limit: 60, windowMs: 60 * 1000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const dept = sanitizeDepartmentCode(searchParams.get('dept'));

  const result = await fetchVigilance({ dept });

  return NextResponse.json(
    {
      alerts: result.items,
      source: result.source,
      degraded: result.degraded,
      error: result.error,
      updatedAt: result.updatedAt,
      count: result.count,
    },
    { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
  );
}
