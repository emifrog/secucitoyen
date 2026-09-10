import { NextResponse } from 'next/server';
import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import { rateLimited } from '@/lib/rate-limit';
import type { OpenDataSoftDAEResponse, OpenDataSoftDAERecord } from '@/lib/types/api-responses';

// API pour trouver les défibrillateurs (DAE) à proximité
// Source : data.gouv.fr - Base nationale des défibrillateurs
//
// Aucun DAE n'est jamais inventé : en cas d'indisponibilité de la source, la
// route renvoie 503 et une liste vide. Envoyer quelqu'un vers un défibrillateur
// fictif pendant un arrêt cardiaque serait dangereux ; l'UI affiche alors
// « appelez le 15 / 112, le régulateur vous indiquera le DAE le plus proche ».

export interface Defibrillateur {
  id: string;
  nom: string;
  adresse: string;
  commune: string;
  codePostal: string;
  latitude: number;
  longitude: number;
  accessibilite: string;
  disponibilite: string;
  distance?: number;
}

export const dynamic = 'force-dynamic';

// Bornes des paramètres (anti-abus : un `limit` non borné allouait autant
// d'objets que demandé ; un rayon énorme fait exploser la bounding box amont).
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

// Calcul de distance Haversine en mètres
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function unavailableResponse(
  reason: string,
  center: { lat: number; lon: number },
  radiusMeters: number
) {
  return NextResponse.json(
    {
      defibrillateurs: [] as Defibrillateur[],
      count: 0,
      error: 'Service de localisation des DAE indisponible',
      unavailable: true,
      reason,
      searchRadius: radiusMeters,
      center,
    },
    { status: 503 }
  );
}

export async function GET(request: Request) {
  const limited = rateLimited(request, { key: 'dae', limit: 40, windowMs: 60 * 1000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({
      error: 'Paramètres lat et lon requis',
      defibrillateurs: [],
    }, { status: 400 });
  }

  const latitude = Number(lat);
  const longitude = Number(lon);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return NextResponse.json({
      error: 'Coordonnées invalides',
      defibrillateurs: [],
    }, { status: 400 });
  }

  const radiusMeters = clampInt(searchParams.get('radius'), RADIUS_DEFAULT, RADIUS_MIN, RADIUS_MAX);
  const maxResults = clampInt(searchParams.get('limit'), LIMIT_DEFAULT, LIMIT_MIN, LIMIT_MAX);
  const center = { lat: latitude, lon: longitude };

  try {
    // Calcul de la bounding box pour optimiser la requête
    const latDelta = radiusMeters / 111000; // ~111km par degré
    const lonDelta = radiusMeters / (111000 * Math.cos(latitude * Math.PI / 180));

    const minLat = latitude - latDelta;
    const maxLat = latitude + latDelta;
    const minLon = longitude - lonDelta;
    const maxLon = longitude + lonDelta;

    // Requête à l'API des DAE de data.gouv.fr via OpenDataSoft
    const apiUrl = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-france-defibrillateur-automatique-externe-dae/records?where=geo_point_2d%20within%20(${minLat}%2C%20${minLon}%2C%20${maxLat}%2C%20${maxLon})&limit=100`;

    const response = await fetchWithCircuitBreaker('opendatasoft-dae', apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
      timeout: 10000,
    });

    if (!response.ok) {
      console.warn(`API DAE non disponible (HTTP ${response.status})`);
      return unavailableResponse(`HTTP ${response.status}`, center, radiusMeters);
    }

    const data: OpenDataSoftDAEResponse = await response.json();

    // Transformer les résultats
    const defibrillateurs = (data.results || [])
      .map((record: OpenDataSoftDAERecord): Defibrillateur | null => {
        const geoPoint = record.geo_point_2d;
        if (!geoPoint) return null;

        const dLat = geoPoint.lat;
        const dLon = geoPoint.lon;
        const distance = haversineDistance(latitude, longitude, dLat, dLon);

        if (distance > radiusMeters) return null;

        return {
          id: String(record.c_gid || record.id || `${dLat},${dLon}`),
          nom: String(record.c_nom || record.nom_site || 'Défibrillateur'),
          adresse: String(record.c_adr_voie || record.adr_voie || ''),
          commune: String(record.c_com_nom || record.commune || ''),
          codePostal: String(record.c_com_cp || record.code_postal || ''),
          latitude: dLat,
          longitude: dLon,
          accessibilite: String(record.c_acc || record.accessibilite || 'Non précisé'),
          disponibilite: String(record.c_disp_j || record.disponibilite || '24h/24'),
          distance: Math.round(distance),
        };
      })
      .filter((d): d is Defibrillateur => d !== null);

    defibrillateurs.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    const limitedResults = defibrillateurs.slice(0, maxResults);

    return NextResponse.json({
      defibrillateurs: limitedResults,
      count: limitedResults.length,
      source: 'OpenDataSoft - DAE France',
      searchRadius: radiusMeters,
      center,
    });
  } catch (error) {
    console.error('Erreur API défibrillateurs:', error);
    return unavailableResponse('exception', center, radiusMeters);
  }
}
