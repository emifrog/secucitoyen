import { NextResponse } from 'next/server';

// API unifiée pour toutes les alertes
// Combine : Météo-France (vigilance), Qualité de l'air, Risque incendie

export interface UnifiedAlert {
  id: string;
  type: string;
  category: 'meteo' | 'pollution' | 'incendie' | 'sanitaire';
  level: 'vert' | 'jaune' | 'orange' | 'rouge';
  title: string;
  description: string;
  department?: string;
  departmentCode?: string;
  startDate?: string;
  endDate?: string;
  updatedAt: string;
  source: string;
  advice: string[];
  icon: string;
}

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

const alertIcons: Record<string, string> = {
  'vent': '💨',
  'pluie-inondation': '🌧️',
  'orages': '⛈️',
  'neige-verglas': '❄️',
  'canicule': '🌡️',
  'grand-froid': '🥶',
  'avalanches': '🏔️',
  'vagues-submersion': '🌊',
  'crues': '🌊',
  'pollution': '😷',
  'feux-foret': '🔥',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const deptCode = searchParams.get('dept');

  const baseUrl = new URL(request.url).origin;
  const allAlerts: UnifiedAlert[] = [];
  const sources: string[] = [];

  try {
    // 1. Récupérer les alertes Météo-France (vigilance)
    const vigilanceParams = new URLSearchParams();
    if (deptCode) vigilanceParams.set('dept', deptCode);

    const vigilanceResponse = await fetch(
      `${baseUrl}/api/vigilance?${vigilanceParams}`,
      { next: { revalidate: 300 } }
    );

    if (vigilanceResponse.ok) {
      const vigilanceData = await vigilanceResponse.json();
      sources.push(vigilanceData.source || 'Météo-France');

      for (const alert of vigilanceData.alerts || []) {
        allAlerts.push({
          id: alert.id,
          type: alert.type,
          category: 'meteo',
          level: alert.level,
          title: alert.title,
          description: alert.description,
          department: alert.department,
          departmentCode: alert.departmentCode,
          startDate: alert.startDate,
          endDate: alert.endDate,
          updatedAt: alert.updatedAt,
          source: 'Météo-France',
          advice: alert.advice || [],
          icon: alertIcons[alert.type] || '⚠️',
        });
      }
    }

    // 2. Récupérer la qualité de l'air
    const airParams = new URLSearchParams();
    if (lat && lon) {
      airParams.set('lat', lat);
      airParams.set('lon', lon);
    } else if (deptCode) {
      airParams.set('dept', deptCode);
    }

    const airResponse = await fetch(
      `${baseUrl}/api/air-quality?${airParams}`,
      { next: { revalidate: 1800 } }
    );

    if (airResponse.ok) {
      const airData = await airResponse.json();
      if (airData.source) sources.push(airData.source);

      if (airData.alert) {
        allAlerts.push({
          id: airData.alert.id,
          type: 'pollution',
          category: 'pollution',
          level: airData.alert.level,
          title: airData.alert.title,
          description: airData.alert.description,
          department: airData.alert.department,
          departmentCode: airData.alert.departmentCode,
          updatedAt: airData.alert.updatedAt,
          source: 'Open-Meteo Air Quality',
          advice: airData.alert.advice || [],
          icon: '😷',
        });
      }
    }

    // 3. Récupérer le risque incendie (seulement en été ou pour les départements à risque)
    const month = new Date().getMonth();
    const isFireSeason = month >= 5 && month <= 9; // Juin à Octobre

    if (isFireSeason || ['13', '83', '06', '2A', '2B', '30', '34', '40', '33'].includes(deptCode || '')) {
      const fireParams = new URLSearchParams();
      if (lat && lon) {
        fireParams.set('lat', lat);
        fireParams.set('lon', lon);
      } else if (deptCode) {
        fireParams.set('dept', deptCode);
      }

      const fireResponse = await fetch(
        `${baseUrl}/api/fire-risk?${fireParams}`,
        { next: { revalidate: 3600 } }
      );

      if (fireResponse.ok) {
        const fireData = await fireResponse.json();
        if (fireData.source) sources.push(fireData.source);

        for (const alert of fireData.alerts || []) {
          allAlerts.push({
            id: alert.id,
            type: 'feux-foret',
            category: 'incendie',
            level: alert.level,
            title: alert.title,
            description: alert.description,
            department: alert.department,
            departmentCode: alert.departmentCode,
            updatedAt: alert.updatedAt,
            source: 'Calcul météo',
            advice: alert.advice || [],
            icon: '🔥',
          });
        }
      }
    }

    // Trier par niveau de danger (rouge > orange > jaune > vert)
    const levelOrder: Record<string, number> = { rouge: 0, orange: 1, jaune: 2, vert: 3 };
    allAlerts.sort((a, b) => {
      const levelDiff = levelOrder[a.level] - levelOrder[b.level];
      if (levelDiff !== 0) return levelDiff;
      // Ensuite par catégorie
      const categoryOrder: Record<string, number> = { meteo: 0, incendie: 1, pollution: 2, sanitaire: 3 };
      return categoryOrder[a.category] - categoryOrder[b.category];
    });

    // Dédupliquer les sources
    const uniqueSources = Array.from(new Set(sources));

    return NextResponse.json({
      alerts: allAlerts,
      count: allAlerts.length,
      sources: uniqueSources,
      updatedAt: new Date().toISOString(),
      filters: {
        department: deptCode || null,
        coordinates: lat && lon ? { lat: parseFloat(lat), lon: parseFloat(lon) } : null,
      },
    });
  } catch (error) {
    console.error('Erreur API alertes unifiées:', error);

    return NextResponse.json({
      alerts: [],
      count: 0,
      sources: [],
      updatedAt: new Date().toISOString(),
      error: 'Erreur lors de la récupération des alertes',
    });
  }
}
