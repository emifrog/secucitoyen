import { test, expect } from '@playwright/test';

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };

test.describe('Navigation adaptative', () => {
  // Sous l'émulation mobile de webkit, `width=device-width` épingle le viewport
  // CSS et empêche les breakpoints de répondre au redimensionnement (quirk du
  // harness, pas un bug réel). Couvert par les projets Chromium.
  test.skip(({ browserName }) => browserName === 'webkit', 'Émulation viewport webkit peu fiable');

  test('desktop (lg) : sidebar visible, bottom-nav et FAB masqués', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/');
    await expect(page.getByTestId('side-nav')).toBeVisible();
    await expect(page.getByTestId('bottom-nav')).toBeHidden();
    await expect(page.getByTestId('emergency-fab')).toBeHidden();
  });

  test('mobile : bottom-nav et FAB visibles, sidebar masquée', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/');
    await expect(page.getByTestId('bottom-nav')).toBeVisible();
    await expect(page.getByTestId('emergency-fab')).toBeVisible();
    await expect(page.getByTestId('side-nav')).toBeHidden();
  });
});

// Pas de scroll horizontal : le contenu ne doit jamais dépasser la largeur du viewport.
const PATHS = ['/', '/urgences', '/secours', '/prevention', '/alertes', '/mentions-legales'];
const WIDTHS = [320, 768, 1280];

test.describe('Pas de débordement horizontal', () => {
  for (const path of PATHS) {
    for (const width of WIDTHS) {
      test(`${path} @ ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await page.waitForTimeout(300); // laisse le layout se stabiliser
        const overflow = await page.evaluate(() => {
          const w = window.innerWidth;
          return Math.max(
            document.documentElement.scrollWidth,
            document.body.scrollWidth
          ) - w;
        });
        expect(overflow).toBeLessThanOrEqual(1);
      });
    }
  }
});
