'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { alertLevels, alertTypes } from '@/lib/alertes';
import { getSavedDepartment } from '@/lib/geolocation';
import { TIMINGS } from '@/lib/ui-tokens';
import type { UnifiedAlert } from '@/lib/types/api-responses';

const categoryLabels: Record<string, string> = {
  meteo: 'Météo',
  pollution: 'Pollution',
  incendie: 'Incendie',
  inondation: 'Crues',
  sanitaire: 'Santé',
};

// Fonds des pastilles de catégorie : ≥ 4,5:1 avec du texte blanc.
const categoryColors: Record<string, string> = {
  meteo: 'bg-blue-600',
  pollution: 'bg-purple-700',
  incendie: 'bg-orange-700',
  inondation: 'bg-cyan-700',
  sanitaire: 'bg-green-700',
};

type Filter = 'all' | 'orange' | 'rouge' | 'meteo' | 'pollution' | 'incendie' | 'inondation';

const FILTERS: { key: Filter; label: string; icon: string; heading: string }[] = [
  { key: 'all', label: 'Toutes', icon: '📋', heading: 'Toutes les alertes' },
  { key: 'orange', label: 'Orange', icon: '🟠', heading: 'Alertes orange' },
  { key: 'rouge', label: 'Rouge', icon: '🔴', heading: 'Alertes rouges' },
  { key: 'meteo', label: 'Météo', icon: '⛈️', heading: 'Alertes météo' },
  { key: 'pollution', label: 'Air', icon: '😷', heading: "Alertes qualité de l'air" },
  { key: 'incendie', label: 'Feux', icon: '🔥', heading: 'Risque incendie (estimation)' },
  { key: 'inondation', label: 'Crues', icon: '🌊', heading: 'Vigilance crues' },
];

interface HealthSource {
  source: string;
  status: 'ok' | 'unavailable';
  failures: number;
}

