'use client';

// Illustration animée du massage cardiaque
export default function MassageCardiaque() {
  return (
    <div className="relative w-full max-w-xs mx-auto">
      <svg viewBox="0 0 200 160" className="w-full h-auto">
        {/* Corps de la victime */}
        <ellipse cx="100" cy="130" rx="80" ry="20" fill="#E5E7EB" />

        {/* Torse */}
        <rect x="60" y="60" width="80" height="60" rx="10" fill="#FCD34D" />

        {/* Tête */}
        <circle cx="100" cy="40" r="25" fill="#FBBF24" />

        {/* Point de compression - sternum */}
        <circle cx="100" cy="85" r="12" fill="#EF4444" className="animate-pulse" />
        <text x="100" y="89" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
          ICI
        </text>

        {/* Mains du sauveteur - animation */}
        <g className="animate-compression">
          {/* Main gauche */}
          <rect x="75" y="45" width="25" height="35" rx="5" fill="#D97706" />
          {/* Main droite par-dessus */}
          <rect x="100" y="45" width="25" height="35" rx="5" fill="#B45309" />
          {/* Doigts entrelacés */}
          <path d="M80 80 L85 75 L90 80 L95 75 L100 80 L105 75 L110 80 L115 75 L120 80"
                stroke="#92400E" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>

        {/* Flèches de pression */}
        <g className="animate-arrows">
          <path d="M100 25 L100 40" stroke="#DC2626" strokeWidth="3" markerEnd="url(#arrowhead)" />
          <path d="M70 85 L85 85" stroke="#DC2626" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <path d="M130 85 L115 85" stroke="#DC2626" strokeWidth="2" markerEnd="url(#arrowhead)" />
        </g>

        {/* Définition de la flèche */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#DC2626" />
          </marker>
        </defs>
      </svg>

      {/* Indicateur de rythme */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-full">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <span className="text-sm font-bold text-red-700 dark:text-red-300">
            100-120 compressions/min
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Rythme : &quot;Staying Alive&quot; des Bee Gees
        </p>
      </div>

      <style jsx>{`
        @keyframes compression {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .animate-compression {
          animation: compression 0.5s ease-in-out infinite;
        }
        @keyframes arrows {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-arrows {
          animation: arrows 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
