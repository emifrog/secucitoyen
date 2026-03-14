import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import FavoriteButton from '@/components/urgences/FavoriteButton';

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

describe('FavoriteButton', () => {
  it('affiche le bouton "Ajouter aux favoris" par défaut', () => {
    render(<FavoriteButton number="15" />);
    expect(screen.getByRole('button', { name: /ajouter aux favoris/i })).toBeInTheDocument();
  });

  it('passe en "Retirer des favoris" après un clic', () => {
    render(<FavoriteButton number="15" />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: /retirer des favoris/i })).toBeInTheDocument();
  });

  it('retourne en "Ajouter aux favoris" après un double clic (toggle)', () => {
    render(<FavoriteButton number="15" />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: /ajouter aux favoris/i })).toBeInTheDocument();
  });

  it('appelle onToggle avec le bon état', () => {
    const onToggle = jest.fn();
    render(<FavoriteButton number="15" onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith(true);

    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('empêche la propagation de l\'événement', () => {
    const parentClick = jest.fn();
    render(
      <div onClick={parentClick}>
        <FavoriteButton number="15" />
      </div>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(parentClick).not.toHaveBeenCalled();
  });
});
