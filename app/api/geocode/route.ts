import { NextResponse } from 'next/server';
import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import { rateLimited } from '@/lib/rate-limit';
import { sanitizeDepartmentCode } from '@/lib/validation';
import { getDepartementNom } from '@/lib/departements';

// Géocodage inverse : coordonnées → département, via l'API officielle
// geo.api.gouv.fr (gratuite, sans clé). Passe par le serveur pour garder une
// CSP `connect-src 'self'`, mutualiser le cache et limiter le débit.

export const dynamic = 'force-dynamic';

const GEO_API_URL = 'https://geo.api.gouv.fr/communes';

interface GeoCommune {
  nom?: string;
  code?: string;
  codeDepartement?: string;
}

export async function GET(request: Request) {
  const limited = rateLimited(request, { key: 'geocode', limit: 30, windowMs: 60 * 1000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat'));
  const lon = Number(searchParams.get('lon'));

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return NextResponse.json({ error: 'Coordonnées invalides', departmentCode: null }, { status: 400 });
  }

  // Arrondi à 3 décimales (~100 m) : largement suffisant pour un département,
  // limite la précision transmise au tiers et rend le cache efficace.
  const url = `${GEO_API_URL}?lat=${lat.toFixed(3)}&lon=${lon.toFixed(3)}&fields=nom,codeDepartement&format=json&limit=1`;

  try {
    const response = await fetchWithCircuitBreaker('geo-api-gouv', url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
      timeout: 5000,
    });

    if (!response.ok) {
      return NextResponse.json(
        { departmentCode: null, degraded: true, error: `Géocodage indisponible (HTTP ${response.status})` },
        { status: 503 }
      );
    }

    const data: GeoCommune[] = await response.json();
    const commune = Array.isArray(data) ? data[0] : undefined;
    const code = sanitizeDepartmentCode(commune?.codeDepartement);

    // Pas de commune (en mer, hors de France) : réponse valide mais vide.
    if (!code) {
      return NextResponse.json(
        { departmentCode: null, departmentName: null, commune: null },
        { headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=86400' } }
      );
    }

    return NextResponse.json(
      {
        departmentCode: code,
        departmentName: getDepartementNom(code) ?? null,
        commune: commune?.nom ?? null,
      },
      { headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=86400' } }
    );
  } catch (error) {
    console.error('Erreur API geocode:', error);
    return NextResponse.json(
      { departmentCode: null, degraded: true, error: 'Géocodage indisponible' },
      { status: 503 }
    );
  }
}
