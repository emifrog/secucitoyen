import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFicheById, fichesSecours } from '@/lib/fiches-secours';
import FicheContent from '@/components/secours/FicheContent';
import { serializeJsonLd } from '@/lib/json-ld';

// Next 15 : `params` est une Promise.
interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return fichesSecours.map((fiche) => ({
    id: fiche.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const fiche = getFicheById(id);
  if (!fiche) return { title: 'Fiche non trouvée' };

  return {
    title: fiche.title,
    description: fiche.shortDescription,
    alternates: { canonical: `/secours/${fiche.id}` },
    // `openGraph` n'est pas fusionné en profondeur avec celui du layout :
    // répéter l'image, sinon la fiche perd son aperçu au partage.
    openGraph: {
      title: `${fiche.title} - Premiers secours`,
      description: fiche.shortDescription,
      type: 'article',
      siteName: 'SécuCitoyen',
      locale: 'fr_FR',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SécuCitoyen' }],
    },
  };
}

export default async function FichePage({ params }: PageProps) {
  const { id } = await params;
  const fiche = getFicheById(id);

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
      {/* Sous-en-tête collant, sous le header global (~64 px). */}
      <div className="sticky top-16 z-10 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/secours"
            className="p-2.5 -ml-2.5 min-w-11 min-h-11 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Retour aux fiches de secours"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl" aria-hidden="true">{fiche.icon}</span>
            <h1 className="font-bold text-gray-800 dark:text-gray-100 truncate">{fiche.title}</h1>
          </div>
        </div>
      </div>

      <FicheContent fiche={fiche} />
    </div>
  );
}
