import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header, BottomNav, SideNav, InstallPrompt, UpdatePrompt } from "@/components/layout";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers";
import EmergencyFab from "@/components/layout/EmergencyFab";
import ServiceWorkerRegister from "@/components/layout/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/react";
import { SITE_URL } from "@/lib/site";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SécuCitoyen - Sécurité citoyenne",
    template: "%s | SécuCitoyen",
  },
  description: "Numéros d'urgence, premiers secours, alertes météo et prévention. Tout pour votre sécurité au quotidien, accessible hors-ligne.",
  manifest: "/manifest.json",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "SécuCitoyen",
    title: "SécuCitoyen - Sécurité citoyenne",
    description: "Numéros d'urgence, premiers secours, alertes météo et prévention. Tout pour votre sécurité au quotidien.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SécuCitoyen" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SécuCitoyen",
    description: "Numéros d'urgence, premiers secours, alertes et prévention.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SécuCitoyen",
  },
};

export const viewport: Viewport = {
  // Couleur de la barre système adaptée au thème.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1E3A5F" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
  // iOS installé : le contenu s'étend sous l'encoche et l'indicateur d'accueil,
  // les éléments fixes utilisent env(safe-area-inset-*) (nav basse, FAB, header).
  viewportFit: "cover",
  // Zoom laissé libre : le bloquer viole WCAG 1.4.4 (critique pour une app
  // d'urgence utilisée aussi par des personnes malvoyantes).
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('secucitoyen_theme') || 'system';
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-slate-900 overflow-x-hidden`}>
        {/* Lien d'évitement : premier élément focusable, visible au focus clavier. */}
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-orange-700 focus:text-white focus:rounded-lg"
        >
          Aller au contenu
        </a>
        <ThemeProvider>
          {/* Shell : colonne unique sur mobile/tablette, sidebar + contenu sur desktop */}
          <div className="lg:mx-auto lg:flex lg:max-w-6xl">
            <SideNav />
            <div className="max-w-app md:max-w-2xl lg:max-w-none mx-auto lg:mx-0 w-full lg:flex-1 lg:min-w-0 min-h-screen bg-white dark:bg-slate-800 shadow-lg lg:shadow-none flex flex-col">
              <Header />
              <main id="contenu" tabIndex={-1} className="pb-20 lg:pb-12 flex-1 outline-none">
                {/* Cap de largeur de lecture sur desktop (confort sur les pages
                    de contenu ; les grilles internes se densifient en md:/lg:) */}
                <div className="lg:mx-auto lg:max-w-3xl xl:max-w-4xl">
                  {children}
                </div>
              </main>
              <Footer />
              <EmergencyFab />
              <InstallPrompt />
              <UpdatePrompt />
              <BottomNav />
            </div>
          </div>
          {/* Enregistrement du SW (next-pwa ne le fait pas en App Router). */}
          <ServiceWorkerRegister />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
