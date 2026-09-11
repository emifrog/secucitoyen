import type { UnifiedAlert } from '@/lib/types/api-responses';
import { DEPARTEMENTS_RISQUE_INCENDIE, getDepartementNom } from '@/lib/departements';
import { fetchVigilance, VIGILANCE_SOURCE } from './vigilance';
import { fetchAirQuality, AIR_QUALITY_SOURCE } from './air-quality';
import { fetchVigicrues, VIGICRUES_SOURCE } from './vigicrues';
import { fetchMeteoForets, FIRE_ESTIMATE_SOURCE, type ForetRiskAlert } from './meteo-forets';
import { fetchFireRisk } from './fire-risk';
import { LEVEL_ORDER, type AlertLevel } from './types';

// Agrégateur des alertes : appelle les sources EN PARALLÈLE et directement
// (plus d'auto-appels HTTP serverless → serverless en série). Utilisé par
// /api/alerts et par le cron de notifications.

/** Sources dont une vigilance orange/rouge peut être poussée en notification. */
export const OFFICIAL_PUSH_SOURCES: ReadonlySet<string> = new Set([VIGILANCE_SOURCE, VIGICRUES_SOURCE]);

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

const CRUES_ADVICE = [
  'Éloignez-vous des cours d\'eau et zones inondables',
  'Ne traversez jamais une zone inondée à pied ou en voiture',
  'Montez dans les étages si votre habitation est menacée',
  'Coupez l\'électricité et le gaz si l\'eau monte',
  'Suivez les consignes des autorités locales',
];

const INCENDIE_ADVICE = [
  'N\'allumez pas de feu en extérieur',
  'Ne jetez pas de mégots',
  'Respectez les interdictions d\'accès aux massifs',
  'Signalez toute fumée suspecte au 18 ou 112',
  'En cas de feu, fuyez dos au vent vers une zone dégagée',
  'Consultez la Météo des forêts officielle (meteofrance.com)',
];

const CATEGORY_ORDER: Record<UnifiedAlert['category'], number> = {
  inondation: 0,
  incendie: 1,
  meteo: 2,
  pollution: 3,
  sanitaire: 4,
};

/**
 * Niveau affiché pour une estimation de risque incendie : plafonné à orange.
 * Le rouge est réservé aux vigilances officielles (et au push).
 */
export function foretNiveauToLevel(niveau: ForetRiskAlert['niveau']): AlertLevel {
  switch (niveau) {
    case 'extreme':
    case 'tres_eleve':
    case 'eleve':
      return 'orange';
    case 'modere':
      return 'jaune';
    default:
      return 'vert';
  }
}

export interface AggregateOptions {
  /** Code département déjà validé, ou null = vue nationale. */
  dept?: string | null;
  lat?: number;
  lon?: number;
  /** Ne conserver que orange/rouge (cron). */
  severeOnly?: boolean;
}

export type SourceStatus = 'ok' | 'degraded' | 'skipped';

export interface AggregateResult {
  alerts: UnifiedAlert[];
  count: number;
  stats: { meteo: number; inondation: number; incendie: number; pollution: number };
  sources: string[];
  /** true dès qu'une source n'a pas répondu (liste possiblement incomplète). */
  degraded: boolean;
  sourceStatus: Record<string, SourceStatus>;
  updatedAt: string;
}

