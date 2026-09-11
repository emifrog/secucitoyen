'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { FicheSecours } from '@/lib/fiches-secours';
import { urgencyConfig } from '@/lib/ui-tokens';

// Illustrations chargées à la demande (code-splitting) mais RENDUES côté
// serveur : ce sont des SVG purs, l'ancien `ssr: false` faisait apparaître un
// bloc de ~300 px après hydratation (décalage de mise en page) et le masquait
// sans JavaScript. L'espace est réservé pendant le chargement du chunk.
const illustrationLoading = () => <div className="h-64 rounded-lg bg-white/40 dark:bg-slate-700/40 animate-pulse" aria-hidden="true" />;
const MassageCardiaque = dynamic(() => import('./illustrations/MassageCardiaque'), { loading: illustrationLoading });
const PLS = dynamic(() => import('./illustrations/PLS'), { loading: illustrationLoading });
const Heimlich = dynamic(() => import('./illustrations/Heimlich'), { loading: illustrationLoading });
const CompressionHemorragie = dynamic(() => import('./illustrations/CompressionHemorragie'), { loading: illustrationLoading });
const Brulure = dynamic(() => import('./illustrations/Brulure'), { loading: illustrationLoading });

// Mapping des illustrations par ID de fiche
const illustrationComponents: Record<string, React.ComponentType> = {
  'arret-cardiaque': MassageCardiaque,
  'pls': PLS,
  'etouffement': Heimlich,
  'hemorragie': CompressionHemorragie,
  'brulures': Brulure,
};

interface FicheContentProps {
  fiche: FicheSecours;
}

export default function FicheContent({ fiche }: FicheContentProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showIllustration, setShowIllustration] = useState(true);
  const config = urgencyConfig[fiche.urgency];
  const telNumber = fiche.callEmergency.number.split(' ')[0];

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  // Récupérer l'illustration pour cette fiche
  const IllustrationComponent = illustrationComponents[fiche.id];

  return (
    <div className="px-4 space-y-5 mt-4">
      {/* Illustration animée si disponible */}
      {IllustrationComponent && showIllustration && (
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-100 dark:border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <span aria-hidden="true">🎬</span> Visualisation du geste
            </h2>
            <button
              onClick={() => setShowIllustration(false)}
              className="text-sm min-h-11 px-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Masquer
            </button>
          </div>
          <IllustrationComponent />
        </section>
      )}

      {/* Bouton pour réafficher l'illustration */}
      {IllustrationComponent && !showIllustration && (
        <button
          onClick={() => setShowIllustration(true)}
          className="w-full py-3 min-h-11 text-sm text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 flex items-center justify-center gap-2"
        >
          <span aria-hidden="true">🎬</span> Afficher l&apos;illustration animée
        </button>
      )}

      {/* Badge urgence */}
      <div className={`${config.bg} ${config.fg} px-4 py-3 rounded-xl flex items-center justify-between gap-3`}>
        <div>
          <div className="text-xs">Niveau d&apos;urgence</div>
          <div className="font-bold">{config.label}</div>
        </div>
        <a
          href={`tel:${telNumber}`}
          className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 min-h-11 flex items-center rounded-lg font-bold transition-colors"
        >
          Appeler {fiche.callEmergency.number}
        </a>
      </div>

      {/* Quand agir */}
      <section className={`${config.light} border ${config.border} rounded-xl p-4`}>
        <h2 className={`font-bold ${config.text} mb-3 flex items-center gap-2`}>
          <span aria-hidden="true">⚡</span> Quand agir ?
        </h2>
        <ul className="space-y-2">
          {fiche.whenToAct.map((item) => (
            <li key={item} className={`flex items-start gap-2 text-sm ${config.text}`}>
              <span className="mt-0.5" aria-hidden="true">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Étapes */}
      <section>
        <h2 className="font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
          <span aria-hidden="true">📋</span> Les gestes à effectuer
        </h2>
        <ol className="space-y-3">
          {fiche.steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            return (
              <li
                key={step.title}
                className={`border rounded-xl overflow-hidden transition-all ${
                  isCompleted
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                }`}
              >
                <button
                  onClick={() => toggleStep(index)}
                  aria-pressed={isCompleted}
                  className="w-full p-4 flex items-start gap-3 text-left"
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      isCompleted
                        ? 'bg-green-700 text-white'
                        : 'bg-primary text-white'
                    }`}
                    aria-hidden="true"
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isCompleted ? 'text-green-800 dark:text-green-300' : 'text-gray-800 dark:text-gray-100'}`}>
                      {step.title}
                      {isCompleted && <span className="sr-only"> (étape faite)</span>}
                    </h3>
                    <p className={`text-sm mt-1 ${isCompleted ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                      {step.description}
                    </p>
                    {step.tip && (
                      <div className="flex items-start gap-2 mt-2 text-sm text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                        <span aria-hidden="true">💡</span>
                        <span><span className="sr-only">Conseil : </span>{step.tip}</span>
                      </div>
                    )}
                    {step.warning && (
                      <div className="flex items-start gap-2 mt-2 text-sm text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 p-2 rounded-lg">
                        <span aria-hidden="true">⚠️</span>
                        <span><span className="sr-only">Attention : </span>{step.warning}</span>
                      </div>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {/* À ne pas faire */}
      <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <h2 className="font-bold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
          <span aria-hidden="true">🚫</span> À ne PAS faire
        </h2>
        <ul className="space-y-2">
          {fiche.doNot.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
              <span className="text-red-500 mt-0.5" aria-hidden="true">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Appeler les secours */}
      <section className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-4 text-white">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <span aria-hidden="true">📞</span> Quand appeler les secours
        </h2>
        <p className="text-sm text-white/90 mb-4">{fiche.callEmergency.when}</p>

        <div className="bg-white/10 rounded-lg p-3 mb-4">
          <p className="text-xs text-white/90 mb-2">Que dire au téléphone :</p>
          <ul className="space-y-1">
            {fiche.callEmergency.whatToSay.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <span className="text-accent" aria-hidden="true">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <a
          href={`tel:${telNumber}`}
          className="block w-full bg-red-600 hover:bg-red-700 text-center py-3 min-h-11 rounded-lg font-bold transition-colors"
        >
          Appeler le {fiche.callEmergency.number}
        </a>
      </section>

      {/* Progression */}
      {completedSteps.length > 0 && (
        <section className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4" role="status">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">✅</span>
              <span className="font-semibold text-green-800 dark:text-green-300">
                {completedSteps.length}/{fiche.steps.length} étapes complétées
              </span>
            </div>
            <button
              onClick={() => setCompletedSteps([])}
              className="text-sm min-h-11 px-2 text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 font-medium"
            >
              Réinitialiser
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
