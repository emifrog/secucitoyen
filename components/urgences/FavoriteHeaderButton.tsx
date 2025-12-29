'use client';

import FavoriteButton from './FavoriteButton';

interface FavoriteHeaderButtonProps {
  number: string;
}

export default function FavoriteHeaderButton({ number }: FavoriteHeaderButtonProps) {
  return (
    <FavoriteButton number={number} size="md" />
  );
}
