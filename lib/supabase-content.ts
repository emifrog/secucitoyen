import { supabase } from './supabase';
import { emergencyNumbers, categories, type EmergencyNumber } from './numeros-urgence';
import { fichesSecours, type FicheSecours } from './fiches-secours';
import { checklistsPrevention, type ChecklistCategory, type ChecklistItem } from './checklists-prevention';
import { saisons, type Saison, type ConseilSaisonnier } from './conseils-saisonniers';

/**
 * Couche de données Supabase avec fallback sur les données locales.
 * - En cas d'erreur Supabase → données locales utilisées
 * - Cache ISR côté serveur (revalidation 1h)
 */

// ========================
// Numéros d'urgence
// ========================

interface SupabaseNumero {
  number: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'vital' | 'social' | 'special';
  details: string[];
  available: string;
  search_keywords: string[];
}

function mapNumero(row: SupabaseNumero): EmergencyNumber {
  return {
    number: row.number,
    name: row.name,
    description: row.description,
    icon: row.icon,
    color: row.color,
    category: row.category,
    details: row.details,
    available: row.available,
    searchKeywords: row.search_keywords,
  };
}

export async function fetchEmergencyNumbers(): Promise<EmergencyNumber[]> {
  try {
    const { data, error } = await supabase
      .from('numeros_urgence')
      .select('*')
      .eq('active', true)
      .order('sort_order');

    if (error || !data || data.length === 0) {
      return emergencyNumbers;
    }

    return data.map(mapNumero);
  } catch {
    return emergencyNumbers;
  }
}

// ========================
// Fiches de secours
// ========================

interface SupabaseFiche {
  id: string;
  title: string;
  icon: string;
  urgency: 'critical' | 'high' | 'medium';
  short_description: string;
  when_to_act: string[];
  steps: { title: string; description: string; warning?: string; tip?: string }[];
  do_not: string[];
  call_emergency: { when: string; number: string; whatToSay: string[] };
}

function mapFiche(row: SupabaseFiche): FicheSecours {
  return {
    id: row.id,
    title: row.title,
    icon: row.icon,
    urgency: row.urgency,
    shortDescription: row.short_description,
    whenToAct: row.when_to_act,
    steps: row.steps,
    doNot: row.do_not,
    callEmergency: row.call_emergency,
  };
}

export async function fetchFichesSecours(): Promise<FicheSecours[]> {
  try {
    const { data, error } = await supabase
      .from('fiches_secours')
      .select('*')
      .eq('active', true)
      .order('sort_order');

    if (error || !data || data.length === 0) {
      return fichesSecours;
    }

    return data.map(mapFiche);
  } catch {
    return fichesSecours;
  }
}

export async function fetchFicheById(id: string): Promise<FicheSecours | undefined> {
  try {
    const { data, error } = await supabase
      .from('fiches_secours')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error || !data) {
      return fichesSecours.find((f) => f.id === id);
    }

    return mapFiche(data);
  } catch {
    return fichesSecours.find((f) => f.id === id);
  }
}

// ========================
// Checklists de prévention
// ========================

interface SupabaseChecklist {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  items: ChecklistItem[];
}

function mapChecklist(row: SupabaseChecklist): ChecklistCategory {
  return {
    id: row.id,
    title: row.title,
    icon: row.icon,
    color: row.color,
    description: row.description,
    items: row.items,
  };
}

export async function fetchChecklists(): Promise<ChecklistCategory[]> {
  try {
    const { data, error } = await supabase
      .from('checklists_prevention')
      .select('*')
      .eq('active', true)
      .order('sort_order');

    if (error || !data || data.length === 0) {
      return checklistsPrevention;
    }

    return data.map(mapChecklist);
  } catch {
    return checklistsPrevention;
  }
}

// ========================
// Conseils saisonniers
// ========================

interface SupabaseSaison {
  id: string;
  nom: string;
  icon: string;
  mois: number[];
  couleur: string;
}

interface SupabaseConseil {
  id: string;
  titre: string;
  description: string;
  icon: string;
  conseils: string[];
  urgence: string | null;
  saison: string;
}

export async function fetchSaisons(): Promise<Saison[]> {
  try {
    const { data: saisonsData, error: saisonsError } = await supabase
      .from('saisons')
      .select('*')
      .order('sort_order');

    const { data: conseilsData, error: conseilsError } = await supabase
      .from('conseils_saisonniers')
      .select('*')
      .eq('active', true)
      .order('sort_order');

    if (saisonsError || conseilsError || !saisonsData || !conseilsData || saisonsData.length === 0) {
      return saisons;
    }

    return saisonsData.map((s: SupabaseSaison) => ({
      id: s.id,
      nom: s.nom,
      icon: s.icon,
      mois: s.mois,
      couleur: s.couleur,
      conseils: conseilsData
        .filter((c: SupabaseConseil) => c.saison === s.id)
        .map((c: SupabaseConseil): ConseilSaisonnier => ({
          id: c.id,
          titre: c.titre,
          description: c.description,
          icon: c.icon,
          conseils: c.conseils,
          urgence: c.urgence || undefined,
        })),
    }));
  } catch {
    return saisons;
  }
}

export async function fetchConseilById(id: string): Promise<{ conseil: ConseilSaisonnier; saison: Saison } | undefined> {
  try {
    const { data, error } = await supabase
      .from('conseils_saisonniers')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single();

    if (error || !data) {
      // Fallback local
      for (const saison of saisons) {
        const conseil = saison.conseils.find((c) => c.id === id);
        if (conseil) return { conseil, saison };
      }
      return undefined;
    }

    const allSaisons = await fetchSaisons();
    const saison = allSaisons.find((s) => s.id === data.saison);
    if (!saison) return undefined;

    return {
      conseil: {
        id: data.id,
        titre: data.titre,
        description: data.description,
        icon: data.icon,
        conseils: data.conseils,
        urgence: data.urgence || undefined,
      },
      saison,
    };
  } catch {
    for (const s of saisons) {
      const conseil = s.conseils.find((c) => c.id === id);
      if (conseil) return { conseil, saison: s };
    }
    return undefined;
  }
}

// Re-export pour compatibilité
export { categories };
