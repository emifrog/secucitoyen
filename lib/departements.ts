/**
 * Source unique des départements français (métropole + Corse + DROM).
 *
 * Remplace les cinq tables recopiées dans le sélecteur, la vigilance,
 * Vigicrues, la qualité de l'air et la géolocalisation, qui divergeaient
 * (coordonnées différentes pour un même département, DROM absents).
 *
 * `lat`/`lon` : point de référence du département (préfecture, ou centroïde
 * géométrique pour la petite couronne parisienne où la préfecture est
 * excentrée). Utilisé pour les requêtes météo par département et comme
 * repli « département le plus proche » quand le géocodage inverse est
 * indisponible — ce repli est une ESTIMATION et doit être présenté comme tel.
 *
 * `risqueIncendie` : sensibilité aux feux de forêt (départements suivis par
 * l'estimation d'indice feu), reprise de l'ancienne table de meteo-forets.
 */

export type SensibiliteIncendie = 'haute' | 'moyenne';

export interface Departement {
  code: string;
  nom: string;
  lat: number;
  lon: number;
  risqueIncendie?: SensibiliteIncendie;
}

export const DEPARTEMENTS: readonly Departement[] = [
  { code: '01', nom: 'Ain', lat: 46.2052, lon: 5.2255 },
  { code: '02', nom: 'Aisne', lat: 49.5641, lon: 3.6199 },
  { code: '03', nom: 'Allier', lat: 46.5647, lon: 3.3325 },
  { code: '04', nom: 'Alpes-de-Haute-Provence', lat: 44.0921, lon: 6.2359, risqueIncendie: 'haute' },
  { code: '05', nom: 'Hautes-Alpes', lat: 44.5594, lon: 6.0786, risqueIncendie: 'moyenne' },
  { code: '06', nom: 'Alpes-Maritimes', lat: 43.7102, lon: 7.262, risqueIncendie: 'haute' },
  { code: '07', nom: 'Ardèche', lat: 44.7355, lon: 4.5992, risqueIncendie: 'moyenne' },
  { code: '08', nom: 'Ardennes', lat: 49.7735, lon: 4.72 },
  { code: '09', nom: 'Ariège', lat: 42.9656, lon: 1.6053 },
  { code: '10', nom: 'Aube', lat: 48.2973, lon: 4.0744 },
  { code: '11', nom: 'Aude', lat: 43.213, lon: 2.3491, risqueIncendie: 'haute' },
  { code: '12', nom: 'Aveyron', lat: 44.3506, lon: 2.575 },
  { code: '13', nom: 'Bouches-du-Rhône', lat: 43.2965, lon: 5.3698, risqueIncendie: 'haute' },
  { code: '14', nom: 'Calvados', lat: 49.1829, lon: -0.3707 },
  { code: '15', nom: 'Cantal', lat: 44.9261, lon: 2.4406 },
  { code: '16', nom: 'Charente', lat: 45.6484, lon: 0.1562 },
  { code: '17', nom: 'Charente-Maritime', lat: 46.1603, lon: -1.1511 },
  { code: '18', nom: 'Cher', lat: 47.081, lon: 2.3988 },
  { code: '19', nom: 'Corrèze', lat: 45.2678, lon: 1.7717 },
  { code: '2A', nom: 'Corse-du-Sud', lat: 41.9192, lon: 8.7386, risqueIncendie: 'haute' },
  { code: '2B', nom: 'Haute-Corse', lat: 42.697, lon: 9.4503, risqueIncendie: 'haute' },
  { code: '21', nom: "Côte-d'Or", lat: 47.322, lon: 5.0415 },
  { code: '22', nom: "Côtes-d'Armor", lat: 48.514, lon: -2.7654 },
  { code: '23', nom: 'Creuse', lat: 46.1711, lon: 1.8714 },
  { code: '24', nom: 'Dordogne', lat: 45.1846, lon: 0.7214 },
  { code: '25', nom: 'Doubs', lat: 47.2378, lon: 6.0241 },
  { code: '26', nom: 'Drôme', lat: 44.9334, lon: 4.8924, risqueIncendie: 'moyenne' },
  { code: '27', nom: 'Eure', lat: 49.0241, lon: 1.1508 },
  { code: '28', nom: 'Eure-et-Loir', lat: 48.4439, lon: 1.489 },
  { code: '29', nom: 'Finistère', lat: 47.996, lon: -4.1024 },
  { code: '30', nom: 'Gard', lat: 43.8367, lon: 4.3601, risqueIncendie: 'haute' },
  { code: '31', nom: 'Haute-Garonne', lat: 43.6047, lon: 1.4442 },
  { code: '32', nom: 'Gers', lat: 43.6465, lon: 0.5855 },
  { code: '33', nom: 'Gironde', lat: 44.8378, lon: -0.5792, risqueIncendie: 'haute' },
  { code: '34', nom: 'Hérault', lat: 43.6108, lon: 3.8767, risqueIncendie: 'haute' },
  { code: '35', nom: 'Ille-et-Vilaine', lat: 48.1173, lon: -1.6778 },
  { code: '36', nom: 'Indre', lat: 46.8103, lon: 1.6913 },
  { code: '37', nom: 'Indre-et-Loire', lat: 47.3941, lon: 0.6848 },
  { code: '38', nom: 'Isère', lat: 45.1885, lon: 5.7245 },
  { code: '39', nom: 'Jura', lat: 46.6745, lon: 5.5548 },
  { code: '40', nom: 'Landes', lat: 43.8902, lon: -0.4995, risqueIncendie: 'haute' },
  { code: '41', nom: 'Loir-et-Cher', lat: 47.5861, lon: 1.3359 },
  { code: '42', nom: 'Loire', lat: 45.4397, lon: 4.3872 },
  { code: '43', nom: 'Haute-Loire', lat: 45.0433, lon: 3.885 },
  { code: '44', nom: 'Loire-Atlantique', lat: 47.2184, lon: -1.5536 },
  { code: '45', nom: 'Loiret', lat: 47.9029, lon: 1.9093 },
  { code: '46', nom: 'Lot', lat: 44.4475, lon: 1.4419 },
  { code: '47', nom: 'Lot-et-Garonne', lat: 44.2033, lon: 0.6163 },
  { code: '48', nom: 'Lozère', lat: 44.518, lon: 3.5008 },
  { code: '49', nom: 'Maine-et-Loire', lat: 47.4784, lon: -0.5632 },
  { code: '50', nom: 'Manche', lat: 49.1157, lon: -1.0906 },
  { code: '51', nom: 'Marne', lat: 48.9566, lon: 4.3631 },
  { code: '52', nom: 'Haute-Marne', lat: 48.1111, lon: 5.139 },
  { code: '53', nom: 'Mayenne', lat: 48.0704, lon: -0.7708 },
  { code: '54', nom: 'Meurthe-et-Moselle', lat: 48.6921, lon: 6.1844 },
  { code: '55', nom: 'Meuse', lat: 48.7728, lon: 5.161 },
  { code: '56', nom: 'Morbihan', lat: 47.6582, lon: -2.7608 },
  { code: '57', nom: 'Moselle', lat: 49.1193, lon: 6.1757 },
  { code: '58', nom: 'Nièvre', lat: 46.9896, lon: 3.159 },
  { code: '59', nom: 'Nord', lat: 50.6292, lon: 3.0573 },
  { code: '60', nom: 'Oise', lat: 49.4295, lon: 2.0807 },
  { code: '61', nom: 'Orne', lat: 48.4329, lon: 0.0918 },
  { code: '62', nom: 'Pas-de-Calais', lat: 50.291, lon: 2.7775 },
  { code: '63', nom: 'Puy-de-Dôme', lat: 45.7772, lon: 3.087 },
  { code: '64', nom: 'Pyrénées-Atlantiques', lat: 43.2951, lon: -0.3708 },
  { code: '65', nom: 'Hautes-Pyrénées', lat: 43.2328, lon: 0.0781 },
  { code: '66', nom: 'Pyrénées-Orientales', lat: 42.6887, lon: 2.8948, risqueIncendie: 'haute' },
  { code: '67', nom: 'Bas-Rhin', lat: 48.5734, lon: 7.7521 },
  { code: '68', nom: 'Haut-Rhin', lat: 48.0794, lon: 7.3585 },
  { code: '69', nom: 'Rhône', lat: 45.764, lon: 4.8357 },
  { code: '70', nom: 'Haute-Saône', lat: 47.6197, lon: 6.1545 },
  { code: '71', nom: 'Saône-et-Loire', lat: 46.3069, lon: 4.8286 },
  { code: '72', nom: 'Sarthe', lat: 48.0061, lon: 0.1996 },
  { code: '73', nom: 'Savoie', lat: 45.5646, lon: 5.9178 },
  { code: '74', nom: 'Haute-Savoie', lat: 45.8992, lon: 6.1294 },
  { code: '75', nom: 'Paris', lat: 48.8566, lon: 2.3522 },
  { code: '76', nom: 'Seine-Maritime', lat: 49.4431, lon: 1.0993 },
  { code: '77', nom: 'Seine-et-Marne', lat: 48.5421, lon: 2.6554 },
  { code: '78', nom: 'Yvelines', lat: 48.8049, lon: 2.1204 },
  { code: '79', nom: 'Deux-Sèvres', lat: 46.3237, lon: -0.4648 },
  { code: '80', nom: 'Somme', lat: 49.8941, lon: 2.2958 },
  { code: '81', nom: 'Tarn', lat: 43.9289, lon: 2.1464 },
  { code: '82', nom: 'Tarn-et-Garonne', lat: 44.0176, lon: 1.355 },
  { code: '83', nom: 'Var', lat: 43.1242, lon: 5.928, risqueIncendie: 'haute' },
  { code: '84', nom: 'Vaucluse', lat: 43.9493, lon: 4.8055, risqueIncendie: 'haute' },
  { code: '85', nom: 'Vendée', lat: 46.6705, lon: -1.426 },
  { code: '86', nom: 'Vienne', lat: 46.5802, lon: 0.3404 },
  { code: '87', nom: 'Haute-Vienne', lat: 45.8336, lon: 1.2611 },
  { code: '88', nom: 'Vosges', lat: 48.1724, lon: 6.4494 },
  { code: '89', nom: 'Yonne', lat: 47.7982, lon: 3.5673 },
  { code: '90', nom: 'Territoire de Belfort', lat: 47.6379, lon: 6.8628 },
  { code: '91', nom: 'Essonne', lat: 48.6238, lon: 2.4296 },
  // Petite couronne : centroïdes géométriques (préfectures excentrées).
  { code: '92', nom: 'Hauts-de-Seine', lat: 48.84, lon: 2.24 },
  { code: '93', nom: 'Seine-Saint-Denis', lat: 48.92, lon: 2.48 },
  { code: '94', nom: 'Val-de-Marne', lat: 48.78, lon: 2.47 },
  { code: '95', nom: "Val-d'Oise", lat: 49.0364, lon: 2.0761 },
  // Départements et régions d'outre-mer.
  { code: '971', nom: 'Guadeloupe', lat: 16.2405, lon: -61.5331 },
  { code: '972', nom: 'Martinique', lat: 14.6161, lon: -61.0588 },
  { code: '973', nom: 'Guyane', lat: 4.9224, lon: -52.3135 },
  { code: '974', nom: 'La Réunion', lat: -20.8823, lon: 55.4504 },
  { code: '976', nom: 'Mayotte', lat: -12.7806, lon: 45.2278 },
];

