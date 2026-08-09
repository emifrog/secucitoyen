'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'secucitoyen_install_dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Déjà installé (standalone) ? — inclut le cas iOS (navigator.standalone).
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    // Refusé récemment ? — masquer 7 jours.
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const days = (Date.now() - new Date(dismissed).getTime()) / (1000 * 60 * 60 * 24);
      if (days < 7) return;
    }

    // Détection iOS (iPhone/iPad, y compris iPadOS qui se déclare en MacIntel).
    const ua = window.navigator.userAgent.toLowerCase();
    const iOS =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (iOS) {
      // iOS ne déclenche pas `beforeinstallprompt` : on affiche les instructions.
      setIsIOS(true);
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Chromium : capter l'événement d'installation.
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
    } catch (error) {
      console.error('Erreur installation:', error);
    } finally {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
  };

  if (isInstalled || !showPrompt) return null;
  // Android sans événement capté : rien à proposer.
  if (!isIOS && !deferredPrompt) return null;

  return (
    <div className="fixed bottom-36 lg:bottom-6 left-4 right-4 max-w-[400px] mx-auto z-30">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">SC</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
              Installer SécuCitoyen
            </h3>

            {isIOS ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Ajoutez l&apos;app à votre écran d&apos;accueil pour recevoir les alertes
                  et l&apos;utiliser hors connexion.
                </p>
                <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">1</span>
                    Appuyez sur
                    <svg className="w-5 h-5 text-primary inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Partager">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12v7a1 1 0 001 1h6a1 1 0 001-1v-7M12 3v12m0-12L8 7m4-4l4 4" />
                    </svg>
                    (Partager)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">2</span>
                    Choisissez « Sur l&apos;écran d&apos;accueil »
                  </li>
                </ol>
                <button
                  onClick={handleDismiss}
                  className="mt-3 px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium transition-colors"
                >
                  J&apos;ai compris
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Accédez rapidement aux urgences et recevez les alertes même hors connexion.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstall}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Installer
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium transition-colors"
                  >
                    Plus tard
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
