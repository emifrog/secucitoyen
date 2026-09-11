'use client';

import { useState, useEffect } from 'react';
import { getOverallProgress } from '@/lib/checklist-storage';

export default function OverallProgress() {
  const [progress, setProgress] = useState({ completedItems: 0, totalItems: 0, percentage: 0 });

  useEffect(() => {
    // Lecture du localStorage après montage (rendu serveur identique à 0 %).
    setProgress(getOverallProgress());
  }, []);

  return (
    <section
      className="bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 border border-accent/20 rounded-xl p-4"
      aria-labelledby="progress-title"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 id="progress-title" className="font-semibold text-gray-800 dark:text-gray-100">Votre progression</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {progress.completedItems}/{progress.totalItems} éléments complétés
          </p>
        </div>
        <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{progress.percentage}%</div>
      </div>
      <div
        className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden"
        role="progressbar"
        aria-valuenow={progress.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progression globale des check-lists"
      >
        <div
          className="bg-accent h-full rounded-full transition-all duration-500"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      {progress.percentage === 100 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
          <span aria-hidden="true">🎉</span>
          <span>Félicitations ! Vous avez complété toutes les check-lists.</span>
        </div>
      )}
    </section>
  );
}
