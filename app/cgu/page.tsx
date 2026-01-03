'use client';

import Link from 'next/link';

export default function CGUPage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      <section>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Dernière mise à jour : Janvier 2025
        </p>
      </section>

      <section className="space-y-4 text-gray-700 dark:text-gray-300">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Article 1 - Objet
          </h2>
          <p className="text-sm leading-relaxed">
            Les présentes Conditions Générales d&apos;Utilisation (CGU) encadrent
            l&apos;utilisation de l&apos;application web progressive SécuCitoyen.
            En accédant à l&apos;application, vous acceptez sans réserve les présentes CGU.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Article 2 - Description des services
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            SécuCitoyen propose gratuitement les services suivants :
          </p>
          <ul className="text-sm space-y-2 ml-4 list-disc">
            <li>Accès aux numéros d&apos;urgence français avec appel direct</li>
            <li>Fiches pratiques sur les gestes de premiers secours</li>
            <li>Conseils de prévention des risques domestiques et naturels</li>
            <li>Alertes en temps réel (météo, crues, qualité de l&apos;air, incendies)</li>
            <li>Localisation des défibrillateurs automatisés externes (DAE)</li>
            <li>Conseils saisonniers adaptés</li>
            <li>Partage de position GPS en cas d&apos;urgence</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Article 3 - Accès à l&apos;application
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            L&apos;application est accessible gratuitement depuis tout navigateur web
            compatible. Aucune inscription n&apos;est requise pour utiliser les services.
          </p>
          <p className="text-sm leading-relaxed">
            L&apos;éditeur se réserve le droit de suspendre, limiter ou interrompre
            l&apos;accès à tout ou partie de l&apos;application pour des raisons de
            maintenance ou de mise à jour.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Article 4 - Utilisation de la géolocalisation
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            Certaines fonctionnalités nécessitent l&apos;accès à votre position
            géographique :
          </p>
          <ul className="text-sm space-y-2 ml-4 list-disc">
            <li>Alertes localisées (vigilances météo par département)</li>
            <li>Recherche de défibrillateurs à proximité</li>
            <li>Partage de position en cas d&apos;urgence</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3">
            Cette autorisation est facultative. Vous pouvez la refuser ou la révoquer
            à tout moment dans les paramètres de votre navigateur. En cas de refus,
            certaines fonctionnalités seront limitées.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Article 5 - Notifications push
          </h2>
          <p className="text-sm leading-relaxed">
            L&apos;application peut vous envoyer des notifications pour vous alerter
            en cas de vigilance météorologique (orange ou rouge) dans votre département.
            L&apos;activation des notifications est facultative et peut être désactivée
            à tout moment dans les paramètres de votre navigateur.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Article 6 - Avertissement et limitation de responsabilité
          </h2>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 mb-3">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">
              ⚠️ Avertissement important
            </p>
          </div>
          <p className="text-sm leading-relaxed mb-3">
            Les informations fournies par SécuCitoyen sont à caractère informatif
            et éducatif. Elles <strong>ne remplacent pas</strong> :
          </p>
          <ul className="text-sm space-y-2 ml-4 list-disc">
            <li>Une formation certifiante aux premiers secours (PSC1, SST, etc.)</li>
            <li>L&apos;avis ou le diagnostic d&apos;un professionnel de santé</li>
            <li>Les consignes des services d&apos;urgence (15, 17, 18, 112)</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3">
            <strong>En cas d&apos;urgence vitale, appelez immédiatement le 15 (SAMU),
            le 18 (Pompiers) ou le 112 (Urgences européennes).</strong>
          </p>
          <p className="text-sm leading-relaxed mt-3">
            L&apos;éditeur ne saurait être tenu responsable des conséquences directes
            ou indirectes résultant de l&apos;utilisation des informations fournies.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Article 7 - Données et sources externes
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            L&apos;application agrège des données provenant de sources externes :
          </p>
          <ul className="text-sm space-y-2 ml-4 list-disc">
            <li>Météo-France (vigilances météorologiques)</li>
            <li>Vigicrues (vigilance crues)</li>
            <li>Open-Meteo (qualité de l&apos;air, météo)</li>
            <li>OpenDataSoft (défibrillateurs)</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3">
            L&apos;éditeur ne garantit pas la disponibilité permanente de ces données
            ni leur exactitude. En cas de doute, consultez directement les sources
            officielles.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Article 8 - Propriété intellectuelle
          </h2>
          <p className="text-sm leading-relaxed">
            L&apos;ensemble des contenus de l&apos;application (textes, images, logos,
            icônes, code source) sont protégés par le droit de la propriété intellectuelle.
            Toute reproduction ou utilisation non autorisée est interdite.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Article 9 - Modification des CGU
          </h2>
          <p className="text-sm leading-relaxed">
            L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout moment.
            Les utilisateurs seront informés des modifications par la mise à jour de la
            date en haut de cette page. L&apos;utilisation continue de l&apos;application
            vaut acceptation des nouvelles conditions.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Article 10 - Droit applicable
          </h2>
          <p className="text-sm leading-relaxed">
            Les présentes CGU sont régies par le droit français. Tout litige relatif
            à leur interprétation ou à leur exécution sera soumis aux tribunaux
            compétents.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Liens utiles
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/mentions-legales"
              className="text-sm text-primary hover:underline"
            >
              Mentions légales →
            </Link>
            <Link
              href="/confidentialite"
              className="text-sm text-primary hover:underline"
            >
              Politique de confidentialité →
            </Link>
            <Link
              href="/contact"
              className="text-sm text-primary hover:underline"
            >
              Contact →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
