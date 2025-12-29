import { NextResponse } from 'next/server';

// Calcul du risque d'incendie basé sur les conditions météo
// Utilise Fire Weather Index (FWI) via Open-Meteo
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export interface FireRiskAlert {
  id: string;
  type: 'feux-foret';
  level: 'vert' | 'jaune' | 'orange' | 'rouge';
  title: string;
  description: string;
  fwi: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  department?: string;
  departmentCode?: string;
  updatedAt: string;
  source: string;
  advice: string[];
}

// Départements à risque élevé de feux de forêt
const highRiskDepartments: Record<string, { lat: number; lon: number; name: string }> = {
  '13': { lat: 43.2965, lon: 5.3698, name: 'Bouches-du-Rhône' },
  '83': { lat: 43.4667, lon: 6.2167, name: 'Var' },
  '06': { lat: 43.7102, lon: 7.2620, name: 'Alpes-Maritimes' },
  '2A': { lat: 41.9267, lon: 8.7369, name: 'Corse-du-Sud' },
  '2B': { lat: 42.6667, lon: 9.0500, name: 'Haute-Corse' },
  '30': { lat: 43.8367, lon: 4.3601, name: 'Gard' },
  '34': { lat: 43.6108, lon: 3.8767, name: 'Hérault' },
  '11': { lat: 43.2167, lon: 2.3500, name: 'Aude' },
  '66': { lat: 42.6986, lon: 2.8954, name: 'Pyrénées-Orientales' },
  '84': { lat: 43.9493, lon: 5.0459, name: 'Vaucluse' },
  '04': { lat: 44.0919, lon: 6.2351, name: 'Alpes-de-Haute-Provence' },
  '33': { lat: 44.8378, lon: -0.5792, name: 'Gironde' },
  '40': { lat: 43.8927, lon: -0.5000, name: 'Landes' },
};

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 heure

function calculateFireRiskLevel(
  temp: number,
  humidity: number,
  windSpeed: number
): { level: 'vert' | 'jaune' | 'orange' | 'rouge'; fwi: number } {
  // Calcul simplifié du Fire Weather Index
  // Basé sur température, humidité et vent
  let fwi = 0;

  // Facteur température (plus c'est chaud, plus le risque est élevé)
  if (temp > 35) fwi += 40;
  else if (temp > 30) fwi += 30;
  else if (temp > 25) fwi += 20;
  else if (temp > 20) fwi += 10;

  // Facteur humidité (moins il y a d'humidité, plus le risque est élevé)
  if (humidity < 20) fwi += 40;
  else if (humidity < 30) fwi += 30;
  else if (humidity < 40) fwi += 20;
  else if (humidity < 50) fwi += 10;

  // Facteur vent (plus il y a de vent, plus le risque est élevé)
  if (windSpeed > 60) fwi += 30;
  else if (windSpeed > 40) fwi += 20;
  else if (windSpeed > 25) fwi += 10;

  // Déterminer le niveau
  let level: 'vert' | 'jaune' | 'orange' | 'rouge';
  if (fwi >= 70) level = 'rouge';
  else if (fwi >= 50) level = 'orange';
  else if (fwi >= 30) level = 'jaune';
  else level = 'vert';

  return { level, fwi };
}

function getFireAdvice(level: 'vert' | 'jaune' | 'orange' | 'rouge'): string[] {
  switch (level) {
    case 'vert':
      return ['Risque faible', 'Restez vigilant en zone forestière'];
    case 'jaune':
      return [
        'Soyez prudent en forêt',
        'Ne jetez pas de mégots',
        'Évitez les barbecues en zone sensible',
      ];
    case 'orange':
      return [
        'Risque élevé - Évitez les zones forestières',
        'Barbecues et feux interdits',
        'Signalez toute fumée au 18',
        'Ne stationnez pas sur l\'herbe sèche',
        'Respectez les restrictions d\'accès aux massifs',
      ];
    case 'rouge':
      return [
        'DANGER - Risque très élevé',
        'Accès aux massifs forestiers interdit',
        'Évacuez si demandé par les autorités',
        'Préparez un sac d\'évacuation',
        'Suivez les consignes des pompiers',
        'Appelez le 18 en cas de feu',
      ];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const deptCode = searchParams.get('dept');

  try {
    const alerts: FireRiskAlert[] = [];
    const now = new Date().toISOString();

    // Si coordonnées ou département spécifique demandé
    if ((lat && lon) || deptCode) {
      let latitude: number;
      let longitude: number;
      let deptName = '';
      const code = deptCode || '';

      if (lat && lon) {
        latitude = parseFloat(lat);
        longitude = parseFloat(lon);
      } else if (deptCode && highRiskDepartments[deptCode]) {
        const dept = highRiskDepartments[deptCode];
        latitude = dept.lat;
        longitude = dept.lon;
        deptName = dept.name;
      } else {
        return NextResponse.json({
          alerts: [],
          source: 'Open-Meteo',
          updatedAt: now,
        });
      }

      const response = await fetch(
        `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`,
        { next: { revalidate: 3600 } }
      );

      if (response.ok) {
        const data = await response.json();
        const temp = data.current.temperature_2m;
        const humidity = data.current.relative_humidity_2m;
        const windSpeed = data.current.wind_speed_10m;

        const { level, fwi } = calculateFireRiskLevel(temp, humidity, windSpeed);

        if (level !== 'vert') {
          alerts.push({
            id: `fire-${code || 'loc'}`,
            type: 'feux-foret',
            level,
            title: `Risque incendie ${level}`,
            description: `Indice de risque feu : ${fwi}/100`,
            fwi,
            temperature: temp,
            humidity,
            windSpeed,
            department: deptName,
            departmentCode: code,
            updatedAt: data.current.time,
            source: 'Calcul météo',
            advice: getFireAdvice(level),
          });
        }
      }
    } else {
      // Vérifier tous les départements à risque
      for (const [code, dept] of Object.entries(highRiskDepartments)) {
        try {
          const response = await fetch(
            `${WEATHER_URL}?latitude=${dept.lat}&longitude=${dept.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`,
            { next: { revalidate: 3600 } }
          );

          if (response.ok) {
            const data = await response.json();
            const temp = data.current.temperature_2m;
            const humidity = data.current.relative_humidity_2m;
            const windSpeed = data.current.wind_speed_10m;

            const { level, fwi } = calculateFireRiskLevel(temp, humidity, windSpeed);

            // Ne garder que les alertes significatives (orange ou rouge)
            if (level === 'orange' || level === 'rouge') {
              alerts.push({
                id: `fire-${code}`,
                type: 'feux-foret',
                level,
                title: `Risque incendie ${level}`,
                description: `Indice de risque feu : ${fwi}/100`,
                fwi,
                temperature: temp,
                humidity,
                windSpeed,
                department: dept.name,
                departmentCode: code,
                updatedAt: data.current.time,
                source: 'Calcul météo',
                advice: getFireAdvice(level),
              });
            }
          }
        } catch {
          // Ignorer les erreurs individuelles
        }
      }
    }

    // Trier par niveau de risque
    const levelOrder = { rouge: 0, orange: 1, jaune: 2, vert: 3 };
    alerts.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

    return NextResponse.json({
      alerts,
      source: 'Open-Meteo / Calcul FWI',
      updatedAt: now,
    });
  } catch (error) {
    console.error('Erreur API risque incendie:', error);

    return NextResponse.json({
      alerts: [],
      source: 'erreur',
      updatedAt: new Date().toISOString(),
      error: 'Erreur lors du calcul du risque incendie',
    });
  }
}
