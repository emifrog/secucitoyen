'use client';

import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import GlobalSearch from './GlobalSearch';
import LanguageSelector from './LanguageSelector';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="bg-primary dark:bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-primary dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-sm">
            SC
          </div>
          <h1 className="text-lg font-semibold">SécuCitoyen</h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Rechercher"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <LanguageSelector />
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Recherche globale */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Menu déroulant */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-14 right-4 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 py-2 min-w-[200px]">
            <a
              href="/urgences"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span>🚨</span>
              <span className="text-gray-800 dark:text-gray-200">Urgences</span>
            </a>
            <a
              href="/secours"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span>🏥</span>
              <span className="text-gray-800 dark:text-gray-200">Premiers secours</span>
            </a>
            <a
              href="/prevention"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span>🛡️</span>
              <span className="text-gray-800 dark:text-gray-200">Prévention</span>
            </a>
            <a
              href="/alertes"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span>🔔</span>
              <span className="text-gray-800 dark:text-gray-200">Alertes</span>
            </a>
            <div className="border-t border-gray-200 dark:border-slate-700 my-2" />
            <a
              href="tel:112"
              className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <span>📞</span>
              <span className="font-semibold">Appeler le 112</span>
            </a>
          </div>
        </>
      )}
    </>
  );
}
