import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFicheById, fichesSecours } from '@/lib/fiches-secours';
import FicheContent from '@/components/secours/FicheContent';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return fichesSecours.map((fiche) => ({
    id: fiche.id,
  }));
}

export function generateMetadata({ params }: PageProps) {
  const fiche = getFicheById(params.id);
  if (!fiche) return { title: 'Fiche non trouvée' };

  return {
    title: `${fiche.title} - SécuCitoyen`,
    description: fiche.shortDescription,
  };
}

export default function FichePage({ params }: PageProps) {
  const fiche = getFicheById(params.id);

  if (!fiche) {
    notFound();
  }

  return (
    <div className="pb-6">
      {/* Header fixe */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/secours"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{fiche.icon}</span>
            <h1 className="font-bold text-gray-800 truncate">{fiche.title}</h1>
          </div>
        </div>
      </div>

      {/* Bouton urgence flottant */}
      <Link
        href="tel:15"
        className="fixed bottom-24 right-4 z-20 bg-red-600 text-white p-4 rounded-full shadow-lg shadow-red-500/30 hover:bg-red-700 active:scale-95 transition-all"
        aria-label="Appeler le 15"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </Link>

      <FicheContent fiche={fiche} />
    </div>
  );
}
