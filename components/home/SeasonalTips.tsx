'use client';

import Link from 'next/link';
import { getSaisonActuelle } from '@/lib/conseils-saisonniers';

export default function SeasonalTips() {
  const saison = getSaisonActuelle();
  const conseilsPreview = saison.conseils.slice(0, 3);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span>{saison.icon}</span>
          Conseils de saison
        </h3>
        <Link
          href="/conseils-saison"
          className="text-sm text-primary dark:text-blue-400 hover:underline"
        >
          Voir tout
        </Link>
      </div>

      <div className="space-y-2">
        {conseilsPreview.map((conseil) => (
          <Link key={conseil.id} href={`/conseils-saison/${conseil.id}`}>
            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl hover:shadow-md transition-all">
              <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                {conseil.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">
                  {conseil.titre}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {conseil.description}
                </p>
              </div>
              {conseil.urgence && (
                <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" title="Contient une alerte urgence" />
              )}
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      <div className={`${saison.couleur} rounded-xl p-3 flex items-center gap-3`}>
        <span className="text-2xl">{saison.icon}</span>
        <div className="text-white">
          <p className="text-sm font-medium">{saison.nom} - {saison.conseils.length} conseils</p>
          <p className="text-xs text-white/80">Conseils adaptés à la saison actuelle</p>
        </div>
      </div>
    </section>
  );
}
