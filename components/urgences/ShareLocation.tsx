'use client';

import { useState } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export default function ShareLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Vous avez refusé l\'accès à votre position.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Position indisponible.');
            break;
          case err.TIMEOUT:
            setError('Délai dépassé.');
            break;
          default:
            setError('Erreur de géolocalisation.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const getGoogleMapsUrl = () => {
    if (!location) return '';
    return `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
  };

  const getSmsMessage = () => {
    if (!location) return '';
    return `🆘 URGENCE - Ma position actuelle:\n${getGoogleMapsUrl()}\n\nCoordonnées: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const shareBySms = () => {
    if (!location) return;
    const smsUrl = `sms:?body=${encodeURIComponent(getSmsMessage())}`;
    window.location.href = smsUrl;
  };

  const shareByNative = async () => {
    if (!location) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ma position - Urgence',
          text: getSmsMessage(),
          url: getGoogleMapsUrl(),
        });
      } catch (err) {
        // L'utilisateur a annulé ou erreur
        console.log('Partage annulé ou erreur:', err);
      }
    } else {
      // Fallback: copier dans le presse-papier
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    if (!location) return;

    try {
      await navigator.clipboard.writeText(getSmsMessage());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  return (
    <section className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-xl">
          📤
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Partager ma position</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Envoyez votre localisation par SMS</p>
        </div>
      </div>

      {!location ? (
        <>
          <button
            onClick={getLocation}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Localisation en cours...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Obtenir ma position
              </>
            )}
          </button>

          {error && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          {/* Coordonnées */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ma position actuelle</div>
            <div className="font-mono text-sm text-gray-800 dark:text-gray-100">
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </div>
            {location.accuracy && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Précision: ±{Math.round(location.accuracy)}m
              </div>
            )}
          </div>

          {/* Boutons de partage */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={shareBySms}
              className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              SMS
            </button>
            <button
              onClick={shareByNative}
              className="flex items-center justify-center gap-2 p-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Partager
            </button>
          </div>

          <button
            onClick={copyToClipboard}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition-colors ${
              copied
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copié !
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copier le message
              </>
            )}
          </button>

          {/* Actualiser */}
          <button
            onClick={getLocation}
            className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-2"
          >
            Actualiser la position
          </button>
        </div>
      )}
    </section>
  );
}
