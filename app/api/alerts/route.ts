import { NextResponse } from 'next/server';
import { getTrustedBaseUrl, sanitizeDepartmentCode } from '@/lib/validation';
import { rateLimited } from '@/lib/rate-limit';
import type { UnifiedAlert } from '@/lib/types/api-responses';

// API unifiée pour toutes les alertes
// Combine : Météo-France (vigilance), Qualité de l'air, Risque incendie, Vigicrues, Météo des forêts

export type { UnifiedAlert };

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
  'inondation': '🌊',
  'pollution': '😷',
  'feux-foret': '🔥',
  'incendie': '🔥',
};

// Conseils selon le type d'alerte
const alertAdvice: Record<string, string[]> = {
  'crues': [
    'Éloignez-vous des cours d\'eau et zones inondables',
    'Ne traversez jamais une zone inondée à pied ou en voiture',
    'Montez dans les étages si votre habitation est menacée',
    'Coupez l\'électricité et le gaz si l\'eau monte',
    'Suivez les consignes des autorités locales',
  ],
  'incendie': [
    'N\'allumez pas de feu en extérieur',
    'Ne jetez pas de mégots',
    'Respectez les interdictions d\'accès aux massifs',
    'Signalez toute fumée suspecte au 18 ou 112',
    'En cas de feu, fuyez dos au vent vers une zone dégagée',
  ],
};

export async function GET(request: Request) {
  // Entrée publique qui déclenche un fan-out vers 5+ APIs tierces : plafond par
  // IP pour éviter l'épuisement des quotas (les circuit breakers protègent en aval).
  const limited = rateLimited(request, { key: 'alerts', limit: 60, windowMs: 60 * 1000 });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const deptCode = sanitizeDepartmentCode(searchParams.get('dept'));

  const baseUrl = getTrustedBaseUrl(request);
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

    // 3. Récupérer les vigilances crues (Vigicrues)
    const vigicruesParams = new URLSearchParams();
    if (deptCode) vigicruesParams.set('dept', deptCode);

    const vigicruesResponse = await fetch(
      `${baseUrl}/api/vigicrues?${vigicruesParams}`,
      { next: { revalidate: 300 } }
    );

    if (vigicruesResponse.ok) {
      const vigicruesData = await vigicruesResponse.json();
      if (vigicruesData.source) sources.push(vigicruesData.source);

      for (const alert of vigicruesData.alerts || []) {
        // Convertir le niveau Vigicrues en niveau standard
        const level = alert.niveau === 'rouge' ? 'rouge' :
                      alert.niveau === 'orange' ? 'orange' :
                      alert.niveau === 'jaune' ? 'jaune' : 'vert';

        if (level !== 'vert') {
          allAlerts.push({
            id: alert.id,
            type: 'crues',
            category: 'inondation',
            level,
            title: `Vigilance crues - ${alert.cours_eau}`,
            description: `Tronçon : ${alert.troncon}`,
            department: alert.departement,
            departmentCode: alert.departementCode,
            updatedAt: vigicruesData.updatedAt,
            source: 'Vigicrues',
            advice: alertAdvice.crues,
            icon: '🌊',
          });
        }
      }
    }

    // 4. Récupérer le risque incendie forêt (Météo des forêts)
    const month = new Date().getMonth();
    const isFireSeason = month >= 4 && month <= 9; // Mai à Octobre
    const highRiskDepts = ['13', '83', '06', '2A', '2B', '30', '34', '40', '33', '66', '84', '04', '11'];

    if (isFireSeason || highRiskDepts.includes(deptCode || '')) {
      const foretParams = new URLSearchParams();
      if (deptCode) foretParams.set('dept', deptCode);

      const foretResponse = await fetch(
        `${baseUrl}/api/meteo-forets?${foretParams}`,
        { next: { revalidate: 1800 } }
      );

      if (foretResponse.ok) {
        const foretData = await foretResponse.json();
        if (foretData.source) sources.push(foretData.source);

        for (const alert of foretData.alerts || []) {
          // Convertir le niveau Météo des forêts en niveau standard
          let level: 'vert' | 'jaune' | 'orange' | 'rouge' = 'vert';
          if (alert.niveau === 'extreme' || alert.niveau === 'tres_eleve') {
            level = 'rouge';
          } else if (alert.niveau === 'eleve') {
            level = 'orange';
          } else if (alert.niveau === 'modere') {
            level = 'jaune';
          }

          if (level !== 'vert') {
            allAlerts.push({
              id: alert.id,
              type: 'incendie',
              category: 'incendie',
              level,
              title: `Risque incendie - ${alert.departement}`,
              description: `${alert.description} (IFM: ${alert.ifm})`,
              department: alert.departement,
              departmentCode: alert.departementCode,
              updatedAt: foretData.updatedAt,
              source: 'Météo des forêts',
              advice: alertAdvice.incendie,
              icon: '🔥',
            });
          }
        }
      }
    }

    // 5. Ancien risque incendie (fire-risk) - gardé pour compatibilité
    if (isFireSeason || highRiskDepts.includes(deptCode || '')) {
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
        // Ne pas ajouter de doublon si déjà présent via météo-forets
        const existingFireAlerts = allAlerts.filter(a => a.category === 'incendie');

        for (const alert of fireData.alerts || []) {
          // Vérifier si une alerte pour ce département existe déjà
          const exists = existingFireAlerts.some(
            a => a.departmentCode === alert.departmentCode
          );

          if (!exists) {
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
              source: 'Calcul FWI',
              advice: alertAdvice.incendie,
              icon: '🔥',
            });
          }
        }
      }
    }

    // Trier par niveau de danger (rouge > orange > jaune > vert)
    const levelOrder: Record<string, number> = { rouge: 0, orange: 1, jaune: 2, vert: 3 };
    allAlerts.sort((a, b) => {
      const levelDiff = levelOrder[a.level] - levelOrder[b.level];
      if (levelDiff !== 0) return levelDiff;
      // Ensuite par catégorie
      const categoryOrder: Record<string, number> = { inondation: 0, incendie: 1, meteo: 2, pollution: 3, sanitaire: 4 };
      return categoryOrder[a.category] - categoryOrder[b.category];
    });

    // Dédupliquer les sources
    const uniqueSources = Array.from(new Set(sources));

    // Statistiques par catégorie
    const stats = {
      meteo: allAlerts.filter(a => a.category === 'meteo').length,
      inondation: allAlerts.filter(a => a.category === 'inondation').length,
      incendie: allAlerts.filter(a => a.category === 'incendie').length,
      pollution: allAlerts.filter(a => a.category === 'pollution').length,
    };

    return NextResponse.json({
      alerts: allAlerts,
      count: allAlerts.length,
      stats,
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
      stats: { meteo: 0, inondation: 0, incendie: 0, pollution: 0 },
      sources: [],
      updatedAt: new Date().toISOString(),
      error: 'Erreur lors de la récupération des alertes',
    });
  }
}
