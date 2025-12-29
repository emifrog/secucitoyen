'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Alert {
  id: number;
  type: 'meteo' | 'securite' | 'sante';
  severity: 'red' | 'orange' | 'yellow';
  title: string;
  active: boolean;
}

// Simulation d'alertes - sera remplacé par API
const mockAlerts: Alert[] = [
  {
    id: 1,
    type: 'meteo',
    severity: 'orange',
    title: 'Vigilance orange orages',
    active: true,
  },
];

const severityConfig = {
  red: {
    bg: 'bg-red-600',
    text: 'Alerte rouge',
    icon: '🔴',
  },
  orange: {
    bg: 'bg-orange-500',
    text: 'Vigilance orange',
    icon: '🟠',
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'Vigilance jaune',
    icon: '🟡',
  },
};

export default function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Simule le chargement des alertes
    const activeAlerts = mockAlerts.filter((a) => a.active);
    setAlerts(activeAlerts);
  }, []);

  if (alerts.length === 0 || dismissed) {
    return null;
  }

  const currentAlert = alerts[0];
  const config = severityConfig[currentAlert.severity];

  return (
    <div className={`${config.bg} text-white px-4 py-3`}>
      <Link href="/alertes" className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">{config.icon}</span>
          <div>
            <div className="text-xs font-medium opacity-90">{config.text}</div>
            <div className="font-semibold">{currentAlert.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
