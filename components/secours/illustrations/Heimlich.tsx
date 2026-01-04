'use client';

// Illustration de la manoeuvre de Heimlich (étouffement)
export default function Heimlich() {
  return (
    <div className="relative w-full max-w-xs mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-auto">
        {/* Personne qui s'étouffe (devant) */}
        <g>
          {/* Corps */}
          <rect x="70" y="80" width="60" height="80" rx="10" fill="#FCD34D" />

          {/* Tête */}
          <circle cx="100" cy="55" r="28" fill="#FBBF24" />

          {/* Visage en détresse */}
          <circle cx="90" cy="50" r="3" fill="#1F2937" /> {/* Oeil gauche */}
          <circle cx="110" cy="50" r="3" fill="#1F2937" /> {/* Oeil droit */}
          <ellipse cx="100" cy="65" rx="8" ry="5" fill="#EF4444" /> {/* Bouche ouverte */}

          {/* Mains à la gorge */}
          <path d="M75 75 Q85 70 90 80" stroke="#D97706" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M125 75 Q115 70 110 80" stroke="#D97706" strokeWidth="8" strokeLinecap="round" fill="none" />

          {/* Jambes */}
          <rect x="75" y="160" width="20" height="35" rx="5" fill="#FBBF24" />
          <rect x="105" y="160" width="20" height="35" rx="5" fill="#FBBF24" />
        </g>

        {/* Sauveteur (derrière) */}
        <g>
          {/* Bras gauche */}
          <path d="M30 120 Q50 100 70 110 Q80 115 85 125" stroke="#60A5FA" strokeWidth="14" strokeLinecap="round" fill="none" />

          {/* Bras droit */}
          <path d="M170 120 Q150 100 130 110 Q120 115 115 125" stroke="#3B82F6" strokeWidth="14" strokeLinecap="round" fill="none" />

          {/* Mains jointes - poing */}
          <g className="animate-thrust">
            <circle cx="100" cy="130" r="15" fill="#2563EB" />
            <circle cx="100" cy="130" r="10" fill="#1D4ED8" />
          </g>
        </g>

        {/* Zone de compression */}
        <g className="animate-pulse">
          <ellipse cx="100" cy="115" rx="20" ry="10" fill="#EF4444" opacity="0.3" />
          <text x="100" y="105" textAnchor="middle" fontSize="8" fill="#DC2626" fontWeight="bold">
            ABDOMEN
          </text>
        </g>

        {/* Flèches de poussée */}
        <g className="animate-push">
          <path d="M100 145 L100 125" stroke="#DC2626" strokeWidth="3" markerEnd="url(#arrowUp)" />
          <path d="M85 140 Q100 150 115 140" stroke="#DC2626" strokeWidth="2" fill="none" strokeDasharray="4,2" />
        </g>

        {/* Définition flèche */}
        <defs>
          <marker id="arrowUp" markerWidth="10" markerHeight="7" refX="5" refY="7" orient="auto">
            <polygon points="0 7, 5 0, 10 7" fill="#DC2626" />
          </marker>
        </defs>

        {/* Indication */}
        <text x="100" y="190" textAnchor="middle" fontSize="10" fill="#6B7280">
          Poussées vers le haut et l&apos;intérieur
        </text>
      </svg>

      {/* Instructions */}
      <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 text-sm font-medium">
          <span className="text-lg">👊</span>
          <span>Poing fermé au-dessus du nombril</span>
        </div>
        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
          5 compressions abdominales en J (vers le haut)
        </p>
      </div>

      <style jsx>{`
        @keyframes thrust {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-thrust {
          animation: thrust 0.8s ease-in-out infinite;
        }
        @keyframes push {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-push {
          animation: push 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
