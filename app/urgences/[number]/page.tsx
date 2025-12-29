import Link from 'next/link';
import { notFound } from 'next/navigation';
import { emergencyNumbers, categories } from '@/lib/numeros-urgence';
import FavoriteHeaderButton from '@/components/urgences/FavoriteHeaderButton';

interface PageProps {
  params: { number: string };
}

export function generateStaticParams() {
  return emergencyNumbers.map((n) => ({
    number: n.number.replace(/\s/g, '-'),
  }));
}

export function generateMetadata({ params }: PageProps) {
  const number = emergencyNumbers.find(
    (n) => n.number.replace(/\s/g, '-') === params.number
  );
  if (!number) return { title: 'Numéro non trouvé' };

  return {
    title: `${number.number} - ${number.name} - SécuCitoyen`,
    description: number.description,
  };
}

export default function EmergencyNumberPage({ params }: PageProps) {
  const emergency = emergencyNumbers.find(
    (n) => n.number.replace(/\s/g, '-') === params.number
  );

  if (!emergency) {
    notFound();
  }

  const category = categories[emergency.category];

  return (
    <div className="pb-6">
      {/* Header fixe */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/urgences"
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{emergency.icon}</span>
            <h1 className="font-bold text-gray-800 dark:text-gray-100">{emergency.name}</h1>
          </div>
          <FavoriteHeaderButton number={emergency.number} />
        </div>
      </div>

      {/* Contenu */}
      <div className="px-4 space-y-5 mt-4">
        {/* Header avec numéro */}
        <section className={`${emergency.color} text-white rounded-2xl p-6 text-center`}>
          <div className="text-5xl font-bold mb-2">{emergency.number}</div>
          <div className="text-lg opacity-90">{emergency.name}</div>
          <div className="text-sm opacity-75 mt-1">{emergency.description}</div>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {emergency.available}
          </div>
        </section>

        {/* Bouton appeler */}
        <section>
          <Link href={`tel:${emergency.number.replace(/\s/g, '')}`}>
            <div className="bg-green-500 hover:bg-green-600 text-white rounded-xl p-4 flex items-center justify-center gap-3 transition-colors active:scale-[0.98]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-lg font-bold">Appeler le {emergency.number}</span>
            </div>
          </Link>
        </section>

        {/* Catégorie */}
        <section className={`${category.color} border rounded-lg p-3`}>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${category.textColor}`}>
              {category.title}
            </span>
          </div>
        </section>

        {/* Quand appeler */}
        <section className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
          <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span>📋</span> Quand appeler ce numéro ?
          </h2>
          <ul className="space-y-3">
            {emergency.details.map((detail, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                {detail}
              </li>
            ))}
          </ul>
        </section>

        {/* Conseils */}
        <section className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <h2 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
            <span>💡</span> Avant d&apos;appeler
          </h2>
          <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-400">
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Restez calme et parlez clairement</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Donnez votre localisation précise (adresse, repères)</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Décrivez la situation et le nombre de personnes concernées</span>
            </li>
            <li className="flex items-start gap-2">
              <span>•</span>
              <span>Ne raccrochez pas avant qu&apos;on vous le dise</span>
            </li>
          </ul>
        </section>

        {/* Bouton appeler en bas */}
        <section className="pt-4">
          <Link href={`tel:${emergency.number.replace(/\s/g, '')}`}>
            <div className={`${emergency.color} text-white rounded-xl p-5 flex items-center gap-4 shadow-lg active:scale-[0.98] transition-all`}>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{emergency.number}</div>
                <div className="text-sm opacity-90">Appel gratuit • {emergency.available}</div>
              </div>
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
