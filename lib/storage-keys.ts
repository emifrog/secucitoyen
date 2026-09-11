/**
 * Clés localStorage de l'application, centralisées (elles étaient recopiées
 * en dur dans plusieurs composants).
 *
 * NB : le script anti-FOUC inline de app/layout.tsx lit `secucitoyen_theme`
 * en dur (il s'exécute avant tout module) : garder la valeur synchronisée.
 */
export const STORAGE_KEYS = {
  theme: 'secucitoyen_theme',
  department: 'secucitoyen_department',
  favorites: 'secucitoyen_favorites',
  checklists: 'secucitoyen_checklists',
  notifications: 'secucitoyen_notifications',
  notificationsDismissed: 'secucitoyen_notif_dismissed',
  installDismissed: 'secucitoyen_install_dismissed',
} as const;
