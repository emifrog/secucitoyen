/**
 * Jetons visuels partagés (niveaux d'urgence des fiches, priorités des
 * check-lists). Les niveaux de vigilance sont dans `alertLevels` (lib/alertes).
 *
 * Chaque entrée fournit le fond (`bg`) ET la couleur de texte lisible dessus
 * (`fg`) : le blanc échoue WCAG 1.4.3 sur jaune-500 (1,9:1) comme sur
 * orange-500 (2,8:1) ; seul rouge-600 (4,8:1) accepte du texte blanc.
 */

export type Urgency = 'critical' | 'high' | 'medium';

export const urgencyConfig: Record<
  Urgency,
  { label: string; bg: string; fg: string; border: string; light: string; text: string; badge: string; dot: string }
> = {
  critical: {
    label: 'Urgence vitale',
    bg: 'bg-red-600',
    fg: 'text-white',
    border: 'border-red-500',
    light: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-800 dark:text-red-300',
    badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    dot: 'bg-red-500',
  },
  high: {
    label: 'Urgence haute',
    bg: 'bg-orange-500',
    fg: 'text-gray-900',
    border: 'border-orange-500',
    light: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-800 dark:text-orange-300',
    badge: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    dot: 'bg-orange-500',
  },
  medium: {
    label: 'Urgence modérée',
    bg: 'bg-yellow-500',
    fg: 'text-gray-900',
    border: 'border-yellow-500',
    light: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-800 dark:text-yellow-300',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    dot: 'bg-yellow-500',
  },
};

export type Priority = 'high' | 'medium' | 'low';

export const priorityConfig: Record<Priority, { label: string; bg: string; text: string }> = {
  high: {
    label: 'Prioritaire',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
  },
  medium: {
    label: 'Recommandé',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
  },
  low: {
    label: 'Optionnel',
    bg: 'bg-gray-100 dark:bg-slate-700',
    text: 'text-gray-600 dark:text-gray-300',
  },
};

/** Durées partagées (ms). */
export const TIMINGS = {
  /** Rafraîchissement des alertes (liste et bannière). */
  alertsRefreshMs: 5 * 60 * 1000,
  /** Délai avant d'afficher une invite non urgente (installation). */
  promptDelayMs: 3000,
  /** Rappel d'une invite refusée. */
  dismissDays: 7,
} as const;
