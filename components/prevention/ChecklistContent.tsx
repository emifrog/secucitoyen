'use client';

import { useState, useEffect } from 'react';
import { ChecklistCategory } from '@/lib/checklists-prevention';
import { getCompletedItems, toggleItem, resetChecklist } from '@/lib/checklist-storage';

interface ChecklistContentProps {
  checklist: ChecklistCategory;
}

const priorityConfig = {
  high: {
    label: 'Prioritaire',
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  medium: {
    label: 'Recommandé',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  low: {
    label: 'Optionnel',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
};

export default function ChecklistContent({ checklist }: ChecklistContentProps) {
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    setCompletedItems(getCompletedItems(checklist.id));
  }, [checklist.id]);

  const handleToggle = (itemId: string) => {
    const updated = toggleItem(checklist.id, itemId);
    setCompletedItems(updated);
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
        <p className="text-sm opacity-90">{checklist.description}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-bold">{progress}%</span>
        </div>
        <p className="text-xs opacity-80 mt-2">
          {completedItems.length}/{checklist.items.length} éléments complétés
        </p>
      </section>

      {/* Filtres */}
      <section className="flex gap-2">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'pending', label: 'À faire' },
          { key: 'completed', label: 'Faits' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </section>

      {/* Liste des items */}
      <section className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">
              {filter === 'completed' ? '📝' : '✅'}
            </div>
            <p>
              {filter === 'completed'
                ? 'Aucun élément complété'
                : 'Tous les éléments sont complétés !'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCompleted = completedItems.includes(item.id);
            const priority = priorityConfig[item.priority];

            return (
              <button
                key={item.id}
                onClick={() => handleToggle(item.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isCompleted
                    ? 'bg-green-50 border-green-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300'
                    }`}
                  >
                    {isCompleted && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`font-medium ${
                          isCompleted ? 'text-green-800 line-through' : 'text-gray-800'
                        }`}
                      >
                        {item.text}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority.bg} ${priority.text}`}
                      >
                        {priority.label}
                      </span>
                    </div>
                    {item.description && (
                      <p
                        className={`text-sm ${
                          isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </section>

      {/* Actions */}
      {completedItems.length > 0 && (
        <section className="flex justify-center">
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors"
          >
            Réinitialiser la check-list
          </button>
        </section>
      )}

      {/* Message de succès */}
      {progress === 100 && (
        <section className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-semibold text-green-800">Check-list complétée !</p>
          <p className="text-sm text-green-600 mt-1">
            Bravo, vous avez vérifié tous les éléments.
          </p>
        </section>
      )}
    </div>
  );
}
