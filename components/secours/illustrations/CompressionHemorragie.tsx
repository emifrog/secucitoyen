'use client';

// Illustration de la compression d'une hémorragie
export default function CompressionHemorragie() {
  return (
    <div className="relative w-full max-w-xs mx-auto">
      <svg viewBox="0 0 200 150" className="w-full h-auto">
        {/* Bras blessé */}
        <g>
          {/* Avant-bras */}
          <path d="M20 80 Q100 75 180 80" stroke="#FBBF24" strokeWidth="35" strokeLinecap="round" fill="none" />

          {/* Main */}
          <ellipse cx="185" cy="80" rx="15" ry="12" fill="#FCD34D" />
          <path d="M185 68 L190 55" stroke="#FCD34D" strokeWidth="6" strokeLinecap="round" />
          <path d="M188 70 L196 60" stroke="#FCD34D" strokeWidth="5" strokeLinecap="round" />
          <path d="M190 73 L200 66" stroke="#FCD34D" strokeWidth="4" strokeLinecap="round" />
          <path d="M190 78 L200 75" stroke="#FCD34D" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Plaie */}
        <ellipse cx="100" cy="80" rx="15" ry="8" fill="#DC2626" />

        {/* Gouttes de sang (avant compression) */}
        <g className="animate-blood">
          <circle cx="95" cy="95" r="3" fill="#EF4444" opacity="0.7" />
          <circle cx="105" cy="100" r="4" fill="#EF4444" opacity="0.6" />
          <circle cx="100" cy="105" r="3" fill="#EF4444" opacity="0.5" />
        </g>

        {/* Main qui compresse */}
        <g className="animate-press">
          {/* Paume */}
          <ellipse cx="100" cy="60" rx="30" ry="20" fill="#60A5FA" />

          {/* Doigts */}
          <rect x="72" y="45" width="12" height="25" rx="6" fill="#3B82F6" />
          <rect x="86" y="40" width="12" height="30" rx="6" fill="#3B82F6" />
          <rect x="100" y="38" width="12" height="32" rx="6" fill="#3B82F6" />
          <rect x="114" y="42" width="12" height="28" rx="6" fill="#3B82F6" />

          {/* Pouce */}
          <ellipse cx="135" cy="65" rx="10" ry="7" fill="#3B82F6" transform="rotate(-30 135 65)" />
        </g>

        {/* Flèches de pression */}
        <g>
          <path d="M100 25 L100 38" stroke="#DC2626" strokeWidth="3" markerEnd="url(#pressArrow)" />
          <path d="M75 50 L82 55" stroke="#DC2626" strokeWidth="2" markerEnd="url(#pressArrow)" />
          <path d="M125 50 L118 55" stroke="#DC2626" strokeWidth="2" markerEnd="url(#pressArrow)" />
        </g>

        {/* Compresse/tissu */}
        <rect x="85" y="70" width="30" height="15" rx="3" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" className="animate-pulse" />

        <defs>
          <marker id="pressArrow" markerWidth="8" markerHeight="6" refX="4" refY="6" orient="auto">
            <polygon points="0 0, 8 0, 4 6" fill="#DC2626" />
          </marker>
        </defs>
      </svg>

      {/* Instructions */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
          <span className="text-sm text-red-700 dark:text-red-300">Appuyer fort directement sur la plaie</span>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
          <span className="text-sm text-blue-700 dark:text-blue-300">Maintenir la pression sans relâcher</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes press {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        .animate-press {
          animation: press 1.5s ease-in-out infinite;
        }
        @keyframes blood {
          0% { opacity: 0.7; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(15px); }
        }
        .animate-blood {
          animation: blood 2s ease-out infinite;
        }
      `}</style>
    </div>
  );
}
