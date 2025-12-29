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

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = toggleFavorite(number);
    setFavorite(newState);
    setAnimate(true);
    setTimeout(() => setAnimate(false), 300);

    onToggle?.(newState);
  };

  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={handleToggle}
      className={`${sizeClasses} flex items-center justify-center rounded-full transition-all ${
        favorite
          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500'
          : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-600'
      } ${animate ? 'scale-125' : ''}`}
      aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <svg
        className={`${iconSize} transition-transform ${animate ? 'animate-pulse' : ''}`}
        fill={favorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
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
