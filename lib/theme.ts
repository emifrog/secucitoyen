import { STORAGE_KEYS } from './storage-keys';

export type Theme = 'light' | 'dark' | 'system';

const THEMES: readonly Theme[] = ['light', 'dark', 'system'];
const TRANSITION_MS = 250;

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    return THEMES.includes(stored as Theme) ? (stored as Theme) : 'system';
  } catch {
    return 'system';
  }
}

export function setStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  } catch {
    // Stockage indisponible : le thème vaut pour la session seulement.
  }
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

let transitionTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Applique le thème sur <html>. Une classe `theme-transition` est posée le
 * temps du changement pour animer les couleurs (voir globals.css), au lieu
 * d'une transition permanente sur tous les éléments.
 */
export function applyTheme(theme: Theme, { animate = true }: { animate?: boolean } = {}): void {
  const effective = getEffectiveTheme(theme);
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');

  if ((effective === 'dark') === isDark) return;

  if (animate) {
    root.classList.add('theme-transition');
    if (transitionTimer) clearTimeout(transitionTimer);
    transitionTimer = setTimeout(() => root.classList.remove('theme-transition'), TRANSITION_MS);
  }

  root.classList.toggle('dark', effective === 'dark');
}