export async function aggregateAlerts(opts: AggregateOptions = {}): Promise<AggregateResult> {
  const dept = opts.dept ?? null;
  const hasCoords = Number.isFinite(opts.lat) && Number.isFinite(opts.lon);
  const severeOnly = opts.severeOnly === true;

  const month = new Date().getMonth();
  const isFireSeason = month >= 4 && month <= 9; // mai à octobre
  const deptIsFireSensitive = dept !== null && DEPARTEMENTS_RISQUE_INCENDIE.some((d) => d.code === dept);
  const watchFire = isFireSeason || deptIsFireSensitive;

  const [vigilance, air, crues, fire] = await Promise.allSettled([
    fetchVigilance({ dept, minLevel: severeOnly ? 'orange' : 'jaune' }),
    hasCoords || dept ? fetchAirQuality({ lat: opts.lat, lon: opts.lon, dept }) : Promise.resolve(null),
    fetchVigicrues(dept),
    watchFire
      ? hasCoords && !dept
        ? fetchFireRisk({ lat: opts.lat, lon: opts.lon })
        : fetchMeteoForets(dept)
      : Promise.resolve(null),
  ]);

  const allAlerts: UnifiedAlert[] = [];
  const sources: string[] = [];
  const sourceStatus: Record<string, SourceStatus> = {};
  let degraded = false;

  const note = (name: string, status: SourceStatus) => {
    sourceStatus[name] = status;
    if (status === 'degraded') degraded = true;
  };

  // 1. Vigilance Météo-France
  if (vigilance.status === 'fulfilled') {
    const r = vigilance.value;
    sources.push(r.source);
    note(r.source, r.degraded ? 'degraded' : 'ok');
    for (const a of r.items) {
      allAlerts.push({
        id: a.id,
        type: a.type,
        category: 'meteo',
        level: a.level,
        title: a.title,
        description: a.description,
        department: a.department,
        departmentCode: a.departmentCode,
        startDate: a.startDate,
        endDate: a.endDate,
        updatedAt: a.updatedAt,
        source: r.source,
        advice: a.advice ?? [],
        icon: alertIcons[a.type] || '⚠️',
      });
    }
  } else {
    note(VIGILANCE_SOURCE, 'degraded');
  }

  // 2. Qualité de l'air
  if (air.status === 'fulfilled') {
    const r = air.value;
    if (r === null) {
      note(AIR_QUALITY_SOURCE, 'skipped');
    } else {
      sources.push(r.source);
      note(r.source, r.degraded ? 'degraded' : 'ok');
      if (r.alert) {
        allAlerts.push({
          id: r.alert.id,
          type: 'pollution',
          category: 'pollution',
          level: r.alert.level,
          title: r.alert.title,
          description: r.alert.description,
          department: r.alert.department,
          departmentCode: r.alert.departmentCode,
          updatedAt: r.alert.updatedAt,
          source: r.source,
          advice: r.alert.advice,
          icon: '😷',
        });
      }
    }
  } else {
    note(AIR_QUALITY_SOURCE, 'degraded');
  }

  // 3. Vigilance crues
  if (crues.status === 'fulfilled') {
    const r = crues.value;
    sources.push(r.source);
    note(r.source, r.degraded ? 'degraded' : 'ok');
    for (const a of r.items) {
      if (a.niveau === 'vert') continue;
      // Un tronçon traverse souvent plusieurs départements. En vue nationale on
      // émet une alerte par département concerné : sans cela, le cron ne
      // notifierait que les abonnés du premier d'entre eux. En vue
      // départementale, seule la cible demandée est conservée.
      const cibles = dept ? [dept] : a.departements.length > 0 ? a.departements : [''];
      for (const code of cibles) {
        allAlerts.push({
          id: code ? `${a.id}-${code}` : a.id,
          type: 'crues',
          category: 'inondation',
          level: a.niveau,
          title: `Vigilance crues - ${a.cours_eau}`,
          description: `Tronçon : ${a.troncon}`,
          department: code ? getDepartementNom(code) ?? '' : '',
          departmentCode: code,
          updatedAt: r.updatedAt,
          source: r.source,
          advice: CRUES_ADVICE,
          icon: '🌊',
        });
      }
    }
  } else {
    note(VIGICRUES_SOURCE, 'degraded');
  }

  // 4. Risque incendie (estimation, plafonnée à orange)
  if (fire.status === 'fulfilled') {
    const r = fire.value;
    if (r === null) {
      note(FIRE_ESTIMATE_SOURCE, 'skipped');
    } else {
      sources.push(r.source);
      note(r.source, r.degraded ? 'degraded' : 'ok');
      for (const item of r.items) {
        if ('niveau' in item) {
          const level = foretNiveauToLevel(item.niveau);
          if (level === 'vert') continue;
          allAlerts.push({
            id: item.id,
            type: 'incendie',
            category: 'incendie',
            level,
            title: `Risque incendie estimé - ${item.departement}`,
            description: `${item.description} (indice estimé : ${item.ifm}/100)`,
            department: item.departement,
            departmentCode: item.departementCode,
            updatedAt: r.updatedAt,
            source: r.source,
            advice: INCENDIE_ADVICE,
            icon: '🔥',
          });
        } else {
          if (item.level === 'vert') continue;
          allAlerts.push({
            id: item.id,
            type: 'feux-foret',
            category: 'incendie',
            level: item.level,
            title: item.title,
            description: item.description,
            department: item.department,
            departmentCode: item.departmentCode,
            updatedAt: item.updatedAt,
            source: r.source,
            advice: item.advice,
            icon: '🔥',
          });
        }
      }
    }
  } else {
    note(FIRE_ESTIMATE_SOURCE, 'degraded');
  }

  const alerts = (severeOnly
    ? allAlerts.filter((a) => a.level === 'orange' || a.level === 'rouge')
    : allAlerts
  ).sort((a, b) => {
    const levelDiff = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
    if (levelDiff !== 0) return levelDiff;
    return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
  });

  return {
    alerts,
    count: alerts.length,
    stats: {
      meteo: alerts.filter((a) => a.category === 'meteo').length,
      inondation: alerts.filter((a) => a.category === 'inondation').length,
      incendie: alerts.filter((a) => a.category === 'incendie').length,
      pollution: alerts.filter((a) => a.category === 'pollution').length,
    },
    sources: Array.from(new Set(sources)),
    degraded,
    sourceStatus,
    updatedAt: new Date().toISOString(),
  };
}
