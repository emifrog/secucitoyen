import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header, BottomNav, InstallPrompt } from "@/components/layout";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers";
import { I18nProvider } from "@/lib/i18n";
import EmergencyFab from "@/components/layout/EmergencyFab";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SécuCitoyen",
  description: "Application de sécurité citoyenne - Prévention, alertes et urgences",
  manifest: "/manifest.json",
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
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
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
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-slate-900`}>
        <ThemeProvider>
          <I18nProvider>
            <div className="max-w-[428px] mx-auto min-h-screen bg-white dark:bg-slate-800 shadow-lg flex flex-col">
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
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
