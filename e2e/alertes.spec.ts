import { test, expect } from '@playwright/test';

// Page Alertes avec l'API interceptée côté navigateur : déterministe, sans
// dépendre des APIs externes (Météo-France, Vigicrues…) appelées par le serveur.

const ALERTS_FIXTURE = {
  alerts: [
    {
      id: '13-canicule-J',
      type: 'canicule',
      category: 'meteo',
      level: 'orange',
      title: 'Vigilance orange Canicule',
      description: 'Températures très élevées pendant plusieurs jours',
      department: 'Bouches-du-Rhône',
      departmentCode: '13',
      updatedAt: '2026-07-01T05:00:00Z',
      source: 'Météo-France',
      advice: ['Buvez régulièrement de l\'eau', 'Évitez de sortir entre 11h et 21h'],
      icon: '🌡️',
    },
    {
      id: 'foret-13',
      type: 'incendie',
      category: 'incendie',
      level: 'orange',
      title: 'Risque incendie estimé - Bouches-du-Rhône',
      description: 'Risque élevé (estimation)',
      department: 'Bouches-du-Rhône',
      departmentCode: '13',
      updatedAt: '2026-07-01T05:00:00Z',
      source: 'Estimation SécuCitoyen (non officielle)',
      advice: ['N\'allumez pas de feu en extérieur'],
      icon: '🔥',
    },
  ],
  count: 2,
  stats: { meteo: 1, inondation: 0, incendie: 1, pollution: 0 },
  sources: ['Météo-France', 'Estimation SécuCitoyen (non officielle)'],
  degraded: false,
  sourceStatus: {},
  updatedAt: '2026-07-01T05:05:00Z',
};

test.describe('Page Alertes (API mockée)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/alerts*', (route) => route.fulfill({ json: ALERTS_FIXTURE }));
    await page.route('**/api/health', (route) =>
      route.fulfill({ json: { status: 'healthy', sources: [], timestamp: '2026-07-01T05:05:00Z' } })
    );
    // Département sauvegardé avant le chargement de la page.
    await page.addInitScript(() => {
      window.localStorage.setItem('secucitoyen_department', '13');
    });
  });

  test('affiche les alertes, le compteur et les sources', async ({ page }) => {
    await page.goto('/alertes');
    const main = page.getByRole('main');
    await expect(main.getByText('Vigilance orange Canicule')).toBeVisible();
    await expect(main.getByText('Risque incendie estimé - Bouches-du-Rhône')).toBeVisible();
    await expect(main.getByText('dont 2 orange/rouge')).toBeVisible();
    await expect(main.getByText(/Sources : Météo-France/)).toBeVisible();
  });

  test('le filtre « Feux » ne garde que le risque incendie', async ({ page }) => {
    await page.goto('/alertes');
    const main = page.getByRole('main');
    await main.getByRole('button', { name: /Feux/ }).click();
    await expect(main.getByText('Risque incendie estimé - Bouches-du-Rhône')).toBeVisible();
    await expect(main.getByText('Vigilance orange Canicule')).toBeHidden();
  });

  test('la page de détail affiche une alerte réelle (plus de données factices)', async ({ page }) => {
    await page.goto('/alertes/13-canicule-J');
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 2, name: 'Vigilance orange Canicule' })).toBeVisible();
    await expect(main.getByText('Buvez régulièrement de l\'eau')).toBeVisible();
    await expect(main.getByText('Bouches-du-Rhône').first()).toBeVisible();
  });

  test('un identifiant inconnu affiche « Alerte non trouvée »', async ({ page }) => {
    await page.goto('/alertes/inconnue-123');
    await expect(page.getByRole('main').getByText('Alerte non trouvée')).toBeVisible();
  });

  test('une source dégradée affiche la bannière ambre avec le lien officiel', async ({ page }) => {
    await page.route('**/api/alerts*', (route) =>
      route.fulfill({ json: { ...ALERTS_FIXTURE, alerts: [], count: 0, degraded: true, sources: ['Météo-France'] } })
    );
    await page.goto('/alertes');
    const main = page.getByRole('main');
    await expect(main.getByText(/temporairement indisponible/)).toBeVisible();
    await expect(main.getByRole('link', { name: 'vigilance.meteofrance.fr' })).toBeVisible();
  });
});
