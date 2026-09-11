'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, getStoredTheme, setStoredTheme, applyTheme } from '@/lib/theme';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    // Sans animation : la classe `dark` a déjà été posée par le script inline
    // du layout (anti-FOUC), on ne fait que se resynchroniser.
    applyTheme(stored, { animate: false });

    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (getStoredTheme() === 'system') applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  };

  // Rendu immédiat : l'anti-FOUC est déjà géré par le script inline du layout
  // (classe `dark` posée avant hydratation), donc pas besoin de bloquer le SSR.
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
