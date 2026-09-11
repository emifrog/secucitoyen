'use client';

import { useCallback, useState } from 'react';
import { getCurrentPosition, isGeolocationSupported, type GeoLocation } from '@/lib/geolocation';

/**
 * Hook de géolocalisation partagé (LocationFinder, ShareLocation…) :
 * remplace deux copies de `navigator.geolocation.getCurrentPosition` avec le
 * même `switch` de messages d'erreur.
 */
export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback(async (): Promise<GeoLocation | null> => {
    if (!isGeolocationSupported()) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const position = await getCurrentPosition();
      setLocation(position);
      return position;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de géolocalisation.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return { location, loading, error, locate, reset };
}
