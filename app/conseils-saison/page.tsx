import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui';
import { saisons, getSaisonActuelle } from '@/lib/conseils-saisonniers';

export const metadata: Metadata = {
  title: 'Conseils saisonniers',
  description: 'Risques et conseils de prévention adaptés à chaque saison : hiver, printemps, été, automne.',
  alternates: { canonical: '/conseils-saison' },
};

// La saison est calculée côté serveur : sans revalidation, elle resterait
// figée à la date du build jusqu'au déploiement suivant.
export const revalidate = 86400;

export default function ConseilsSaisonPage() {
  const saisonActuelle = getSaisonActuelle();

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <section>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Conseils saisonniers
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Risques et prévention adaptés à chaque saison
        </p>
      </section>

      {/* Saison actuelle mise en avant */}
      <section className={`${saisonActuelle.couleur} rounded-xl p-4 text-white`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{saisonActuelle.icon}</span>
          <div>
            <p className="text-sm text-white">Saison actuelle</p>
            <h3 className="text-xl font-bold">{saisonActuelle.nom}</h3>
          </div>
        </div>
        <p className="text-sm text-white/90">
          {saisonActuelle.conseils.length} conseils de prévention pour cette période
        </p>
      </section>

      {/* Conseils de la saison actuelle */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          Conseils {saisonActuelle.nom.toLowerCase()}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {saisonActuelle.conseils.map((conseil) => (
          <Link key={conseil.id} href={`/conseils-saison/${conseil.id}`}>
            <Card className="hover:shadow-lg transition-all active:scale-[0.99]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {conseil.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100">{conseil.titre}</h4>
                    {conseil.urgence && (
                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full">
                        Urgence
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {conseil.description}
                  </p>
                  <p className="text-xs text-primary dark:text-blue-400 mt-1">
                    {conseil.conseils.length} conseils
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Card>
          </Link>
        ))}
        </div>
      </section>

      {/* Autres saisons */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          Autres saisons
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {saisons
            .filter((s) => s.id !== saisonActuelle.id)
            .map((saison) => (
              <Link key={saison.id} href={`/conseils-saison?saison=${saison.id}`}>
                <div className={`${saison.couleur} rounded-xl p-4 text-white hover:opacity-90 transition-opacity`}>
                  <div className="text-3xl mb-2">{saison.icon}</div>
                  <h4 className="font-semibold">{saison.nom}</h4>
                  <p className="text-sm text-white">{saison.conseils.length} conseils</p>
                </div>
              </Link>
            ))}
        </div>
      </section>

      {/* Info */}
      <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <div className="text-2xl">💡</div>
        <div>
          <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-1">Conseils automatiques</p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Les conseils affichés en priorité sont adaptés à la saison en cours pour vous aider à anticiper les risques.
          </p>
        </div>
      </section>
    </div>
  );
}
