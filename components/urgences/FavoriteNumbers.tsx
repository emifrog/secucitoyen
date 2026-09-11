'use client';

import { useState, useEffect } from 'react';
import { getFavorites, FavoriteNumber } from '@/lib/favorites-storage';
import { getNumberByNumber } from '@/lib/numeros-urgence';
import FavoriteButton from './FavoriteButton';

export default function FavoriteNumbers() {
  const [favorites, setFavorites] = useState<FavoriteNumber[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleToggle = () => {
    setFavorites(getFavorites());
  };

  if (favorites.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3" aria-labelledby="favorites-title">
      <div className="flex items-center gap-2">
        <span className="text-yellow-500" aria-hidden="true">⭐</span>
        <h2 id="favorites-title" className="font-semibold text-gray-800 dark:text-gray-100">Vos favoris</h2>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {favorites.map((fav) => {
          const numberInfo = getNumberByNumber(fav.number);
          if (!numberInfo) return null;

          return (
            // Le bouton « favori » est frère du lien d'appel (pas enfant) :
            // un <button> dans un <a> est invalide.
            <li key={fav.number} className="relative">
              <a
                href={`tel:${numberInfo.number.replace(/\s/g, '')}`}
                aria-label={`Appeler le ${numberInfo.number} (${numberInfo.name})`}
                className={`${numberInfo.color} text-white rounded-xl p-3 pr-12 min-h-11 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm`}
              >
                <span className="text-xl" aria-hidden="true">{numberInfo.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg">{numberInfo.number}</div>
                  <div className="text-xs text-white truncate">{numberInfo.name}</div>
                </div>
              </a>
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <FavoriteButton number={fav.number} size="sm" onToggle={handleToggle} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
