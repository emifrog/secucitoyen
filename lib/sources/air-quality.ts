import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import { getDepartement } from '@/lib/departements';
import type { AlertLevel, SourceResult } from './types';

// Qualité de l'air : indice européen (EAQI) modélisé CAMS, servi par Open-Meteo
// (gratuit, sans clé). Ce n'est pas une alerte officielle ATMO/préfectorale.

export const AIR_QUALITY_SOURCE = 'Open-Meteo Air Quality';

const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

interface AirQualityResponse {
  current: {
    time: string;
    european_aqi: number;
    pm10: number;
    pm2_5: number;
    nitrogen_dioxide: number;
    ozone: number;
  };
}

export interface AirQualityAlert {
  id: string;
  type: 'pollution';
  level: AlertLevel;
  title: string;
  description: string;
  aqi: number;
  pm10: number;
  pm25: number;
  no2: number;
  o3: number;
  department?: string;
  departmentCode?: string;
  updatedAt: string;
  source: string;
  advice: string[];
}

/**
 * Niveau de couleur selon les bandes de l'indice européen de qualité de l'air
 * (0-20 bon, 20-40 moyen, 40-60 dégradé, 60-80 mauvais, 80-100 très mauvais,
 * > 100 extrêmement mauvais). Les anciens seuils (50/100/150) étaient ceux de
 * l'échelle US AQI et sous-estimaient systématiquement la gravité.
 */
export function getAqiLevel(aqi: number): AlertLevel {
  if (aqi <= 40) return 'vert';
  if (aqi <= 60) return 'jaune';
  if (aqi <= 80) return 'orange';
  return 'rouge';
}

export function getAqiDescription(aqi: number): string {
  if (aqi <= 20) return 'Excellente qualité de l\'air';
  if (aqi <= 40) return 'Bonne qualité de l\'air';
  if (aqi <= 60) return 'Qualité de l\'air dégradée';
  if (aqi <= 80) return 'Mauvaise qualité de l\'air';
  if (aqi <= 100) return 'Très mauvaise qualité de l\'air';
  return 'Qualité de l\'air extrêmement mauvaise';
}

export function getAqiAdvice(level: AlertLevel): string[] {
  switch (level) {
    case 'vert':
      return ['Qualité de l\'air satisfaisante', 'Aucune précaution particulière'];
    case 'jaune':
      return [
        'Personnes sensibles : limitez les efforts prolongés',
        'Privilégiez les activités intérieures si gêne respiratoire',
      ];
    case 'orange':
      return [
        'Évitez les efforts intenses en extérieur',
        'Personnes sensibles : restez à l\'intérieur',
        'Limitez l\'usage de la voiture',
        'Ne faites pas de feu de cheminée',
      ];
    case 'rouge':
      return [
        'Restez à l\'intérieur autant que possible',
        'Reportez tous les efforts physiques',
        'Fermez les fenêtres aux heures de pointe',
        'Consultez un médecin si gêne respiratoire',
        'Respectez les restrictions de circulation',
      ];
  }
}

export interface AirQualityOptions {
  lat?: number;
  lon?: number;
  /** Code département déjà validé. */
  dept?: string | null;
}

export interface AirQualityResult extends SourceResult<AirQualityAlert> {
  alert: AirQualityAlert | null;
  current?: {
    aqi: number;
    level: AlertLevel;
    description: string;
    pm10: number;
    pm25: number;
    no2: number;
    o3: number;
  };
}

function emptyResult(extra: Partial<AirQualityResult> = {}): AirQualityResult {
  return {
    items: [],
    alert: null,
    source: AIR_QUALITY_SOURCE,
    degraded: false,
    updatedAt: new Date().toISOString(),
    ...extra,
  };
}

/**
 * Qualité de l'air à un point (lat/lon) ou au point de référence d'un
 * département. Sans point exploitable (département inconnu, aucune
 * coordonnée) : aucune donnée — on ne retombe plus sur Paris par défaut.
 */
export async function fetchAirQuality(opts: AirQualityOptions = {}): Promise<AirQualityResult> {
  let latitude: number;
  let longitude: number;
  let deptName = '';
  let deptCode = '';

  if (Number.isFinite(opts.lat) && Number.isFinite(opts.lon)) {
    latitude = opts.lat as number;
    longitude = opts.lon as number;
  } else {
    const dep = getDepartement(opts.dept);
    if (!dep) return emptyResult();
    latitude = dep.lat;
    longitude = dep.lon;
    deptName = dep.nom;
    deptCode = dep.code;
  }

  // Arrondi à 2 décimales (~1 km) : la donnée est modélisée à cette échelle et
  // le cache de données Next est indexé par URL.
  const lat = latitude.toFixed(2);
  const lon = longitude.toFixed(2);

  try {
    const response = await fetchWithCircuitBreaker(
      'open-meteo-air',
      `${AIR_QUALITY_URL}?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone`,
      {
        headers: { 'User-Agent': 'SécuCitoyen PWA' },
        next: { revalidate: 1800 },
        timeout: 10000,
      }
    );

    if (!response.ok) {
      return emptyResult({ degraded: true, error: `Qualité de l'air indisponible (HTTP ${response.status})` });
    }

    const data: AirQualityResponse = await response.json();
    const aqi = data.current?.european_aqi;
    if (!Number.isFinite(aqi)) {
      return emptyResult({ degraded: true, error: 'Réponse qualité de l\'air invalide' });
    }

    const level = getAqiLevel(aqi);
    const current = {
      aqi,
      level,
      description: getAqiDescription(aqi),
      pm10: data.current.pm10,
      pm25: data.current.pm2_5,
      no2: data.current.nitrogen_dioxide,
      o3: data.current.ozone,
    };

    // Ne créer une alerte que si niveau > vert
    const alert: AirQualityAlert | null =
      level === 'vert'
        ? null
        : {
            id: `pollution-${deptCode || 'loc'}`,
            type: 'pollution',
            level,
            title: `Pollution - ${getAqiDescription(aqi)}`,
            description: `Indice européen de qualité de l'air : ${aqi}`,
            aqi,
            pm10: data.current.pm10,
            pm25: data.current.pm2_5,
            no2: data.current.nitrogen_dioxide,
            o3: data.current.ozone,
            department: deptName,
            departmentCode: deptCode,
            updatedAt: data.current.time,
            source: AIR_QUALITY_SOURCE,
            advice: getAqiAdvice(level),
          };

    return {
      items: alert ? [alert] : [],
      alert,
      current,
      source: AIR_QUALITY_SOURCE,
      degraded: false,
      updatedAt: data.current.time,
    };
  } catch (error) {
    console.error('Erreur source qualité air:', error);
    return emptyResult({ degraded: true, error: 'Qualité de l\'air indisponible' });
  }
}
