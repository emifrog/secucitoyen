'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { mainNav, secondaryNav, isNavActive } from '@/lib/nav';

// La recherche globale embarque l'index de tout le contenu : chargée à la
// demande (premier clic) plutôt que dans le bundle du layout.
const GlobalSearch = dynamic(() => import('./GlobalSearch'), { ssr: false });

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

  // `onClose` stable : GlobalSearch y attache un écouteur clavier dans un effet.
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Menu burger : fermeture à Échap, focus sur le premier lien à l'ouverture,
  // retour du focus sur le bouton à la fermeture, fermeture à la navigation.
  useEffect(() => {
    if (!menuOpen) return;
    firstMenuLinkRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const menuLinkClass = (href: string) =>
    `flex items-center gap-3 px-4 py-3 min-h-11 transition-colors ${
      isNavActive(pathname, href)
        ? 'bg-accent/10 text-orange-800 dark:text-orange-300 font-medium'
        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'
    }`;

  return (
    <>
      {/* px-3 / gap-0 / titre en text-base sur les très petits écrans : trois
          boutons de 44 px + logo + titre doivent tenir dans 320 px. */}
      <header className="bg-primary dark:bg-slate-900 text-white px-3 sm:px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center justify-between lg:justify-end sticky top-0 z-50 border-b border-primary dark:border-slate-700">
        <Link href="/" className="flex items-center gap-2 min-w-0 hover:opacity-90 transition-opacity lg:hidden">
          <div className="w-9 h-9 relative">
            {/* Logo bouclier avec croix */}
            <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
              <defs>
                <linearGradient id="headerShield" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F97316"/>
                  <stop offset="100%" stopColor="#EA580C"/>
                </linearGradient>
              </defs>
              <path
                d="M18 3C18 3 30 7 30 7C31 7.3 32 8.3 32 9.5L32 18C32 24 26 30 18 34C10 30 4 24 4 18L4 9.5C4 8.3 5 7.3 6 7C6 7 18 3 18 3Z"
                fill="url(#headerShield)"
              />
              <rect x="15" y="10" width="6" height="16" rx="1.5" fill="white"/>
              <rect x="10" y="15" width="16" height="6" rx="1.5" fill="white"/>
            </svg>
          </div>
          {/* Marque (pas un titre de page : chaque page a son propre h1/h2). */}
          <p className="text-base sm:text-lg font-semibold truncate">SécuCitoyen</p>
        </Link>
        <div className="flex items-center gap-0 sm:gap-1 shrink-0">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2.5 min-w-11 min-h-11 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Rechercher"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            onClick={() => setMenuOpen((open) => !open)}
            className="p-2.5 min-w-11 min-h-11 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors lg:hidden"
            aria-label="Menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-haspopup="true"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Recherche globale (chargée à la demande) */}
      {searchOpen && <GlobalSearch isOpen={searchOpen} onClose={closeSearch} />}

      {/* Menu déroulant (mobile) */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id={menuId}
            aria-label="Menu principal"
            className="absolute top-14 right-4 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 py-2 min-w-[220px]"
          >
            {mainNav.map((item, index) => (
              <Link
                key={item.href}
                ref={index === 0 ? firstMenuLinkRef : undefined}
                href={item.href}
                className={menuLinkClass(item.href)}
                aria-current={isNavActive(pathname, item.href) ? 'page' : undefined}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="border-t border-gray-200 dark:border-slate-700 my-2" />
            {secondaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={menuLinkClass(item.href)}
                aria-current={isNavActive(pathname, item.href) ? 'page' : undefined}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="border-t border-gray-200 dark:border-slate-700 my-2" />
            <a
              href="tel:112"
              className="flex items-center gap-3 px-4 py-3 min-h-11 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <span aria-hidden="true">📞</span>
              <span className="font-semibold">Appeler le 112</span>
            </a>
          </nav>
        </>
      )}
    </>
  );
}
