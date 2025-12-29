'use client';

import { useState, useEffect } from 'react';
import {
  requestNotificationPermission,
  isNotificationSupported,
  showNotification,
  getNotificationSettings,
  checkAndNotifyAlerts,
} from '@/lib/notifications';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export default function NotificationPrompt() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNotificationSupported()) {
      setPermission('unsupported');
      return;
    }

    const settings = getNotificationSettings();
    setPermission(settings.permission as PermissionState);

    // Vérifier si déjà fermé
    const wasDismissed = localStorage.getItem('secucitoyen_notif_dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }

    // Si notifications activées, vérifier les alertes
    if (settings.enabled && settings.permission === 'granted') {
      checkAndNotifyAlerts();
    }
  }, []);

  const handleRequestPermission = async () => {
    setLoading(true);

    try {
      const granted = await requestNotificationPermission();

      if (granted) {
        setPermission('granted');
        // Envoyer une notification de test
        showNotification('SécuCitoyen activé', {
          body: 'Vous recevrez les alertes de vigilance météo en temps réel.',
        });
        // Vérifier immédiatement les alertes
        checkAndNotifyAlerts();
      } else {
        setPermission(Notification.permission as PermissionState);
      }
    } catch (error) {
      console.error('Erreur permission notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem('secucitoyen_notif_dismissed', 'true');
  };

  // Ne rien afficher si déjà accordé, refusé ou fermé
  if (permission === 'granted' || permission === 'denied' || permission === 'unsupported' || dismissed) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 border border-accent/20 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-xl flex-shrink-0">
          🔔
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Activez les notifications</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Recevez les alertes de vigilance en temps réel, même quand l&apos;application est fermée.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRequestPermission}
              disabled={loading}
              className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Activation...
                </>
              ) : (
                'Activer'
              )}
            </button>
            <button
              onClick={dismiss}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          aria-label="Fermer"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </section>
  );
}
