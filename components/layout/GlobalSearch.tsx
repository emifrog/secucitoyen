'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { globalSearch, SearchResult, typeLabels, typeColors } from '@/lib/global-search';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      setResults([]);
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      setResults(globalSearch(query));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal de recherche */}
      <div className="absolute inset-x-0 top-0 max-w-[428px] mx-auto bg-white dark:bg-slate-800 shadow-2xl animate-slide-down">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (numéros, fiches, alertes...)"
              className="w-full px-4 py-3 pl-10 bg-gray-100 dark:bg-slate-700 rounded-xl border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-600 focus:outline-none transition-all dark:text-gray-100 dark:placeholder-gray-400"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Résultats */}
        <div className="max-h-[60vh] overflow-auto">
          {query.length < 2 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">Tapez au moins 2 caractères pour rechercher</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <QuickLink
                  href="/urgences"
                  icon="🆘"
                  label="Urgences"
                  onClick={handleClose}
                />
                <QuickLink
                  href="/secours"
                  icon="🏥"
                  label="Secours"
                  onClick={handleClose}
                />
                <QuickLink
                  href="/prevention"
                  icon="🛡️"
                  label="Prévention"
                  onClick={handleClose}
                />
                <QuickLink
                  href="/alertes"
                  icon="🔔"
                  label="Alertes"
                  onClick={handleClose}
                />
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-sm">Aucun résultat pour &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.href}
                  onClick={handleClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 dark:bg-slate-600 rounded-lg flex items-center justify-center text-xl">
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
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
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
      className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
    </Link>
  );
}
