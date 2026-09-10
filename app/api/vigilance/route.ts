import { NextResponse } from 'next/server';
import { Alert, AlertLevel, AlertType, alertTypes, getAdviceForAlert } from '@/lib/alertes';
import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import { sanitizeDepartmentCode } from '@/lib/validation';

// API Opendatasoft - Données officielles Météo-France par département
const VIGILANCE_DEPT_URL = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/weatherref-france-vigilance-meteo-departement/records';

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

// Noms des départements
const departmentNames: Record<string, string> = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
  '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
  '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud',
  '2B': 'Haute-Corse', '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor', '23': 'Creuse',
  '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure',
  '28': 'Eure-et-Loir', '29': 'Finistère', '30': 'Gard', '31': 'Haute-Garonne',
  '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
  '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
  '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
  '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
  '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
  '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
  '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
  '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
  '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
  '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
  '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
  '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne', '95': 'Val-d\'Oise', '99': 'Andorre',
  'FRA': 'France',
};

interface DeptVigilanceResponse {
  total_count: number;
  results: DeptVigilanceRecord[];
}

interface DeptVigilanceRecord {
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

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deptCode = sanitizeDepartmentCode(searchParams.get('dept'));

  try {
    // Construire l'URL avec filtres. `deptCode` est validé (^\d{2}|2[AB]|97[1-6]$)
    // en amont, ce qui exclut toute injection ODSQL dans la clause where.
    let whereClause = 'color_id>1';
    if (deptCode) {
      whereClause += ` AND domain_id='${deptCode}'`;
    }
    const apiUrl = `${VIGILANCE_DEPT_URL}?limit=100&where=${encodeURIComponent(whereClause)}`;

    const response = await fetchWithCircuitBreaker('meteo-france', apiUrl, {
      headers: {
        'User-Agent': 'SécuCitoyen PWA',
      },
      next: { revalidate: 300 },
      timeout: 10000,
    });

    if (!response.ok) {
      return degradedResponse(`Vigilance Météo-France indisponible (HTTP ${response.status})`);
    }

    const data: DeptVigilanceResponse = await response.json();
    const alerts = parseVigilanceData(data);

    return NextResponse.json({
      alerts,
      source: 'Météo-France',
      degraded: false,
      updatedAt: new Date().toISOString(),
      count: data.total_count,
    });
  } catch (error) {
    console.error('Erreur API vigilance:', error);
    return degradedResponse('Vigilance Météo-France indisponible');
  }
}

/**
 * Réponse en cas d'indisponibilité de la source officielle.
 *
 * Aucune alerte n'est jamais fabriquée : une vigilance « simulée » présentée
 * comme réelle peut déclencher une notification push à de vrais abonnés
 * (l'agrégateur /api/alerts et le cron ne distinguaient pas la source).
 * On renvoie une liste vide + `degraded: true`, l'UI affiche une bannière et
 * renvoie vers vigilance.meteofrance.fr.
 */
function degradedResponse(reason: string) {
  return NextResponse.json({
    alerts: [] as Alert[],
    source: 'Météo-France',
    degraded: true,
    error: reason,
    updatedAt: new Date().toISOString(),
  });
}

function parseVigilanceData(data: DeptVigilanceResponse): Alert[] {
  const alerts: Alert[] = [];

  if (data.results) {
    for (const record of data.results) {
      // Exclure les entrées nationales (FRA) pour éviter les doublons
      if (record.domain_id === 'FRA') continue;

      const phenomenonKey = record.phenomenon.toLowerCase();
      const type = phenomenonMap[phenomenonKey];
      const colorKey = record.color.toLowerCase();
      const level = colorMap[colorKey];

      if (type && level && level !== 'vert') {
        const typeInfo = alertTypes.find((t) => t.type === type);
        const deptName = departmentNames[record.domain_id] || record.domain_id;

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
          source: 'Météo-France',
          advice: getAdviceForAlert(type, level),
        });
      }
    }
  }

  // Trier par niveau (rouge > orange > jaune) puis par département
  const levelOrder: Record<AlertLevel, number> = { rouge: 0, orange: 1, jaune: 2, vert: 3 };
  alerts.sort((a, b) => {
    const levelDiff = levelOrder[a.level] - levelOrder[b.level];
    if (levelDiff !== 0) return levelDiff;
    return (a.department || '').localeCompare(b.department || '');
  });

  return alerts;
}