export default function AlertsList() {
  const [alerts, setAlerts] = useState<UnifiedAlert[]>([]);
  // `loading` : premier chargement (squelette) ; `refreshing` : rafraîchissement
  // périodique, la liste reste affichée.
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [sources, setSources] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [degradedSources, setDegradedSources] = useState<HealthSource[]>([]);
  // `degraded` est renvoyé par /api/alerts quand au moins une source amont
  // (Météo-France, Vigicrues…) n'a pas répondu : la liste peut être incomplète.
  const [degraded, setDegraded] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const loadAlerts = useCallback(async (initial: boolean) => {
    // Une seule requête en vol : la précédente est annulée (pas de réponse
    // obsolète appliquée après une plus récente).
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (initial) setLoading(true);
    else setRefreshing(true);
    setLoadError(null);

    try {
      const savedDept = getSavedDepartment();
      const params = new URLSearchParams();
      if (savedDept) params.set('dept', savedDept);

      const response = await fetch(`/api/alerts?${params}`, { signal: controller.signal });
      const data = await response.json();
      if (controller.signal.aborted) return;

      setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
      setSources(Array.isArray(data.sources) ? data.sources : []);
      setDegraded(data.degraded === true);
      setLastUpdate(data.updatedAt || new Date().toISOString());
      if (data.error) setLoadError(data.error);
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error('Erreur chargement alertes:', error);
      // Hors-ligne : on conserve la dernière liste affichée (dernier état connu).
      setLoadError('Impossible de charger les alertes. Vérifiez votre connexion.');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      const unavailable = (data.sources || []).filter((s: HealthSource) => s.status === 'unavailable');
      setDegradedSources(unavailable);
    } catch {
      // Silently ignore health check failures
    }
  }, []);

  useEffect(() => {
    loadAlerts(true);
    checkHealth();

    // Rafraîchir périodiquement, uniquement quand l'onglet est visible ; un
    // rafraîchissement immédiat au retour sur l'onglet.
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (interval) return;
      interval = setInterval(() => { loadAlerts(false); checkHealth(); }, TIMINGS.alertsRefreshMs);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadAlerts(false);
        start();
      } else {
        stop();
      }
    };
    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      abortRef.current?.abort();
    };
  }, [loadAlerts, checkHealth]);

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
    inondation: alerts.filter((a) => a.category === 'inondation').length,
  };
  const currentFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];

  if (loading) {
    return (
      <section className="space-y-3" aria-busy="true" aria-label="Chargement des alertes">
        <div className="animate-pulse bg-gray-100 dark:bg-slate-700 h-6 w-32 rounded" />
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 dark:bg-slate-700 h-24 rounded-xl" />
        ))}
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="alerts-count-title">
      {/* Compteur principal */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p id="alerts-count-title" className="text-sm text-white/90">Alertes en cours</p>
            <p className="text-3xl font-bold">{alerts.length}</p>
            {severeCount > 0 && (
              <p className="text-xs text-orange-300 mt-1">
                dont {severeCount} orange/rouge
              </p>
            )}
          </div>
          <div className="text-4xl" aria-hidden="true">🔔</div>
        </div>

        {/* Répartition par catégorie */}
        {alerts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-4 gap-2">
            {(['meteo', 'pollution', 'incendie', 'inondation'] as const).map((cat) =>
              categoryCount[cat] > 0 ? (
                <div key={cat} className="text-center">
                  <span className="text-lg" aria-hidden="true">{FILTERS.find((f) => f.key === cat)?.icon}</span>
                  <p className="text-xs text-white/90">{categoryLabels[cat]} : {categoryCount[cat]}</p>
                </div>
              ) : null
            )}
          </div>
        )}

        {sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between gap-2 text-xs text-white/90">
            <span className="truncate">Sources : {sources.join(', ')}</span>
            {lastUpdate && (
              <span className="whitespace-nowrap">
                {refreshing ? 'Mise à jour…' : `Données du ${new Date(lastUpdate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bannière d'erreur */}
      {loadError && (
        <div role="alert" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start gap-2">
          <span className="text-red-500 mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{loadError}</p>
            {lastUpdate && alerts.length > 0 && (
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                Liste affichée : données du {new Date(lastUpdate).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sources dégradées (état des circuit breakers et/ou drapeau `degraded`
          de /api/alerts). Aucune donnée n'est simulée : on prévient l'utilisateur
          et on renvoie vers la source officielle. */}
      {(degraded || degradedSources.length > 0) && (
        <div role="alert" className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-2">
          <span className="text-amber-500 mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {degradedSources.length > 1
                ? `${degradedSources.length} sources sont temporairement indisponibles`
                : 'Une source d\'alerte est temporairement indisponible'}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              {degradedSources.length > 0 && `${degradedSources.map((s) => s.source).join(', ')} — `}
              la liste peut être incomplète. En cas de doute, consultez{' '}
              <a href="https://vigilance.meteofrance.fr" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                vigilance.meteofrance.fr
              </a>
              .
            </p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrer les alertes">
        {FILTERS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`px-3 py-1.5 min-h-11 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{currentFilter.heading}</h3>

        {filteredAlerts.length === 0 ? (
          <Card className="text-center py-8">
            <div className="text-4xl mb-2" aria-hidden="true">✅</div>
            <p className="text-gray-600 dark:text-gray-300">
              {filter === 'all' ? 'Aucune alerte en cours' : `Aucune alerte dans cette catégorie`}
            </p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {filteredAlerts.map((alert) => (
              <li key={alert.id}>
                <AlertCard alert={alert} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function AlertCard({ alert }: { alert: UnifiedAlert }) {
  const levelConfig = alertLevels[alert.level];
  const typeInfo = alertTypes.find((t) => t.type === alert.type);

  return (
    <Link href={`/alertes/${encodeURIComponent(alert.id)}`} className="block">
      <Card className={`border-l-4 ${levelConfig.borderColor} hover:shadow-lg transition-all active:scale-[0.99]`}>
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 ${levelConfig.bgColor} rounded-xl flex items-center justify-center text-xl flex-shrink-0`} aria-hidden="true">
            {alert.icon || typeInfo?.icon || '⚠️'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">{alert.title}</h4>
              <span className={`px-2 py-0.5 ${levelConfig.bgColor} ${levelConfig.textOnBg} text-xs rounded-full`}>
                {levelConfig.name.replace('Vigilance ', '')}
              </span>
              <span className={`px-2 py-0.5 ${categoryColors[alert.category] || 'bg-gray-600'} text-white text-xs rounded-full`}>
                {categoryLabels[alert.category] || alert.category}
              </span>
            </div>
            {alert.department && (
              <p className="text-sm text-primary dark:text-blue-400 font-medium">{alert.department}</p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{alert.description}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {new Date(alert.updatedAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span aria-hidden="true">•</span>
              <span>{alert.source}</span>
            </div>
          </div>
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </Link>
  );
}
