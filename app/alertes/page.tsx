import { Suspense } from 'react';
import AlertsList from '@/components/alertes/AlertsList';
import DepartmentSelector from '@/components/alertes/DepartmentSelector';
import VigilanceMap from '@/components/alertes/VigilanceMap';
import NotificationPrompt from '@/components/alertes/NotificationPrompt';

export const revalidate = 300; // Revalidate every 5 minutes

export default function AlertesPage() {
  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Alertes & Vigilances</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Vigilances météo et alertes en temps réel.
        </p>
      </section>

      {/* Notification prompt */}
      <NotificationPrompt />

      {/* Carte vigilance */}
      <section>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Carte de vigilance</h3>
        <VigilanceMap />
      </section>

      {/* Sélecteur département */}
      <Suspense fallback={<div className="animate-pulse bg-gray-100 h-12 rounded-xl" />}>
        <DepartmentSelector />
      </Suspense>

      {/* Liste des alertes */}
      <Suspense fallback={<AlertsListSkeleton />}>
        <AlertsList />
      </Suspense>

      {/* Légende */}
      <section className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Niveaux de vigilance</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Vert - Pas de vigilance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Jaune - Soyez attentif</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Orange - Soyez vigilant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Rouge - Danger</span>
          </div>
        </div>
      </section>

      {/* Source */}
      <section className="text-center text-xs text-gray-500 dark:text-gray-400">
        <p>Données : Météo-France</p>
        <p>Mise à jour automatique toutes les 5 minutes</p>
      </section>
    </div>
  );
}

function AlertsListSkeleton() {
  return (
    <section className="space-y-3">
      <div className="animate-pulse bg-gray-100 dark:bg-slate-700 h-6 w-32 rounded" />
      {[1, 2].map((i) => (
        <div key={i} className="animate-pulse bg-gray-100 dark:bg-slate-700 h-24 rounded-xl" />
      ))}
    </section>
  );
}
