import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

// Composant purement présentationnel (utilisable côté serveur comme côté
// client). L'ancienne variante `onClick` (rendu en <button>) n'était utilisée
// nulle part : un conteneur cliquable se compose avec <Link> ou <button>.
export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 p-4 ${className}`}>
      {children}
    </div>
  );
}
