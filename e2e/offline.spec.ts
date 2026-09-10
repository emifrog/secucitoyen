import { test, expect } from '@playwright/test';

// Garantie hors-ligne : une fiche de secours JAMAIS visitée doit s'ouvrir sans
// réseau dès que le service worker est installé (préchauffage dans
// worker/index.js). La PWA est désactivée sous `next dev` : ce test ne tourne
// qu'avec un build de production :
//   - en CI (CI=1 → `next build && next start`) ;
//   - en local : `npx next build && npx next start`, puis
//     `E2E_PWA=1 npx playwright test e2e/offline.spec.ts --project="Desktop Chrome"`.

test.describe('Hors-ligne', () => {
  test.skip(
    !process.env.CI && !process.env.E2E_PWA,
    'PWA désactivée sous next dev ; lancer avec CI=1 ou E2E_PWA=1 sur un build de production'
  );

  test('une fiche secours jamais visitée est disponible hors-ligne', async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'service worker exercé sous Chromium uniquement');

    await page.goto('/');

    // Le préchauffage se fait dans l'événement `install` : le cache est rempli
    // avant que le worker soit actif.
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect
      .poll(
        () =>
          page.evaluate(async () => {
            const cache = await caches.open('secours-fiches');
            const keys = await cache.keys();
            return keys.some((k) => new URL(k.url).pathname === '/secours/arret-cardiaque');
          }),
        { timeout: 30_000 }
      )
      .toBe(true);

    await context.setOffline(true);
    try {
      await page.goto('/secours/arret-cardiaque');
      await expect(page.getByRole('main').getByText(/arr[êe]t cardiaque/i).first()).toBeVisible();
      // Le contenu de la fiche (pas la page /offline de repli).
      await expect(page.getByRole('main').getByText(/massage cardiaque/i).first()).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test("un numéro d'urgence jamais visité est disponible hors-ligne", async ({
    page,
    context,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'service worker exercé sous Chromium uniquement');

    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect
      .poll(
        () =>
          page.evaluate(async () => {
            const cache = await caches.open('detail-pages');
            const keys = await cache.keys();
            return keys.some((k) => new URL(k.url).pathname === '/urgences/18');
          }),
        { timeout: 30_000 }
      )
      .toBe(true);

    await context.setOffline(true);
    try {
      await page.goto('/urgences/18');
      await expect(page.getByRole('main').getByText(/pompiers/i).first()).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });
});
