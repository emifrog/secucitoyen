import { test, expect } from '@playwright/test';

test.describe('Navigation principale', () => {
  test('la page d\'accueil se charge correctement', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SécuCitoyen/);
    await expect(page.locator('text=Urgences')).toBeVisible();
  });

  test('navigation vers la page urgences', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Urgences');
    await expect(page).toHaveURL(/\/urgences/);
    await expect(page.locator('text=15')).toBeVisible(); // SAMU
    await expect(page.locator('text=18')).toBeVisible(); // Pompiers
  });

  test('navigation vers les fiches secours', async ({ page }) => {
    await page.goto('/secours');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    // Vérifier qu'au moins une fiche est affichée
    const fiches = page.locator('[href*="/secours/"]');
    await expect(fiches.first()).toBeVisible();
  });

  test('navigation vers la page alertes', async ({ page }) => {
    await page.goto('/alertes');
    await expect(page.locator('text=Alertes')).toBeVisible();
  });

  test('la page prévention affiche les checklists', async ({ page }) => {
    await page.goto('/prevention');
    await expect(page.locator('text=Prévention')).toBeVisible();
  });
});

test.describe('Numéros d\'urgence', () => {
  test('les numéros d\'urgence principaux sont visibles', async ({ page }) => {
    await page.goto('/urgences');
    // Vérifier les numéros critiques
    await expect(page.locator('text=15')).toBeVisible();
    await expect(page.locator('text=17')).toBeVisible();
    await expect(page.locator('text=18')).toBeVisible();
    await expect(page.locator('text=112')).toBeVisible();
  });

  test('la page détail d\'un numéro se charge', async ({ page }) => {
    await page.goto('/urgences/15');
    await expect(page.locator('text=SAMU')).toBeVisible();
  });
});

test.describe('Fiches secours', () => {
  test('une fiche secours affiche les étapes', async ({ page }) => {
    await page.goto('/secours');
    // Cliquer sur la première fiche
    const premiereFiche = page.locator('[href*="/secours/"]').first();
    await premiereFiche.click();
    // Vérifier que des étapes sont affichées
    await expect(page.locator('text=tape').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Bouton d\'urgence (FAB)', () => {
  test('le FAB 112 est visible sur toutes les pages', async ({ page }) => {
    await page.goto('/');
    const fab = page.locator('button:has-text("112"), [aria-label*="urgence"], [aria-label*="112"]').first();
    await expect(fab).toBeVisible();
  });
});
