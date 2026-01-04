'use client';

// Illustration du refroidissement d'une brûlure
export default function Brulure() {
  return (
    <div className="relative w-full max-w-xs mx-auto">
      <svg viewBox="0 0 200 160" className="w-full h-auto">
        {/* Robinet */}
        <g>
          <rect x="85" y="10" width="30" height="15" rx="3" fill="#9CA3AF" />
          <rect x="95" y="25" width="10" height="20" fill="#6B7280" />
          <ellipse cx="100" cy="48" rx="8" ry="4" fill="#4B5563" />
        </g>

        {/* Eau qui coule */}
        <g className="animate-water">
          <path d="M100 52 Q98 70 100 90 Q102 110 100 130" stroke="#60A5FA" strokeWidth="12" fill="none" opacity="0.7" />
          <path d="M100 52 Q95 75 100 100" stroke="#93C5FD" strokeWidth="8" fill="none" opacity="0.5" />

          {/* Gouttelettes */}
          <circle cx="92" cy="95" r="3" fill="#60A5FA" opacity="0.6" />
          <circle cx="108" cy="100" r="4" fill="#60A5FA" opacity="0.5" />
          <circle cx="95" cy="115" r="3" fill="#60A5FA" opacity="0.4" />
          <circle cx="105" cy="120" r="3" fill="#60A5FA" opacity="0.4" />
        </g>

        {/* Main brûlée */}
        <g>
          {/* Avant-bras */}
          <path d="M40 140 Q70 130 100 125" stroke="#FBBF24" strokeWidth="25" strokeLinecap="round" fill="none" />

          {/* Main */}
          <ellipse cx="115" cy="120" rx="22" ry="18" fill="#FCD34D" transform="rotate(-20 115 120)" />

          {/* Doigts */}
          <path d="M125 105 L135 95" stroke="#FCD34D" strokeWidth="8" strokeLinecap="round" />
          <path d="M130 110 L143 103" stroke="#FCD34D" strokeWidth="7" strokeLinecap="round" />
          <path d="M133 116 L148 112" stroke="#FCD34D" strokeWidth="6" strokeLinecap="round" />
          <path d="M133 123 L147 122" stroke="#FCD34D" strokeWidth="6" strokeLinecap="round" />

          {/* Zone brûlée */}
          <ellipse cx="105" cy="118" rx="12" ry="8" fill="#EF4444" opacity="0.6" className="animate-pulse" />
        </g>

        {/* Éclaboussures */}
        <g className="animate-splash">
          <circle cx="85" cy="125" r="2" fill="#60A5FA" />
          <circle cx="120" cy="130" r="2" fill="#60A5FA" />
          <circle cx="90" cy="135" r="1.5" fill="#60A5FA" />
        </g>

        {/* Indicateur température */}
        <g>
          <rect x="150" y="60" width="8" height="40" rx="4" fill="#E5E7EB" />
          <rect x="150" y="85" width="8" height="15" rx="4" fill="#3B82F6" />
          <circle cx="154" cy="105" r="6" fill="#3B82F6" />
          <text x="170" y="95" fontSize="10" fill="#3B82F6" fontWeight="bold">15-25°C</text>
        </g>
      </svg>

      {/* Timer */}
      <div className="mt-4 flex justify-center">
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full px-6 py-3 flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">10-15</span>
            <span className="text-sm text-blue-600 dark:text-blue-400 ml-1">minutes</span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
        Eau tiède (15-25°C) - Jamais d&apos;eau glacée !
      </p>

      <style jsx>{`
        @keyframes water {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.9; }
        }
        .animate-water {
          animation: water 0.5s ease-in-out infinite;
        }
        @keyframes splash {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5) translateY(10px); }
        }
        .animate-splash {
          animation: splash 1s ease-out infinite;
        }
      `}</style>
    </div>
  );
}
