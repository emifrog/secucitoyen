'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 p-4 ${
        onClick ? 'cursor-pointer hover:shadow-lg transition-shadow w-full text-left' : ''
      } ${className}`}
    >
      {children}
    </Component>
  );
}
