/**
 * Types stricts pour les réponses des APIs externes
 */

// ========================
// Vigicrues (GeoJSON)
// ========================
export interface VigicruesGeoJSON {
  type: 'FeatureCollection';
  features: VigicruesFeature[];
}

export interface VigicruesFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: unknown[];
  };
  properties: {
    NivSituVigiCruEnt: number;
    CdEntVigiCru: string;
    NomEntVigiCru: string;
    NomCoursEau?: string;
    [key: string]: unknown;
  };
}

// ========================
// Open-Meteo (Forecast / Fire)
// ========================
export interface OpenMeteoCurrentResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    precipitation: number;
    time?: string;
  };
  timezone?: string;
}

// ========================
// OpenDataSoft (Défibrillateurs) — jeu « osm-france-defibrillator »
// (schéma Géo'DAE national, géolocalisation OSM dans meta_geo_point)
// ========================
export interface OpenDataSoftDAEResponse {
  results: OpenDataSoftDAERecord[];
  total_count?: number;
}

export interface OpenDataSoftDAERecord {
  gid?: string;
  name?: string;
  adr_num?: string;
  adr_voie?: string;
  com_cp?: string;
  com_nom?: string;
  acc?: string;
  acc_lib?: string;
  acc_complt?: string;
  disp_j?: string;
  disp_h?: string;
  etat_fonct?: string;
  lat_coor1?: number;
  long_coor1?: number;
  meta_geo_point?: { lat: number; lon: number };
  geo_point_2d?: { lat: number; lon: number };
  meta_osm_id?: string;
  meta_name_com?: string;
  meta_code_dep?: string;
  [key: string]: unknown;
}

// ========================
// Réponses internes des routes API
// ========================

/**
 * Alerte unifiée renvoyée par /api/alerts (source de vérité unique du type,
 * consommée par la route et les composants d'affichage).
 */
export interface UnifiedAlert {
  id: string;
  type: string;
  category: 'meteo' | 'pollution' | 'incendie' | 'inondation' | 'sanitaire';
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

export interface AlertApiResponse {
  alerts: AlertItem[];
  sources?: Record<string, { status: string; count: number }>;
  error?: string;
}

export interface AlertItem {
  id: string;
  type: string;
  level: 'vert' | 'jaune' | 'orange' | 'rouge';
  title: string;
  description: string;
  department?: string;
  departmentCode?: string;
  source: string;
  startTime?: string;
  endTime?: string;
}

export interface VigilanceApiResponse {
  alerts: AlertItem[];
  source: string;
  department?: string;
}

export interface AirQualityApiResponse {
  aqi: number;
  level: string;
  color: string;
  components: {
    pm10: number;
    pm2_5: number;
    no2: number;
    o3: number;
  };
}

export interface VigicruesApiResponse {
  alerts: AlertItem[];
  source: string;
}

export interface MeteoForetsApiResponse {
  ifm: number;
  level: string;
  color: string;
  description: string;
}

export interface FireRiskApiResponse {
  fwi: number;
  level: string;
  color: string;
  components: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
  };
}

export interface DefibrillateursApiResponse {
  defibrillateurs: DefibrillatorItem[];
  total: number;
  source: string;
}

export interface DefibrillatorItem {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lon: number;
  access: string;
  availability: string;
  distance?: number;
}
