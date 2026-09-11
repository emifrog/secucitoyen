import { render, screen, fireEvent } from '@testing-library/react';
import FavoriteButton from '@/components/urgences/FavoriteButton';
import { getFavorites, isFavorite } from '@/lib/favorites-storage';

// localStorage réel de jsdom : on vérifie le comportement observable (état
// persistant lu via lib/favorites-storage), pas les appels internes d'un mock.
beforeEach(() => {
  window.localStorage.clear();
});

describe('FavoriteButton', () => {
  it('propose « Ajouter aux favoris » par défaut, non pressé', () => {
    render(<FavoriteButton number="15" />);
    const button = screen.getByRole('button', { name: /ajouter le 15 aux favoris/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('passe en « Retirer des favoris » après un clic et persiste le favori', () => {
    render(<FavoriteButton number="15" />);
    fireEvent.click(screen.getByRole('button'));
    const button = screen.getByRole('button', { name: /retirer le 15 des favoris/i });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(isFavorite('15')).toBe(true);
    expect(getFavorites().map((f) => f.number)).toEqual(['15']);
  });

  it('retourne en « Ajouter aux favoris » après un double clic (toggle)', () => {
    render(<FavoriteButton number="15" />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: /ajouter le 15 aux favoris/i })).toHaveAttribute('aria-pressed', 'false');
    expect(isFavorite('15')).toBe(false);
  });

  it('reflète un favori déjà enregistré au montage', () => {
    window.localStorage.setItem(
      'secucitoyen_favorites',
      JSON.stringify([{ number: '18', addedAt: '2026-01-01T00:00:00Z' }])
    );
    render(<FavoriteButton number="18" />);
    expect(screen.getByRole('button', { name: /retirer le 18 des favoris/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('appelle onToggle avec le bon état', () => {
    const onToggle = jest.fn();
    render(<FavoriteButton number="15" onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('est un vrai bouton (type=button), jamais imbriqué dans un lien', () => {
    render(<FavoriteButton number="15" />);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
