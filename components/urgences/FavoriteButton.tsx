'use client';

import { useState, useEffect } from 'react';
import { isFavorite, toggleFavorite } from '@/lib/favorites-storage';

interface FavoriteButtonProps {
  number: string;
  size?: 'sm' | 'md';
  onToggle?: (isFavorite: boolean) => void;
}

export default function FavoriteButton({ number, size = 'md', onToggle }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(number));
  }, [number]);

  // Fin de l'animation, timer annulé au démontage.
  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  }, [animate]);

  const handleToggle = () => {
    const newState = toggleFavorite(number);
    setFavorite(newState);
    setAnimate(true);
    onToggle?.(newState);
  };

  // Zone tactile ≥ 44 px même pour la petite variante (icône plus petite).
  const sizeClasses = size === 'sm' ? 'w-11 h-11' : 'w-11 h-11';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={favorite}
      className={`${sizeClasses} flex items-center justify-center rounded-full transition-all ${
        favorite
          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
          : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-600'
      } ${animate ? 'scale-110' : ''}`}
      aria-label={favorite ? `Retirer le ${number} des favoris` : `Ajouter le ${number} aux favoris`}
    >
      <svg
        className={iconSize}
        fill={favorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>
  );
}
