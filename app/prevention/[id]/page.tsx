import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getChecklistById, checklistsPrevention } from '@/lib/checklists-prevention';
import ChecklistContent from '@/components/prevention/ChecklistContent';

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return checklistsPrevention.map((checklist) => ({
    id: checklist.id,
  }));
}

export function generateMetadata({ params }: PageProps) {
  const checklist = getChecklistById(params.id);
  if (!checklist) return { title: 'Check-list non trouvée' };

  return {
    title: `${checklist.title} - SécuCitoyen`,
    description: checklist.description,
  };
}

export default function ChecklistPage({ params }: PageProps) {
  const checklist = getChecklistById(params.id);

  if (!checklist) {
    notFound();
  }

  return (
    <div className="pb-6">
      {/* Header fixe */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/prevention"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Retour"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{checklist.icon}</span>
            <h1 className="font-bold text-gray-800 truncate">{checklist.title}</h1>
          </div>
        </div>
      </div>

      <ChecklistContent checklist={checklist} />
    </div>
  );
}
