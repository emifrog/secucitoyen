'use client';

import { useGeolocation } from '@/lib/hooks/useGeolocation';

const nearbyServices = [
  { id: 'hospital', name: 'Hôpital', icon: '🏥', query: 'hospital' },
  { id: 'police', name: 'Commissariat', icon: '👮', query: 'police+station' },
  { id: 'pharmacy', name: 'Pharmacie', icon: '💊', query: 'pharmacy' },
  { id: 'fire', name: 'Pompiers', icon: '🚒', query: 'fire+station' },
];

export default function LocationFinder() {
  const { location, loading, error, locate, reset } = useGeolocation();

  const openMap = (service: (typeof nearbyServices)[0]) => {
    if (!location) return;
    // Google Maps URL pour rechercher à proximité
    const url = `https://www.google.com/maps/search/${service.query}/@${location.latitude},${location.longitude},14z`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openCurrentLocation = () => {
    if (!location) return;
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4" aria-labelledby="nearby-title">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl" aria-hidden="true">
          📍
        </div>
        <div>
          <h2 id="nearby-title" className="font-semibold text-gray-800 dark:text-gray-100">Services à proximité</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Trouvez les services d&apos;urgence les plus proches</p>
        </div>
      </div>

      {!location && (
        <button
          onClick={locate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 min-h-11 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Localisation en cours...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Activer la géolocalisation
            </>
          )}
        </button>
      )}

      {error && (
        <div role="alert" className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {location && (
        <div className="space-y-3">
          {/* Position actuelle */}
          <button
            onClick={openCurrentLocation}
            className="w-full flex items-center gap-3 p-3 min-h-11 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-slate-600 hover:border-blue-400 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center" aria-hidden="true">
              📍
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Ma position actuelle</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="sr-only">(ouvre Google Maps dans une nouvelle fenêtre)</span>
          </button>

          {/* Services à proximité */}
          <div className="grid grid-cols-2 gap-2">
            {nearbyServices.map((service) => (
              <button
                key={service.id}
                onClick={() => openMap(service)}
                className="flex items-center gap-2 p-3 min-h-11 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all"
              >
                <span className="text-xl" aria-hidden="true">{service.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{service.name}</span>
              </button>
            ))}
          </div>

          {/* Bouton réinitialiser */}
          <button
            onClick={reset}
            className="w-full text-sm min-h-11 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 py-2"
          >
            Réinitialiser
          </button>
        </div>
      )}
    </section>
  );
}
