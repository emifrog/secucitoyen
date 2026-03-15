/**
 * Script de seed : insère les données locales dans Supabase
 * Usage : npx ts-node --skip-project scripts/seed-supabase.ts
 *
 * Nécessite les variables d'environnement :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
import { createClient } from '@supabase/supabase-js';

// Charger .env.local
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex);
        const value = trimmed.slice(eqIndex + 1);
        process.env[key] = value;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Import des données locales
import { emergencyNumbers } from '../lib/numeros-urgence';
import { fichesSecours } from '../lib/fiches-secours';
import { checklistsPrevention } from '../lib/checklists-prevention';
import { saisons } from '../lib/conseils-saisonniers';

async function seedNumerosUrgence() {
  console.log('📞 Insertion des numéros d\'urgence...');
  const rows = emergencyNumbers.map((n, i) => ({
    number: n.number,
    name: n.name,
    description: n.description,
    icon: n.icon,
    color: n.color,
    category: n.category,
    details: n.details,
    available: n.available,
    search_keywords: n.searchKeywords || [],
    sort_order: i,
    active: true,
  }));

  const { error } = await supabase.from('numeros_urgence').upsert(rows, { onConflict: 'number' });
  if (error) throw new Error(`numeros_urgence: ${error.message}`);
  console.log(`  ✅ ${rows.length} numéros insérés`);
}

async function seedFichesSecours() {
  console.log('🩹 Insertion des fiches de secours...');
  const rows = fichesSecours.map((f, i) => ({
    id: f.id,
    title: f.title,
    icon: f.icon,
    urgency: f.urgency,
    short_description: f.shortDescription,
    when_to_act: f.whenToAct,
    steps: f.steps,
    do_not: f.doNot,
    call_emergency: f.callEmergency,
    sort_order: i,
    active: true,
  }));

  const { error } = await supabase.from('fiches_secours').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`fiches_secours: ${error.message}`);
  console.log(`  ✅ ${rows.length} fiches insérées`);
}

async function seedChecklists() {
  console.log('✅ Insertion des checklists de prévention...');
  const rows = checklistsPrevention.map((c, i) => ({
    id: c.id,
    title: c.title,
    icon: c.icon,
    color: c.color,
    description: c.description,
    items: c.items,
    sort_order: i,
    active: true,
  }));

  const { error } = await supabase.from('checklists_prevention').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(`checklists_prevention: ${error.message}`);
  console.log(`  ✅ ${rows.length} checklists insérées`);
}

async function seedConseilsSaisonniers() {
  console.log('🌤️ Insertion des saisons et conseils...');

  // Insérer les saisons
  const saisonRows = saisons.map((s, i) => ({
    id: s.id,
    nom: s.nom,
    icon: s.icon,
    mois: s.mois,
    couleur: s.couleur,
    sort_order: i,
  }));

  const { error: saisonError } = await supabase.from('saisons').upsert(saisonRows, { onConflict: 'id' });
  if (saisonError) throw new Error(`saisons: ${saisonError.message}`);
  console.log(`  ✅ ${saisonRows.length} saisons insérées`);

  // Insérer les conseils
  const conseilRows: Array<Record<string, unknown>> = [];
  for (const saison of saisons) {
    for (let i = 0; i < saison.conseils.length; i++) {
      const conseil = saison.conseils[i];
      conseilRows.push({
        id: conseil.id,
        titre: conseil.titre,
        description: conseil.description,
        icon: conseil.icon,
        conseils: conseil.conseils,
        urgence: conseil.urgence || null,
        saison: saison.id,
        sort_order: i,
        active: true,
      });
    }
  }

  const { error: conseilError } = await supabase.from('conseils_saisonniers').upsert(conseilRows, { onConflict: 'id' });
  if (conseilError) throw new Error(`conseils_saisonniers: ${conseilError.message}`);
  console.log(`  ✅ ${conseilRows.length} conseils insérés`);
}

async function main() {
  console.log('🚀 Seed Supabase — SécuCitoyen\n');
  console.log(`URL: ${supabaseUrl}\n`);

  try {
    await seedNumerosUrgence();
    await seedFichesSecours();
    await seedChecklists();
    await seedConseilsSaisonniers();
    console.log('\n🎉 Seed terminé avec succès !');
  } catch (error) {
    console.error('\n❌ Erreur durant le seed:', error);
    process.exit(1);
  }
}

main();
