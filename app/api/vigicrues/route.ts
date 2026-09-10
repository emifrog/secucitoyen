import { NextResponse } from 'next/server';
import { rateLimited } from '@/lib/rate-limit';
import { sanitizeDepartmentCode } from '@/lib/validation';
import { fetchVigicrues } from '@/lib/sources/vigicrues';

// Vigilance crues (Vigicrues). Logique dans lib/sources/vigicrues.ts
// (partagée avec l'agrégateur /api/alerts).

export type { VigicrueAlert } from '@/lib/sources/vigicrues';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const limited = rateLimited(request, { key: 'vigicrues', limit: 60, windowMs: 60 * 1000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const dept = sanitizeDepartmentCode(searchParams.get('dept'));

  const result = await fetchVigicrues(dept);

  return NextResponse.json(
    {
      alerts: result.items,
      count: result.items.length,
      totalNational: result.totalNational,
      source: 'Vigicrues - Ministère de la Transition écologique',
      cached: result.cached,
      degraded: result.degraded,
      error: result.error,
      updatedAt: result.updatedAt,
    },
    { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
  );
}
