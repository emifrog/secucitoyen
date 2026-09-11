/**
 * Types stricts pour les réponses des APIs externes
 */

// ========================
// Vigicrues (GeoJSON)
// ========================
export interface VigicruesGeoJSON {
  type: 'FeatureCollection';
  features: VigicruesFeature[];
  /** Référence du bulletin en cours. */
  RefInfoVigiCru?: string;
  /** Date/heure de publication du bulletin (ISO 8601). */
  DtHrInfoVigiCru?: string;
}

/**
 * Un tronçon de vigilance crues. Le service en ligne
 * (`/services/1/InfoVigiCru.geojson`) et l'API v1.1 documentée nomment les
 * mêmes informations différemment : les deux jeux de champs sont déclarés
 * optionnels et lus avec un repli (cf. `lib/sources/vigicrues.ts`).
 */
export interface VigicruesFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: unknown[];
  };
  properties: {
    /** Niveau de vigilance 1–4 (GeoJSON en service). */
    NivInfViCr?: number;
    /** Même niveau, nommage de l'API v1.1. */
    NivSituVigiCruEnt?: number;
    /** Code du tronçon : acronyme de territoire (« CO1 », « ML101 »), pas un département. */
    CdEntCru?: string;
    CdEntVigiCru?: string;
    /** Libellé du tronçon (« Eure moyenne et aval »). */
    lbentcru?: string;
    NomEntVigiCru?: string;
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

// NB : les anciens types « *ApiResponse » (AlertItem, DefibrillatorItem…)
// n'étaient importés nulle part et ne correspondaient plus aux réponses
// réelles ; les contrats des sources vivent dans lib/sources/*.
