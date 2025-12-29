import { NextResponse } from 'next/server';

// API ATMO France via Open-Meteo (gratuit, sans clé API)
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

interface AirQualityResponse {
  current: {
    time: string;
    european_aqi: number;
    pm10: number;
    pm2_5: number;
    nitrogen_dioxide: number;
    ozone: number;
  };
}

export interface AirQualityAlert {
  id: string;
  type: 'pollution';
  level: 'vert' | 'jaune' | 'orange' | 'rouge';
  title: string;
  description: string;
  aqi: number;
  pm10: number;
  pm25: number;
  no2: number;
  o3: number;
  department?: string;
  departmentCode?: string;
  updatedAt: string;
  source: string;
  advice: string[];
}

// Centres des départements pour la requête
const departmentCenters: Record<string, { lat: number; lon: number; name: string }> = {
  '75': { lat: 48.8566, lon: 2.3522, name: 'Paris' },
  '13': { lat: 43.2965, lon: 5.3698, name: 'Bouches-du-Rhône' },
  '69': { lat: 45.7640, lon: 4.8357, name: 'Rhône' },
  '31': { lat: 43.6047, lon: 1.4442, name: 'Haute-Garonne' },
  '33': { lat: 44.8378, lon: -0.5792, name: 'Gironde' },
  '59': { lat: 50.6292, lon: 3.0573, name: 'Nord' },
  '06': { lat: 43.7102, lon: 7.2620, name: 'Alpes-Maritimes' },
  '34': { lat: 43.6108, lon: 3.8767, name: 'Hérault' },
  '44': { lat: 47.2184, lon: -1.5536, name: 'Loire-Atlantique' },
  '67': { lat: 48.5734, lon: 7.7521, name: 'Bas-Rhin' },
};

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30 minutes

function getAqiLevel(aqi: number): 'vert' | 'jaune' | 'orange' | 'rouge' {
  if (aqi <= 50) return 'vert';
  if (aqi <= 100) return 'jaune';
  if (aqi <= 150) return 'orange';
  return 'rouge';
}

function getAqiAdvice(level: 'vert' | 'jaune' | 'orange' | 'rouge'): string[] {
  switch (level) {
    case 'vert':
      return ['Qualité de l\'air satisfaisante', 'Aucune précaution particulière'];
    case 'jaune':
      return [
        'Personnes sensibles : limitez les efforts prolongés',
        'Privilégiez les activités intérieures si gêne respiratoire',
      ];
    case 'orange':
      return [
        'Évitez les efforts intenses en extérieur',
        'Personnes sensibles : restez à l\'intérieur',
        'Limitez l\'usage de la voiture',
        'Ne faites pas de feu de cheminée',
      ];
    case 'rouge':
      return [
        'Restez à l\'intérieur autant que possible',
        'Reportez tous les efforts physiques',
        'Fermez les fenêtres aux heures de pointe',
        'Consultez un médecin si gêne respiratoire',
        'Respectez les restrictions de circulation',
      ];
  }
}

function getAqiDescription(aqi: number): string {
  if (aqi <= 20) return 'Excellente qualité de l\'air';
  if (aqi <= 40) return 'Bonne qualité de l\'air';
  if (aqi <= 60) return 'Qualité de l\'air modérée';
  if (aqi <= 80) return 'Qualité de l\'air dégradée';
  if (aqi <= 100) return 'Mauvaise qualité de l\'air';
  if (aqi <= 150) return 'Très mauvaise qualité de l\'air';
  return 'Qualité de l\'air extrêmement mauvaise';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const deptCode = searchParams.get('dept');

  try {
    let latitude: number;
    let longitude: number;
    let deptName = '';
    let deptCodeResult = deptCode || '';

    // Si coordonnées fournies
    if (lat && lon) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);
    }
    // Si code département fourni
    else if (deptCode && departmentCenters[deptCode]) {
      const center = departmentCenters[deptCode];
      latitude = center.lat;
      longitude = center.lon;
      deptName = center.name;
    }
    // Par défaut : Paris
    else {
      latitude = 48.8566;
      longitude = 2.3522;
      deptName = 'Paris';
      deptCodeResult = '75';
    }

    const response = await fetch(
      `${AIR_QUALITY_URL}?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone`,
      {
        headers: { 'User-Agent': 'SécuCitoyen PWA' },
        next: { revalidate: 1800 },
      }
    );

    if (!response.ok) {
      return NextResponse.json({
        alert: null,
        source: 'indisponible',
        updatedAt: new Date().toISOString(),
        error: 'API qualité de l\'air indisponible',
      });
    }

    const data: AirQualityResponse = await response.json();
    const aqi = data.current.european_aqi;
    const level = getAqiLevel(aqi);

    // Ne créer une alerte que si niveau > vert
    let alert: AirQualityAlert | null = null;

    if (level !== 'vert') {
      alert = {
        id: `pollution-${deptCodeResult || 'loc'}`,
        type: 'pollution',
        level,
        title: `Pollution - ${getAqiDescription(aqi)}`,
        description: `Indice européen de qualité de l'air : ${aqi}`,
        aqi,
        pm10: data.current.pm10,
        pm25: data.current.pm2_5,
        no2: data.current.nitrogen_dioxide,
        o3: data.current.ozone,
        department: deptName,
        departmentCode: deptCodeResult,
        updatedAt: data.current.time,
        source: 'Open-Meteo Air Quality',
        advice: getAqiAdvice(level),
      };
    }

    return NextResponse.json({
      alert,
      current: {
        aqi,
        level,
        description: getAqiDescription(aqi),
        pm10: data.current.pm10,
        pm25: data.current.pm2_5,
        no2: data.current.nitrogen_dioxide,
        o3: data.current.ozone,
      },
      source: 'Open-Meteo Air Quality',
      updatedAt: data.current.time,
    });
  } catch (error) {
    console.error('Erreur API qualité air:', error);

    return NextResponse.json({
      alert: null,
      source: 'erreur',
      updatedAt: new Date().toISOString(),
      error: 'Erreur lors de la récupération des données',
    });
  }
}
