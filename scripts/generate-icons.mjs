/**
 * Génère les PNG PWA/social depuis des sources SVG.
 * Usage : node scripts/generate-icons.mjs
 *
 * Produit :
 *   public/icons/icon-192x192.png        (purpose "any")
 *   public/icons/icon-512x512.png        (purpose "any")
 *   public/icons/icon-maskable-512x512.png (purpose "maskable", zone de sécurité)
 *   public/icons/apple-touch-icon.png    (180x180, full-bleed pour iOS)
 *   public/og-image.png                  (1200x630, aperçus sociaux)
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'public', 'icons');

// Bouclier + croix médicale, exprimés dans un repère 192x192 (repris de l'icône
// existante). `scale` contrôle la taille dans le canevas final (zone de sécurité).
function shieldGroup(scale) {
  return `
    <g transform="translate(256 256) scale(${scale}) translate(-96 -96)">
      <path d="M96 27 C96 27 138 39 138 39 C141 40 144 43 144 47 L144 93
               C144 117 126 141 96 159 C66 141 48 117 48 93 L48 47
               C48 43 51 40 54 39 C54 39 96 27 96 27Z"
            fill="url(#shield)"/>
      <path d="M96 35 C96 35 132 45 132 45 C134 46 136 48 136 50 L136 92
               C136 113 120 134 96 150 C72 134 56 113 56 92 L56 50
               C56 48 58 46 60 45 C60 45 96 35 96 35Z"
            fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
      <rect x="84" y="57" width="24" height="66" rx="4" fill="white"/>
      <rect x="66" y="78" width="60" height="24" rx="4" fill="white"/>
    </g>`;
}

const defs = `
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A5F"/>
      <stop offset="100%" stop-color="#0F2744"/>
    </linearGradient>
    <linearGradient id="shield" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#EA580C"/>
    </linearGradient>
  </defs>`;

// Canevas 512 full-bleed (fond de marque sur tout le carré) + bouclier centré.
function fullBleed(scale) {
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    ${defs}
    <rect width="512" height="512" fill="url(#bg)"/>
    ${shieldGroup(scale)}
  </svg>`;
}

// Image Open Graph 1200x630.
const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  ${defs}
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g transform="translate(150 315) scale(2.1) translate(-96 -96)">
    <path d="M96 27 C96 27 138 39 138 39 C141 40 144 43 144 47 L144 93
             C144 117 126 141 96 159 C66 141 48 117 48 93 L48 47
             C48 43 51 40 54 39 C54 39 96 27 96 27Z" fill="url(#shield)"/>
    <rect x="84" y="57" width="24" height="66" rx="4" fill="white"/>
    <rect x="66" y="78" width="60" height="24" rx="4" fill="white"/>
  </g>
  <text x="470" y="300" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="700" fill="#ffffff">SécuCitoyen</text>
  <text x="472" y="372" font-family="Arial, Helvetica, sans-serif" font-size="38" fill="#cbd5e1">Urgences · Premiers secours · Alertes</text>
</svg>`;

async function svgToPng(svg, size, outPath) {
  const buf = Buffer.isBuffer(svg) ? svg : Buffer.from(svg);
  await sharp(buf, { density: 384 })
    .resize(size.w, size.h)
    .png()
    .toFile(outPath);
  console.log('✓', outPath.replace(root, '.'));
}

async function main() {
  const svg192 = await readFile(join(iconsDir, 'icon-192x192.svg'));
  const svg512 = await readFile(join(iconsDir, 'icon-512x512.svg'));

  await svgToPng(svg192, { w: 192, h: 192 }, join(iconsDir, 'icon-192x192.png'));
  await svgToPng(svg512, { w: 512, h: 512 }, join(iconsDir, 'icon-512x512.png'));
  // Maskable : bouclier à ~62 % pour respecter la zone de sécurité circulaire.
  await svgToPng(fullBleed(1.65), { w: 512, h: 512 }, join(iconsDir, 'icon-maskable-512x512.png'));
  // apple-touch : full-bleed (iOS applique son propre masque arrondi).
  await svgToPng(fullBleed(1.9), { w: 180, h: 180 }, join(iconsDir, 'apple-touch-icon.png'));
  await svgToPng(ogSvg, { w: 1200, h: 630 }, join(root, 'public', 'og-image.png'));

  // Raccourcis du manifeste : Android attend du PNG (les SVG sont ignorés).
  for (const name of ['shortcut-15', 'shortcut-17', 'shortcut-18', 'shortcut-dae']) {
    const svg = await readFile(join(iconsDir, `${name}.svg`));
    await svgToPng(svg, { w: 96, h: 96 }, join(iconsDir, `${name}.png`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
