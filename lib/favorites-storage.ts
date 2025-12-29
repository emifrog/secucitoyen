'use client';

const STORAGE_KEY = 'secucitoyen_favorites';

export interface FavoriteNumber {
  number: string;
  addedAt: string;
}

export function getFavorites(): FavoriteNumber[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(number: string): void {
  const favorites = getFavorites();
  const filtered = favorites.filter((f) => f.number !== number);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
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
