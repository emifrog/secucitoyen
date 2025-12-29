'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FicheSecours } from '@/lib/fiches-secours';

interface FicheContentProps {
  fiche: FicheSecours;
}

const urgencyConfig = {
  critical: {
    label: 'Urgence vitale',
    bg: 'bg-red-600',
    border: 'border-red-500',
    light: 'bg-red-50',
    text: 'text-red-800',
  },
  high: {
    label: 'Urgence haute',
    bg: 'bg-orange-500',
    border: 'border-orange-500',
    light: 'bg-orange-50',
    text: 'text-orange-800',
  },
  medium: {
    label: 'Urgence modérée',
    bg: 'bg-yellow-500',
    border: 'border-yellow-500',
    light: 'bg-yellow-50',
    text: 'text-yellow-800',
  },
};

export default function FicheContent({ fiche }: FicheContentProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const config = urgencyConfig[fiche.urgency];

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="px-4 space-y-5 mt-4">
      {/* Badge urgence */}
      <div className={`${config.bg} text-white px-4 py-3 rounded-xl flex items-center justify-between`}>
        <div>
          <div className="text-xs opacity-80">Niveau d&apos;urgence</div>
          <div className="font-bold">{config.label}</div>
        </div>
        <Link
          href={`tel:${fiche.callEmergency.number.split(' ')[0]}`}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold transition-colors"
        >
          Appeler {fiche.callEmergency.number}
        </Link>
      </div>

      {/* Quand agir */}
      <section className={`${config.light} border ${config.border} rounded-xl p-4`}>
        <h2 className={`font-bold ${config.text} mb-3 flex items-center gap-2`}>
          <span>⚡</span> Quand agir ?
        </h2>
        <ul className="space-y-2">
          {fiche.whenToAct.map((item, index) => (
            <li key={index} className={`flex items-start gap-2 text-sm ${config.text}`}>
              <span className="mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Étapes */}
      <section>
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>📋</span> Les gestes à effectuer
        </h2>
        <div className="space-y-3">
          {fiche.steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            return (
              <div
                key={index}
                className={`border rounded-xl overflow-hidden transition-all ${
                  isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                }`}
              >
                <button
                  onClick={() => toggleStep(index)}
                  className="w-full p-4 flex items-start gap-3 text-left"
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-white'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mt-1 ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                      {step.description}
                    </p>
                    {step.tip && (
                      <div className="flex items-start gap-2 mt-2 text-sm text-blue-700 bg-blue-50 p-2 rounded-lg">
                        <span>💡</span>
                        <span>{step.tip}</span>
                      </div>
                    )}
                    {step.warning && (
                      <div className="flex items-start gap-2 mt-2 text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
                        <span>⚠️</span>
                        <span>{step.warning}</span>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* À ne pas faire */}
      <section className="bg-red-50 border border-red-200 rounded-xl p-4">
        <h2 className="font-bold text-red-800 mb-3 flex items-center gap-2">
          <span>🚫</span> À ne PAS faire
        </h2>
        <ul className="space-y-2">
          {fiche.doNot.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-red-700">
              <span className="text-red-500 mt-0.5">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Appeler les secours */}
      <section className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-4 text-white">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <span>📞</span> Quand appeler les secours
        </h2>
        <p className="text-sm text-white/90 mb-4">{fiche.callEmergency.when}</p>

        <div className="bg-white/10 rounded-lg p-3 mb-4">
          <div className="text-xs text-white/70 mb-2">Que dire au téléphone :</div>
          <ul className="space-y-1">
            {fiche.callEmergency.whatToSay.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-accent">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={`tel:${fiche.callEmergency.number.split(' ')[0]}`}
          className="block w-full bg-red-600 hover:bg-red-700 text-center py-3 rounded-lg font-bold transition-colors"
        >
          Appeler le {fiche.callEmergency.number}
        </Link>
      </section>

      {/* Progression */}
      {completedSteps.length > 0 && (
        <section className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span className="font-semibold text-green-800">
                {completedSteps.length}/{fiche.steps.length} étapes complétées
              </span>
            </div>
            <button
              onClick={() => setCompletedSteps([])}
              className="text-sm text-green-700 hover:text-green-800 font-medium"
            >
              Réinitialiser
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
