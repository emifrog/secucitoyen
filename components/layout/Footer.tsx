import Link from 'next/link';

// Composant serveur : aucun hook. L'année est celle du rendu (pages revalidées
// quotidiennement pour l'accueil, au déploiement pour les autres).
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-auto">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Liens légaux */}
        <nav aria-label="Informations légales" className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link href="/mentions-legales" className="hover:text-primary transition-colors py-2">
            Mentions légales
          </Link>
          <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">|</span>
          <Link href="/cgu" className="hover:text-primary transition-colors py-2">
            CGU
          </Link>
          <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">|</span>
          <Link href="/confidentialite" className="hover:text-primary transition-colors py-2">
            Confidentialité
          </Link>
        </nav>

        {/* Avertissement */}
        <p className="text-xs text-center text-gray-600 dark:text-gray-400 mb-3">
          Les informations fournies ne remplacent pas une formation aux premiers secours
          ni l&apos;avis d&apos;un professionnel de santé.
        </p>

        {/* Copyright */}
        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
          © {currentYear} SécuCitoyen. Application de prévention et sécurité citoyenne.
        </p>

        {/* Urgences */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          {/* red-700 : red-600 sur gray-100 plafonne à 4,4:1 (WCAG AA = 4,5). */}
          <p className="text-xs text-center text-red-700 dark:text-red-400 font-medium">
            En cas d&apos;urgence : 15 (SAMU) • 17 (Police) • 18 (Pompiers) • 112 (Européen)
          </p>
        </div>
      </div>
    </footer>
  );
}
