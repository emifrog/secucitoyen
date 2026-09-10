import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import type { VigicruesGeoJSON, VigicruesFeature } from '@/lib/types/api-responses';
import { parseNiveau } from '@/lib/vigicrues-parse';
import { getDepartementNom } from '@/lib/departements';
import { LEVEL_ORDER, type AlertLevel, type SourceResult } from './types';

// Vigilance crues — service officiel Vigicrues (Ministère de la Transition
// écologique) : https://www.vigicrues.gouv.fr/services/v1.1

export const VIGICRUES_SOURCE = 'Vigicrues';
const VIGICRUES_URL = 'https://www.vigicrues.gouv.fr/services/1/InfoVigiCru.geojson';

export interface VigicrueAlert {
  id: string;
  troncon: string;
  niveau: AlertLevel;
  cours_eau: string;
  departement: string;
  departementCode: string;
  dateDebut?: string;
  dateFin?: string;
}

// Cache mémoire : le GeoJSON fait ~3 Mo (trop gros pour le cache Next), on ne
// conserve que les tronçons en vigilance, 5 min.
let cachedData: { alerts: VigicrueAlert[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

function parseFeatures(features: VigicruesFeature[]): VigicrueAlert[] {
  const alerts: VigicrueAlert[] = [];

  for (const feature of features) {
    const props = feature.properties;
    const niveau = parseNiveau(props.NivSituVigiCruEnt);
    if (niveau === 'vert') continue;

    // Heuristique : les deux premiers caractères du code tronçon
    // (CdEntVigiCru) correspondent en pratique au département. Format réel à
    // confirmer auprès du service ; sans correspondance, le département reste
    // vide et l'alerte n'est jamais diffusée en push (cf. cron).
    const codeTroncon = props.CdEntVigiCru || '';
    const potentialDept = codeTroncon.substring(0, 2);
    const deptName = getDepartementNom(potentialDept);

    alerts.push({
      id: `vigicrues-${codeTroncon}`,
      troncon: props.NomEntVigiCru || 'Tronçon inconnu',
      niveau,
      cours_eau: props.NomCoursEau || props.NomEntVigiCru || 'Cours d\'eau',
      departement: deptName ?? '',
      departementCode: deptName ? potentialDept : '',
    });
  }

  return alerts;
}

async function fetchAllVigicrues(): Promise<VigicrueAlert[]> {
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.alerts;
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
  cachedData = { alerts, timestamp: Date.now() };
  return alerts;
}

function filterAndSort(alerts: VigicrueAlert[], dept: string | null): VigicrueAlert[] {
  const filtered = dept ? alerts.filter((a) => a.departementCode === dept) : [...alerts];
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
    const alerts = await fetchAllVigicrues();
    return {
      items: filterAndSort(alerts, dept),
      totalNational: alerts.length,
      source: VIGICRUES_SOURCE,
      degraded: false,
      updatedAt: new Date().toISOString(),
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
        updatedAt: new Date(cachedData.timestamp).toISOString(),
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
