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
    },
  },
  plugins: [],
};
export default config;
