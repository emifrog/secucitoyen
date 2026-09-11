import type { Metadata } from 'next';
import AlertDetail from '@/components/alertes/AlertDetail';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Les alertes sont des données temps réel : la page n'est pas prérendue, le
// détail est chargé côté client depuis /api/alerts.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Détail de l'alerte",
    description: 'Niveau de vigilance, département concerné et conseils de comportement.',
    // Contenu éphémère : ne pas indexer.
    robots: { index: false, follow: true },
    alternates: { canonical: `/alertes/${encodeURIComponent(id)}` },
  };
}

export default async function AlertDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AlertDetail id={id} />;
}
