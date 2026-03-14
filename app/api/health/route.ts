import { NextResponse } from 'next/server';
import { getCircuitState } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

const SOURCES = [
  'meteo-france',
  'open-meteo-air',
  'open-meteo-forecast',
  'vigicrues',
  'opendatasoft-dae',
] as const;

export async function GET() {
  const sources = SOURCES.map((source) => {
    const state = getCircuitState(source);
    return {
      source,
      status: state.isOpen ? 'unavailable' : 'ok',
      failures: state.failures,
    };
  });

  const allHealthy = sources.every((s) => s.status === 'ok');

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'degraded',
    sources,
    timestamp: new Date().toISOString(),
  });
}
