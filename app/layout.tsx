import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header, BottomNav, InstallPrompt } from "@/components/layout";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers";
import EmergencyFab from "@/components/layout/EmergencyFab";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SécuCitoyen - Sécurité citoyenne",
    template: "%s | SécuCitoyen",
  },
  description: "Numéros d'urgence, premiers secours, alertes météo et prévention. Tout pour votre sécurité au quotidien, accessible hors-ligne.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://secucitoyen.vercel.app"),
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
  themeColor: "#1E3A5F",
  width: "device-width",
  initialScale: 1,
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
        <ThemeProvider>
          <div className="max-w-app mx-auto min-h-screen bg-white dark:bg-slate-800 shadow-lg flex flex-col">
            <Header />
            <main className="pb-20 flex-1">
              {children}
            </main>
            <Footer />
            <EmergencyFab />
            <InstallPrompt />
            <BottomNav />
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
