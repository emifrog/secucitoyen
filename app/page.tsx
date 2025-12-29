import Link from 'next/link';
import { Card } from '@/components/ui';
import EmergencyNumbers from '@/components/home/EmergencyNumbers';
import AlertBanner from '@/components/home/AlertBanner';
import DailyTip from '@/components/home/DailyTip';
import SeasonalTips from '@/components/home/SeasonalTips';

const quickActions = [
  {
    href: '/urgences',
    title: 'Urgences',
    description: 'Numéros et contacts',
    icon: '🚨',
    color: 'bg-red-500',
  },
  {
    href: '/secours',
    title: 'Secours',
    description: 'Gestes qui sauvent',
    icon: '🏥',
    color: 'bg-green-500',
  },
  {
    href: '/defibrillateurs',
    title: 'DAE',
    description: 'Défibrillateurs proches',
    icon: '🫀',
    color: 'bg-emerald-500',
  },
  {
    href: '/alertes',
    title: 'Alertes',
    description: 'Vigilances en cours',
    icon: '🔔',
    color: 'bg-accent',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-4">
      {/* Alert Banner - si alerte active */}
      <AlertBanner />

      <div className="px-4 space-y-5">
        {/* Hero Section amélioré */}
        <section className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 relative">
                {/* Logo bouclier avec croix */}
                <svg viewBox="0 0 36 36" className="w-full h-full drop-shadow-lg">
                  <defs>
                    <linearGradient id="homeShield" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F97316"/>
                      <stop offset="100%" stopColor="#EA580C"/>
                    </linearGradient>
                  </defs>
                  <path
                    d="M18 3C18 3 30 7 30 7C31 7.3 32 8.3 32 9.5L32 18C32 24 26 30 18 34C10 30 4 24 4 18L4 9.5C4 8.3 5 7.3 6 7C6 7 18 3 18 3Z"
                    fill="url(#homeShield)"
                  />
                  <rect x="15" y="10" width="6" height="16" rx="1.5" fill="white"/>
                  <rect x="10" y="15" width="16" height="6" rx="1.5" fill="white"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold">SécuCitoyen</h2>
                <p className="text-xs text-white/70">Votre sécurité au quotidien</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">15</div>
                <div className="text-xs text-white/70">Fiches secours</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">8</div>
                <div className="text-xs text-white/70">N° urgence</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-xs text-white/70">Disponible</div>
              </div>
            </div>
          </div>
        </section>

        {/* Numéros d'urgence rapides */}
        <EmergencyNumbers />

        {/* Quick Actions */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Accès rapide</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-2xl mb-3 shadow-sm`}>
                    {action.icon}
                  </div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100">{action.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Conseils saisonniers */}
        <SeasonalTips />

        {/* Conseil du jour */}
        <DailyTip />

        {/* Bouton urgence principal */}
        <section>
          <Link href="tel:112">
            <div className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-2xl p-5 flex items-center gap-4 transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold">Appeler le 112</div>
                <div className="text-sm text-white/80">Urgence vitale - Appel gratuit</div>
              </div>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </section>

        {/* Info sécurité */}
        <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 flex gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Le saviez-vous ?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Le 112 fonctionne même sans carte SIM et localise automatiquement votre position pour les secours.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
