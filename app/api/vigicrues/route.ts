import { NextResponse } from 'next/server';

// API pour récupérer les vigilances crues depuis Vigicrues
// Source : https://www.vigicrues.gouv.fr/services/v1.1

export interface VigicrueAlert {
  id: string;
  troncon: string;
  niveau: 'vert' | 'jaune' | 'orange' | 'rouge';
  cours_eau: string;
  departement: string;
  departementCode: string;
  dateDebut?: string;
  dateFin?: string;
}

export const dynamic = 'force-dynamic';

// Cache mémoire simple pour éviter les requêtes trop fréquentes
// Le fichier GeoJSON fait ~3Mo, trop gros pour le cache Next.js
let cachedData: { alerts: VigicrueAlert[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

// Mapping des codes département vers noms
const departementNames: Record<string, string> = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
  '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
  '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '21': "Côte-d'Or",
  '22': "Côtes-d'Armor", '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs',
  '26': 'Drôme', '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère',
  '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde',
  '34': 'Hérault', '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire',
  '38': 'Isère', '39': 'Jura', '40': 'Landes', '41': 'Loir-et-Cher',
  '42': 'Loire', '43': 'Haute-Loire', '44': 'Loire-Atlantique', '45': 'Loiret',
  '46': 'Lot', '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire',
  '50': 'Manche', '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne',
  '54': 'Meurthe-et-Moselle', '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle',
  '58': 'Nièvre', '59': 'Nord', '60': 'Oise', '61': 'Orne',
  '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme', '64': 'Pyrénées-Atlantiques',
  '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales', '67': 'Bas-Rhin',
  '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône', '71': 'Saône-et-Loire',
  '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie', '75': 'Paris',
  '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
  '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
  '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne', '95': "Val-d'Oise",
};

// Convertir le niveau de vigilance Vigicrues
function parseNiveau(niveau: number | string): 'vert' | 'jaune' | 'orange' | 'rouge' {
  const n = typeof niveau === 'string' ? parseInt(niveau) : niveau;
  switch (n) {
    case 1: return 'vert';
    case 2: return 'jaune';
    case 3: return 'orange';
    case 4: return 'rouge';
    default: return 'vert';
  }
}

// Fonction pour récupérer et parser les données Vigicrues
async function fetchVigicruesData(): Promise<VigicrueAlert[]> {
  // Vérifier le cache mémoire
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.alerts;
  }

  // Récupérer les vigilances crues en GeoJSON (sans cache Next.js car > 2Mo)
  const response = await fetch(
    'https://www.vigicrues.gouv.fr/services/1/InfoVigiCru.geojson',
    {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store', // Désactiver le cache Next.js (fichier trop gros)
    }
  );

  if (!response.ok) {
    throw new Error(`Vigicrues API error: ${response.status}`);
  }

  const data = await response.json();
  const features = data.features || [];

  // Transformer les données - ne garder que les alertes actives
  const alerts: VigicrueAlert[] = features
    .map((feature: Record<string, unknown>) => {
      const props = feature.properties as Record<string, unknown> || {};
      const niveau = parseNiveau(props.NivSituVigiCruEnt as number);

      // Ne garder que les alertes jaune, orange ou rouge
      if (niveau === 'vert') return null;

      // Extraire le département du code tronçon si possible
      const codeTroncon = String(props.CdEntVigiCru || '');
      const tronconName = String(props.NomEntVigiCru || 'Tronçon inconnu');

      // Essayer de déterminer le département
      let deptCode = '';
      let deptName = '';

      // Le code tronçon peut contenir des infos sur le département
      if (codeTroncon.length >= 2) {
        const potentialDept = codeTroncon.substring(0, 2);
        if (departementNames[potentialDept]) {
          deptCode = potentialDept;
          deptName = departementNames[potentialDept];
        }
      }

      return {
        id: `vigicrues-${codeTroncon}`,
        troncon: tronconName,
        niveau,
        cours_eau: String(props.NomCoursEau || props.NomEntVigiCru || 'Cours d\'eau'),
        departement: deptName,
        departementCode: deptCode,
      };
    })
    .filter((alert: VigicrueAlert | null): alert is VigicrueAlert => alert !== null);

  // Mettre en cache mémoire (léger, uniquement les alertes actives)
  cachedData = { alerts, timestamp: Date.now() };

  return alerts;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dept = searchParams.get('dept');

  try {
    const alerts = await fetchVigicruesData();

    // Filtrer par département si demandé
    let filteredAlerts = alerts;
    if (dept) {
      filteredAlerts = alerts.filter(
        (a) => a.departementCode === dept || a.departement.toLowerCase().includes(dept.toLowerCase())
      );
    }

    // Trier par niveau de gravité
    const niveauOrder = { rouge: 0, orange: 1, jaune: 2, vert: 3 };
    filteredAlerts.sort((a, b) => niveauOrder[a.niveau] - niveauOrder[b.niveau]);

    return NextResponse.json({
      alerts: filteredAlerts,
      count: filteredAlerts.length,
      totalNational: alerts.length,
      source: 'Vigicrues - Ministère de la Transition écologique',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur API Vigicrues:', error);

    // En cas d'erreur, retourner le cache s'il existe (même expiré)
    if (cachedData) {
      const filteredAlerts = dept
        ? cachedData.alerts.filter(
            (a) => a.departementCode === dept || a.departement.toLowerCase().includes(dept.toLowerCase())
          )
        : cachedData.alerts;

      return NextResponse.json({
        alerts: filteredAlerts,
        count: filteredAlerts.length,
        totalNational: cachedData.alerts.length,
        source: 'Vigicrues (cache)',
        cached: true,
        updatedAt: new Date(cachedData.timestamp).toISOString(),
      });
    }

    return NextResponse.json({
      alerts: [],
      count: 0,
      error: 'Service Vigicrues temporairement indisponible',
      source: 'Vigicrues',
      updatedAt: new Date().toISOString(),
    });
  }
}