const BY_CODE: ReadonlyMap<string, Departement> = new Map(DEPARTEMENTS.map((d) => [d.code, d]));

export function getDepartement(code: string | null | undefined): Departement | undefined {
  if (!code) return undefined;
  return BY_CODE.get(code.toUpperCase());
}

export function getDepartementNom(code: string | null | undefined): string | undefined {
  return getDepartement(code)?.nom;
}

/** Départements suivis par l'estimation de risque incendie. */
export const DEPARTEMENTS_RISQUE_INCENDIE: readonly Departement[] = DEPARTEMENTS.filter(
  (d) => d.risqueIncendie !== undefined
);

/** Distance orthodromique en mètres (formule de haversine). */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Département dont le point de référence est le plus proche des coordonnées.
 * ESTIMATION : fiable hors des zones urbaines denses, approximative en
 * petite couronne parisienne. Utiliser le géocodage inverse (/api/geocode)
 * en priorité ; ceci n'est que le repli hors-ligne.
 */
export function findNearestDepartement(lat: number, lon: number): Departement {
  let best = DEPARTEMENTS[0];
  let bestDistance = Infinity;
  for (const d of DEPARTEMENTS) {
    const distance = haversineDistance(lat, lon, d.lat, d.lon);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = d;
    }
  }
  return best;
}
