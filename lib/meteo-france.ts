import { Alert, AlertLevel, AlertType, alertTypes, getAdviceForAlert } from './alertes';

// Configuration API Météo-France
// L'API publique de vigilance est accessible sans clé
const METEO_FRANCE_API = 'https://vigilance.meteofrance.fr/data/vigilance.json';

interface MeteoFranceVigilance {
  product: {
    update_time: string;
  };
  domain_ids: {
    id: string;
    domain: {
      domain_id: string;
      max_color_id: number;
      phenomenon_ids: {
        phenomenon_id: number;
        color_id: number;
      }[];
    };
  }[];
}

// Mapping des phénomènes Météo-France
const phenomenonMap: Record<number, AlertType> = {
  1: 'vent',
  2: 'pluie-inondation',
  3: 'orages',
  4: 'crues',
  5: 'neige-verglas',
  6: 'canicule',
  7: 'grand-froid',
  8: 'avalanches',
  9: 'vagues-submersion',
};

// Mapping des couleurs
const colorMap: Record<number, AlertLevel> = {
  1: 'vert',
  2: 'jaune',
  3: 'orange',
  4: 'rouge',
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
  '94': 'Val-de-Marne', '95': 'Val-d\'Oise',
  '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane',
  '974': 'La Réunion', '976': 'Mayotte',
};

export async function fetchVigilanceAlerts(): Promise<Alert[]> {
  try {
    const response = await fetch(METEO_FRANCE_API, {
      next: { revalidate: 300 }, // Cache 5 minutes
    });

    if (!response.ok) {
      throw new Error('Erreur API Météo-France');
    }

    const data: MeteoFranceVigilance = await response.json();
    const alerts: Alert[] = [];

    for (const domain of data.domain_ids) {
      const deptCode = domain.domain.domain_id;
      const deptName = departmentNames[deptCode] || deptCode;

      for (const phenomenon of domain.domain.phenomenon_ids) {
        const level = colorMap[phenomenon.color_id];
        const type = phenomenonMap[phenomenon.phenomenon_id];

        // Ne garder que les alertes jaune, orange, rouge
        if (level && level !== 'vert' && type) {
          const typeInfo = alertTypes.find((t) => t.type === type);

          alerts.push({
            id: `${deptCode}-${type}`,
            type,
            level,
            title: `Vigilance ${level} ${typeInfo?.name || type}`,
            description: typeInfo?.description || '',
            department: deptName,
            departmentCode: deptCode,
            startDate: data.product.update_time,
            updatedAt: data.product.update_time,
            source: 'Météo-France',
            advice: getAdviceForAlert(type, level),
          });
        }
      }
    }

    return alerts;
  } catch (error) {
    console.error('Erreur fetch vigilance:', error);
    return [];
  }
}

// Fonction pour obtenir la vigilance d'un département
export async function getVigilanceByDepartment(deptCode: string): Promise<Alert[]> {
  const allAlerts = await fetchVigilanceAlerts();
  return allAlerts.filter((a) => a.departmentCode === deptCode);
}

// Fonction pour obtenir les alertes les plus graves (orange et rouge)
export async function getSevereAlerts(): Promise<Alert[]> {
  const allAlerts = await fetchVigilanceAlerts();
  return allAlerts.filter((a) => a.level === 'orange' || a.level === 'rouge');
}
