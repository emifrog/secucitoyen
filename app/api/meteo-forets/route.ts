import { NextResponse } from 'next/server';
import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import type { OpenMeteoCurrentResponse } from '@/lib/types/api-responses';
import {
  calculateIFM,
  getNiveau,
  getNiveauNumeric,
  getDescription,
  type ForetNiveau,
} from '@/lib/fire-index';

// API pour récupérer le risque incendie de forêt (Météo des forêts)
// Calcul basé sur l'Indice Feu Météo (IFM) via données météo

export interface ForetRiskAlert {
  id: string;
  departement: string;
  departementCode: string;
  niveau: ForetNiveau;
  niveauNumeric: number;
  ifm: number; // Indice Feu Météo
  temperature: number;
  humidite: number;
  vent: number;
  description: string;
}

export const dynamic = 'force-dynamic';

// Départements à risque incendie (zones sensibles)
const departementsRisque: Record<string, { name: string; lat: number; lon: number; sensibilite: 'haute' | 'moyenne' | 'normale' }> = {
  '04': { name: 'Alpes-de-Haute-Provence', lat: 44.0, lon: 6.2, sensibilite: 'haute' },
  '05': { name: 'Hautes-Alpes', lat: 44.5, lon: 6.3, sensibilite: 'moyenne' },
  '06': { name: 'Alpes-Maritimes', lat: 43.7, lon: 7.2, sensibilite: 'haute' },
  '07': { name: 'Ardèche', lat: 44.7, lon: 4.4, sensibilite: 'moyenne' },
  '11': { name: 'Aude', lat: 43.1, lon: 2.4, sensibilite: 'haute' },
  '13': { name: 'Bouches-du-Rhône', lat: 43.5, lon: 5.1, sensibilite: 'haute' },
  '2A': { name: 'Corse-du-Sud', lat: 41.6, lon: 9.0, sensibilite: 'haute' },
  '2B': { name: 'Haute-Corse', lat: 42.4, lon: 9.2, sensibilite: 'haute' },
  '26': { name: 'Drôme', lat: 44.7, lon: 5.0, sensibilite: 'moyenne' },
  '30': { name: 'Gard', lat: 44.0, lon: 4.1, sensibilite: 'haute' },
  '33': { name: 'Gironde', lat: 44.8, lon: -0.6, sensibilite: 'haute' },
  '34': { name: 'Hérault', lat: 43.6, lon: 3.5, sensibilite: 'haute' },
  '40': { name: 'Landes', lat: 43.9, lon: -0.8, sensibilite: 'haute' },
  '66': { name: 'Pyrénées-Orientales', lat: 42.6, lon: 2.5, sensibilite: 'haute' },
  '83': { name: 'Var', lat: 43.4, lon: 6.2, sensibilite: 'haute' },
  '84': { name: 'Vaucluse', lat: 44.0, lon: 5.1, sensibilite: 'haute' },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dept = searchParams.get('dept');

  try {
    const alerts: ForetRiskAlert[] = [];

    // Filtrer les départements si demandé
    const deptsToCheck = dept
      ? Object.entries(departementsRisque).filter(([code]) => code === dept)
      : Object.entries(departementsRisque);

    // Récupérer les données météo pour chaque département
    for (const [code, info] of deptsToCheck) {
      try {
        const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${info.lat}&longitude=${info.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=Europe/Paris`;

        const response = await fetchWithCircuitBreaker('open-meteo-forecast', meteoUrl, {
          next: { revalidate: 1800 },
          timeout: 10000,
        });

        if (!response.ok) continue;

        const data: OpenMeteoCurrentResponse = await response.json();
        const current = data.current;

        if (!current) continue;

        const temp = current.temperature_2m ?? 20;
        const humidity = current.relative_humidity_2m ?? 50;
        const wind = current.wind_speed_10m ?? 10;
        const precip = current.precipitation ?? 0;

        const ifm = calculateIFM(temp, humidity, wind, precip);
        const niveau = getNiveau(ifm, info.sensibilite);

        // Ne remonter que les risques modérés ou plus
        if (niveau !== 'faible') {
          alerts.push({
            id: `foret-${code}`,
            departement: info.name,
            departementCode: code,
            niveau,
            niveauNumeric: getNiveauNumeric(niveau),
            ifm,
            temperature: Math.round(temp),
            humidite: Math.round(humidity),
            vent: Math.round(wind),
            description: getDescription(niveau),
          });
        }
      } catch {
        // Ignorer les erreurs individuelles
        continue;
      }
    }

    // Trier par niveau de risque (décroissant)
    alerts.sort((a, b) => b.niveauNumeric - a.niveauNumeric);

    return NextResponse.json({
      alerts,
      count: alerts.length,
      departementsVerifies: deptsToCheck.length,
      source: 'Météo des forêts - Calcul IFM',
      updatedAt: new Date().toISOString(),
      legend: {
        faible: { color: 'green', label: 'Risque faible' },
        modere: { color: 'yellow', label: 'Risque modéré' },
        eleve: { color: 'orange', label: 'Risque élevé' },
        tres_eleve: { color: 'red', label: 'Risque très élevé' },
        extreme: { color: 'darkred', label: 'Risque extrême' },
      },
    });
  } catch (error) {
    console.error('Erreur API Météo des forêts:', error);

    return NextResponse.json({
      alerts: [],
      count: 0,
      error: 'Service temporairement indisponible',
      source: 'Météo des forêts',
      updatedAt: new Date().toISOString(),
    });
  }
}
