/**
 * Calcul de l'Indice Feu Météo (IFM) simplifié et détermination du niveau
 * de risque incendie. Extrait de la route /api/meteo-forets pour être testable.
 */

export type ForetNiveau = 'faible' | 'modere' | 'eleve' | 'tres_eleve' | 'extreme';
export type ForetSensibilite = 'haute' | 'moyenne' | 'normale';

/**
 * IFM simplifié (0–100) : plus il fait chaud, sec et venteux, plus le risque
 * est élevé ; la pluie l'atténue. Tous les facteurs sont bornés.
 */
export function calculateIFM(
  temp: number,
  humidity: number,
  windSpeed: number,
  precipitation: number
): number {
  const tempFactor = Math.min(Math.max((temp - 10) / 30, 0), 1);
  const humidityFactor = Math.min(Math.max((100 - humidity) / 80, 0), 1);
  const windFactor = Math.min(Math.max(windSpeed / 50, 0), 1);
  const precipFactor = precipitation > 5 ? 0.3 : precipitation > 1 ? 0.7 : 1;

  const ifm = (tempFactor * 40 + humidityFactor * 35 + windFactor * 25) * precipFactor;
  return Math.round(ifm);
}

/** Niveau de risque, avec seuils ajustés selon la sensibilité de la zone. */
export function getNiveau(ifm: number, sensibilite: ForetSensibilite): ForetNiveau {
  const seuils = {
    haute: { modere: 20, eleve: 35, tres_eleve: 55, extreme: 75 },
    moyenne: { modere: 25, eleve: 45, tres_eleve: 65, extreme: 85 },
    normale: { modere: 35, eleve: 55, tres_eleve: 75, extreme: 90 },
  };
  const s = seuils[sensibilite];

  if (ifm >= s.extreme) return 'extreme';
  if (ifm >= s.tres_eleve) return 'tres_eleve';
  if (ifm >= s.eleve) return 'eleve';
  if (ifm >= s.modere) return 'modere';
  return 'faible';
}

export function getNiveauNumeric(niveau: ForetNiveau): number {
  switch (niveau) {
    case 'faible': return 1;
    case 'modere': return 2;
    case 'eleve': return 3;
    case 'tres_eleve': return 4;
    case 'extreme': return 5;
  }
}

export function getDescription(niveau: ForetNiveau): string {
  switch (niveau) {
    case 'faible': return 'Risque faible - Conditions normales';
    case 'modere': return 'Risque modéré - Prudence recommandée';
    case 'eleve': return 'Risque élevé - Éviter tout comportement à risque';
    case 'tres_eleve': return 'Risque très élevé - Interdiction possible de certains massifs';
    case 'extreme': return 'Risque extrême - Accès aux forêts fortement déconseillé';
  }
}
