'use client';

import { useState } from 'react';
import Link from 'next/link';
import { searchNumbers } from '@/lib/numeros-urgence';

export default function SearchNumbers() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const results = query.length >= 2 ? searchNumbers(query) : [];

  return (
    <section className="relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un numéro (ex: violence, enfant, mer...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full px-4 py-3 pl-10 bg-gray-100 dark:bg-slate-800 rounded-xl border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-700 focus:outline-none transition-all dark:text-gray-100 dark:placeholder-gray-400"
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
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Résultats */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 z-20 max-h-64 overflow-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              Aucun résultat pour &quot;{query}&quot;
            </div>
          ) : (
            <div className="py-2">
              {results.map((number) => (
                <Link
                  key={number.number}
                  href={`/urgences/${number.number.replace(/\s/g, '-')}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className={`w-10 h-10 ${number.color} rounded-lg flex items-center justify-center text-lg`}>
                    {number.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary dark:text-blue-400">{number.number}</span>
                      <span className="text-gray-800 dark:text-gray-100">{number.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{number.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overlay pour fermer */}
      {isOpen && query.length >= 2 && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </section>
  );
}
