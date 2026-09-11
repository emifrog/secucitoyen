import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Audit d'accessibilité automatisé (axe-core, règles WCAG 2.1 A/AA) sur les
// pages principales. Ne couvre pas tout (clavier, sens des libellés…) mais
// bloque les régressions courantes : contrastes, rôles, labels, landmarks.
const PAGES = ['/', '/urgences', '/secours', '/secours/arret-cardiaque', '/prevention', '/alertes', '/defibrillateurs'];

test.describe('Accessibilité (axe-core)', () => {
  for (const path of PAGES) {
    test(`${path} sans violation WCAG A/AA`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('main')).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        // Les illustrations SVG animées ne sont pas des images informatives.
        .exclude('svg[aria-hidden="true"]')
        .analyze();

      const summary = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
      }));
      expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
    });
  }
});
