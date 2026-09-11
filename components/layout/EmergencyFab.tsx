'use client';

import { useState, useEffect, useRef } from 'react';
import { getNumberByNumber } from '@/lib/numeros-urgence';

// Numéros du menu rapide, lus dans la source unique (couleurs, noms).
const QUICK_NUMBERS = ['15', '17', '18'] as const;

export default function EmergencyFab() {
  const [expanded, setExpanded] = useState(false);
  // Le bouton déclencheur est remplacé par le lien 112 quand le menu est
  // ouvert : le focus ne peut lui être rendu qu'APRÈS le re-rendu de fermeture.
  const [restoreFocus, setRestoreFocus] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstActionRef = useRef<HTMLAnchorElement>(null);

  // Fermeture au clavier (Échap) + focus sur la première action à l'ouverture.
  useEffect(() => {
    if (!expanded) return;
    firstActionRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpanded(false);
        setRestoreFocus(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expanded]);

  useEffect(() => {
    if (!expanded && restoreFocus) {
      triggerRef.current?.focus();
      setRestoreFocus(false);
    }
  }, [expanded, restoreFocus]);

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

      {/* Wrapper centré : aligne le FAB sur la colonne de contenu (428 px
          mobile, 2xl tablette), transparent aux clics sauf sur le bouton.
          Masqué sur desktop (la sidebar fournit l'accès urgence). Décalé de la
          zone sûre iOS (indicateur d'accueil). */}
      <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 pointer-events-none lg:hidden">
        <div className="relative max-w-app md:max-w-2xl mx-auto">
          <div className="absolute right-4 bottom-0 pointer-events-auto">
            {/* Menu étendu */}
            {expanded && (
              <div
                role="group"
                aria-label="Numéros d'urgence"
                className="absolute bottom-16 right-0 z-40 space-y-2 mb-2"
              >
                {QUICK_NUMBERS.map((num, index) => {
                  const info = getNumberByNumber(num);
                  if (!info) return null;
                  return (
                    <a
                      key={num}
                      ref={index === 0 ? firstActionRef : undefined}
                      href={`tel:${num}`}
                      className={`flex items-center gap-3 ${info.color} hover:brightness-110 text-white px-4 py-3 min-h-11 rounded-xl shadow-lg transition-all animate-slide-up ${
                        index === 1 ? 'animation-delay-100' : index === 2 ? 'animation-delay-200' : ''
                      }`}
                      onClick={() => setExpanded(false)}
                    >
                      <span className="text-xl" aria-hidden="true">{info.icon}</span>
                      <div>
                        <div className="font-bold">{num}</div>
                        <div className="text-xs text-white">{info.name}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {/* FAB principal */}
            {expanded ? (
              <a
                href="tel:112"
                aria-label="Appeler le 112 (numéro d'urgence européen)"
                className="relative z-40 w-14 h-14 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all animate-pulse-ring"
              >
                <span className="text-lg font-bold leading-tight">112</span>
              </a>
            ) : (
              <button
                ref={triggerRef}
                data-testid="emergency-fab"
                onClick={() => setExpanded(true)}
                className="relative z-40 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center transition-all active:scale-95"
                aria-label="Ouvrir les numéros d'urgence"
                aria-expanded={expanded}
                aria-haspopup="true"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {/* Indicateur */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-500 text-xs font-bold rounded-full flex items-center justify-center shadow" aria-hidden="true">
                  !
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
