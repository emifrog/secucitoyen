/**
 * @jest-environment node
 */
import { OFFLINE_URLS } from '@/worker/precache-urls';
import { fichesSecours } from '@/lib/fiches-secours';
import { emergencyNumbers } from '@/lib/numeros-urgence';

// La liste des URLs préchauffées par le service worker est maintenue à la main
// (worker/precache-urls.js). Ces tests garantissent qu'ajouter une fiche ou un
// numéro sans mettre la liste à jour fait échouer la CI.

describe('worker/precache-urls — cohérence avec les données', () => {
  it('préchauffe exactement les pages des fiches de secours', () => {
    const expected = fichesSecours.map((f) => `/secours/${f.id}`);
    expect([...OFFLINE_URLS['secours-fiches']].sort()).toEqual([...expected].sort());
  });

  it("préchauffe exactement les pages des numéros d'urgence", () => {
    // Même slug que generateStaticParams de app/urgences/[number]/page.tsx.
    const expected = emergencyNumbers.map((n) => `/urgences/${n.number.replace(/\s/g, '-')}`);
    expect([...OFFLINE_URLS['detail-pages']].sort()).toEqual([...expected].sort());
  });

  it('préchauffe les pages racine secours et urgences', () => {
    expect(OFFLINE_URLS.pages).toEqual(expect.arrayContaining(['/secours', '/urgences']));
  });

  it('ne contient que des chemins relatifs same-origin', () => {
    for (const urls of Object.values(OFFLINE_URLS)) {
      for (const url of urls) {
        expect(url).toMatch(/^\/(?!\/)/);
      }
    }
  });
});
