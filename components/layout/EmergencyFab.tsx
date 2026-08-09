'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function EmergencyFab() {
  const [expanded, setExpanded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstActionRef = useRef<HTMLAnchorElement>(null);

  // Fermeture au clavier (Échap) + gestion du focus quand le menu est ouvert.
  useEffect(() => {
    if (!expanded) return;
    firstActionRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpanded(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expanded]);

  return (
    <>
      {/* Overlay plein écran (backdrop de fermeture) */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          aria-hidden="true"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Wrapper centré : aligne le FAB sur la colonne de l'app (max-w-app),
          transparent aux clics sauf sur le bouton lui-même. Masqué sur desktop
          (la sidebar fournit l'accès urgence). */}
      <div className="fixed inset-x-0 bottom-20 z-40 pointer-events-none lg:hidden">
        <div className="relative max-w-app mx-auto">
          <div className="absolute right-4 bottom-0 pointer-events-auto">
      {/* Menu étendu */}
      {expanded && (
        <>
          {/* Quick actions */}
          <div
            role="group"
            aria-label="Numéros d'urgence"
            className="absolute bottom-16 right-0 z-40 space-y-2 mb-2"
          >
            <Link
              ref={firstActionRef}
              href="tel:15"
              className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg transition-all animate-slide-up"
              onClick={() => setExpanded(false)}
            >
              <span className="text-xl">🏥</span>
              <div>
                <div className="font-bold">15</div>
                <div className="text-xs text-white/80">SAMU</div>
              </div>
            </Link>
            <Link
              href="tel:17"
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl shadow-lg transition-all animate-slide-up animation-delay-100"
              onClick={() => setExpanded(false)}
            >
              <span className="text-xl">👮</span>
              <div>
                <div className="font-bold">17</div>
                <div className="text-xs text-white/80">Police</div>
              </div>
            </Link>
            <Link
              href="tel:18"
              className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl shadow-lg transition-all animate-slide-up animation-delay-200"
              onClick={() => setExpanded(false)}
            >
              <span className="text-xl">🚒</span>
              <div>
                <div className="font-bold">18</div>
                <div className="text-xs text-white/80">Pompiers</div>
              </div>
            </Link>
          </div>
        </>
      )}

      {/* FAB principal */}
      {expanded ? (
        <Link
          href="tel:112"
          aria-label="Appeler le 112 (numéro d'urgence européen)"
          className="relative z-40 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all animate-pulse-slow"
        >
          <div className="text-center">
            <div className="text-lg font-bold leading-tight">112</div>
          </div>
        </Link>
      ) : (
        <button
          ref={triggerRef}
          onClick={() => setExpanded(true)}
          className="relative z-40 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center transition-all active:scale-95"
          aria-label="Ouvrir les numéros d'urgence"
          aria-expanded={expanded}
          aria-haspopup="true"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {/* Indicateur */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-500 text-xs font-bold rounded-full flex items-center justify-center shadow">
            !
          </span>
        </button>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out forwards;
        }
        .animation-delay-100 {
          animation-delay: 0.05s;
          opacity: 0;
        }
        .animation-delay-200 {
          animation-delay: 0.1s;
          opacity: 0;
        }
        @keyframes pulse-slow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite;
        }
      `}</style>
          </div>
        </div>
      </div>
    </>
  );
}
