'use client';

import Link from 'next/link';
import { emergencyNumbers, categories, getNumbersByCategory } from '@/lib/numeros-urgence';
import { Card } from '@/components/ui';
import LocationFinder from '@/components/urgences/LocationFinder';
import SearchNumbers from '@/components/urgences/SearchNumbers';
import FavoriteNumbers from '@/components/urgences/FavoriteNumbers';
import FavoriteButton from '@/components/urgences/FavoriteButton';
import ShareLocation from '@/components/urgences/ShareLocation';

export default function UrgencesPage() {
  const vitalNumbers = getNumbersByCategory('vital');
  const socialNumbers = getNumbersByCategory('social');
  const specialNumbers = getNumbersByCategory('special');

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Numéros d&apos;urgence</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tous les numéros essentiels, gratuits et disponibles 24h/24.
        </p>
      </section>

      {/* Bouton 112 principal */}
      <section>
        <Link href="tel:112">
          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              🆘
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold">112</div>
              <div className="text-sm text-white/90">Numéro d&apos;urgence universel</div>
              <div className="text-xs text-white/70 mt-1">Fonctionne partout en Europe, même sans carte SIM</div>
            </div>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </Link>
      </section>

      {/* Favoris */}
      <FavoriteNumbers />

      {/* Recherche */}
      <SearchNumbers />

      {/* Géolocalisation */}
      <LocationFinder />

      {/* Partage de position */}
      <ShareLocation />

      {/* Urgences vitales */}
      <section className="space-y-3">
        <div className={`${categories.vital.color} border rounded-lg p-3`}>
          <h3 className={`font-bold ${categories.vital.textColor}`}>{categories.vital.title}</h3>
          <p className={`text-sm ${categories.vital.textColor} opacity-80`}>{categories.vital.description}</p>
        </div>
        {vitalNumbers.filter(n => n.number !== '112').map((emergency) => (
          <EmergencyCard key={emergency.number} emergency={emergency} />
        ))}
      </section>

      {/* Aide sociale */}
      <section className="space-y-3">
        <div className={`${categories.social.color} border rounded-lg p-3`}>
          <h3 className={`font-bold ${categories.social.textColor}`}>{categories.social.title}</h3>
          <p className={`text-sm ${categories.social.textColor} opacity-80`}>{categories.social.description}</p>
        </div>
        {socialNumbers.map((emergency) => (
          <EmergencyCard key={emergency.number} emergency={emergency} />
        ))}
      </section>

      {/* Numéros spécialisés */}
      <section className="space-y-3">
        <div className={`${categories.special.color} border rounded-lg p-3`}>
          <h3 className={`font-bold ${categories.special.textColor}`}>{categories.special.title}</h3>
          <p className={`text-sm ${categories.special.textColor} opacity-80`}>{categories.special.description}</p>
        </div>
        {specialNumbers.map((emergency) => (
          <EmergencyCard key={emergency.number} emergency={emergency} />
        ))}
      </section>

      {/* Info */}
      <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <div className="text-2xl">💡</div>
        <div>
          <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-1">Bon à savoir</p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Tous ces numéros sont gratuits depuis un fixe ou un mobile, même sans crédit.
          </p>
        </div>
      </section>
    </div>
  );
}

function EmergencyCard({ emergency }: { emergency: typeof emergencyNumbers[0] }) {
  return (
    <div className="relative">
      <Link href={`/urgences/${emergency.number.replace(/\s/g, '-')}`}>
        <Card className="flex items-center gap-4 hover:shadow-lg transition-all active:scale-[0.99]">
          <div className={`w-14 h-14 ${emergency.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
            {emergency.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-bold text-primary dark:text-blue-400">{emergency.number}</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{emergency.name}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{emergency.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton number={emergency.number} size="sm" />
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Card>
      </Link>
    </div>
  );
}
