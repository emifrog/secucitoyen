import type { Metadata } from 'next';
import Link from 'next/link';
import { emergencyNumbers, categories, getNumbersByCategory } from '@/lib/numeros-urgence';
import { Card } from '@/components/ui';
import LocationFinder from '@/components/urgences/LocationFinder';
import SearchNumbers from '@/components/urgences/SearchNumbers';
import FavoriteNumbers from '@/components/urgences/FavoriteNumbers';
import FavoriteButton from '@/components/urgences/FavoriteButton';
import ShareLocation from '@/components/urgences/ShareLocation';

export const metadata: Metadata = {
  title: "Numéros d'urgence",
  description:
    "Tous les numéros d'urgence en France (15, 17, 18, 112, 114…) avec appel direct, favoris, services à proximité et partage de position.",
  alternates: { canonical: '/urgences' },
};

// Page serveur : seules les feuilles interactives (favoris, recherche,
// géolocalisation) sont des composants client.
export default function UrgencesPage() {
  const vitalNumbers = getNumbersByCategory('vital');
  const socialNumbers = getNumbersByCategory('social');
  const specialNumbers = getNumbersByCategory('special');

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <section>
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">Numéros d&apos;urgence</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Tous les numéros essentiels, gratuits et disponibles 24h/24.
        </p>
      </section>

      {/* Bouton 112 principal */}
      <section>
        <a href="tel:112" className="block">
          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl" aria-hidden="true">
              🆘
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold">112</div>
              <div className="text-sm text-white">Numéro d&apos;urgence universel</div>
              <div className="text-xs text-white mt-1">Fonctionne partout en Europe</div>
            </div>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </a>
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
      <CategorySection category={categories.vital}>
        {vitalNumbers.filter((n) => n.number !== '112').map((emergency) => (
          <EmergencyCard key={emergency.number} emergency={emergency} />
        ))}
      </CategorySection>

      {/* Aide sociale */}
      <CategorySection category={categories.social}>
        {socialNumbers.map((emergency) => (
          <EmergencyCard key={emergency.number} emergency={emergency} />
        ))}
      </CategorySection>

      {/* Numéros spécialisés */}
      <CategorySection category={categories.special}>
        {specialNumbers.map((emergency) => (
          <EmergencyCard key={emergency.number} emergency={emergency} />
        ))}
      </CategorySection>

      {/* Info */}
      <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <div className="text-2xl" aria-hidden="true">💡</div>
        <div>
          <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-1">Bon à savoir</p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Les numéros d&apos;urgence sont gratuits depuis un fixe ou un mobile, même sans crédit.
            Certains numéros d&apos;écoute (39 77) sont facturés au prix d&apos;un appel local.
          </p>
        </div>
      </section>
    </div>
  );
}

function CategorySection({
  category,
  children,
}: {
  category: (typeof categories)[keyof typeof categories];
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3" aria-labelledby={`cat-${category.title}`}>
      <div className={`${category.color} border rounded-lg p-3`}>
        <h2 id={`cat-${category.title}`} className={`font-bold ${category.textColor}`}>{category.title}</h2>
        <p className={`text-sm ${category.textColor}`}>{category.description}</p>
      </div>
      {children}
    </section>
  );
}

function EmergencyCard({ emergency }: { emergency: (typeof emergencyNumbers)[0] }) {
  return (
    // Le bouton « favori » est FRÈRE du lien, pas enfant : un <button> dans un
    // <a> est invalide et perturbe le clavier et les lecteurs d'écran.
    <div className="relative">
      <Link href={`/urgences/${emergency.number.replace(/\s/g, '-')}`} className="block">
        <Card className="flex items-center gap-4 pr-24 hover:shadow-lg transition-all active:scale-[0.99]">
          <div className={`w-14 h-14 ${emergency.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`} aria-hidden="true">
            {emergency.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-bold text-primary dark:text-blue-400">{emergency.number}</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">{emergency.name}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{emergency.description}</p>
          </div>
        </Card>
      </Link>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <FavoriteButton number={emergency.number} size="sm" />
        <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
