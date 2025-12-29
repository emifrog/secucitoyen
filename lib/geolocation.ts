'use client';

// Mapping des coordonnées vers les codes départements
// Basé sur les centres approximatifs des départements
const departmentsBounds: Record<string, { lat: [number, number]; lon: [number, number]; name: string }> = {
  '01': { lat: [45.8, 46.5], lon: [4.7, 5.9], name: 'Ain' },
  '02': { lat: [49.0, 49.8], lon: [3.2, 4.3], name: 'Aisne' },
  '03': { lat: [46.0, 46.8], lon: [2.4, 3.9], name: 'Allier' },
  '04': { lat: [43.7, 44.7], lon: [5.7, 6.9], name: 'Alpes-de-Haute-Provence' },
  '05': { lat: [44.2, 45.1], lon: [5.4, 6.9], name: 'Hautes-Alpes' },
  '06': { lat: [43.5, 44.4], lon: [6.6, 7.7], name: 'Alpes-Maritimes' },
  '07': { lat: [44.3, 45.4], lon: [3.9, 4.9], name: 'Ardèche' },
  '08': { lat: [49.3, 50.2], lon: [4.0, 5.4], name: 'Ardennes' },
  '09': { lat: [42.6, 43.3], lon: [0.8, 2.2], name: 'Ariège' },
  '10': { lat: [47.9, 48.6], lon: [3.4, 4.9], name: 'Aube' },
  '11': { lat: [42.9, 43.5], lon: [1.7, 3.2], name: 'Aude' },
  '12': { lat: [43.8, 44.9], lon: [1.8, 3.5], name: 'Aveyron' },
  '13': { lat: [43.2, 43.9], lon: [4.2, 5.8], name: 'Bouches-du-Rhône' },
  '14': { lat: [48.8, 49.4], lon: [-0.9, 0.4], name: 'Calvados' },
  '15': { lat: [44.6, 45.4], lon: [2.1, 3.3], name: 'Cantal' },
  '16': { lat: [45.4, 46.1], lon: [-0.5, 0.6], name: 'Charente' },
  '17': { lat: [45.2, 46.4], lon: [-1.5, -0.3], name: 'Charente-Maritime' },
  '18': { lat: [46.6, 47.6], lon: [1.8, 3.1], name: 'Cher' },
  '19': { lat: [45.0, 45.7], lon: [1.2, 2.5], name: 'Corrèze' },
  '2A': { lat: [41.3, 42.0], lon: [8.5, 9.4], name: 'Corse-du-Sud' },
  '2B': { lat: [42.0, 43.0], lon: [8.6, 9.6], name: 'Haute-Corse' },
  '21': { lat: [46.9, 47.9], lon: [4.1, 5.5], name: "Côte-d'Or" },
  '22': { lat: [48.2, 48.9], lon: [-3.6, -2.0], name: "Côtes-d'Armor" },
  '23': { lat: [45.8, 46.4], lon: [1.4, 2.6], name: 'Creuse' },
  '24': { lat: [44.5, 45.7], lon: [-0.2, 1.5], name: 'Dordogne' },
  '25': { lat: [46.8, 47.6], lon: [5.7, 7.0], name: 'Doubs' },
  '26': { lat: [44.1, 45.4], lon: [4.6, 5.8], name: 'Drôme' },
  '27': { lat: [48.7, 49.5], lon: [0.3, 1.8], name: 'Eure' },
  '28': { lat: [47.8, 48.7], lon: [0.8, 2.0], name: 'Eure-et-Loir' },
  '29': { lat: [47.8, 48.8], lon: [-5.2, -3.8], name: 'Finistère' },
  '30': { lat: [43.5, 44.5], lon: [3.3, 4.8], name: 'Gard' },
  '31': { lat: [42.9, 43.9], lon: [0.4, 2.0], name: 'Haute-Garonne' },
  '32': { lat: [43.2, 44.1], lon: [-0.3, 1.2], name: 'Gers' },
  '33': { lat: [44.2, 45.6], lon: [-1.3, 0.3], name: 'Gironde' },
  '34': { lat: [43.2, 43.9], lon: [2.5, 4.2], name: 'Hérault' },
  '35': { lat: [47.6, 48.5], lon: [-2.3, -1.0], name: 'Ille-et-Vilaine' },
  '36': { lat: [46.4, 47.2], lon: [0.9, 2.2], name: 'Indre' },
  '37': { lat: [46.7, 47.7], lon: [0.1, 1.4], name: 'Indre-et-Loire' },
  '38': { lat: [44.7, 45.9], lon: [4.7, 6.4], name: 'Isère' },
  '39': { lat: [46.2, 47.1], lon: [5.2, 6.2], name: 'Jura' },
  '40': { lat: [43.5, 44.5], lon: [-1.5, 0.1], name: 'Landes' },
  '41': { lat: [47.0, 48.0], lon: [0.6, 2.2], name: 'Loir-et-Cher' },
  '42': { lat: [45.2, 46.3], lon: [3.7, 4.8], name: 'Loire' },
  '43': { lat: [44.7, 45.4], lon: [3.1, 4.5], name: 'Haute-Loire' },
  '44': { lat: [46.9, 47.8], lon: [-2.6, -1.0], name: 'Loire-Atlantique' },
  '45': { lat: [47.5, 48.3], lon: [1.5, 3.1], name: 'Loiret' },
  '46': { lat: [44.2, 45.1], lon: [1.0, 2.2], name: 'Lot' },
  '47': { lat: [43.8, 44.8], lon: [-0.2, 1.1], name: 'Lot-et-Garonne' },
  '48': { lat: [44.1, 44.9], lon: [2.9, 4.0], name: 'Lozère' },
  '49': { lat: [47.0, 47.8], lon: [-1.4, 0.2], name: 'Maine-et-Loire' },
  '50': { lat: [48.5, 49.7], lon: [-1.9, -0.9], name: 'Manche' },
  '51': { lat: [48.5, 49.4], lon: [3.4, 5.0], name: 'Marne' },
  '52': { lat: [47.6, 48.5], lon: [4.6, 5.9], name: 'Haute-Marne' },
  '53': { lat: [47.7, 48.4], lon: [-1.2, 0.0], name: 'Mayenne' },
  '54': { lat: [48.3, 49.2], lon: [5.4, 7.1], name: 'Meurthe-et-Moselle' },
  '55': { lat: [48.5, 49.6], lon: [4.9, 5.9], name: 'Meuse' },
  '56': { lat: [47.3, 48.0], lon: [-3.7, -2.3], name: 'Morbihan' },
  '57': { lat: [48.6, 49.5], lon: [5.9, 7.6], name: 'Moselle' },
  '58': { lat: [46.7, 47.6], lon: [2.8, 4.2], name: 'Nièvre' },
  '59': { lat: [50.0, 51.1], lon: [2.1, 4.2], name: 'Nord' },
  '60': { lat: [49.1, 49.8], lon: [1.7, 3.2], name: 'Oise' },
  '61': { lat: [48.3, 48.9], lon: [-0.9, 0.8], name: 'Orne' },
  '62': { lat: [50.1, 51.0], lon: [1.6, 3.2], name: 'Pas-de-Calais' },
  '63': { lat: [45.3, 46.3], lon: [2.4, 3.9], name: 'Puy-de-Dôme' },
  '64': { lat: [42.8, 43.6], lon: [-1.8, 0.0], name: 'Pyrénées-Atlantiques' },
  '65': { lat: [42.7, 43.4], lon: [-0.4, 0.6], name: 'Hautes-Pyrénées' },
  '66': { lat: [42.3, 42.9], lon: [1.7, 3.2], name: 'Pyrénées-Orientales' },
  '67': { lat: [48.1, 49.1], lon: [7.0, 8.2], name: 'Bas-Rhin' },
  '68': { lat: [47.4, 48.3], lon: [6.8, 7.6], name: 'Haut-Rhin' },
  '69': { lat: [45.5, 46.3], lon: [4.2, 5.2], name: 'Rhône' },
  '70': { lat: [47.2, 48.0], lon: [5.6, 6.8], name: 'Haute-Saône' },
  '71': { lat: [46.1, 47.2], lon: [3.6, 5.5], name: 'Saône-et-Loire' },
  '72': { lat: [47.5, 48.3], lon: [-0.5, 0.9], name: 'Sarthe' },
  '73': { lat: [45.1, 45.9], lon: [5.6, 7.2], name: 'Savoie' },
  '74': { lat: [45.7, 46.4], lon: [5.8, 7.0], name: 'Haute-Savoie' },
  '75': { lat: [48.8, 48.9], lon: [2.25, 2.42], name: 'Paris' },
  '76': { lat: [49.2, 50.1], lon: [-0.2, 1.8], name: 'Seine-Maritime' },
  '77': { lat: [48.1, 49.1], lon: [2.4, 3.6], name: 'Seine-et-Marne' },
  '78': { lat: [48.4, 49.1], lon: [1.4, 2.2], name: 'Yvelines' },
  '79': { lat: [46.0, 47.1], lon: [-0.9, 0.2], name: 'Deux-Sèvres' },
  '80': { lat: [49.6, 50.4], lon: [1.4, 3.2], name: 'Somme' },
  '81': { lat: [43.4, 44.2], lon: [1.5, 2.9], name: 'Tarn' },
  '82': { lat: [43.8, 44.4], lon: [0.7, 1.9], name: 'Tarn-et-Garonne' },
  '83': { lat: [43.0, 43.8], lon: [5.7, 6.9], name: 'Var' },
  '84': { lat: [43.7, 44.4], lon: [4.6, 5.8], name: 'Vaucluse' },
  '85': { lat: [46.3, 47.1], lon: [-2.4, -0.5], name: 'Vendée' },
  '86': { lat: [46.0, 47.2], lon: [0.0, 1.2], name: 'Vienne' },
  '87': { lat: [45.4, 46.4], lon: [0.6, 1.9], name: 'Haute-Vienne' },
  '88': { lat: [47.8, 48.5], lon: [5.4, 7.2], name: 'Vosges' },
  '89': { lat: [47.3, 48.4], lon: [2.8, 4.3], name: 'Yonne' },
  '90': { lat: [47.4, 47.8], lon: [6.7, 7.1], name: 'Territoire de Belfort' },
  '91': { lat: [48.3, 48.8], lon: [2.0, 2.6], name: 'Essonne' },
  '92': { lat: [48.8, 48.95], lon: [2.15, 2.35], name: 'Hauts-de-Seine' },
  '93': { lat: [48.85, 49.0], lon: [2.3, 2.6], name: 'Seine-Saint-Denis' },
  '94': { lat: [48.7, 48.85], lon: [2.3, 2.6], name: 'Val-de-Marne' },
  '95': { lat: [48.9, 49.3], lon: [1.6, 2.6], name: "Val-d'Oise" },
};

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  departmentCode: string | null;
  departmentName: string | null;
  timestamp: number;
}

