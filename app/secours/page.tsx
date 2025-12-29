import Link from 'next/link';
import { Card } from '@/components/ui';
import { getFichesSummary } from '@/lib/fiches-secours';

const urgencyConfig = {
  critical: {
    label: 'Urgence vitale',
    color: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500',
  },
  high: {
    label: 'Urgence haute',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    dot: 'bg-orange-500',
  },
  medium: {
    label: 'Urgence modérée',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dot: 'bg-yellow-500',
  },
};

export default function SecoursPage() {
  const fiches = getFichesSummary();

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Premiers secours</h2>
        <p className="text-gray-600 dark:text-gray-400">
          15 fiches pratiques pour les gestes qui sauvent. Disponibles hors-ligne.
        </p>
      </section>

      {/* Alerte */}
      <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3">
        <div className="text-2xl">🚨</div>
        <div>
          <p className="text-sm text-red-800 dark:text-red-300 font-semibold mb-1">
            En cas d&apos;urgence vitale
          </p>
          <p className="text-sm text-red-700 dark:text-red-400">
            Appelez le <Link href="tel:15" className="font-bold underline">15</Link> ou le{' '}
            <Link href="tel:112" className="font-bold underline">112</Link> avant d&apos;agir.
          </p>
        </div>
      </section>

      {/* Liste des fiches */}
      <section className="space-y-3">
        {fiches.map((fiche) => {
          const config = urgencyConfig[fiche.urgency];
          return (
            <Link key={fiche.id} href={`/secours/${fiche.id}`}>
              <Card className="flex items-center gap-4 hover:shadow-lg transition-all active:scale-[0.99]">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                  {fiche.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{fiche.title}</h3>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{fiche.shortDescription}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Card>
            </Link>
          );
        })}
      </section>

      {/* Info offline */}
      <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <div className="text-2xl">📱</div>
        <div>
          <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-1">Disponible hors-ligne</p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Ces fiches sont sauvegardées sur votre téléphone et accessibles même sans connexion internet.
          </p>
        </div>
      </section>

      {/* Rappel formation */}
      <section className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-white">
        <h3 className="font-semibold mb-2">Se former aux gestes qui sauvent</h3>
        <p className="text-sm text-white/80 mb-3">
          Ces fiches ne remplacent pas une formation. Trouvez une session PSC1 près de chez vous.
        </p>
        <Link
          href="https://www.interieur.gouv.fr/Le-ministere/Securite-civile/Documentation-technique/Secourisme-et-premiers-secours"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          En savoir plus
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </section>
    </div>
  );
}
