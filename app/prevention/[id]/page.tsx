import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getChecklistById, checklistsPrevention } from '@/lib/checklists-prevention';
import ChecklistContent from '@/components/prevention/ChecklistContent';

// Next 15 : `params` est une Promise.
interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return checklistsPrevention.map((checklist) => ({
    id: checklist.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const checklist = getChecklistById(id);
  if (!checklist) return { title: 'Check-list non trouvée' };

  // Le template du layout ajoute déjà « | SécuCitoyen ».
  return {
    title: checklist.title,
    description: checklist.description,
    alternates: { canonical: `/prevention/${checklist.id}` },
  };
}

export default async function ChecklistPage({ params }: PageProps) {
  const { id } = await params;
  const checklist = getChecklistById(id);

  if (!checklist) {
    notFound();
  }

  return (
    <div className="pb-6">
      {/* Sous-en-tête collant, sous le header global (~64 px). */}
      <div className="sticky top-16 z-10 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/prevention"
            className="p-2.5 -ml-2.5 min-w-11 min-h-11 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Retour à la prévention"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl" aria-hidden="true">{checklist.icon}</span>
            <h1 className="font-bold text-gray-800 dark:text-gray-100 truncate">{checklist.title}</h1>
          </div>
        </div>
      </div>

      <ChecklistContent checklist={checklist} />
    </div>
  );
}
