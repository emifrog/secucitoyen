'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { alertLevels, alertTypes } from '@/lib/alertes';
import { getSavedDepartment } from '@/lib/geolocation';

interface UnifiedAlert {
  id: string;
  type: string;
  category: 'meteo' | 'pollution' | 'incendie' | 'sanitaire';
  level: 'vert' | 'jaune' | 'orange' | 'rouge';
  title: string;
  description: string;
  department?: string;
  departmentCode?: string;
  startDate?: string;
  endDate?: string;
  updatedAt: string;
  source: string;
  advice: string[];
  icon: string;
}

const categoryLabels: Record<string, string> = {
  meteo: 'Météo',
  pollution: 'Pollution',
  incendie: 'Incendie',
  sanitaire: 'Santé',
};

const categoryColors: Record<string, string> = {
  meteo: 'bg-blue-500',
  pollution: 'bg-purple-500',
  incendie: 'bg-orange-600',
  sanitaire: 'bg-green-500',
};

export default function AlertsList() {
  const [alerts, setAlerts] = useState<UnifiedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'orange' | 'rouge' | 'meteo' | 'pollution' | 'incendie'>('all');
  const [sources, setSources] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      try {
        const savedDept = getSavedDepartment();
        const params = new URLSearchParams();
        if (savedDept) params.set('dept', savedDept);

        const response = await fetch(`/api/alerts?${params}`);
        const data = await response.json();

        setAlerts(data.alerts || []);
        setSources(data.sources || []);
        setLastUpdate(data.updatedAt || new Date().toISOString());
      } catch (error) {
        console.error('Erreur chargement alertes:', error);
        setAlerts([]);
        setSources(['Erreur']);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();

    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    if (filter === 'orange' || filter === 'rouge') return alert.level === filter;
    return alert.category === filter;
  });

  const severeCount = alerts.filter((a) => a.level === 'orange' || a.level === 'rouge').length;
  const categoryCount = {
    meteo: alerts.filter((a) => a.category === 'meteo').length,
    pollution: alerts.filter((a) => a.category === 'pollution').length,
    incendie: alerts.filter((a) => a.category === 'incendie').length,
  };

  if (loading) {
    return (
      <section className="space-y-3">
        <div className="animate-pulse bg-gray-100 dark:bg-slate-700 h-6 w-32 rounded" />
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 dark:bg-slate-700 h-24 rounded-xl" />
        ))}
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Compteur principal */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Alertes en cours</p>
            <p className="text-3xl font-bold">{alerts.length}</p>
            {severeCount > 0 && (
              <p className="text-xs text-orange-300 mt-1">
                dont {severeCount} orange/rouge
              </p>
            )}
          </div>
          <div className="text-4xl">🔔</div>
        </div>

        {/* Répartition par catégorie */}
        {alerts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-3 gap-2">
            {categoryCount.meteo > 0 && (
              <div className="text-center">
                <span className="text-lg">⛈️</span>
                <p className="text-xs text-white/70">Météo: {categoryCount.meteo}</p>
              </div>
            )}
            {categoryCount.pollution > 0 && (
              <div className="text-center">
                <span className="text-lg">😷</span>
                <p className="text-xs text-white/70">Pollution: {categoryCount.pollution}</p>
              </div>
            )}
            {categoryCount.incendie > 0 && (
              <div className="text-center">
                <span className="text-lg">🔥</span>
                <p className="text-xs text-white/70">Incendie: {categoryCount.incendie}</p>
              </div>
            )}
          </div>
        )}

        {sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between text-xs text-white/60">
            <span>Sources: {sources.join(', ')}</span>
            {lastUpdate && (
              <span>
                MAJ: {new Date(lastUpdate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Toutes', icon: '📋' },
          { key: 'orange', label: 'Orange', icon: '🟠' },
          { key: 'rouge', label: 'Rouge', icon: '🔴' },
          { key: 'meteo', label: 'Météo', icon: '⛈️' },
          { key: 'pollution', label: 'Air', icon: '😷' },
          { key: 'incendie', label: 'Feux', icon: '🔥' },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          {filter === 'all' ? 'Toutes les alertes' : `Alertes ${filter}`}
        </h3>

        {filteredAlerts.length === 0 ? (
          <Card className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-600 dark:text-gray-300">
              {filter === 'all'
                ? 'Aucune alerte en cours'
                : `Aucune alerte ${filter} en cours`}
            </p>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        )}
      </div>
    </section>
  );
}

function AlertCard({ alert }: { alert: UnifiedAlert }) {
  const levelConfig = alertLevels[alert.level];
  const typeInfo = alertTypes.find((t) => t.type === alert.type);

  return (
    <Link href={`/alertes/${alert.id}`}>
      <Card className={`border-l-4 ${levelConfig.borderColor} hover:shadow-lg transition-all active:scale-[0.99]`}>
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 ${levelConfig.bgColor} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
            {alert.icon || typeInfo?.icon || '⚠️'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">{alert.title}</h4>
              <span className={`px-2 py-0.5 ${levelConfig.bgColor} text-white text-xs rounded-full`}>
                {levelConfig.name.replace('Vigilance ', '')}
              </span>
              <span className={`px-2 py-0.5 ${categoryColors[alert.category] || 'bg-gray-500'} text-white text-xs rounded-full`}>
                {categoryLabels[alert.category] || alert.category}
              </span>
            </div>
            {alert.department && (
              <p className="text-sm text-primary dark:text-blue-400 font-medium">{alert.department}</p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{alert.description}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {new Date(alert.updatedAt).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="text-gray-400">•</span>
              <span>{alert.source}</span>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </Link>
  );
}
