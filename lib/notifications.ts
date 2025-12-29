'use client';

const STORAGE_KEY = 'secucitoyen_notifications';

export interface NotificationSettings {
  enabled: boolean;
  permission: NotificationPermission;
  enabledAt?: string;
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') {
    return { enabled: false, permission: 'default' };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      // Mettre à jour la permission actuelle
      settings.permission = Notification.permission;
      return settings;
    }
  } catch (error) {
    console.error('Erreur lecture paramètres notifications:', error);
  }

  return {
    enabled: false,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
  };
}

export function setNotificationEnabled(enabled: boolean): void {
  const settings: NotificationSettings = {
    enabled,
    permission: Notification.permission,
    enabledAt: enabled ? new Date().toISOString() : undefined,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') {
    console.warn('Notifications non supportées');
    return false;
  }

  if (Notification.permission === 'granted') {
    setNotificationEnabled(true);
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setNotificationEnabled(granted);
    return granted;
  } catch (error) {
    console.error('Erreur demande permission:', error);
    return false;
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function showNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  try {
    // Utiliser le service worker si disponible
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icons/icon-192x192.svg',
          badge: '/icons/icon-72x72.svg',
          tag: 'secucitoyen',
          renotify: true,
          ...options,
        } as NotificationOptions);
      });
    } else {
      // Fallback: notification standard
      new Notification(title, {
        icon: '/icons/icon-192x192.svg',
        ...options,
      });
    }
  } catch (error) {
    console.error('Erreur affichage notification:', error);
  }
}

// Notifications pour les alertes
export function showAlertNotification(
  level: 'jaune' | 'orange' | 'rouge',
  title: string,
  department: string
): void {
  const levelEmoji: Record<string, string> = {
    jaune: '🟡',
    orange: '🟠',
    rouge: '🔴',
  };

  const levelText: Record<string, string> = {
    jaune: 'Vigilance jaune',
    orange: 'Vigilance orange',
    rouge: 'ALERTE ROUGE',
  };

  showNotification(`${levelEmoji[level]} ${levelText[level]}`, {
    body: `${title}\n${department}`,
    tag: `alert-${level}-${department}`,
    requireInteraction: level === 'rouge',
    data: {
      url: '/alertes',
    },
  });
}

// Vérifier les nouvelles alertes et notifier
export async function checkAndNotifyAlerts(): Promise<void> {
  const settings = getNotificationSettings();
  if (!settings.enabled || Notification.permission !== 'granted') return;

  try {
    const response = await fetch('/api/vigilance');
    const data = await response.json();

    // Récupérer les alertes déjà notifiées
    const notifiedKey = 'secucitoyen_notified_alerts';
    const notified = JSON.parse(localStorage.getItem(notifiedKey) || '[]');

    const severeAlerts = (data.alerts || []).filter(
      (a: { level: string; id: string }) =>
        (a.level === 'orange' || a.level === 'rouge') && !notified.includes(a.id)
    );

    // Notifier les nouvelles alertes sévères
    for (const alert of severeAlerts) {
      showAlertNotification(alert.level, alert.title, alert.department);
      notified.push(alert.id);
    }

    // Sauvegarder les alertes notifiées (garder les 50 dernières)
    localStorage.setItem(notifiedKey, JSON.stringify(notified.slice(-50)));
  } catch (error) {
    console.error('Erreur vérification alertes:', error);
  }
}
