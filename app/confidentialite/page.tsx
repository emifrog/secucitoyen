import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: "Quelles données SécuCitoyen utilise, où elles sont stockées et comment les supprimer.",
  alternates: { canonical: '/confidentialite' },
  robots: { index: false, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      <section>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Dernière mise à jour : septembre 2026
        </p>
      </section>

      <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="text-2xl">🔒</div>
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
              Respect de votre vie privée
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              SécuCitoyen est conçue pour minimiser la collecte de données personnelles.
              Vos données restent sur votre appareil.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4 text-gray-700 dark:text-gray-300">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            1. Responsable du traitement
          </h2>
          <p className="text-sm leading-relaxed">
            Le responsable du traitement des données est l&apos;éditeur de
            l&apos;application SécuCitoyen, joignable pour toute question relative
            aux données personnelles à l&apos;adresse{' '}
            <a href="mailto:xav.robart@gmail.com" className="text-primary hover:underline">xav.robart@gmail.com</a>{' '}
            ou via la <Link href="/contact" className="text-primary hover:underline">page de contact</Link>.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            2. Données collectées
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            SécuCitoyen collecte un minimum de données pour fonctionner :
          </p>

          <div className="space-y-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                ✅ Données stockées localement (sur votre appareil uniquement)
              </h3>
              <ul className="text-sm text-green-700 dark:text-green-400 space-y-1 ml-4 list-disc">
                <li>Département sélectionné (pour les alertes)</li>
                <li>Numéros d&apos;urgence favoris</li>
                <li>Préférence de thème (clair/sombre)</li>
                <li>Progression dans les check-lists de prévention</li>
                <li>Choix de masquer les invites d&apos;installation et de notifications</li>
              </ul>
              <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                Ces données sont stockées dans le localStorage de votre navigateur
                et ne sont jamais transmises à nos serveurs.
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                📍 Données de géolocalisation (optionnelles)
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 ml-4 list-disc">
                <li>Position GPS (latitude, longitude)</li>
              </ul>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                Utilisée uniquement pour : déterminer votre département (géocodage
                inverse via geo.api.gouv.fr, coordonnées arrondies à ~100 m), rechercher
                les DAE à proximité, partager votre position en cas d&apos;urgence.
                Votre position n&apos;est <strong>jamais stockée</strong> sur nos serveurs.
              </p>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">
                🔔 Notifications push (optionnelles)
              </h3>
              <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 ml-4 list-disc">
                <li>Identifiant technique d&apos;abonnement fourni par votre navigateur (endpoint et clés de chiffrement)</li>
                <li>Code du département choisi, pour cibler les alertes</li>
              </ul>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
                Ce sont les seules données conservées sur nos serveurs (base Supabase, Union
                européenne). Elles ne contiennent ni nom, ni e-mail, ni position. Elles sont
                supprimées automatiquement quand l&apos;abonnement expire ou que vous désactivez
                les notifications dans votre navigateur.
              </p>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">
                ❌ Données NON collectées
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4 list-disc">
                <li>Nom, prénom, email, téléphone</li>
                <li>Adresse IP (non enregistrée)</li>
                <li>Historique de navigation</li>
                <li>Données de santé</li>
                <li>Cookies de suivi publicitaire</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            3. Finalités du traitement
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            Les données sont utilisées exclusivement pour :
          </p>
          <ul className="text-sm space-y-2 ml-4 list-disc">
            <li>
              <strong>Afficher les alertes localisées</strong> : vigilances météo,
              crues, qualité de l&apos;air dans votre département
            </li>
            <li>
              <strong>Rechercher les DAE</strong> : trouver les défibrillateurs
              les plus proches de votre position
            </li>
            <li>
              <strong>Partage d&apos;urgence</strong> : permettre l&apos;envoi
              de votre position par SMS en cas d&apos;urgence
            </li>
            <li>
              <strong>Personnaliser l&apos;expérience</strong> : mémoriser vos
              préférences (thème, favoris)
            </li>
            <li>
              <strong>Vous alerter</strong> : envoyer une notification push en cas de
              vigilance orange ou rouge dans votre département, si vous l&apos;avez activée
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            4. Base légale du traitement
          </h2>
          <p className="text-sm leading-relaxed">
            Le traitement des données repose sur votre <strong>consentement</strong>.
            Vous autorisez explicitement l&apos;accès à votre position via la
            demande de permission du navigateur. Vous pouvez retirer ce consentement
            à tout moment.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            5. Partage des données
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            Vos données personnelles ne sont <strong>jamais vendues, louées ou
            partagées</strong> avec des tiers à des fins commerciales.
          </p>
          <p className="text-sm leading-relaxed">
            Seules les requêtes vers les APIs publiques contiennent des paramètres
            de localisation (coordonnées GPS ou code département) pour obtenir
            les données pertinentes. Ces APIs sont opérées par :
          </p>
          <ul className="text-sm space-y-1 ml-4 list-disc mt-2">
            <li>Météo-France / Opendatasoft (vigilances)</li>
            <li>Vigicrues (crues)</li>
            <li>Open-Meteo (météo, qualité de l&apos;air)</li>
            <li>OpenDataSoft (défibrillateurs, données OpenStreetMap)</li>
            <li>geo.api.gouv.fr (département à partir de la position)</li>
          </ul>
          <p className="text-sm leading-relaxed mt-2">
            Ces requêtes sont émises par nos serveurs, pas par votre navigateur : les
            services tiers ne voient pas votre adresse IP.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            6. Durée de conservation
          </h2>
          <p className="text-sm leading-relaxed">
            Les données stockées localement (localStorage) persistent jusqu&apos;à
            ce que vous les supprimiez manuellement ou effaciez les données de
            navigation de votre navigateur. L&apos;abonnement aux notifications push
            est conservé tant qu&apos;il est actif et supprimé dès qu&apos;il expire ou
            que vous retirez l&apos;autorisation ; l&apos;historique des alertes envoyées
            est purgé après 7 jours.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            7. Vos droits (RGPD)
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            Conformément au Règlement Général sur la Protection des Données (RGPD),
            vous disposez des droits suivants :
          </p>
          <ul className="text-sm space-y-2 ml-4 list-disc">
            <li><strong>Droit d&apos;accès</strong> : connaître les données vous concernant</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
            <li><strong>Droit à l&apos;effacement</strong> : supprimer vos données</li>
            <li><strong>Droit à la portabilité</strong> : récupérer vos données</li>
            <li><strong>Droit d&apos;opposition</strong> : refuser le traitement</li>
            <li><strong>Droit de retrait du consentement</strong> : à tout moment</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3">
            Pour exercer ces droits ou pour toute question, contactez-nous via
            la <Link href="/contact" className="text-primary hover:underline">page de contact</Link>.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            8. Comment supprimer vos données
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            Pour supprimer toutes les données stockées par SécuCitoyen :
          </p>
          <ol className="text-sm space-y-2 ml-4 list-decimal">
            <li>Ouvrez les paramètres de votre navigateur</li>
            <li>Accédez à &quot;Confidentialité&quot; ou &quot;Données de navigation&quot;</li>
            <li>Sélectionnez &quot;Données des sites&quot; ou &quot;Stockage local&quot;</li>
            <li>Recherchez SécuCitoyen et supprimez les données</li>
          </ol>
          <p className="text-sm leading-relaxed mt-3 text-gray-500 dark:text-gray-400">
            Vous pouvez également désinstaller l&apos;application PWA depuis
            votre écran d&apos;accueil.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            9. Cookies
          </h2>
          <p className="text-sm leading-relaxed">
            SécuCitoyen n&apos;utilise <strong>aucun cookie de suivi ou publicitaire</strong>.
            Seuls des cookies techniques essentiels au fonctionnement de l&apos;application
            peuvent être utilisés (gestion de session, Service Worker pour le mode offline).
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            10. Analyse et monitoring
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            Pour améliorer la qualité de l&apos;application, nous utilisons :
          </p>
          <ul className="text-sm space-y-3 ml-4 list-disc">
            <li>
              <strong>Vercel Analytics</strong> : mesure de performance et statistiques
              d&apos;usage anonymes (pages vues, temps de chargement). Aucune donnée
              personnelle n&apos;est collectée. Conforme RGPD sans consentement requis.
              <a
                href="https://vercel.com/docs/analytics/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                Politique Vercel →
              </a>
            </li>
            <li>
              <strong>Sentry</strong> : monitoring des erreurs techniques pour garantir
              le bon fonctionnement de l&apos;application. Collecte uniquement les
              informations techniques en cas d&apos;erreur (type d&apos;erreur, navigateur,
              URL). Aucune donnée personnelle identifiable.
              <a
                href="https://sentry.io/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                Politique Sentry →
              </a>
            </li>
          </ul>
          <p className="text-sm leading-relaxed mt-3 text-gray-500 dark:text-gray-400">
            Ces outils sont essentiels pour assurer la fiabilité d&apos;une application
            d&apos;urgence. Ils ne collectent aucune donnée personnelle identifiable.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            11. Sécurité
          </h2>
          <p className="text-sm leading-relaxed">
            L&apos;application utilise le protocole HTTPS pour sécuriser toutes
            les communications. Les données locales sont stockées dans le
            navigateur et bénéficient des mécanismes de sécurité de celui-ci.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            12. Modifications
          </h2>
          <p className="text-sm leading-relaxed">
            Cette politique de confidentialité peut être mise à jour. La date
            de dernière modification est indiquée en haut de page. Nous vous
            encourageons à la consulter régulièrement.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            13. Réclamation
          </h2>
          <p className="text-sm leading-relaxed">
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez
            introduire une réclamation auprès de la CNIL (Commission Nationale
            de l&apos;Informatique et des Libertés) :
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              www.cnil.fr
            </a>
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
              href="/cgu"
              className="text-sm text-primary hover:underline"
            >
              Conditions Générales d&apos;Utilisation →
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
