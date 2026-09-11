'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { globalSearch, SearchResult, typeLabels, typeColors } from '@/lib/global-search';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled])';

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Mémoriser l'élément déclencheur pour lui rendre le focus à la fermeture.
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Piège de focus : Tab reste dans le dialogue.
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      restoreFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setResults(query.length >= 2 ? globalSearch(query) : []);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal de recherche */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Recherche"
        className="absolute inset-x-0 top-0 max-w-app md:max-w-2xl mx-auto bg-white dark:bg-slate-800 shadow-2xl animate-slide-down"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (numéros, fiches, alertes...)"
              aria-label="Rechercher dans l'application"
              className="w-full px-4 py-3 pl-10 bg-gray-100 dark:bg-slate-700 rounded-xl border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-600 focus:outline-none transition-all dark:text-gray-100 dark:placeholder-gray-400"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 min-w-11 min-h-11 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Fermer la recherche"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Résultats */}
        <div className="max-h-[60vh] overflow-auto" aria-live="polite">
          {query.length < 2 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">Tapez au moins 2 caractères pour rechercher</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <QuickLink href="/urgences" icon="🆘" label="Urgences" onClick={onClose} />
                <QuickLink href="/secours" icon="🏥" label="Secours" onClick={onClose} />
                <QuickLink href="/prevention" icon="🛡️" label="Prévention" onClick={onClose} />
                <QuickLink href="/alertes" icon="🔔" label="Alertes" onClick={onClose} />
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2" aria-hidden="true">🔍</div>
              <p className="text-sm">Aucun résultat pour &quot;{query}&quot;</p>
            </div>
          ) : (
            <ul className="py-2">
              {results.map((result) => (
                <li key={result.id}>
                  <Link
                    href={result.href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-slate-600 rounded-lg flex items-center justify-center text-xl" aria-hidden="true">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-gray-800 dark:text-gray-100 truncate">
                          {result.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[result.type]}`}>
                          {typeLabels[result.type]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {result.description}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 p-3 min-h-11 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
    >
      <span className="text-lg" aria-hidden="true">{icon}</span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
    </Link>
  );
}
