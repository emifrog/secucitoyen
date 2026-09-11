import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Largeur de la colonne « app » (format téléphone). Source unique,
      // à réutiliser via `max-w-app` partout où l'ancien `max-w-[428px]` était codé.
      maxWidth: {
        app: "428px",
      },
      colors: {
        primary: "#1E3A5F",
        accent: "#F97316",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Animations déclarées ici plutôt qu'en styled-jsx (qui imposait des
      // <style> inline). Respectent prefers-reduced-motion via globals.css.
      keyframes: {
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
          '50%': { boxShadow: '0 0 0 8px rgba(34, 197, 94, 0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.2s ease-out both',
        'slide-down': 'slide-down 0.2s ease-out both',
        'pulse-ring': 'pulse-ring 2s infinite',
      },
    },
  },
  plugins: [],
};
export default config;
