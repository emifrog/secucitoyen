import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import type { VigicruesGeoJSON, VigicruesFeature } from '@/lib/types/api-responses';
import { parseNiveau } from '@/lib/vigicrues-parse';
import { getDepartementNom } from '@/lib/departements';
import { LEVEL_ORDER, type AlertLevel, type SourceResult } from './types';
import tronconsData from '@/lib/data/vigicrues-troncons.json';

// Vigilance crues — service officiel Vigicrues (Ministère de la Transition
// écologique) : https://www.vigicrues.gouv.fr/services/1/InfoVigiCru.geojson

export const VIGICRUES_SOURCE = 'Vigicrues';
const VIGICRUES_URL = 'https://www.vigicrues.gouv.fr/services/1/InfoVigiCru.geojson';

/**
 * Départements traversés par chaque tronçon, dérivés de la géométrie officielle
 * (`scripts/build-vigicrues-departements.mjs`). Le GeoJSON ne porte aucun code
 * département et les codes de tronçon sont des acronymes de territoire
 * (« CO1 », « ML101 »…) : il n'existe aucun moyen de les deviner.
 */
const TRONCONS: Record<string, { nom: string; departements: string[] }> = tronconsData.troncons;

export interface VigicrueAlert {
  id: string;
  troncon: string;
  niveau: AlertLevel;
  cours_eau: string;
  /** Tous les départements traversés par le tronçon (vide si code inconnu). */
  departements: string[];
  /** Premier département traversé, pour un affichage simple. */
  departementCode: string;
  departement: string;
  dateDebut?: string;
  dateFin?: string;
}

// Cache mémoire : le GeoJSON fait ~3 Mo (trop gros pour le cache Next), on ne
// conserve que les tronçons en vigilance, 5 min.
let cachedData: { alerts: VigicrueAlert[]; bulletin?: string; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

function parseFeatures(features: VigicruesFeature[]): VigicrueAlert[] {
  const alerts: VigicrueAlert[] = [];

  for (const feature of features) {
    const props = feature.properties;

    // Le GeoJSON en service nomme ses champs `NivInfViCr` / `CdEntCru` /
    // `lbentcru` ; l'API v1.1 documentée utilise `NivSituVigiCruEnt` /
    // `CdEntVigiCru` / `NomEntVigiCru`. On accepte les deux pour ne pas
    // dépendre du millésime du service (un nom inconnu ferait silencieusement
    // disparaître toutes les crues).
    const niveauBrut = props.NivInfViCr ?? props.NivSituVigiCruEnt;
    if (niveauBrut === undefined || niveauBrut === null) continue;

    const niveau = parseNiveau(niveauBrut);
    if (niveau === 'vert') continue;

    const code = String(props.CdEntCru ?? props.CdEntVigiCru ?? '');
    if (!code) continue;

    const nom = props.lbentcru ?? props.NomEntVigiCru ?? TRONCONS[code]?.nom ?? code;
    const departements = TRONCONS[code]?.departements ?? [];
    const principal = departements[0] ?? '';

    alerts.push({
      id: `vigicrues-${code}`,
      troncon: nom,
      niveau,
      cours_eau: props.NomCoursEau ?? nom,
      departements,
      departementCode: principal,
      departement: principal ? getDepartementNom(principal) ?? '' : '',
    });
  }

  return alerts;
}

async function fetchAllVigicrues(): Promise<{ alerts: VigicrueAlert[]; bulletin?: string }> {
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return { alerts: cachedData.alerts, bulletin: cachedData.bulletin };
  }

  const response = await fetchWithCircuitBreaker('vigicrues', VIGICRUES_URL, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    timeout: 15000, // fichier ~3 Mo
  });

  if (!response.ok) {
    throw new Error(`Vigicrues API error: ${response.status}`);
  }

  const data: VigicruesGeoJSON = await response.json();
  const alerts = parseFeatures(data.features || []);
  const bulletin = data.DtHrInfoVigiCru;
  cachedData = { alerts, bulletin, timestamp: Date.now() };
  return { alerts, bulletin };
}

function filterAndSort(alerts: VigicrueAlert[], dept: string | null): VigicrueAlert[] {
  // Un tronçon traverse souvent plusieurs départements (127 sur 337) : on teste
  // la liste complète, pas seulement le premier.
  const filtered = dept ? alerts.filter((a) => a.departements.includes(dept)) : [...alerts];
  filtered.sort((a, b) => LEVEL_ORDER[a.niveau] - LEVEL_ORDER[b.niveau]);
  return filtered;
}

export type VigicruesResult = SourceResult<VigicrueAlert> & { totalNational: number };

/**
 * Tronçons en vigilance crues (jaune à rouge), filtrés par département si
 * demandé. En cas d'échec, le dernier cache mémoire (même expiré) est servi
 * avec `cached: true` et `degraded: true` ; sinon liste vide.
 */
export async function fetchVigicrues(dept: string | null = null): Promise<VigicruesResult> {
  try {
    const { alerts, bulletin } = await fetchAllVigicrues();
    return {
      items: filterAndSort(alerts, dept),
      totalNational: alerts.length,
      source: VIGICRUES_SOURCE,
      degraded: false,
      updatedAt: bulletin ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error('Erreur source Vigicrues:', error);

    if (cachedData) {
      return {
        items: filterAndSort(cachedData.alerts, dept),
        totalNational: cachedData.alerts.length,
        source: VIGICRUES_SOURCE,
        degraded: true,
        cached: true,
        error: 'Service Vigicrues indisponible, dernières données connues',
        updatedAt: cachedData.bulletin ?? new Date(cachedData.timestamp).toISOString(),
      };
    }

    return {
      items: [],
      totalNational: 0,
      source: VIGICRUES_SOURCE,
      degraded: true,
      error: 'Service Vigicrues temporairement indisponible',
      updatedAt: new Date().toISOString(),
    };
  }
}
