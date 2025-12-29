import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui';
import { getConseilById, saisons, getSaisonActuelle } from '@/lib/conseils-saisonniers';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const allConseils: { id: string }[] = [];
  for (const saison of saisons) {
    for (const conseil of saison.conseils) {
      allConseils.push({ id: conseil.id });
    }
  }
  return allConseils;
}

export default async function ConseilSaisonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const conseil = getConseilById(id);

  if (!conseil) {
    notFound();
  }

  // Trouver la saison du conseil
  const saison = saisons.find((s) => s.conseils.some((c) => c.id === id)) || getSaisonActuelle();

  return (
    <div className="p-4 space-y-5">
      {/* Header avec retour */}
      <div className="flex items-center gap-3">
        <Link
          href="/conseils-saison"
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span>{saison.icon}</span>
            {saison.nom}
          </p>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{conseil.titre}</h2>
        </div>
        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-2xl">
          {conseil.icon}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-300">{conseil.description}</p>

      {/* Alerte urgence si présente */}
      {conseil.urgence && (
        <section className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="text-2xl">🚨</div>
            <div>
              <p className="text-sm text-orange-800 dark:text-orange-300 font-semibold mb-1">
                Situation d&apos;urgence
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                {conseil.urgence}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Liste des conseils */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          Conseils de prévention
        </h3>

        <Card>
          <ul className="space-y-4">
            {conseil.conseils.map((c, index) => (
              <li key={index} className="flex gap-3">
                <div className={`w-6 h-6 ${saison.couleur} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{c}</p>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Numéros d'urgence associés */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          En cas de problème
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <a
            href="tel:15"
            className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">15</span>
            </div>
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">SAMU</p>
              <p className="text-xs text-red-600 dark:text-red-400">Urgence médicale</p>
            </div>
          </a>

          <a
            href="tel:18"
            className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">18</span>
            </div>
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-300">Pompiers</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">Secours</p>
            </div>
          </a>
        </div>
      </section>

      {/* Lien vers la fiche secours si pertinent */}
      <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📋</div>
          <div className="flex-1">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold">
              Besoin des gestes de secours ?
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Consultez nos fiches pratiques
            </p>
          </div>
          <Link
            href="/secours"
            className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Voir les fiches
          </Link>
        </div>
      </section>
    </div>
  );
}
