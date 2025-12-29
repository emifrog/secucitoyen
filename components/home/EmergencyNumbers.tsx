'use client';

import Link from 'next/link';

const emergencyNumbers = [
  { number: '15', name: 'SAMU', color: 'bg-red-500' },
  { number: '17', name: 'Police', color: 'bg-blue-600' },
  { number: '18', name: 'Pompiers', color: 'bg-orange-500' },
  { number: '112', name: 'Urgences', color: 'bg-green-600' },
];

export default function EmergencyNumbers() {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Numéros d&apos;urgence</h3>
        <Link href="/urgences" className="text-sm text-accent font-medium">
          Voir tout →
        </Link>
      </div>
      <div className="flex gap-2">
        {emergencyNumbers.map((item) => (
          <Link
            key={item.number}
            href={`tel:${item.number}`}
            className="flex-1"
          >
            <div className={`${item.color} text-white rounded-xl p-3 text-center transition-all hover:scale-105 active:scale-95 shadow-sm`}>
              <div className="text-xl font-bold">{item.number}</div>
              <div className="text-xs opacity-90">{item.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
