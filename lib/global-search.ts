import { emergencyNumbers } from './numeros-urgence';
import { getFichesSummary } from './fiches-secours';
import { getChecklistsSummary } from './checklists-prevention';
import { alertTypes } from './alertes';

export interface SearchResult {
  id: string;
  type: 'urgence' | 'secours' | 'prevention' | 'alerte';
  title: string;
  description: string;
  icon: string;
  href: string;
}

// Préparer les données de recherche
const fichesData = getFichesSummary();
const checklistsData = getChecklistsSummary();

const fichesList = fichesData.map((f) => ({
  ...f,
  searchText: `${f.title} ${f.shortDescription}`.toLowerCase(),
}));

const checklistsList = checklistsData.map((c) => ({
  ...c,
  searchText: `${c.title} ${c.description}`.toLowerCase(),
}));

const emergencyList = emergencyNumbers.map((n) => ({
  ...n,
  searchText: `${n.number} ${n.name} ${n.description} ${n.searchKeywords?.join(' ') || ''}`.toLowerCase(),
}));

const alertTypesList = alertTypes.map((a) => ({
  ...a,
  searchText: `${a.name} ${a.type}`.toLowerCase(),
}));

export function globalSearch(query: string): SearchResult[] {
  if (!query || query.length < 2) return [];

  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  // Chercher dans les numéros d'urgence
  emergencyList.forEach((n) => {
    if (n.searchText.includes(q)) {
      results.push({
        id: `urgence-${n.number}`,
        type: 'urgence',
        title: `${n.number} - ${n.name}`,
        description: n.description,
        icon: n.icon,
        href: `/urgences/${n.number.replace(/\s/g, '-')}`,
      });
    }
  });

  // Chercher dans les fiches secours
  fichesList.forEach((f) => {
    if (f.searchText.includes(q)) {
      results.push({
        id: `secours-${f.id}`,
        type: 'secours',
        title: f.title,
        description: f.shortDescription,
        icon: f.icon,
        href: `/secours/${f.id}`,
      });
    }
  });

  // Chercher dans les checklists
  checklistsList.forEach((c) => {
    if (c.searchText.includes(q)) {
      results.push({
        id: `prevention-${c.id}`,
        type: 'prevention',
        title: c.title,
        description: c.description,
        icon: c.icon,
        href: `/prevention/${c.id}`,
      });
    }
  });

  // Chercher dans les types d'alertes
  alertTypesList.forEach((a) => {
    if (a.searchText.includes(q)) {
      results.push({
        id: `alerte-${a.type}`,
        type: 'alerte',
        title: a.name,
        description: `Alertes ${a.name.toLowerCase()}`,
        icon: a.icon,
        href: '/alertes',
      });
    }
  });

  return results.slice(0, 10); // Limiter à 10 résultats
}

export const typeLabels: Record<SearchResult['type'], string> = {
  urgence: 'Urgence',
  secours: 'Secours',
  prevention: 'Prévention',
  alerte: 'Alerte',
};

export const typeColors: Record<SearchResult['type'], string> = {
  urgence: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  secours: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  prevention: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  alerte: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};
