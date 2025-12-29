'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Alert, alertLevels, alertTypes, mockAlerts, getAdviceForAlert } from '@/lib/alertes';
import { Card } from '@/components/ui';

export default function AlertDetailPage() {
  const params = useParams();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement
    const loadAlert = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const found = mockAlerts.find((a) => a.id === params.id);
      if (found) {
        const advice = getAdviceForAlert(found.type, found.level);
        setAlert({ ...found, advice });
      }
      setLoading(false);
    };

    loadAlert();
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse bg-gray-100 dark:bg-slate-700 h-8 w-48 rounded" />
        <div className="animate-pulse bg-gray-100 dark:bg-slate-700 h-32 rounded-xl" />
        <div className="animate-pulse bg-gray-100 dark:bg-slate-700 h-48 rounded-xl" />
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="p-4 text-center py-12">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Alerte non trouvée</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Cette alerte n&apos;existe pas ou a été levée.</p>
        <Link
          href="/alertes"
          className="inline-flex items-center gap-2 text-primary font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux alertes
        </Link>
      </div>
    );
  }

  const levelConfig = alertLevels[alert.level];
  const typeInfo = alertTypes.find((t) => t.type === alert.type);

  return (
    <div className="pb-6">
      {/* Header fixe */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/alertes"
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{typeInfo?.icon || '⚠️'}</span>
            <h1 className="font-bold text-gray-800 dark:text-gray-100 truncate">{typeInfo?.name || alert.type}</h1>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5 mt-4">
        {/* Header alerte */}
        <section className={`${levelConfig.bgColor} text-white rounded-2xl p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">{typeInfo?.icon || '⚠️'}</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {levelConfig.name}
            </span>
          </div>
          <h2 className="text-xl font-bold mb-2">{alert.title}</h2>
          {alert.department && (
            <p className="text-white/90 font-medium">{alert.department}</p>
          )}
          <p className="text-white/80 text-sm mt-2">{alert.description}</p>
          <div className="flex items-center gap-2 mt-4 text-sm text-white/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Mis à jour : {new Date(alert.updatedAt).toLocaleString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </section>

        {/* Conseils */}
        {alert.advice && alert.advice.length > 0 && (
          <section className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span>📋</span> Conseils de comportement
            </h3>
            <ul className="space-y-3">
              {alert.advice.map((advice, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 ${levelConfig.bgColor} text-white rounded-full flex items-center justify-center text-xs font-bold`}>
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{advice}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Infos complémentaires */}
        <section className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span>ℹ️</span> Informations
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-white dark:bg-slate-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Source</div>
              <div className="font-medium text-gray-800 dark:text-gray-100">{alert.source}</div>
            </Card>
            <Card className="bg-white dark:bg-slate-800">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Département</div>
              <div className="font-medium text-gray-800 dark:text-gray-100">{alert.department || 'National'}</div>
            </Card>
            {alert.endDate && (
              <Card className="bg-white dark:bg-slate-800 col-span-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fin prévue</div>
                <div className="font-medium text-gray-800 dark:text-gray-100">
                  {new Date(alert.endDate).toLocaleString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* En cas d'urgence */}
        <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <h3 className="font-bold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
            <span>🚨</span> En cas d&apos;urgence
          </h3>
          <div className="space-y-2">
            <Link
              href="tel:112"
              className="flex items-center gap-3 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <div className="font-bold">Appeler le 112</div>
                <div className="text-sm text-white/80">Urgences</div>
              </div>
            </Link>
            <Link
              href="tel:18"
              className="flex items-center gap-3 p-3 bg-white border border-red-200 text-red-800 rounded-lg hover:bg-red-50 transition-colors"
            >
              <span className="text-xl">🚒</span>
              <div>
                <div className="font-bold">Appeler le 18</div>
                <div className="text-sm text-red-600">Pompiers</div>
              </div>
            </Link>
          </div>
        </section>

        {/* Lien Météo-France */}
        <section>
          <Link
            href="https://vigilance.meteofrance.fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            <span>Voir sur Météo-France</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </section>
      </div>
    </div>
  );
}
