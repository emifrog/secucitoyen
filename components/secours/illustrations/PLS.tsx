'use client';

// Illustration de la Position Latérale de Sécurité (PLS)
export default function PLS() {
  return (
    <div className="relative w-full max-w-xs mx-auto">
      <svg viewBox="0 0 240 120" className="w-full h-auto">
        {/* Sol */}
        <rect x="0" y="100" width="240" height="20" fill="#E5E7EB" rx="5" />

        {/* Corps en PLS */}
        <g>
          {/* Jambe du dessous (tendue) */}
          <path d="M180 95 Q200 95 210 90" stroke="#FBBF24" strokeWidth="16" strokeLinecap="round" fill="none" />

          {/* Jambe du dessus (pliée) */}
          <path d="M140 85 Q160 60 180 75 Q190 85 185 95" stroke="#F59E0B" strokeWidth="16" strokeLinecap="round" fill="none" />

          {/* Torse (sur le côté) */}
          <ellipse cx="100" cy="80" rx="45" ry="25" fill="#FCD34D" transform="rotate(-10 100 80)" />

          {/* Bras du dessous (sous la joue) */}
          <path d="M70 70 Q50 60 40 50 Q35 45 45 40" stroke="#FBBF24" strokeWidth="12" strokeLinecap="round" fill="none" />

          {/* Main sous la joue */}
          <circle cx="45" cy="38" r="8" fill="#FBBF24" />

          {/* Bras du dessus (stabilisation) */}
          <path d="M110 65 Q130 50 140 60 Q145 65 140 75" stroke="#F59E0B" strokeWidth="10" strokeLinecap="round" fill="none" />

          {/* Tête (sur le côté) */}
          <ellipse cx="55" cy="45" rx="20" ry="18" fill="#FCD34D" transform="rotate(-20 55 45)" />

          {/* Bouche (ouverte pour respiration) */}
          <ellipse cx="40" cy="50" rx="4" ry="3" fill="#7C3AED" />
        </g>

        {/* Flèche indiquant la respiration */}
        <g className="animate-breathe">
          <path d="M25 50 Q15 45 15 35 Q15 25 25 25" stroke="#22C55E" strokeWidth="2" fill="none" strokeDasharray="3,2" />
          <polygon points="25,22 30,27 25,28" fill="#22C55E" />
        </g>

        {/* Points clés avec numéros */}
        <g>
          {/* Point 1 - Tête basculée */}
          <circle cx="55" cy="25" r="10" fill="#3B82F6" />
          <text x="55" y="29" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">1</text>

          {/* Point 2 - Main sous la joue */}
          <circle cx="45" cy="55" r="10" fill="#3B82F6" />
          <text x="45" y="59" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">2</text>

          {/* Point 3 - Genou plié */}
          <circle cx="170" cy="65" r="10" fill="#3B82F6" />
          <text x="170" y="69" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">3</text>
        </g>
      </svg>

      {/* Légende */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
          <span className="text-gray-600 dark:text-gray-400">Tête basculée</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
          <span className="text-gray-600 dark:text-gray-400">Main sous joue</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
          <span className="text-gray-600 dark:text-gray-400">Genou plié</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% { opacity: 1; transform: translateX(0); }
          50% { opacity: 0.5; transform: translateX(-3px); }
        }
        .animate-breathe {
          animation: breathe 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