const STORAGE_KEY = 'secucitoyen_location';

/**
 * Trouve le département le plus proche pour des coordonnées données
 */
export function findDepartmentFromCoords(lat: number, lon: number): { code: string; name: string } | null {
  let bestMatch: { code: string; name: string; distance: number } | null = null;

  for (const [code, bounds] of Object.entries(departmentsBounds)) {
    // Vérifier si les coordonnées sont dans les limites du département
    if (lat >= bounds.lat[0] && lat <= bounds.lat[1] &&
        lon >= bounds.lon[0] && lon <= bounds.lon[1]) {
      return { code, name: bounds.name };
    }

    // Calculer la distance au centre du département
    const centerLat = (bounds.lat[0] + bounds.lat[1]) / 2;
    const centerLon = (bounds.lon[0] + bounds.lon[1]) / 2;
    const distance = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lon - centerLon, 2));

    if (!bestMatch || distance < bestMatch.distance) {
      bestMatch = { code, name: bounds.name, distance };
    }
  }

  // Retourner le département le plus proche si aucun match exact
  return bestMatch ? { code: bestMatch.code, name: bestMatch.name } : null;
}

/**
 * Vérifie si la géolocalisation est supportée
 */
export function isGeolocationSupported(): boolean {
  return typeof window !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Récupère la position actuelle de l'utilisateur
 */
export async function getCurrentPosition(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Géolocalisation non supportée'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const department = findDepartmentFromCoords(latitude, longitude);

        const location: GeoLocation = {
          latitude,
          longitude,
          accuracy,
          departmentCode: department?.code || null,
          departmentName: department?.name || null,
          timestamp: Date.now(),
        };

        // Sauvegarder en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(location));

        // Sauvegarder le département pour les alertes
        if (department?.code) {
          localStorage.setItem('secucitoyen_department', department.code);
        }

        resolve(location);
      },
      (error) => {
        let message = 'Erreur de géolocalisation';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position non disponible';
            break;
          case error.TIMEOUT:
            message = 'Délai de géolocalisation dépassé';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

/**
 * Récupère la dernière position sauvegardée
 */
export function getSavedLocation(): GeoLocation | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const location = JSON.parse(saved) as GeoLocation;
      // Considérer valide pendant 1 heure
      if (Date.now() - location.timestamp < 3600000) {
        return location;
      }
    }
  } catch {
    // Ignorer les erreurs de parsing
  }

  return null;
}

/**
 * Récupère le code département sauvegardé
 */
export function getSavedDepartment(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('secucitoyen_department');
}

/**
 * Sauvegarde le code département manuellement
 */
export function saveDepartment(code: string): void {
  localStorage.setItem('secucitoyen_department', code);
}
