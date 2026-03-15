import { MetadataRoute } from 'next';

const BASE_URL = 'https://secucitoyen.vercel.app';

const fichesIds = [
  'arret-cardiaque', 'etouffement', 'hemorragie', 'brulures', 'pls',
  'avc', 'noyade', 'electrocution', 'morsures', 'fractures',
  'malaise-cardiaque', 'hypothermie', 'convulsions', 'intoxication',
];

const numerosIds = ['15', '17', '18', '112', '114', '115', '119', '3114', '116-000', '3919', '0-800-05-95-95', '196'];

const conseilsIds = [
  'verglas', 'monoxyde', 'hypothermie-hiver', 'coupures-courant',
  'allergies', 'orages-printemps', 'tiques', 'jardinage',
  'canicule', 'noyades', 'feux-foret', 'piqures-ete', 'uv',
  'chasse', 'champignons', 'brouillard', 'tempetes', 'grippe',
];

const checklistsIds = ['domicile', 'kit-urgence', 'routiere', 'cyber', 'risques-naturels'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/urgences`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/secours`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/alertes`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/prevention`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/defibrillateurs`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/conseils-saison`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${BASE_URL}/confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${BASE_URL}/cgu`, lastModified: now, changeFrequency: 'yearly', priority: 0.1 },
  ];

  const fichesPages: MetadataRoute.Sitemap = fichesIds.map((id) => ({
    url: `${BASE_URL}/secours/${id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const numerosPages: MetadataRoute.Sitemap = numerosIds.map((id) => ({
    url: `${BASE_URL}/urgences/${id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const conseilsPages: MetadataRoute.Sitemap = conseilsIds.map((id) => ({
    url: `${BASE_URL}/conseils-saison/${id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const checklistsPages: MetadataRoute.Sitemap = checklistsIds.map((id) => ({
    url: `${BASE_URL}/prevention/${id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...fichesPages,
    ...numerosPages,
    ...conseilsPages,
    ...checklistsPages,
  ];
}
