import type { Metadata } from 'next';
import AlertsList from '@/components/alertes/AlertsList';
import DepartmentSelector from '@/components/alertes/DepartmentSelector';
import VigilanceMap from '@/components/alertes/VigilanceMap';
import NotificationPrompt from '@/components/alertes/NotificationPrompt';

export const metadata: Metadata = {
  title: 'Alertes',
  description: 'Vigilances météo, qualité de l\'air, crues et risques incendie en temps réel pour votre département.',
  alternates: { canonical: '/alertes' },
};

const LEVELS = [
  { color: 'bg-green-500', label: 'Vert - Pas de vigilance' },
  { color: 'bg-yellow-400', label: 'Jaune - Soyez attentif' },
  { color: 'bg-orange-500', label: 'Orange - Soyez vigilant' },
  { color: 'bg-red-600', label: 'Rouge - Danger' },
];

export default function AlertesPage() {
  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <section>
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">Alertes &amp; Vigilances</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Vigilances météo et alertes en temps réel.
        </p>
      </section>

      {/* Notification prompt */}
      <NotificationPrompt />

      {/* Carte vigilance */}
      <section>
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Carte de vigilance</h2>
        <VigilanceMap />
      </section>

      {/* Sélecteur département */}
      <DepartmentSelector />

      {/* Liste des alertes */}
      <AlertsList />

      {/* Légende */}
      <section className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Niveaux de vigilance</h2>
        <ul className="grid grid-cols-2 gap-2">
          {LEVELS.map((level) => (
            <li key={level.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${level.color}`} aria-hidden="true" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{level.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Source */}
      <section className="text-center text-xs text-gray-600 dark:text-gray-400">
        <p>Données : Météo-France (vigilance), Vigicrues (crues), Open-Meteo (qualité de l&apos;air).</p>
        <p>Le risque incendie est une estimation de l&apos;application, non un produit officiel.</p>
        <p>Mise à jour automatique toutes les 5 minutes.</p>
      </section>
    </div>
  );
}
