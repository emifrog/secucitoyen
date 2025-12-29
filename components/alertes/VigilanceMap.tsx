'use client';

import Link from 'next/link';

export default function VigilanceMap() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Image de la carte de vigilance Météo-France */}
      <Link
        href="https://vigilance.meteofrance.fr/"
        target="_blank"
        rel="noopener noreferrer"
        className="block relative"
      >
        <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center relative">
          {/* Placeholder stylisé de la carte de France */}
          <div className="absolute inset-4 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full max-w-[200px] opacity-50">
              <path
                d="M50 5 L75 15 L85 35 L80 55 L70 75 L55 85 L40 90 L25 80 L15 60 L20 40 L35 20 Z"
                fill="currentColor"
                className="text-green-400"
              />
            </svg>
          </div>
          <div className="relative z-10 text-center p-4">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Carte de vigilance Météo-France
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cliquez pour voir la carte officielle
            </p>
          </div>
        </div>

        {/* Overlay au hover */}
        <div className="absolute inset-0 bg-primary/0 hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <span className="bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-primary flex items-center gap-2">
            Ouvrir sur Météo-France
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </span>
        </div>
      </Link>

      {/* Légende rapide */}
      <div className="p-3 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600 dark:text-gray-300">RAS</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="text-xs text-gray-600 dark:text-gray-300">Attentif</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-gray-600 dark:text-gray-300">Vigilant</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-xs text-gray-600 dark:text-gray-300">Danger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
