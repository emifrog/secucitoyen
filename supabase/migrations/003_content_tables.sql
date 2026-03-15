-- =========================================
-- Migration 003: Tables de contenu
-- Externalisation des données statiques
-- =========================================

-- 1. Numéros d'urgence
CREATE TABLE IF NOT EXISTS numeros_urgence (
  id SERIAL PRIMARY KEY,
  number VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  color VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('vital', 'social', 'special')),
  details TEXT[] NOT NULL DEFAULT '{}',
  available VARCHAR(100) NOT NULL,
  search_keywords TEXT[] DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Fiches de premiers secours
CREATE TABLE IF NOT EXISTS fiches_secours (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('critical', 'high', 'medium')),
  short_description TEXT NOT NULL,
  when_to_act TEXT[] NOT NULL DEFAULT '{}',
  steps JSONB NOT NULL DEFAULT '[]',
  do_not TEXT[] NOT NULL DEFAULT '{}',
  call_emergency JSONB NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Checklists de prévention
CREATE TABLE IF NOT EXISTS checklists_prevention (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  color VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Conseils saisonniers
CREATE TABLE IF NOT EXISTS conseils_saisonniers (
  id VARCHAR(50) PRIMARY KEY,
  titre VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,
  conseils TEXT[] NOT NULL DEFAULT '{}',
  urgence TEXT,
  saison VARCHAR(20) NOT NULL CHECK (saison IN ('hiver', 'printemps', 'ete', 'automne')),
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Saisons (référence)
CREATE TABLE IF NOT EXISTS saisons (
  id VARCHAR(20) PRIMARY KEY,
  nom VARCHAR(50) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  mois INT[] NOT NULL,
  couleur VARCHAR(50) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- =========================================
-- Index
-- =========================================
CREATE INDEX IF NOT EXISTS idx_numeros_category ON numeros_urgence (category);
CREATE INDEX IF NOT EXISTS idx_fiches_urgency ON fiches_secours (urgency);
CREATE INDEX IF NOT EXISTS idx_conseils_saison ON conseils_saisonniers (saison);

-- =========================================
-- RLS (lecture publique, écriture admin)
-- =========================================
ALTER TABLE numeros_urgence ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiches_secours ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists_prevention ENABLE ROW LEVEL SECURITY;
ALTER TABLE conseils_saisonniers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saisons ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Public read numeros" ON numeros_urgence FOR SELECT TO anon USING (true);
CREATE POLICY "Public read fiches" ON fiches_secours FOR SELECT TO anon USING (true);
CREATE POLICY "Public read checklists" ON checklists_prevention FOR SELECT TO anon USING (true);
CREATE POLICY "Public read conseils" ON conseils_saisonniers FOR SELECT TO anon USING (true);
CREATE POLICY "Public read saisons" ON saisons FOR SELECT TO anon USING (true);

-- =========================================
-- Trigger auto-update updated_at
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_numeros_updated_at BEFORE UPDATE ON numeros_urgence FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_fiches_updated_at BEFORE UPDATE ON fiches_secours FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_checklists_updated_at BEFORE UPDATE ON checklists_prevention FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_conseils_updated_at BEFORE UPDATE ON conseils_saisonniers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
