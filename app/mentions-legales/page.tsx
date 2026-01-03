'use client';

import Link from 'next/link';

export default function MentionsLegalesPage() {
  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      <section>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Mentions légales
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Dernière mise à jour : Janvier 2025
        </p>
      </section>

      <section className="space-y-4 text-gray-700 dark:text-gray-300">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            1. Éditeur de l&apos;application
          </h2>
          <p className="text-sm leading-relaxed">
            <strong>SécuCitoyen</strong> est une application web progressive (PWA) à vocation
            informative et éducative dans le domaine de la prévention des risques et des
            gestes de premiers secours.
          </p>
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Note :</strong> Complétez cette section avec vos informations légales
              (nom/raison sociale, adresse, SIRET, contact).
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            2. Hébergement
          </h2>
          <p className="text-sm leading-relaxed">
            L&apos;application est hébergée par :
          </p>
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Note :</strong> Indiquez votre hébergeur (Vercel, Netlify, OVH, etc.)
              avec son adresse et contact.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            3. Propriété intellectuelle
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            L&apos;ensemble des contenus présents sur l&apos;application SécuCitoyen
            (textes, images, icônes, logos, structure) sont protégés par le droit
            d&apos;auteur et le droit de la propriété intellectuelle.
          </p>
          <p className="text-sm leading-relaxed">
            Toute reproduction, représentation, modification, publication ou adaptation
            de tout ou partie des éléments de l&apos;application, quel que soit le moyen
            ou le procédé utilisé, est interdite sans autorisation écrite préalable.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            4. Avertissement médical
          </h2>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 mb-3">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">
              ⚠️ Information importante
            </p>
          </div>
          <p className="text-sm leading-relaxed mb-3">
            Les informations fournies par SécuCitoyen sont destinées à améliorer
            la connaissance des gestes de premiers secours et la prévention des risques.
            Elles ne remplacent en aucun cas :
          </p>
          <ul className="text-sm space-y-2 ml-4 list-disc">
            <li>Une formation officielle aux premiers secours (PSC1, SST, etc.)</li>
            <li>L&apos;avis d&apos;un professionnel de santé</li>
            <li>Les instructions données par les services d&apos;urgence (15, 18, 112)</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3">
            En cas d&apos;urgence, appelez immédiatement les secours. L&apos;éditeur
            ne saurait être tenu responsable de l&apos;utilisation des informations
            fournies.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            5. Sources des données
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            SécuCitoyen utilise des données provenant de sources officielles :
          </p>
          <ul className="text-sm space-y-2 ml-4 list-disc">
            <li><strong>Météo-France</strong> - Vigilances météorologiques (via Opendatasoft)</li>
            <li><strong>Vigicrues</strong> - Vigilance crues (Ministère de la Transition écologique)</li>
            <li><strong>Open-Meteo</strong> - Qualité de l&apos;air et données météo</li>
            <li><strong>OpenDataSoft</strong> - Localisation des défibrillateurs (DAE)</li>
          </ul>
          <p className="text-sm leading-relaxed mt-3 text-gray-500 dark:text-gray-400">
            Ces données sont fournies à titre indicatif. En cas de doute, référez-vous
            directement aux sources officielles.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            6. Limitation de responsabilité
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude et la mise
            à jour des informations diffusées. Toutefois, il ne peut garantir
            l&apos;exactitude, la précision ou l&apos;exhaustivité des informations
            disponibles.
          </p>
          <p className="text-sm leading-relaxed">
            L&apos;éditeur décline toute responsabilité pour toute imprécision,
            inexactitude ou omission portant sur des informations disponibles
            sur l&apos;application.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
            7. Liens utiles
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/cgu"
              className="text-sm text-primary hover:underline"
            >
              Conditions Générales d&apos;Utilisation →
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
