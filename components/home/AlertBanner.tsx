'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import type { UnifiedAlert } from '@/lib/types/api-responses';
import { getSavedDepartment } from '@/lib/geolocation';
import { TIMINGS } from '@/lib/ui-tokens';

// Fond + couleur de texte lisible dessus (le blanc sur orange-500 ne dépasse
// pas 2,8:1 : texte sombre sur orange, jaune et vert ; blanc sur rouge).
const severityConfig = {
  rouge: {
    bg: 'bg-red-600 text-white',
    text: 'Alerte rouge',
    icon: '🔴',
    priority: 4,
  },
  orange: {
    bg: 'bg-orange-500 text-gray-900',
    text: 'Vigilance orange',
    icon: '🟠',
    priority: 3,
  },
  jaune: {
    bg: 'bg-yellow-400 text-gray-900',
    text: 'Vigilance jaune',
    icon: '🟡',
    priority: 2,
  },
  vert: {
    bg: 'bg-green-500 text-gray-900',
    text: 'Vigilance verte',
    icon: '🟢',
    priority: 1,
  },
};

const REFRESH_MS = TIMINGS.alertsRefreshMs;
const ROTATION_MS = 5000;

export default function AlertBanner() {
  const [alerts, setAlerts] = useState<UnifiedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Rotation suspendue au survol/focus (WCAG 2.2.2 : contenu qui change
  // automatiquement).
  const [paused, setPaused] = useState(false);

  const fetchAlerts = useCallback(async () => {
    // Sans département choisi, on n'affiche rien : montrer les alertes d'un
    // département par défaut (Paris) laissait croire qu'elles concernaient
    // l'utilisateur.
    const dept = getSavedDepartment();
    if (!dept) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/alerts?dept=${encodeURIComponent(dept)}`);
      const data = await response.json();

      if (Array.isArray(data.alerts) && data.alerts.length > 0) {
        // Filtrer uniquement les alertes orange et rouge
        setAlerts(
          data.alerts.filter(
            (alert: UnifiedAlert) => alert.level === 'orange' || alert.level === 'rouge'
          )
        );
      } else {
        setAlerts([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Rafraîchissement uniquement quand l'onglet est visible.
    let interval: ReturnType<typeof setInterval> | null = setInterval(fetchAlerts, REFRESH_MS);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchAlerts();
        if (!interval) interval = setInterval(fetchAlerts, REFRESH_MS);
      } else if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchAlerts]);

  // Rotation des alertes si plusieurs. L'index est remis à zéro à chaque
  // changement de liste : le refresh périodique peut la raccourcir alors que
  // l'index pointait au-delà (TypeError au rendu sinon).
  useEffect(() => {
    setCurrentIndex(0);
    if (alerts.length > 1 && !paused) {
      const rotationInterval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % alerts.length);
      }, ROTATION_MS);
      return () => clearInterval(rotationInterval);
    }
  }, [alerts.length, paused]);

  if (loading || alerts.length === 0 || dismissed) {
    return null;
  }

  // Garde défensive : jamais hors bornes même entre deux rendus.
  const currentAlert = alerts[currentIndex % alerts.length];
  const config = severityConfig[currentAlert.level] || severityConfig.jaune;

  return (
    <div
      role="status"
      className={`${config.bg} px-4 py-3`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Link href={`/alertes/${encodeURIComponent(currentAlert.id)}`} className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0" aria-hidden="true">{currentAlert.icon || config.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium flex items-center gap-2">
              <span>{config.text}</span>
              {alerts.length > 1 && (
                <span className="bg-black/10 px-1.5 py-0.5 rounded text-xs">
                  <span className="sr-only">Alerte </span>{currentIndex + 1}/{alerts.length}
                </span>
              )}
            </div>
            <div className="font-semibold truncate">{currentAlert.title}</div>
            <div className="text-xs truncate">
              {currentAlert.department} • {currentAlert.source}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs bg-black/10 px-2 py-1 rounded-full">
            Voir
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              setDismissed(true);
            }}
            className="p-2.5 -m-1.5 min-w-11 min-h-11 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
            aria-label="Masquer la bannière d'alerte"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Link>
    </div>
  );
}
