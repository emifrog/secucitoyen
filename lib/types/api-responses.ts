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
// OpenDataSoft (Défibrillateurs)
// ========================
export interface OpenDataSoftDAEResponse {
  results: OpenDataSoftDAERecord[];
  total_count?: number;
}

export interface OpenDataSoftDAERecord {
  c_gid?: string | number;
  id?: string | number;
  c_nom?: string;
  nom_site?: string;
  c_adr_voie?: string;
  adr_voie?: string;
  c_com_nom?: string;
  commune?: string;
  c_com_cp?: string;
  code_postal?: string;
  geo_point_2d?: { lat: number; lon: number };
  c_acc?: string;
  accessibilite?: string;
  c_disp_j?: string;
  disponibilite?: string;
  [key: string]: unknown;
}

// ========================
// Réponses internes des routes API
// ========================
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
