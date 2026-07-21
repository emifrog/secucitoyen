'use client';

import { checklistsPrevention } from './checklists-prevention';

const STORAGE_KEY = 'secucitoyen_checklists';

// Total réel des items, dérivé des données (évite un compteur figé qui
// fausserait la progression dès qu'un conseil est ajouté ou retiré).
const TOTAL_ITEMS = checklistsPrevention.reduce(
  (sum, category) => sum + category.items.length,
  0
);

export interface ChecklistProgress {
  [checklistId: string]: {
    completedItems: string[];
    lastUpdated: string;
  };
}

export function getChecklistProgress(): ChecklistProgress {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getCompletedItems(checklistId: string): string[] {
  const progress = getChecklistProgress();
  return progress[checklistId]?.completedItems || [];
}

export function toggleItem(checklistId: string, itemId: string): string[] {
  const progress = getChecklistProgress();
  const current = progress[checklistId]?.completedItems || [];

  const updated = current.includes(itemId)
    ? current.filter((id) => id !== itemId)
    : [...current, itemId];

  progress[checklistId] = {
    completedItems: updated,
    lastUpdated: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return updated;
}

export function resetChecklist(checklistId: string): void {
  const progress = getChecklistProgress();
  delete progress[checklistId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetAllChecklists(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getOverallProgress(): {
  totalItems: number;
  completedItems: number;
  percentage: number;
} {
  const progress = getChecklistProgress();
  const completedItems = Object.values(progress).reduce(
    (sum, checklist) => sum + checklist.completedItems.length,
    0
  );

  return {
    totalItems: TOTAL_ITEMS,
    completedItems,
    percentage:
      TOTAL_ITEMS > 0 ? Math.round((completedItems / TOTAL_ITEMS) * 100) : 0,
  };
}
