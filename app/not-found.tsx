import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
};

// 404 en français, dans le layout de l'app (navigation, FAB), avec les numéros
// d'urgence : la page Next par défaut était en anglais et sans issue.
export default function NotFound() {
  return (
    <div className="p-4 space-y-5">
      <section className="text-center py-8">
        <div className="text-5xl mb-4" aria-hidden="true">🧭</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Page introuvable</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
      </section>

      <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <p className="text-sm text-red-800 dark:text-red-300 font-semibold mb-1">En cas d&apos;urgence</p>
        <p className="text-sm text-red-700 dark:text-red-400">
          Appelez le <a href="tel:112" className="font-bold underline">112</a>, le{' '}
          <a href="tel:15" className="font-bold underline">15</a> ou le{' '}
          <a href="tel:18" className="font-bold underline">18</a>.
        </p>
      </section>

      <nav aria-label="Pages principales" className="grid grid-cols-2 gap-3">
        {[
          { href: '/', label: 'Accueil' },
          { href: '/urgences', label: "Numéros d'urgence" },
          { href: '/secours', label: 'Premiers secours' },
          { href: '/alertes', label: 'Alertes' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-4 py-3 min-h-11 text-center bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-100 rounded-xl font-medium transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
