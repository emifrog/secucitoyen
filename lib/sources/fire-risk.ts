import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import type { OpenMeteoCurrentResponse } from '@/lib/types/api-responses';
import { DEPARTEMENTS_RISQUE_INCENDIE, getDepartement } from '@/lib/departements';
import { FIRE_ESTIMATE_SOURCE } from './meteo-forets';
import { LEVEL_ORDER, type AlertLevel, type SourceResult } from './types';

// Estimation ponctuelle du risque incendie à partir de la météo instantanée
// (température, humidité, vent). Même avertissement que meteo-forets : c'est
// une ESTIMATION non officielle, plafonnée à orange (jamais rouge, jamais de
// push). Utilisée pour un point GPS précis ; par département, préférer
// fetchMeteoForets.

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export interface FireRiskAlert {
  id: string;
  type: 'feux-foret';
  level: AlertLevel;
  title: string;
  description: string;
  fwi: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  department?: string;
  departmentCode?: string;
  updatedAt: string;
  source: string;
  advice: string[];
}

/**
 * Score 0-100 et niveau, plafonné à orange : un score maison ne justifie
 * jamais une alerte rouge (réservée aux vigilances officielles).
 */
export function calculateFireRiskLevel(
  temp: number,
  humidity: number,
  windSpeed: number
): { level: AlertLevel; fwi: number } {
  let fwi = 0;

  if (temp > 35) fwi += 40;
  else if (temp > 30) fwi += 30;
  else if (temp > 25) fwi += 20;
  else if (temp > 20) fwi += 10;

  if (humidity < 20) fwi += 40;
  else if (humidity < 30) fwi += 30;
  else if (humidity < 40) fwi += 20;
  else if (humidity < 50) fwi += 10;

  if (windSpeed > 60) fwi += 30;
  else if (windSpeed > 40) fwi += 20;
  else if (windSpeed > 25) fwi += 10;

  let level: AlertLevel;
  if (fwi >= 50) level = 'orange';
  else if (fwi >= 30) level = 'jaune';
  else level = 'vert';

  return { level, fwi };
}

export function getFireAdvice(level: AlertLevel): string[] {
  switch (level) {
    case 'vert':
      return ['Risque faible', 'Restez vigilant en zone forestière'];
    case 'jaune':
      return [
        'Soyez prudent en forêt',
        'Ne jetez pas de mégots',
        'Évitez les barbecues en zone sensible',
      ];
    case 'orange':
    case 'rouge':
      return [
        'Risque élevé - Évitez les zones forestières',
        'Barbecues et feux interdits',
        'Signalez toute fumée au 18',
        'Ne stationnez pas sur l\'herbe sèche',
        'Respectez les restrictions d\'accès aux massifs',
        'Consultez la Météo des forêts officielle (meteofrance.com)',
      ];
  }
}

async function estimateAt(
  latitude: number,
  longitude: number,
  code: string,
  name: string
): Promise<FireRiskAlert | null> {
  const response = await fetchWithCircuitBreaker(
    'open-meteo-forecast',
    `${WEATHER_URL}?latitude=${latitude.toFixed(2)}&longitude=${longitude.toFixed(2)}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`,
    { next: { revalidate: 3600 }, timeout: 10000 }
  );
  if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`);

  const data: OpenMeteoCurrentResponse = await response.json();
  const temp = data.current.temperature_2m;
  const humidity = data.current.relative_humidity_2m;
  const windSpeed = data.current.wind_speed_10m;
  const { level, fwi } = calculateFireRiskLevel(temp, humidity, windSpeed);

  if (level === 'vert') return null;

  return {
    id: `fire-${code || 'loc'}`,
    type: 'feux-foret',
    level,
    title: `Risque incendie estimé ${level}`,
    description: `Indice de risque feu estimé : ${fwi}/100`,
    fwi,
    temperature: temp,
    humidity,
    windSpeed,
    department: name,
    departmentCode: code,
    updatedAt: data.current.time || new Date().toISOString(),
    source: FIRE_ESTIMATE_SOURCE,
    advice: getFireAdvice(level),
  };
}

export interface FireRiskOptions {
  lat?: number;
  lon?: number;
  /** Code département déjà validé. */
  dept?: string | null;
}

/**
 * - lat/lon : estimation au point donné ;
 * - dept : estimation au point de référence du département (s'il est suivi) ;
 * - sinon : tous les départements sensibles, en parallèle.
 */
export async function fetchFireRisk(opts: FireRiskOptions = {}): Promise<SourceResult<FireRiskAlert>> {
  const now = new Date().toISOString();

  try {
    if (Number.isFinite(opts.lat) && Number.isFinite(opts.lon)) {
      const alert = await estimateAt(opts.lat as number, opts.lon as number, '', '');
      return { items: alert ? [alert] : [], source: FIRE_ESTIMATE_SOURCE, degraded: false, updatedAt: now };
    }

    if (opts.dept) {
      const dep = getDepartement(opts.dept);
      if (!dep || !dep.risqueIncendie) {
        return { items: [], source: FIRE_ESTIMATE_SOURCE, degraded: false, updatedAt: now };
      }
      const alert = await estimateAt(dep.lat, dep.lon, dep.code, dep.nom);
      return { items: alert ? [alert] : [], source: FIRE_ESTIMATE_SOURCE, degraded: false, updatedAt: now };
    }

    const settled = await Promise.allSettled(
      DEPARTEMENTS_RISQUE_INCENDIE.map((d) => estimateAt(d.lat, d.lon, d.code, d.nom))
    );
    const items: FireRiskAlert[] = [];
    let failures = 0;
    for (const r of settled) {
      if (r.status === 'fulfilled') {
        // Vue nationale : ne garder que les alertes significatives
        if (r.value && r.value.level === 'orange') items.push(r.value);
      } else {
        failures++;
      }
    }
    items.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
    return {
      items,
      source: FIRE_ESTIMATE_SOURCE,
      degraded: failures > 0,
      error: failures > 0 ? `${failures} département(s) sans donnée météo` : undefined,
      updatedAt: now,
    };
  } catch (error) {
    console.error('Erreur source risque incendie:', error);
    return {
      items: [],
      source: FIRE_ESTIMATE_SOURCE,
      degraded: true,
      error: 'Estimation du risque incendie indisponible',
      updatedAt: now,
    };
  }
}
