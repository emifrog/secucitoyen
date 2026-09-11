import Link from 'next/link';
import { getNumberByNumber } from '@/lib/numeros-urgence';

// Composant serveur : lit la source unique des numéros (plus de copie locale
// avec des couleurs divergentes).
const QUICK_NUMBERS = ['15', '17', '18', '112'] as const;

export default function EmergencyNumbers() {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Numéros d&apos;urgence</h2>
        <Link href="/urgences" className="text-sm text-orange-700 dark:text-orange-400 font-medium py-2">
          Voir tout →
        </Link>
      </div>
      {/* 2 colonnes sous 640 px (« Urgences européennes » ne tient pas dans un
          quart de 320 px), 4 au-delà — même grille que l'accès rapide. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUICK_NUMBERS.map((num) => {
          const info = getNumberByNumber(num);
          if (!info) return null;
          return (
            <a key={num} href={`tel:${num}`} className="min-w-0" aria-label={`Appeler le ${num} (${info.name})`}>
              <div className={`${info.color} text-white rounded-xl p-3 min-h-11 h-full text-center transition-all hover:scale-105 active:scale-95 shadow-sm`}>
                <div className="text-xl font-bold">{num}</div>
                <div className="text-xs break-words">{info.name}</div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
