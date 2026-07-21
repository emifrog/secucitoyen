/**
 * Conversion du niveau de vigilance Vigicrues (1–4) vers un code couleur.
 * Extrait de la route /api/vigicrues pour être testable.
 */
export function parseNiveau(niveau: number | string): 'vert' | 'jaune' | 'orange' | 'rouge' {
  const n = typeof niveau === 'string' ? parseInt(niveau) : niveau;
  switch (n) {
    case 1: return 'vert';
    case 2: return 'jaune';
    case 3: return 'orange';
    case 4: return 'rouge';
    default: return 'vert';
  }
}
