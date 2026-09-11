import { render, screen, fireEvent } from '@testing-library/react';
import EmergencyFab from '@/components/layout/EmergencyFab';
import { getNumberByNumber } from '@/lib/numeros-urgence';

// Les libellés viennent de la source unique des numéros (lib/numeros-urgence).
const name = (n: string) => getNumberByNumber(n)!.name;

describe('EmergencyFab', () => {
  it("affiche le bouton d'urgence fermé par défaut", () => {
    render(<EmergencyFab />);
    const button = screen.getByRole('button', { name: /ouvrir les numéros d'urgence/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it("n'affiche pas les numéros quand fermé", () => {
    render(<EmergencyFab />);
    expect(screen.queryByText(name('15'))).not.toBeInTheDocument();
    expect(screen.queryByText(name('17'))).not.toBeInTheDocument();
    expect(screen.queryByText(name('18'))).not.toBeInTheDocument();
  });

  it('affiche les numéros 15, 17, 18 avec leurs noms quand ouvert', () => {
    render(<EmergencyFab />);
    fireEvent.click(screen.getByRole('button', { name: /ouvrir les numéros d'urgence/i }));

    for (const n of ['15', '17', '18']) {
      expect(screen.getByText(n)).toBeInTheDocument();
      expect(screen.getByText(name(n))).toBeInTheDocument();
    }
  });

  it('affiche le lien 112 quand ouvert', () => {
    render(<EmergencyFab />);
    fireEvent.click(screen.getByRole('button', { name: /ouvrir les numéros d'urgence/i }));
    expect(screen.getByText('112')).toBeInTheDocument();
  });

  it('les liens appellent les bons numéros', () => {
    render(<EmergencyFab />);
    fireEvent.click(screen.getByRole('button', { name: /ouvrir les numéros d'urgence/i }));

    const hrefs = screen.getAllByRole('link').map((l) => l.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['tel:15', 'tel:17', 'tel:18', 'tel:112']));
  });

  it('se ferme avec Échap et rend le focus au bouton', () => {
    render(<EmergencyFab />);
    const trigger = screen.getByRole('button', { name: /ouvrir les numéros d'urgence/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('group', { name: /numéros d'urgence/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('group', { name: /numéros d'urgence/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ouvrir les numéros d'urgence/i })).toHaveFocus();
  });
});
