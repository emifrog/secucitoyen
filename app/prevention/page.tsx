import Link from 'next/link';
import { Card } from '@/components/ui';
import { getChecklistsSummary } from '@/lib/checklists-prevention';
import OverallProgress from '@/components/prevention/OverallProgress';

export default function PreventionPage() {
  const checklists = getChecklistsSummary();

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Prévention</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Check-lists interactives pour sécuriser votre quotidien.
        </p>
      </section>

      {/* Progression globale */}
      <OverallProgress />

      {/* Liste des check-lists */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Vos check-lists</h3>
        {checklists.map((checklist) => (
          <Link key={checklist.id} href={`/prevention/${checklist.id}`}>
            <Card className="flex items-center gap-4 hover:shadow-lg transition-all active:scale-[0.99]">
              <div className={`w-14 h-14 ${checklist.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                {checklist.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 dark:text-gray-100">{checklist.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{checklist.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{checklist.itemCount} éléments</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Card>
          </Link>
        ))}
      </section>

      {/* Conseil */}
      <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <div className="text-2xl">💡</div>
        <div>
          <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-1">Conseil</p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Votre progression est sauvegardée localement. Revenez régulièrement pour compléter vos check-lists.
          </p>
        </div>
      </section>

      {/* Ressources */}
      <section className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-white">
        <h3 className="font-semibold mb-2">Ressources officielles</h3>
        <p className="text-sm text-white/80 mb-3">
          Consultez les recommandations du gouvernement sur les risques.
        </p>
        <Link
          href="https://www.gouvernement.fr/risques"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          gouvernement.fr/risques
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </section>
    </div>
  );
}
