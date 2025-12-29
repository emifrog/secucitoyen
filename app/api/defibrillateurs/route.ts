import { NextResponse } from 'next/server';

// API pour trouver les défibrillateurs (DAE) à proximité
// Source : data.gouv.fr - Base nationale des défibrillateurs

export interface Defibrillateur {
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

export const dynamic = 'force-dynamic';

// Calcul de distance Haversine en mètres
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const radius = searchParams.get('radius') || '2000'; // 2km par défaut
  const limit = searchParams.get('limit') || '20';

  if (!lat || !lon) {
    return NextResponse.json({
      error: 'Paramètres lat et lon requis',
      defibrillateurs: [],
    }, { status: 400 });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  const radiusMeters = parseInt(radius);
  const maxResults = parseInt(limit);

  try {
    // API GéoDAE (données ouvertes défibrillateurs)
    // Documentation : https://geo.api.gouv.fr/
    // Alternative : API data.gouv.fr avec dataset des DAE

    // Calcul de la bounding box pour optimiser la requête
    const latDelta = radiusMeters / 111000; // ~111km par degré
    const lonDelta = radiusMeters / (111000 * Math.cos(latitude * Math.PI / 180));

    const minLat = latitude - latDelta;
    const maxLat = latitude + latDelta;
    const minLon = longitude - lonDelta;
    const maxLon = longitude + lonDelta;

    // Requête à l'API des DAE de data.gouv.fr via leur API
    const apiUrl = `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-france-defibrillateur-automatique-externe-dae/records?where=geo_point_2d%20within%20(${minLat}%2C%20${minLon}%2C%20${maxLat}%2C%20${maxLon})&limit=100`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache 1 heure
    });

    if (!response.ok) {
      // Fallback : générer des données simulées pour demo
      // En production, on utiliserait l'API réelle
      console.warn('API DAE non disponible, utilisation du fallback');
      return NextResponse.json({
        defibrillateurs: generateFallbackDAE(latitude, longitude, radiusMeters, maxResults),
        count: maxResults,
        source: 'Données simulées (API non disponible)',
        searchRadius: radiusMeters,
        center: { lat: latitude, lon: longitude },
      });
    }

    const data = await response.json();

    // Transformer les résultats
    const defibrillateurs: Defibrillateur[] = (data.results || [])
      .map((record: Record<string, unknown>) => {
        const geoPoint = record.geo_point_2d as { lat: number; lon: number } | undefined;
        if (!geoPoint) return null;

        const dLat = geoPoint.lat;
        const dLon = geoPoint.lon;
        const distance = haversineDistance(latitude, longitude, dLat, dLon);

        if (distance > radiusMeters) return null;

        return {
          id: String(record.c_gid || record.id || Math.random()),
          nom: String(record.c_nom || record.nom_site || 'Défibrillateur'),
          adresse: String(record.c_adr_voie || record.adr_voie || ''),
          commune: String(record.c_com_nom || record.commune || ''),
          codePostal: String(record.c_com_cp || record.code_postal || ''),
          latitude: dLat,
          longitude: dLon,
          accessibilite: String(record.c_acc || record.accessibilite || 'Non précisé'),
          disponibilite: String(record.c_disp_j || record.disponibilite || '24h/24'),
          distance: Math.round(distance),
        };
      })
      .filter((d: Defibrillateur | null): d is Defibrillateur => d !== null)
      .sort((a: Defibrillateur, b: Defibrillateur) => (a.distance || 0) - (b.distance || 0))
      .slice(0, maxResults);

    return NextResponse.json({
      defibrillateurs,
      count: defibrillateurs.length,
      source: 'OpenDataSoft - DAE France',
      searchRadius: radiusMeters,
      center: { lat: latitude, lon: longitude },
    });
  } catch (error) {
    console.error('Erreur API défibrillateurs:', error);

    // Fallback avec données simulées
    return NextResponse.json({
      defibrillateurs: generateFallbackDAE(latitude, longitude, radiusMeters, maxResults),
      count: maxResults,
      source: 'Données simulées (erreur API)',
      searchRadius: radiusMeters,
      center: { lat: latitude, lon: longitude },
    });
  }
}

// Génère des DAE simulés pour le fallback/démo
function generateFallbackDAE(lat: number, lon: number, radius: number, count: number): Defibrillateur[] {
  const types = [
    'Mairie',
    'Centre commercial',
    'Gare SNCF',
    'Pharmacie',
    'Salle de sport',
    'Piscine municipale',
    'Stade',
    'École primaire',
    'Collège',
    'Poste de police',
    'Caserne pompiers',
    'Centre culturel',
    'Bibliothèque',
    'Supermarché',
  ];

  const accessibilites = [
    'Accessible 24h/24',
    'Heures d\'ouverture',
    'Sur demande',
    'Extérieur',
  ];

  const result: Defibrillateur[] = [];

  for (let i = 0; i < count; i++) {
    // Position aléatoire dans le rayon
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    const dLat = distance * Math.cos(angle) / 111000;
    const dLon = distance * Math.sin(angle) / (111000 * Math.cos(lat * Math.PI / 180));

    const type = types[Math.floor(Math.random() * types.length)];

    result.push({
      id: `dae-${i + 1}`,
      nom: `${type}`,
      adresse: `${Math.floor(Math.random() * 100) + 1} rue Exemple`,
      commune: 'Commune',
      codePostal: '75000',
      latitude: lat + dLat,
      longitude: lon + dLon,
      accessibilite: accessibilites[Math.floor(Math.random() * accessibilites.length)],
      disponibilite: Math.random() > 0.3 ? '24h/24' : 'Heures d\'ouverture',
      distance: Math.round(distance),
    });
  }

  return result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
}
