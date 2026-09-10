import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import { haversineDistance } from '@/lib/departements';
import type { OpenDataSoftDAEResponse, OpenDataSoftDAERecord } from '@/lib/types/api-responses';

// Défibrillateurs (DAE) à proximité.
//
// Source : jeu « osm-france-defibrillator » (OpenStreetMap, licence ODbL) sur
// public.opendatasoft.com — le seul jeu NATIONAL interrogeable par rayon. La
// base officielle Géo'DAE n'expose pas d'API de requête publique. Données
// contributives : l'UI le signale et invite à vérifier sur place.
//
// Historique : l'ancienne route visait un jeu de données inexistant avec une
// syntaxe ODSQL invalide, et masquait l'échec derrière des DAE fictifs. Aucun
// DAE n'est jamais inventé : en cas d'indisponibilité, `degraded` + liste vide
// (la route répond 503 et l'UI affiche « appelez le 15 / 112 »).

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
  etatFonctionnement?: string;
  distance?: number;
}

export const DAE_SOURCE = 'OpenStreetMap (données contributives, ODbL)';
export const DAE_ATTRIBUTION = '© les contributeurs OpenStreetMap';

const DATASET_URL =
  'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-defibrillator/records';
const UPSTREAM_PAGE_SIZE = 100; // maximum autorisé par l'API Explore v2.1

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Convertit un enregistrement OpenDataSoft en DAE ; null si sans position. */
export function toDefibrillateur(
  record: OpenDataSoftDAERecord,
  origin: { lat: number; lon: number }
): Defibrillateur | null {
  const point = record.meta_geo_point ?? record.geo_point_2d;
  const lat = typeof point?.lat === 'number' ? point.lat : record.lat_coor1;
  const lon = typeof point?.lon === 'number' ? point.lon : record.long_coor1;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;

  const adresse = [text(record.adr_num), text(record.adr_voie)].filter(Boolean).join(' ');
  const dispJ = text(record.disp_j);
  const dispH = text(record.disp_h);
  const disponibilite = [dispJ, dispH].filter(Boolean).join(' ') || '24h/24, 7j/7 (déclaré)';
  const accComplement = text(record.acc_complt);
  const acces = text(record.acc) || (text(record.acc_lib).toLowerCase() === 'oui' ? 'Accès libre' : 'Non précisé');

  return {
    id: text(record.meta_osm_id) || text(record.gid) || `${lat},${lon}`,
    nom: text(record.name) || 'Défibrillateur',
    adresse,
    commune: text(record.com_nom) || text(record.meta_name_com),
    codePostal: text(record.com_cp),
    latitude: lat,
    longitude: lon,
    accessibilite: accComplement ? `${acces} — ${accComplement}` : acces,
    disponibilite,
    etatFonctionnement: text(record.etat_fonct) || undefined,
    distance: Math.round(haversineDistance(origin.lat, origin.lon, lat, lon)),
  };
}

/** URL de la requête amont (exportée pour les tests). */
export function buildDaeQueryUrl(lat: number, lon: number, radiusMeters: number): string {
  // Coordonnées arrondies à 3 décimales (~100 m) : sans effet sur un rayon
  // ≥ 100 m, et le cache de données Next (indexé par URL) devient efficace.
  // La distance affichée est calculée avec la position exacte.
  const where = `within_distance(meta_geo_point, geom'POINT(${lon.toFixed(3)} ${lat.toFixed(3)})', ${radiusMeters}m)`;
  return `${DATASET_URL}?where=${encodeURIComponent(where)}&limit=${UPSTREAM_PAGE_SIZE}`;
}

export interface DaeSearch {
  lat: number;
  lon: number;
  radiusMeters: number;
  maxResults: number;
}

export interface DaeResult {
  items: Defibrillateur[];
  totalInRadius: number;
  source: string;
  attribution: string;
  degraded: boolean;
  error?: string;
}

export async function fetchDefibrillateurs(search: DaeSearch): Promise<DaeResult> {
  const origin = { lat: search.lat, lon: search.lon };
  const base = { source: DAE_SOURCE, attribution: DAE_ATTRIBUTION };

  try {
    const response = await fetchWithCircuitBreaker(
      'opendatasoft-dae',
      buildDaeQueryUrl(search.lat, search.lon, search.radiusMeters),
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 3600 },
        timeout: 10000,
      }
    );

    if (!response.ok) {
      console.warn(`API DAE non disponible (HTTP ${response.status})`);
      return { ...base, items: [], totalInRadius: 0, degraded: true, error: `HTTP ${response.status}` };
    }

    const data: OpenDataSoftDAEResponse = await response.json();

    const items = (data.results || [])
      .map((record) => toDefibrillateur(record, origin))
      .filter((d): d is Defibrillateur => d !== null && (d.distance ?? 0) <= search.radiusMeters)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, search.maxResults);

    return { ...base, items, totalInRadius: data.total_count ?? items.length, degraded: false };
  } catch (error) {
    console.error('Erreur source défibrillateurs:', error);
    return { ...base, items: [], totalInRadius: 0, degraded: true, error: 'exception' };
  }
}
