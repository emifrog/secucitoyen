import { findNearestDepartement, getDepartement } from './departements';
import { STORAGE_KEYS } from './storage-keys';

// Géolocalisation côté navigateur et résolution du département.
//
// La résolution passe d'abord par le géocodage inverse officiel
// (geo.api.gouv.fr, via /api/geocode) qui renvoie le VRAI département de la
// commune. En cas d'indisponibilité (hors-ligne, API en panne), on retombe sur
// le département dont le point de référence est le plus proche — une
// estimation, signalée comme telle à l'utilisateur (`estimated: true`).

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface ResolvedDepartment {
  code: string;
  name: string;
  /** true : déduit du point de référence le plus proche (hors-ligne / API indisponible). */
  estimated: boolean;
}

const DEPARTMENT_KEY = STORAGE_KEYS.department;
const GEOCODE_TIMEOUT_MS = 6000;

/**
 * Département le plus proche (ESTIMATION, repli hors-ligne).
 * Ne jamais présenter ce résultat comme certain.
 */
export function findDepartmentFromCoords(lat: number, lon: number): { code: string; name: string } {
  const d = findNearestDepartement(lat, lon);
  return { code: d.code, name: d.nom };
}

/**
 * Résout le département d'un point : géocodage inverse officiel d'abord,
 * estimation locale en repli.
 */
export async function resolveDepartmentFromCoords(
  lat: number,
  lon: number
): Promise<ResolvedDepartment> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);
    try {
      const response = await fetch(
        `/api/geocode?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`,
        { signal: controller.signal }
      );
      if (response.ok) {
        const data: { departmentCode?: string | null } = await response.json();
        const dep = getDepartement(data.departmentCode);
        if (dep) {
          return { code: dep.code, name: dep.nom, estimated: false };
        }
      }
    } finally {
      clearTimeout(timer);
    }
  } catch {
    // Réseau indisponible ou délai dépassé : estimation locale ci-dessous.
  }

  const nearest = findNearestDepartement(lat, lon);
  return { code: nearest.code, name: nearest.nom, estimated: true };
}

/**
 * Vérifie si la géolocalisation est supportée
 */
export function isGeolocationSupported(): boolean {
  return typeof window !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Position actuelle de l'utilisateur (coordonnées seules, sans effet de bord :
 * c'est à l'appelant de décider quoi sauvegarder).
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
        resolve({ latitude, longitude, accuracy, timestamp: Date.now() });
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
 * Récupère le code département sauvegardé
 */
export function getSavedDepartment(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(DEPARTMENT_KEY);
  } catch {
    return null;
  }
}

/**
 * Sauvegarde le code département
 */
export function saveDepartment(code: string): void {
  try {
    localStorage.setItem(DEPARTMENT_KEY, code);
  } catch {
    // Stockage indisponible (navigation privée, quota) : sans conséquence.
  }
}

export function clearSavedDepartment(): void {
  try {
    localStorage.removeItem(DEPARTMENT_KEY);
  } catch {
    // idem
  }
}
