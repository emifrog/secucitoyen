import { STORAGE_KEYS } from './storage-keys';

export interface FavoriteNumber {
  number: string;
  addedAt: string;
}

function save(favorites: FavoriteNumber[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  } catch {
    // Stockage indisponible (navigation privée, quota) : favoris non persistés.
  }
}

export function getFavorites(): FavoriteNumber[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.favorites);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erreur lecture favoris:', error);
  }

  return [];
}

export function isFavorite(number: string): boolean {
  const favorites = getFavorites();
  return favorites.some((f) => f.number === number);
}

export function addFavorite(number: string): void {
  const favorites = getFavorites();

  if (!favorites.some((f) => f.number === number)) {
    favorites.push({
      number,
      addedAt: new Date().toISOString(),
    });
    save(favorites);
  }
}

export function removeFavorite(number: string): void {
  const favorites = getFavorites();
  save(favorites.filter((f) => f.number !== number));
}

export function toggleFavorite(number: string): boolean {
  if (isFavorite(number)) {
    removeFavorite(number);
    return false;
  } else {
    addFavorite(number);
    return true;
  }
}
