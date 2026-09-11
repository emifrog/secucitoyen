import type { Metadata } from 'next';
import CachedPagesList from '@/components/offline/CachedPagesList';

export const metadata: Metadata = {
  title: 'Hors connexion',
  robots: { index: false, follow: false },
};

// Numéros affichés en dur : les liens tel: fonctionnent même sans réseau data.
const urgences = [
  { numero: '15', label: 'SAMU', desc: 'Urgence médicale' },
  { numero: '18', label: 'Pompiers', desc: 'Incendie, accident' },
  { numero: '17', label: 'Police', desc: 'Secours police' },
  { numero: '112', label: 'Urgence UE', desc: "Numéro d'urgence européen" },
];

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-primary text-white p-6">
      <div className="text-5xl mt-8 mb-3" aria-hidden="true">
        📡
      </div>
      <h1 className="text-2xl font-bold mb-2">Hors connexion</h1>
      <p className="text-center text-gray-300 mb-8 max-w-sm">
        Pas de réseau, mais les appels d&apos;urgence restent disponibles.
      </p>

      <ul className="w-full max-w-sm space-y-3">
        {urgences.map(({ numero, label, desc }) => (
          <li key={numero}>
            <a
              href={`tel:${numero}`}
              className="flex items-center gap-4 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/25 p-4 transition-colors"
            >
              <span className="text-3xl font-extrabold tabular-nums w-16 text-center">
                {numero}
              </span>
              <span className="flex flex-col">
                <span className="font-semibold">{label}</span>
                <span className="text-sm text-gray-200">{desc}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      {/* Réessayer + pages réellement en cache (fiches, numéros) */}
      <CachedPagesList />
    </div>
  );
}
