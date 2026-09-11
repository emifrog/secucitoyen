/**
 * Source unique de la navigation (sidebar desktop, menu burger mobile).
 * La barre basse mobile (BottomNav) garde ses quatre entrées avec icônes SVG.
 */

export interface NavItem {
  href: string;
  label: string;
  /** Emoji décoratif (aria-hidden à l'affichage). */
  icon: string;
}

export const mainNav: readonly NavItem[] = [
  { href: '/', label: 'Accueil', icon: '🏠' },
  { href: '/urgences', label: 'Urgences', icon: '🚨' },
  { href: '/secours', label: 'Premiers secours', icon: '🏥' },
  { href: '/prevention', label: 'Prévention', icon: '🛡️' },
  { href: '/alertes', label: 'Alertes', icon: '🔔' },
  { href: '/defibrillateurs', label: 'Défibrillateurs', icon: '🫀' },
  { href: '/conseils-saison', label: 'Conseils saisonniers', icon: '🗓️' },
];

export const secondaryNav: readonly NavItem[] = [
  { href: '/contact', label: 'Contact', icon: '✉️' },
  { href: '/mentions-legales', label: 'Mentions légales', icon: '📜' },
  { href: '/confidentialite', label: 'Confidentialité', icon: '🔒' },
];

/** Vrai si `href` correspond au chemin courant (ou à une de ses sous-pages). */
export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
