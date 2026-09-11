'use client';

import { useState, useEffect } from 'react';
import { ChecklistCategory } from '@/lib/checklists-prevention';
import { getCompletedItems, toggleItem, resetChecklist } from '@/lib/checklist-storage';
import { priorityConfig } from '@/lib/ui-tokens';

interface ChecklistContentProps {
  checklist: ChecklistCategory;
}

export default function ChecklistContent({ checklist }: ChecklistContentProps) {
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    setCompletedItems(getCompletedItems(checklist.id));
  }, [checklist.id]);

  const handleToggle = (itemId: string) => {
    setCompletedItems(toggleItem(checklist.id, itemId));
  };

  const handleReset = () => {
    if (confirm('Voulez-vous vraiment réinitialiser cette check-list ?')) {
      resetChecklist(checklist.id);
      setCompletedItems([]);
    }
  };

  const filteredItems = checklist.items.filter((item) => {
    if (filter === 'pending') return !completedItems.includes(item.id);
    if (filter === 'completed') return completedItems.includes(item.id);
    return true;
  });

  const progress = Math.round((completedItems.length / checklist.items.length) * 100);

  return (
    <div className="px-4 space-y-5 mt-4">
      {/* Description */}
      <section className={`${checklist.color} text-white rounded-xl p-4`}>
        <p className="text-sm">{checklist.description}</p>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="flex-1 bg-white/20 rounded-full h-2"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progression de la check-list"
          >
            <div
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-bold">{progress}%</span>
        </div>
        <p className="text-xs mt-2">
          {completedItems.length}/{checklist.items.length} éléments complétés
        </p>
      </section>

      {/* Filtres */}
      <section className="flex gap-2" role="group" aria-label="Filtrer les éléments">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'pending', label: 'À faire' },
          { key: 'completed', label: 'Faits' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            aria-pressed={filter === key}
            className={`px-3 py-1.5 min-h-11 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </section>

      {/* Liste des items */}
      <section>
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2" aria-hidden="true">
              {filter === 'completed' ? '📝' : '✅'}
            </div>
            <p>
              {filter === 'completed'
                ? 'Aucun élément complété'
                : 'Tous les éléments sont complétés !'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredItems.map((item) => {
              const isCompleted = completedItems.includes(item.id);
              const priority = priorityConfig[item.priority];

              return (
                <li key={item.id}>
                  {/* Sémantique de case à cocher : rôle + état annoncés aux lecteurs d'écran. */}
                  <button
                    role="checkbox"
                    aria-checked={isCompleted}
                    onClick={() => handleToggle(item.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 dark:border-slate-500'
                        }`}
                        aria-hidden="true"
                      >
                        {isCompleted && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`font-medium ${
                              isCompleted ? 'text-green-800 dark:text-green-300 line-through' : 'text-gray-800 dark:text-gray-100'
                            }`}
                          >
                            {item.text}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority.bg} ${priority.text}`}>
                            {priority.label}
                          </span>
                        </div>
                        {item.description && (
                          <p className={`text-sm ${isCompleted ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Actions */}
      {completedItems.length > 0 && (
        <section className="flex justify-center">
          <button
            onClick={handleReset}
            className="text-sm min-h-11 px-3 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
          >
            Réinitialiser la check-list
          </button>
        </section>
      )}

      {/* Message de succès */}
      {progress === 100 && (
        <section className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center" role="status">
          <div className="text-4xl mb-2" aria-hidden="true">🎉</div>
          <p className="font-semibold text-green-800 dark:text-green-300">Check-list complétée !</p>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
            Bravo, vous avez vérifié tous les éléments.
          </p>
        </section>
      )}
    </div>
  );
}
