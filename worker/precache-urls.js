// URLs de contenu critique préchauffées dans le cache runtime à l'installation
// du service worker (voir worker/index.js). Objectif : les fiches de secours et
// les numéros d'urgence sont disponibles hors-ligne DÈS l'installation, sans
// avoir été visités.
//
// Clés = noms des caches runtime déclarés dans next.config.mjs (runtimeCaching).
//
// Liste maintenue à la main (le worker est bundlé sans les modules de données
// pour rester léger). Le test __tests__/lib/precache-urls.test.ts vérifie
// qu'elle reste alignée sur lib/fiches-secours.ts et lib/numeros-urgence.ts.

export const OFFLINE_URLS = {
  pages: ['/secours', '/urgences'],

  'secours-fiches': [
    '/secours/arret-cardiaque',
    '/secours/etouffement',
    '/secours/hemorragie',
    '/secours/brulures',
    '/secours/pls',
    '/secours/avc',
    '/secours/noyade',
    '/secours/electrocution',
    '/secours/morsures',
    '/secours/fractures',
    '/secours/malaise-cardiaque',
    '/secours/hypothermie',
    '/secours/convulsions',
    '/secours/intoxication',
  ],

  'detail-pages': [
    '/urgences/15',
    '/urgences/17',
    '/urgences/18',
    '/urgences/112',
    '/urgences/114',
    '/urgences/115',
    '/urgences/119',
    '/urgences/3114',
    '/urgences/116-000',
    '/urgences/3919',
    '/urgences/0-800-06-66-66',
    '/urgences/196',
  ],
};
