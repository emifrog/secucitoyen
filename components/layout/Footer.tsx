'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-auto">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Liens légaux */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link
            href="/mentions-legales"
            className="hover:text-primary transition-colors"
          >
            Mentions légales
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link
            href="/cgu"
            className="hover:text-primary transition-colors"
          >
            CGU
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link
            href="/confidentialite"
            className="hover:text-primary transition-colors"
          >
            Confidentialité
          </Link>

        </div>

        {/* Avertissement */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-500 mb-3">
          Les informations fournies ne remplacent pas une formation aux premiers secours
          ni l&apos;avis d&apos;un professionnel de santé.
        </p>

        {/* Copyright */}
        <p className="text-xs text-center text-gray-400 dark:text-gray-600">
          © {currentYear} SécuCitoyen. Application de prévention et sécurité citoyenne.
        </p>

        {/* Urgences */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-xs text-center text-red-600 dark:text-red-400 font-medium">
            En cas d&apos;urgence : 15 (SAMU) • 17 (Police) • 18 (Pompiers) • 112 (Européen)
          </p>
        </div>
      </div>
    </footer>
  );
}
