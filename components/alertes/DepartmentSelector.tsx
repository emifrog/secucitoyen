'use client';

import { useState, useEffect } from 'react';
import {
  isGeolocationSupported,
  getCurrentPosition,
  getSavedDepartment,
  saveDepartment,
} from '@/lib/geolocation';

const popularDepartments = [
  { code: '75', name: 'Paris' },
  { code: '13', name: 'Bouches-du-Rhône' },
  { code: '69', name: 'Rhône' },
  { code: '31', name: 'Haute-Garonne' },
  { code: '33', name: 'Gironde' },
  { code: '59', name: 'Nord' },
  { code: '06', name: 'Alpes-Maritimes' },
  { code: '44', name: 'Loire-Atlantique' },
  { code: '67', name: 'Bas-Rhin' },
];

const allDepartments: Record<string, string> = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
  '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
  '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
  '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud',
  '2B': 'Haute-Corse', '21': 'Côte-d\'Or', '22': 'Côtes-d\'Armor', '23': 'Creuse',
  '24': 'Dordogne', '25': 'Doubs', '26': 'Drôme', '27': 'Eure',
  '28': 'Eure-et-Loir', '29': 'Finistère', '30': 'Gard', '31': 'Haute-Garonne',
  '32': 'Gers', '33': 'Gironde', '34': 'Hérault', '35': 'Ille-et-Vilaine',
  '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
  '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire',
  '44': 'Loire-Atlantique', '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne',
  '48': 'Lozère', '49': 'Maine-et-Loire', '50': 'Manche', '51': 'Marne',
  '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle', '55': 'Meuse',
  '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme',
  '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales',
  '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône', '70': 'Haute-Saône',
  '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines',
  '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne',
  '83': 'Var', '84': 'Vaucluse', '85': 'Vendée', '86': 'Vienne',
  '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne', '90': 'Territoire de Belfort',
  '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne', '95': 'Val-d\'Oise',
};

export default function DepartmentSelector() {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [deptName, setDeptName] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isAutoLocated, setIsAutoLocated] = useState(false);

  useEffect(() => {
    const saved = getSavedDepartment();
    if (saved) {
      setSelectedDept(saved);
      setDeptName(allDepartments[saved] || saved);
    }
  }, []);

  const handleGeolocate = async () => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const location = await getCurrentPosition();

      if (location.departmentCode && location.departmentName) {
        setSelectedDept(location.departmentCode);
        setDeptName(location.departmentName);
        setIsAutoLocated(true);
        saveDepartment(location.departmentCode);
      } else {
        setLocationError('Impossible de déterminer votre département');
      }
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Erreur de géolocalisation');
    } finally {
      setIsLocating(false);
    }
  };

  const selectDepartment = (code: string, name: string) => {
    setSelectedDept(code);
    setDeptName(name);
    setIsAutoLocated(false);
    saveDepartment(code);
  };

  const clearSelection = () => {
    setSelectedDept(null);
    setDeptName(null);
    setIsAutoLocated(false);
    localStorage.removeItem('secucitoyen_department');
  };

  return (
    <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl">
          📍
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Votre département</h3>
          {selectedDept ? (
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Alertes pour : <strong>{deptName}</strong>
              {isAutoLocated && (
                <span className="ml-2 text-xs text-green-600 dark:text-green-400">(GPS)</span>
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
        <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg">
          {locationError}
        </div>
      )}

      {!selectedDept ? (
        <div className="space-y-3">
          {/* Bouton géolocalisation */}
          {isGeolocationSupported() && (
            <button
              onClick={handleGeolocate}
              disabled={isLocating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              {isLocating ? (
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
            {popularDepartments.map((dept) => (
              <button
                key={dept.code}
                onClick={() => selectDepartment(dept.code, dept.name)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center gap-1">
              {isAutoLocated && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              )}
              {deptName}
            </span>
          </div>
          <div className="flex gap-2">
            {isGeolocationSupported() && !isAutoLocated && (
              <button
                onClick={handleGeolocate}
                disabled={isLocating}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                title="Utiliser ma position"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
