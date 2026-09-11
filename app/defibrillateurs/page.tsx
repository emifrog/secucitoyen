import type { Metadata } from 'next';
import DefibrillateursFinder from '@/components/defibrillateurs/DefibrillateursFinder';

export const metadata: Metadata = {
  title: 'Défibrillateurs (DAE)',
  description:
    "Trouvez les défibrillateurs automatisés externes à proximité de votre position, avec itinéraire et mode d'emploi d'un DAE.",
  alternates: { canonical: '/defibrillateurs' },
};

// Page serveur (métadonnées) ; la recherche géolocalisée est un composant client.
export default function DefibrilateursPage() {
  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <section>
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
          Défibrillateurs (DAE)
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Trouvez les défibrillateurs automatiques à proximité
        </p>
      </section>

      {/* Alerte info */}
      <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="text-3xl" aria-hidden="true">🫀</div>
          <div>
            <p className="text-sm text-red-800 dark:text-red-300 font-semibold mb-1">
              En cas d&apos;arrêt cardiaque
            </p>
            <ol className="text-sm text-red-700 dark:text-red-400 space-y-1 list-decimal ml-4">
              <li>Appelez le <a href="tel:15" className="font-bold underline">15</a> ou <a href="tel:112" className="font-bold underline">112</a></li>
              <li>Commencez le massage cardiaque</li>
              <li>Envoyez quelqu&apos;un chercher un DAE</li>
            </ol>
          </div>
        </div>
      </section>

      <DefibrillateursFinder />

      {/* Info utilisation DAE */}
      <section className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <h2 className="font-semibold text-green-800 dark:text-green-300 mb-2">
          Comment utiliser un DAE ?
        </h2>
        <ol className="text-sm text-green-700 dark:text-green-400 space-y-2 list-decimal ml-4">
          <li>Allumez le DAE et suivez les instructions vocales</li>
          <li>Dénudez la poitrine et collez les électrodes comme indiqué</li>
          <li>Laissez le DAE analyser - ne touchez pas la victime</li>
          <li>Si choc conseillé : appuyez sur le bouton, puis reprenez le massage</li>
        </ol>
      </section>
    </div>
  );
}
