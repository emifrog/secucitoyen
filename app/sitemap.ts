import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { fichesSecours } from '@/lib/fiches-secours';
import { emergencyNumbers } from '@/lib/numeros-urgence';
import { saisons } from '@/lib/conseils-saisonniers';
import { checklistsPrevention } from '@/lib/checklists-prevention';

// Les identifiants sont dérivés des modules de données (plus de listes
// recopiées à la main qui dérivaient à chaque ajout de fiche).
//
// `lastModified` : date du dernier changement de contenu éditorial (à mettre à
// jour quand les données changent), plutôt que « maintenant » à chaque requête
// qui n'apporte aucun signal aux moteurs.
const CONTENT_UPDATED = new Date('2026-09-10');

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (
    path: string,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: number
  ): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency,
    priority,
  });

  const staticPages: MetadataRoute.Sitemap = [
    page('', 'weekly', 1.0),
    page('/urgences', 'monthly', 0.9),
    page('/secours', 'monthly', 0.9),
    page('/alertes', 'hourly', 0.8),
    page('/prevention', 'monthly', 0.7),
    page('/defibrillateurs', 'monthly', 0.7),
    page('/conseils-saison', 'monthly', 0.6),
    page('/contact', 'yearly', 0.3),
    page('/mentions-legales', 'yearly', 0.1),
    page('/confidentialite', 'yearly', 0.1),
    page('/cgu', 'yearly', 0.1),
  ];

  const fichesPages = fichesSecours.map((f) => page(`/secours/${f.id}`, 'monthly', 0.8));
  const numerosPages = emergencyNumbers.map((n) =>
    page(`/urgences/${n.number.replace(/\s/g, '-')}`, 'monthly', 0.7)
  );
  const conseilsPages = saisons.flatMap((s) =>
    s.conseils.map((c) => page(`/conseils-saison/${c.id}`, 'monthly', 0.5))
  );
  const checklistsPages = checklistsPrevention.map((c) => page(`/prevention/${c.id}`, 'monthly', 0.5));

  return [...staticPages, ...fichesPages, ...numerosPages, ...conseilsPages, ...checklistsPages];
}
