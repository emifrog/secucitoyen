import { Alert, AlertLevel, AlertType, alertTypes, getAdviceForAlert } from '@/lib/alertes';
import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import { getDepartementNom } from '@/lib/departements';
import { LEVEL_ORDER, degradedResult, type SourceResult } from './types';

// Vigilance Météo-France — données officielles par département, via
// Opendatasoft (jeu « weatherref-france-vigilance-meteo-departement »).

export const VIGILANCE_SOURCE = 'Météo-France';

const VIGILANCE_DEPT_URL =
  'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/weatherref-france-vigilance-meteo-departement/records';

// Mapping des phénomènes Météo-France
const phenomenonMap: Record<string, AlertType> = {
  'vent': 'vent',
  'vent violent': 'vent',
  'pluie-inondation': 'pluie-inondation',
  'pluie / inondation': 'pluie-inondation',
  'pluie': 'pluie-inondation',
  'orages': 'orages',
  'crues': 'crues',
  'neige-verglas': 'neige-verglas',
  'neige / verglas': 'neige-verglas',
  'canicule': 'canicule',
  'grand-froid': 'grand-froid',
  'grand froid': 'grand-froid',
  'avalanches': 'avalanches',
  'vagues-submersion': 'vagues-submersion',
  'vagues / submersion': 'vagues-submersion',
};

// Mapping des couleurs
const colorMap: Record<string, AlertLevel> = {
  'vert': 'vert',
  'jaune': 'jaune',
  'orange': 'orange',
  'rouge': 'rouge',
};

export interface DeptVigilanceResponse {
  total_count: number;
  results: DeptVigilanceRecord[];
}

export interface DeptVigilanceRecord {
  domain_id: string;
  echeance: string;
  phenomenon_id: number;
  phenomenon: string;
  color_id: number;
  color: string;
  begin_time: string;
  end_time: string;
  product_datetime: string;
}

/**
 * Convertit les enregistrements Opendatasoft en alertes normalisées.
 * Exportée pour être testable indépendamment du réseau.
 */
export function parseVigilanceData(data: DeptVigilanceResponse): Alert[] {
  const alerts: Alert[] = [];

  for (const record of data.results ?? []) {
    // Exclure les entrées nationales (FRA) pour éviter les doublons
    if (record.domain_id === 'FRA') continue;

    const type = phenomenonMap[(record.phenomenon ?? '').toLowerCase()];
    const level = colorMap[(record.color ?? '').toLowerCase()];
    if (!type || !level || level === 'vert') continue;

    const typeInfo = alertTypes.find((t) => t.type === type);
    const deptName = getDepartementNom(record.domain_id) || record.domain_id;

    alerts.push({
      id: `${record.domain_id}-${type}-${record.echeance}`,
      type,
      level,
      title: `Vigilance ${level} ${typeInfo?.name || record.phenomenon}`,
      description: typeInfo?.description || '',
      department: deptName,
      departmentCode: record.domain_id,
      startDate: record.begin_time,
      endDate: record.end_time,
      updatedAt: record.product_datetime,
      source: VIGILANCE_SOURCE,
      advice: getAdviceForAlert(type, level),
    });
  }

  // Trier par niveau (rouge > orange > jaune) puis par département
  alerts.sort((a, b) => {
    const levelDiff = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
    if (levelDiff !== 0) return levelDiff;
    return (a.department || '').localeCompare(b.department || '');
  });

  return alerts;
}

export interface VigilanceOptions {
  /** Code département déjà validé (sanitizeDepartmentCode) ou null = national. */
  dept?: string | null;
  /** 'orange' : ne rapatrier que orange/rouge (cron), 'jaune' par défaut. */
  minLevel?: 'jaune' | 'orange';
}

export type VigilanceResult = SourceResult<Alert> & { count?: number };

/**
 * Vigilances en cours. En cas d'échec : liste vide + `degraded` (jamais de
 * données simulées).
 */
export async function fetchVigilance(opts: VigilanceOptions = {}): Promise<VigilanceResult> {
  const { dept = null, minLevel = 'jaune' } = opts;

  // `dept` est validé en amont (^\d{2}|2[AB]|97[1-6]$), ce qui exclut toute
  // injection ODSQL dans la clause where.
  let whereClause = minLevel === 'orange' ? 'color_id>2' : 'color_id>1';
  if (dept) whereClause += ` AND domain_id='${dept}'`;
  const apiUrl = `${VIGILANCE_DEPT_URL}?limit=100&where=${encodeURIComponent(whereClause)}`;

  try {
    const response = await fetchWithCircuitBreaker('meteo-france', apiUrl, {
      headers: { 'User-Agent': 'SécuCitoyen PWA' },
      next: { revalidate: 300 },
      timeout: 10000,
    });

    if (!response.ok) {
      return degradedResult(VIGILANCE_SOURCE, `Vigilance Météo-France indisponible (HTTP ${response.status})`);
    }

    const data: DeptVigilanceResponse = await response.json();
    return {
      items: parseVigilanceData(data),
      source: VIGILANCE_SOURCE,
      degraded: false,
      updatedAt: new Date().toISOString(),
      count: data.total_count,
    };
  } catch (error) {
    console.error('Erreur source vigilance:', error);
    return degradedResult(VIGILANCE_SOURCE, 'Vigilance Météo-France indisponible');
  }
}
