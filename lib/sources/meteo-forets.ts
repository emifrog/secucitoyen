import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import type { OpenMeteoCurrentResponse } from '@/lib/types/api-responses';
import { DEPARTEMENTS_RISQUE_INCENDIE, type Departement } from '@/lib/departements';
import {
  calculateIFM,
  getNiveau,
  getNiveauNumeric,
  getDescription,
  type ForetNiveau,
} from '@/lib/fire-index';
import type { SourceResult } from './types';

// Risque incendie de forêt : ESTIMATION maison (indice feu météo simplifié,
// calculé à partir de la météo instantanée Open-Meteo). Ce n'est ni le FWI
// canadien ni le produit officiel « Météo des forêts » de Météo-France : la
// source est étiquetée comme non officielle, le niveau est plafonné à orange
// par l'agrégateur et aucune notification push n'est envoyée sur cette base.

export const FIRE_ESTIMATE_SOURCE = 'Estimation SécuCitoyen (non officielle)';
export const FIRE_OFFICIAL_LINK = 'https://meteofrance.com/meteo-des-forets';

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export interface ForetRiskAlert {
  id: string;
  departement: string;
  departementCode: string;
  niveau: ForetNiveau;
  niveauNumeric: number;
  ifm: number; // Indice feu météo simplifié (0-100)
  temperature: number;
  humidite: number;
  vent: number;
  description: string;
}

async function fetchForDepartement(dep: Departement): Promise<ForetRiskAlert | null> {
  const url = `${WEATHER_URL}?latitude=${dep.lat}&longitude=${dep.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=Europe/Paris`;

  const response = await fetchWithCircuitBreaker('open-meteo-forecast', url, {
    next: { revalidate: 1800 },
    timeout: 10000,
  });
  if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);

  const data: OpenMeteoCurrentResponse = await response.json();
  const current = data.current;
  if (!current) throw new Error('Réponse Open-Meteo sans bloc current');

  const temp = current.temperature_2m ?? 20;
  const humidity = current.relative_humidity_2m ?? 50;
  const wind = current.wind_speed_10m ?? 10;
  const precip = current.precipitation ?? 0;

  const ifm = calculateIFM(temp, humidity, wind, precip);
  const niveau = getNiveau(ifm, dep.risqueIncendie ?? 'normale');

  // Ne remonter que les risques modérés ou plus
  if (niveau === 'faible') return null;

  return {
    id: `foret-${dep.code}`,
    departement: dep.nom,
    departementCode: dep.code,
    niveau,
    niveauNumeric: getNiveauNumeric(niveau),
    ifm,
    temperature: Math.round(temp),
    humidite: Math.round(humidity),
    vent: Math.round(wind),
    description: getDescription(niveau),
  };
}

export type MeteoForetsResult = SourceResult<ForetRiskAlert> & { departementsVerifies: number };

/**
 * Estimation du risque incendie pour les départements sensibles (ou un seul
 * si `dept` est fourni). Les départements sont interrogés EN PARALLÈLE ;
 * un échec individuel marque le résultat `degraded` sans bloquer les autres.
 */
export async function fetchMeteoForets(dept: string | null = null): Promise<MeteoForetsResult> {
  const depts = dept
    ? DEPARTEMENTS_RISQUE_INCENDIE.filter((d) => d.code === dept)
    : DEPARTEMENTS_RISQUE_INCENDIE;

  const settled = await Promise.allSettled(depts.map(fetchForDepartement));

  const items: ForetRiskAlert[] = [];
  let failures = 0;
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      if (result.value) items.push(result.value);
    } else {
      failures++;
    }
  }

  items.sort((a, b) => b.niveauNumeric - a.niveauNumeric);

  return {
    items,
    departementsVerifies: depts.length,
    source: FIRE_ESTIMATE_SOURCE,
    degraded: failures > 0,
    error: failures > 0 ? `${failures} département(s) sans donnée météo` : undefined,
    updatedAt: new Date().toISOString(),
  };
}
