'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mainNav = [
  { href: '/', label: 'Accueil', icon: '🏠' },
  { href: '/urgences', label: 'Urgences', icon: '🚨' },
  { href: '/secours', label: 'Premiers secours', icon: '🏥' },
  { href: '/prevention', label: 'Prévention', icon: '🛡️' },
  { href: '/alertes', label: 'Alertes', icon: '🔔' },
  { href: '/defibrillateurs', label: 'Défibrillateurs', icon: '🫀' },
  { href: '/conseils-saison', label: 'Conseils saisonniers', icon: '🗓️' },
];

const secondaryNav = [
  { href: '/contact', label: 'Contact', icon: '✉️' },
  { href: '/mentions-legales', label: 'Mentions légales', icon: '📜' },
  { href: '/confidentialite', label: 'Confidentialité', icon: '🔒' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Navigation latérale, visible uniquement sur desktop (lg+). Remplace la
 * BottomNav et le menu burger sur grand écran.
 */
export default function SideNav() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(pathname, href)
        ? 'bg-accent/10 text-accent'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
    }`;

  return (
    <aside className="hidden lg:flex lg:flex-col lg:sticky lg:top-0 lg:h-screen w-64 shrink-0 border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-5 overflow-y-auto">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 px-2 mb-6">
        <svg viewBox="0 0 36 36" className="w-8 h-8" aria-hidden="true">
          <defs>
            <linearGradient id="sideShield" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>
          <path
            d="M18 3C18 3 30 7 30 7C31 7.3 32 8.3 32 9.5L32 18C32 24 26 30 18 34C10 30 4 24 4 18L4 9.5C4 8.3 5 7.3 6 7C6 7 18 3 18 3Z"
            fill="url(#sideShield)"
          />
          <rect x="15" y="10" width="6" height="16" rx="1.5" fill="white" />
          <rect x="10" y="15" width="16" height="6" rx="1.5" fill="white" />
        </svg>
        <span className="text-lg font-semibold text-primary dark:text-white">SécuCitoyen</span>
      </Link>

      {/* Navigation principale */}
      <nav aria-label="Navigation principale" className="flex flex-col gap-1">
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.href)}
            aria-current={isActive(pathname, item.href) ? 'page' : undefined}
          >
            <span className="text-lg" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Appel d'urgence */}
      <a
        href="tel:112"
        className="mt-6 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-2.5 rounded-lg transition-colors"
      >
        <span aria-hidden="true">📞</span> Appeler le 112
      </a>

      {/* Liens secondaires (bas) */}
      <nav
        aria-label="Liens secondaires"
        className="mt-auto pt-6 flex flex-col gap-1 border-t border-gray-200 dark:border-slate-700"
      >
        {secondaryNav.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <span className="text-base" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
