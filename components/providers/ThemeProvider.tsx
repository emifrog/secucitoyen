'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, getStoredTheme, setStoredTheme, applyTheme, getSystemTheme } from '@/lib/theme';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    const effective = stored === 'system' ? getSystemTheme() : stored;
    setEffectiveTheme(effective);
    applyTheme(stored);

    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (getStoredTheme() === 'system') {
        const newEffective = getSystemTheme();
        setEffectiveTheme(newEffective);
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
    const effective = newTheme === 'system' ? getSystemTheme() : newTheme;
    setEffectiveTheme(effective);
    applyTheme(newTheme);
  };

  // Rendu immédiat : l'anti-FOUC est déjà géré par le script inline du layout
  // (classe `dark` posée avant hydratation), donc pas besoin de bloquer le SSR.
  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
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
