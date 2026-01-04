'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { getCurrentPosition, isGeolocationSupported } from '@/lib/geolocation';

interface Defibrillateur {
  id: string;
  nom: string;
  adresse: string;
  commune: string;
  codePostal: string;
  latitude: number;
  longitude: number;
  accessibilite: string;
  disponibilite: string;
  distance?: number;
}

export default function DefibrilateursPage() {
  const [defibrillateurs, setDefibrillateurs] = useState<Defibrillateur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [radius, setRadius] = useState(2000);
  const [source, setSource] = useState<string>('');

  const loadDefibrillateurs = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/defibrillateurs?lat=${lat}&lon=${lon}&radius=${radius}&limit=20`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setDefibrillateurs(data.defibrillateurs || []);
        setSource(data.source || '');
      }
    } catch {
      setError('Erreur lors de la recherche des défibrillateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleGeolocate = async () => {
    if (!isGeolocationSupported()) {
      setError('Géolocalisation non supportée sur cet appareil');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const location = await getCurrentPosition();
      setUserLocation({ lat: location.latitude, lon: location.longitude });
      await loadDefibrillateurs(location.latitude, location.longitude);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de géolocalisation');
      setLoading(false);
    }
  };

  const openNavigation = (dae: Defibrillateur) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dae.latitude},${dae.longitude}&travelmode=walking`;
    window.open(url, '_blank');
  };

  const formatDistance = (meters: number | undefined): string => {
    if (!meters) return '';
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  useEffect(() => {
    if (userLocation) {
      loadDefibrillateurs(userLocation.lat, userLocation.lon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, userLocation?.lat, userLocation?.lon]);

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <section>
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
          Défibrillateurs (DAE)
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Trouvez les défibrillateurs automatiques à proximité
        </p>
      </section>

      {/* Alerte info */}
      <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="text-3xl">🫀</div>
          <div>
            <p className="text-sm text-red-800 dark:text-red-300 font-semibold mb-1">
              En cas d&apos;arrêt cardiaque
            </p>
            <ol className="text-sm text-red-700 dark:text-red-400 space-y-1">
              <li>1. Appelez le <a href="tel:15" className="font-bold underline">15</a> ou <a href="tel:112" className="font-bold underline">112</a></li>
              <li>2. Commencez le massage cardiaque</li>
              <li>3. Envoyez quelqu&apos;un chercher un DAE</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Bouton géolocalisation */}
      {!userLocation && (
        <button
          onClick={handleGeolocate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white rounded-xl font-medium transition-colors"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Localisation en cours...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Trouver les DAE près de moi
            </>
          )}
        </button>
      )}

      {/* Contrôles après géolocalisation */}
      {userLocation && (
        <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Position actuelle
              </span>
            </div>
            <button
              onClick={handleGeolocate}
              disabled={loading}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Actualiser
            </button>
          </div>

          {/* Sélecteur de rayon */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Rayon :</span>
            <div className="flex gap-2">
              {[500, 1000, 2000, 5000].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    radius === r
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600'
                  }`}
                >
                  {r < 1000 ? `${r}m` : `${r / 1000}km`}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Erreur */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl">
          {error}
        </div>
      )}

      {/* Liste des DAE */}
      {userLocation && !loading && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              {defibrillateurs.length} DAE trouvé{defibrillateurs.length > 1 ? 's' : ''}
            </h3>
            {source && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{source}</span>
            )}
          </div>

          {defibrillateurs.length === 0 ? (
            <Card className="text-center py-8">
              <div className="text-4xl mb-2">😕</div>
              <p className="text-gray-600 dark:text-gray-300">
                Aucun défibrillateur trouvé dans ce rayon
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Essayez d&apos;augmenter le rayon de recherche
              </p>
            </Card>
          ) : (
            defibrillateurs.map((dae, index) => (
              <Card
                key={dae.id}
                className={`${index === 0 ? 'border-2 border-green-500 dark:border-green-400' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                    index === 0
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-gray-100 dark:bg-slate-700'
                  }`}>
                    {index === 0 ? '🫀' : '💚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {dae.nom}
                      </h4>
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full whitespace-nowrap">
                          Le plus proche
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {dae.adresse}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {dae.codePostal} {dae.commune}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {formatDistance(dae.distance)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {dae.disponibilite}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {dae.accessibilite}
                    </p>
                  </div>
                  <button
                    onClick={() => openNavigation(dae)}
                    className="flex-shrink-0 p-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors"
                    title="Itinéraire"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </button>
                </div>
              </Card>
            ))
          )}
        </section>
      )}

      {/* Info utilisation DAE */}
      <section className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
          Comment utiliser un DAE ?
        </h3>
        <ol className="text-sm text-green-700 dark:text-green-400 space-y-2">
          <li className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span>Allumez le DAE et suivez les instructions vocales</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span>Dénudez la poitrine et collez les électrodes comme indiqué</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span>Laissez le DAE analyser - ne touchez pas la victime</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            <span>Si choc conseillé : appuyez sur le bouton, puis reprenez le massage</span>
          </li>
        </ol>
      </section>

      {/* Loading skeleton */}
      {loading && userLocation && (
        <section className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-100 dark:bg-slate-700 h-24 rounded-xl" />
          ))}
        </section>
      )}
    </div>
  );
}
