'use client';

import { useState, useEffect } from 'react';
import { getChecklistProgress } from '@/lib/checklist-storage';
import { checklistsPrevention } from '@/lib/checklists-prevention';

export default function OverallProgress() {
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });

  useEffect(() => {
    const stored = getChecklistProgress();
    const total = checklistsPrevention.reduce((sum, c) => sum + c.items.length, 0);
    const completed = Object.values(stored).reduce(
      (sum, c) => sum + c.completedItems.length,
      0
    );
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    setProgress({ completed, total, percentage });
  }, []);

  return (
    <section className="bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 border border-accent/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Votre progression</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {progress.completed}/{progress.total} éléments complétés
          </p>
        </div>
        <div className="text-3xl font-bold text-accent">{progress.percentage}%</div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-accent h-full rounded-full transition-all duration-500"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      {progress.percentage === 100 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
          <span>🎉</span>
          <span>Félicitations ! Vous avez complété toutes les check-lists.</span>
        </div>
      )}
    </section>
  );
}
