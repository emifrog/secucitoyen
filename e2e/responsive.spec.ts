import { test, expect } from '@playwright/test';

const MOBILE = { width: 390, height: 844 };
const TABLET = { width: 768, height: 1024 };
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

  test('tablette (md) : bottom-nav et FAB visibles et alignés sur la colonne de contenu', async ({ page }) => {
    await page.setViewportSize(TABLET);
    await page.goto('/');
    await expect(page.getByTestId('bottom-nav')).toBeVisible();
    await expect(page.getByTestId('emergency-fab')).toBeVisible();
    await expect(page.getByTestId('side-nav')).toBeHidden();
    // Le FAB doit rester dans la colonne de contenu (pas au milieu de l'écran).
    const main = await page.getByRole('main').boundingBox();
    const fab = await page.getByTestId('emergency-fab').boundingBox();
    expect(main && fab && fab.x + fab.width <= main.x + main.width + 1).toBe(true);
    expect(main && fab && fab.x >= main.x + main.width - 120).toBe(true);
  });

  test('mobile : bottom-nav et FAB visibles, sidebar masquée', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/');
    await expect(page.getByTestId('bottom-nav')).toBeVisible();
    await expect(page.getByTestId('emergency-fab')).toBeVisible();
    await expect(page.getByTestId('side-nav')).toBeHidden();
  });

  test('le menu burger mobile est accessible au clavier (ouverture, Échap)', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/');
    const menuButton = page.getByRole('button', { name: 'Menu' });
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('navigation', { name: 'Menu principal' });
    await expect(menu).toBeVisible();
    // Le focus est placé sur le premier lien du menu.
    await expect(menu.getByRole('link', { name: /Accueil/ })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(menuButton).toBeFocused();
  });
});

// Pas de scroll horizontal : le contenu ne doit jamais dépasser la largeur du viewport.
const PATHS = ['/', '/urgences', '/secours', '/prevention', '/alertes', '/mentions-legales'];
const WIDTHS = [320, 768, 1024, 1280];

test.describe('Pas de débordement horizontal', () => {
  for (const path of PATHS) {
    for (const width of WIDTHS) {
      test(`${path} @ ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        // Attente d'une mesure stable plutôt qu'un délai fixe.
        await expect
          .poll(
            () =>
              page.evaluate(() =>
                Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth
              ),
            { timeout: 5000 }
          )
          .toBeLessThanOrEqual(1);
      });
    }
  }
});
