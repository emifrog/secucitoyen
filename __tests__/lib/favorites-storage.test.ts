import { getFavorites, isFavorite, addFavorite, removeFavorite, toggleFavorite } from '@/lib/favorites-storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe('getFavorites', () => {
  it('retourne un tableau vide si aucun favori', () => {
    expect(getFavorites()).toEqual([]);
  });

  it('retourne les favoris stockés', () => {
    const favorites = [{ number: '15', addedAt: '2024-01-01T00:00:00Z' }];
    localStorageMock.setItem('secucitoyen_favorites', JSON.stringify(favorites));

    expect(getFavorites()).toEqual(favorites);
  });

  it('retourne un tableau vide si le JSON est invalide', () => {
    localStorageMock.getItem.mockReturnValueOnce('invalid json');
    expect(getFavorites()).toEqual([]);
  });
});

describe('addFavorite', () => {
  it('ajoute un numéro aux favoris', () => {
    addFavorite('15');

    const stored = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(stored).toHaveLength(1);
    expect(stored[0].number).toBe('15');
    expect(stored[0].addedAt).toBeDefined();
  });

  it('n\'ajoute pas de doublon', () => {
    addFavorite('15');
    addFavorite('15');

    // Le premier addFavorite crée [15], le deuxième devrait ne rien changer
    const lastCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
    const stored = JSON.parse(lastCall[1]);
    expect(stored).toHaveLength(1);
  });
});

describe('removeFavorite', () => {
  it('supprime un favori existant', () => {
    addFavorite('15');
    addFavorite('18');
    removeFavorite('15');

    const lastCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
    const stored = JSON.parse(lastCall[1]);
    expect(stored).toHaveLength(1);
    expect(stored[0].number).toBe('18');
  });
});

describe('isFavorite', () => {
  it('retourne true pour un favori existant', () => {
    addFavorite('15');
    expect(isFavorite('15')).toBe(true);
  });

  it('retourne false pour un non-favori', () => {
    expect(isFavorite('999')).toBe(false);
  });
});

describe('toggleFavorite', () => {
  it('ajoute si non-favori et retourne true', () => {
    const result = toggleFavorite('15');
    expect(result).toBe(true);
    expect(isFavorite('15')).toBe(true);
  });

  it('supprime si déjà favori et retourne false', () => {
    addFavorite('15');
    const result = toggleFavorite('15');
    expect(result).toBe(false);
    expect(isFavorite('15')).toBe(false);
  });
});
