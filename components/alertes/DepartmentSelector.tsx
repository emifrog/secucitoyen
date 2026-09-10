'use client';

import { useState, useEffect } from 'react';
import {
  isGeolocationSupported,
  getCurrentPosition,
  resolveDepartmentFromCoords,
  getSavedDepartment,
  saveDepartment,
  clearSavedDepartment,
} from '@/lib/geolocation';
import { DEPARTEMENTS, getDepartementNom } from '@/lib/departements';

// Raccourcis vers les départements les plus peuplés ; la liste complète
// (dont l'outre-mer) est accessible via le sélecteur en dessous.
const POPULAR_CODES = ['75', '13', '69', '31', '33', '59', '06', '44', '67'];

export default function DepartmentSelector() {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [deptName, setDeptName] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isAutoLocated, setIsAutoLocated] = useState(false);
  // true : département déduit du point de référence le plus proche (géocodage
  // indisponible) — à présenter comme une estimation à vérifier.
  const [isEstimated, setIsEstimated] = useState(false);
  // Évalué après montage (false côté serveur, vrai côté client → erreur
  // d'hydratation si lu pendant le rendu).
  const [geoSupported, setGeoSupported] = useState(false);

  useEffect(() => {
    setGeoSupported(isGeolocationSupported());
    const saved = getSavedDepartment();
    if (saved) {
      setSelectedDept(saved);
      setDeptName(getDepartementNom(saved) || saved);
    }
  }, []);

  const handleGeolocate = async () => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const position = await getCurrentPosition();
      const resolved = await resolveDepartmentFromCoords(position.latitude, position.longitude);
      setSelectedDept(resolved.code);
      setDeptName(resolved.name);
      setIsAutoLocated(true);
      setIsEstimated(resolved.estimated);
      saveDepartment(resolved.code);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Erreur de géolocalisation');
    } finally {
      setIsLocating(false);
    }
  };

  const selectDepartment = (code: string) => {
    setSelectedDept(code);
    setDeptName(getDepartementNom(code) || code);
    setIsAutoLocated(false);
    setIsEstimated(false);
    saveDepartment(code);
  };

  const clearSelection = () => {
    setSelectedDept(null);
    setDeptName(null);
    setIsAutoLocated(false);
    setIsEstimated(false);
    clearSavedDepartment();
  };

  return (
    <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl" aria-hidden="true">
          📍
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Votre département</h3>
          {selectedDept ? (
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Alertes pour : <strong>{deptName}</strong>
              {isAutoLocated && !isEstimated && (
                <span className="ml-2 text-xs text-green-600 dark:text-green-400">(GPS)</span>
              )}
              {isAutoLocated && isEstimated && (
                <span className="ml-2 text-xs text-amber-700 dark:text-amber-400">
                  (estimé, vérifiez)
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Localisez-vous ou sélectionnez un département
            </p>
          )}
        </div>
      </div>

      {locationError && (
        <div role="alert" className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg">
          {locationError}
        </div>
      )}

      {isAutoLocated && isEstimated && (
        <p role="status" className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs rounded-lg">
          Le service de géocodage est indisponible : ce département est estimé d&apos;après
          votre position. Vérifiez-le et corrigez-le si nécessaire.
        </p>
      )}

      {!selectedDept ? (
        <div className="space-y-3">
          {/* Bouton géolocalisation */}
          {geoSupported && (
            <button
              onClick={handleGeolocate}
              disabled={isLocating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              {isLocating ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Localisation en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Me localiser automatiquement
                </>
              )}
            </button>
          )}

          {/* Séparateur */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-600" />
            <span className="text-xs text-gray-500 dark:text-gray-400">ou choisir</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-600" />
          </div>

          {/* Départements populaires */}
          <div className="grid grid-cols-3 gap-2">
            {POPULAR_CODES.map((code) => (
              <button
                key={code}
                onClick={() => selectDepartment(code)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                {getDepartementNom(code)}
              </button>
            ))}
          </div>

          {/* Liste complète (métropole, Corse, outre-mer) */}
          <div>
            <label htmlFor="department-select" className="sr-only">
              Tous les départements
            </label>
            <select
              id="department-select"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) selectDepartment(e.target.value);
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-200"
            >
              <option value="" disabled>
                Tous les départements (dont outre-mer)…
              </option>
              {DEPARTEMENTS.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} — {d.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-1">
              {isAutoLocated && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              )}
              {deptName}
            </span>
          </div>
          <div className="flex gap-2">
            {geoSupported && !isAutoLocated && (
              <button
                onClick={handleGeolocate}
                disabled={isLocating}
                className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                aria-label="Utiliser ma position"
                title="Utiliser ma position"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </button>
            )}
            <button
              onClick={clearSelection}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Changer
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
