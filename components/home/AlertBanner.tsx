'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

interface UnifiedAlert {
  id: string;
  type: string;
  category: 'meteo' | 'pollution' | 'incendie' | 'inondation';
  level: 'vert' | 'jaune' | 'orange' | 'rouge';
  title: string;
  department: string;
  departmentCode: string;
  source: string;
  icon: string;
}

const severityConfig = {
  rouge: {
    bg: 'bg-red-600',
    text: 'Alerte rouge',
    icon: '🔴',
    priority: 4,
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'Vigilance orange',
    icon: '🟠',
    priority: 3,
  },
  jaune: {
    bg: 'bg-yellow-500 text-gray-900',
    text: 'Vigilance jaune',
    icon: '🟡',
    priority: 2,
  },
  vert: {
    bg: 'bg-green-500',
    text: 'Vigilance verte',
    icon: '🟢',
    priority: 1,
  },
};

export default function AlertBanner() {
  const [alerts, setAlerts] = useState<UnifiedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchAlerts = useCallback(async () => {
    try {
      // Récupérer le département depuis le localStorage
      const savedDept = localStorage.getItem('secucitoyen_department');
      const dept = savedDept || '75'; // Paris par défaut

      const response = await fetch(`/api/alerts?dept=${dept}`);
      const data = await response.json();

      if (data.alerts && data.alerts.length > 0) {
        // Filtrer uniquement les alertes orange et rouge
        const severeAlerts = data.alerts.filter(
          (alert: UnifiedAlert) => alert.level === 'orange' || alert.level === 'rouge'
        );
        setAlerts(severeAlerts);
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

    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Rotation des alertes si plusieurs
  useEffect(() => {
    if (alerts.length > 1) {
      const rotationInterval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % alerts.length);
      }, 5000); // Change toutes les 5 secondes

      return () => clearInterval(rotationInterval);
    }
  }, [alerts.length]);

  if (loading || alerts.length === 0 || dismissed) {
    return null;
  }

  const currentAlert = alerts[currentIndex];
  const config = severityConfig[currentAlert.level] || severityConfig.jaune;

  return (
    <div className={`${config.bg} text-white px-4 py-3`}>
      <Link href="/alertes" className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{currentAlert.icon || config.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium opacity-90 flex items-center gap-2">
              <span>{config.text}</span>
              {alerts.length > 1 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                  {currentIndex + 1}/{alerts.length}
                </span>
              )}
            </div>
            <div className="font-semibold truncate">{currentAlert.title}</div>
            <div className="text-xs opacity-80 truncate">
              {currentAlert.department} • {currentAlert.source}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
            Voir
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              setDismissed(true);
            }}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fermer l'alerte"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Link>
    </div>
  );
}
