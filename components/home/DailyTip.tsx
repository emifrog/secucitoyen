'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const tips = [
  {
    id: 1,
    category: 'Premiers secours',
    title: 'Position Latérale de Sécurité',
    content: 'Une personne inconsciente qui respire doit être mise en PLS pour éviter l\'étouffement.',
    link: '/secours',
    icon: '🏥',
  },
  {
    id: 2,
    category: 'Prévention incendie',
    title: 'Détecteur de fumée',
    content: 'Testez votre détecteur de fumée chaque mois en appuyant sur le bouton test.',
    link: '/prevention',
    icon: '🔥',
  },
  {
    id: 3,
    category: 'Sécurité routière',
    title: 'Triangle de signalisation',
    content: 'Placez le triangle à 30m minimum du véhicule, visible à 100m sur autoroute.',
    link: '/prevention',
    icon: '⚠️',
  },
  {
    id: 4,
    category: 'Urgences',
    title: 'Que dire au 15 ?',
    content: 'Donnez votre localisation précise, le nombre de victimes et leur état apparent.',
    link: '/urgences',
    icon: '📞',
  },
  {
    id: 5,
    category: 'Premiers secours',
    title: 'Massage cardiaque',
    content: 'Compressez fort (5-6cm) et vite (100-120/min) au centre de la poitrine.',
    link: '/secours',
    icon: '❤️',
  },
];

export default function DailyTip() {
  const [tip, setTip] = useState(tips[0]);

  useEffect(() => {
    // Sélectionne un conseil basé sur le jour
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const tipIndex = dayOfYear % tips.length;
    setTip(tips[tipIndex]);
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Conseil du jour</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
          {tip.category}
        </span>
      </div>
      <Link href={tip.link}>
        <div className="bg-gradient-to-r from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 border border-accent/20 rounded-2xl p-4 transition-all hover:shadow-md active:scale-[0.99]">
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-accent/20 dark:bg-accent/30 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {tip.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">{tip.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{tip.content}</p>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <span className="text-xs text-accent font-medium flex items-center gap-1">
              En savoir plus
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
