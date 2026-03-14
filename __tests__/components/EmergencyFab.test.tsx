import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import EmergencyFab from '@/components/layout/EmergencyFab';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('EmergencyFab', () => {
  it('affiche le bouton d\'urgence fermé par défaut', () => {
    render(<EmergencyFab />);
    const button = screen.getByRole('button', { name: /urgences/i });
    expect(button).toBeInTheDocument();
  });

  it('n\'affiche pas les numéros quand fermé', () => {
    render(<EmergencyFab />);
    expect(screen.queryByText('SAMU')).not.toBeInTheDocument();
    expect(screen.queryByText('Police')).not.toBeInTheDocument();
    expect(screen.queryByText('Pompiers')).not.toBeInTheDocument();
  });

  it('affiche les numéros 15, 17, 18 quand ouvert', () => {
    render(<EmergencyFab />);
    fireEvent.click(screen.getByRole('button', { name: /urgences/i }));

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('SAMU')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getByText('Police')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('Pompiers')).toBeInTheDocument();
  });

  it('affiche le lien 112 quand ouvert', () => {
    render(<EmergencyFab />);
    fireEvent.click(screen.getByRole('button', { name: /urgences/i }));

    expect(screen.getByText('112')).toBeInTheDocument();
  });

  it('les liens appellent les bons numéros', () => {
    render(<EmergencyFab />);
    fireEvent.click(screen.getByRole('button', { name: /urgences/i }));

    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));

    expect(hrefs).toContain('tel:15');
    expect(hrefs).toContain('tel:17');
    expect(hrefs).toContain('tel:18');
    expect(hrefs).toContain('tel:112');
  });
});
