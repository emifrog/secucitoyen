'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-yellow-500">⭐</span>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Vos favoris</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {favorites.map((fav) => {
          const numberInfo = getNumberByNumber(fav.number);
          if (!numberInfo) return null;

          return (
            <Link
              key={fav.number}
              href={`tel:${numberInfo.number}`}
              className={`${numberInfo.color} text-white rounded-xl p-3 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm relative`}
            >
              <span className="text-xl">{numberInfo.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg">{numberInfo.number}</div>
                <div className="text-xs text-white/80 truncate">{numberInfo.name}</div>
              </div>
              <FavoriteButton
                number={fav.number}
                size="sm"
                onToggle={handleToggle}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
