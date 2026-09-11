/**
 * Génère `lib/data/vigicrues-troncons.json` : pour chaque tronçon de vigilance
 * crues, la liste des départements qu'il traverse.
 *
 * Pourquoi : le GeoJSON officiel Vigicrues ne porte AUCUN code département.
 * Les codes de tronçon (`CdEntCru`) sont des acronymes de territoire
 * (« CO1 » Corse, « NO50 » Normandie, « ML101 » Maine-Loire…) : leurs deux
 * premiers caractères ne sont pas un numéro de département. On dérive donc les
 * départements de la géométrie réelle : on échantillonne des sommets de chaque
 * tronçon et on les géocode en inverse par lot via api-adresse.data.gouv.fr
 * (Base Adresse Nationale), qui renvoie le code INSEE de la commune.
 *
 * Usage : node scripts/build-vigicrues-departements.mjs
 * À relancer quand Vigicrues redécoupe ses tronçons. Un code absent du fichier
 * ne bloque rien : l'alerte reste affichée au niveau national, sans département,
 * et n'est alors jamais diffusée en notification (cf. cron).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE = 'https://www.vigicrues.gouv.fr/services/1/InfoVigiCru.geojson';
const REVERSE_CSV = 'https://api-adresse.data.gouv.fr/reverse/csv/';
const SAMPLES_PER_TRONCON = 12;
const CHUNK = 2000; // lignes par requête CSV
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../lib/data/vigicrues-troncons.json');

/** Aplatit une géométrie GeoJSON en liste de [lon, lat]. */
function vertices(geometry) {
  const c = geometry?.coordinates ?? [];
  switch (geometry?.type) {
    case 'Point': return [c];
    case 'LineString': case 'MultiPoint': return c;
    case 'MultiLineString': case 'Polygon': return c.flat(1);
    case 'MultiPolygon': return c.flat(2);
    default: return [];
  }
}

/** n sommets répartis uniformément le long de la liste (extrémités incluses). */
function sample(points, n) {
  if (points.length <= n) return points;
  const out = [];
  for (let i = 0; i < n; i++) out.push(points[Math.round((i * (points.length - 1)) / (n - 1))]);
  return out;
}

/** Code département depuis un code INSEE de commune (2A/2B et DOM inclus). */
function departementFromInsee(insee) {
  if (!insee) return null;
  const code = String(insee).trim();
  if (/^9[789]/.test(code)) return code.slice(0, 3); // DOM : 971…978
  return code.slice(0, 2).toUpperCase(); // métropole, Corse 2A/2B
}

/** Découpe naïve d'une ligne CSV (les champs peuvent être entre guillemets). */
function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

async function reverseGeocode(rows) {
  const header = 'code,lon,lat\n';
  const body = header + rows.map((r) => `${r.code},${r.lon},${r.lat}`).join('\n') + '\n';
  const form = new FormData();
  form.append('data', new Blob([body], { type: 'text/csv' }), 'points.csv');
  form.append('result_columns', 'result_citycode');

  const res = await fetch(REVERSE_CSV, { method: 'POST', body: form, signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`api-adresse HTTP ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split(/\r?\n/);
  const cols = splitCsvLine(lines[0]);
  const iCode = cols.indexOf('code');
  const iCity = cols.indexOf('result_citycode');
  if (iCode < 0 || iCity < 0) throw new Error(`colonnes inattendues : ${cols.join(', ')}`);

  const found = [];
  for (const line of lines.slice(1)) {
    const f = splitCsvLine(line);
    found.push({ code: f[iCode], departement: departementFromInsee(f[iCity]) });
  }
  return found;
}

async function main() {
  const res = await fetch(SOURCE, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`Vigicrues HTTP ${res.status}`);
  const geojson = await res.json();
  const features = geojson.features ?? [];
  console.log(`${features.length} tronçons (bulletin ${geojson.DtHrInfoVigiCru ?? '?'})`);

  const noms = {};
  const rows = [];
  for (const f of features) {
    const code = f.properties?.CdEntCru;
    if (!code) continue;
    noms[code] = f.properties.lbentcru ?? code;
    for (const [lon, lat] of sample(vertices(f.geometry), SAMPLES_PER_TRONCON)) {
      if (Number.isFinite(lon) && Number.isFinite(lat)) rows.push({ code, lon, lat });
    }
  }
  console.log(`${rows.length} points à géocoder (${SAMPLES_PER_TRONCON} max par tronçon)`);

  const parDepartement = {};
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const results = await reverseGeocode(chunk);
    for (const { code, departement } of results) {
      if (!departement) continue; // point en mer, hors France ou non résolu
      (parDepartement[code] ??= new Set()).add(departement);
    }
    console.log(`  ${Math.min(i + CHUNK, rows.length)}/${rows.length} points`);
  }

  // Rattrapage : la Base Adresse Nationale ne résout pas les points tombés au
  // milieu d'un fleuve ou sur une frontière (Rhin). geo.api.gouv.fr interroge
  // les contours communaux, qui couvrent le lit des cours d'eau.
  const orphelins = Object.keys(noms).filter((code) => !parDepartement[code]?.size);
  if (orphelins.length) {
    console.log(`rattrapage de ${orphelins.length} tronçon(s) via geo.api.gouv.fr`);
    for (const code of orphelins) {
      for (const point of rows.filter((r) => r.code === code)) {
        try {
          const r = await fetch(
            `https://geo.api.gouv.fr/communes?lat=${point.lat}&lon=${point.lon}&fields=codeDepartement&format=json`,
            { signal: AbortSignal.timeout(15000) },
          );
          if (!r.ok) continue;
          const communes = await r.json();
          const dept = communes[0]?.codeDepartement;
          if (dept) (parDepartement[code] ??= new Set()).add(dept);
        } catch {
          // Point non résolu : on continue, l'absence est tracée plus bas.
        }
      }
    }
  }

  const troncons = {};
  for (const code of Object.keys(noms).sort((a, b) => a.localeCompare(b))) {
    troncons[code] = {
      nom: noms[code],
      departements: [...(parDepartement[code] ?? [])].sort(),
    };
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: SOURCE,
        method: `${SAMPLES_PER_TRONCON} sommets par tronçon, géocodage inverse api-adresse.data.gouv.fr`,
        troncons,
      },
      null,
      2,
    ) + '\n',
  );

  const entries = Object.entries(troncons);
  const sans = entries.filter(([, t]) => t.departements.length === 0);
  const multi = entries.filter(([, t]) => t.departements.length > 1).length;
  console.log(`écrit ${OUT}`);
  console.log(`tronçons : ${entries.length} | multi-départements : ${multi} | sans département : ${sans.length}`);
  for (const [code, t] of sans) console.log(`  sans département : ${code} (${t.nom})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
