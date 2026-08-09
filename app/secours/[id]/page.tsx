import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFicheById, fichesSecours } from '@/lib/fiches-secours';
import FicheContent from '@/components/secours/FicheContent';
import { serializeJsonLd } from '@/lib/json-ld';

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
    title: fiche.title,
    description: fiche.shortDescription,
    openGraph: {
      title: `${fiche.title} - Premiers secours`,
      description: fiche.shortDescription,
      type: 'article',
    },
  };
}

export default function FichePage({ params }: PageProps) {
  const fiche = getFicheById(params.id);

  if (!fiche) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: fiche.title,
    description: fiche.shortDescription,
    step: fiche.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: step.title,
      text: step.description,
    })),
  };

  return (
    <div className="pb-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      {/* Header fixe */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/secours"
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{fiche.icon}</span>
            <h1 className="font-bold text-gray-800 dark:text-gray-100 truncate">{fiche.title}</h1>
          </div>
        </div>
      </div>

      <FicheContent fiche={fiche} />
    </div>
  );
}
