-- WildWright Database Schema
-- Supabase (PostgreSQL)
-- Extracted from PROJECT_SCHEMA.md Section 3

-- ========================================
-- Table: profiles
-- ========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ========================================
-- Table: characters
-- ========================================
CREATE TYPE game_edition AS ENUM ('pf1e', 'dnd5e', 'pf2e');

CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  edition game_edition NOT NULL DEFAULT 'pf1e',

  -- Base Stats (JSONB for flexibility)
  base_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: { level, effectiveDruidLevel, abilityScores, ac, hp, saves, bab, skills, movement, senses, size, traits }

  -- Features & Modifiers
  features JSONB DEFAULT '{}'::jsonb,
  -- Structure: { feats[], classFeatures[], raceTraits[], wildShapeVariants[] }

  -- Daily Uses
  daily_uses_max INTEGER, -- NULL = infinite
  daily_uses_current INTEGER DEFAULT 0,

  -- Preferences
  preferences JSONB DEFAULT '{}'::jsonb,
  -- Structure: { autoResetTime: "04:00", theme: "dark", defaultView: "cards" }

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_characters_owner ON characters(owner_id);
CREATE INDEX idx_characters_edition ON characters(edition);

-- RLS Policies
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own characters"
  ON characters FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own characters"
  ON characters FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own characters"
  ON characters FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own characters"
  ON characters FOR DELETE
  USING (auth.uid() = owner_id);

-- ========================================
-- Table: wild_shape_forms
-- ========================================
CREATE TYPE creature_size AS ENUM (
  'Fine', 'Diminutive', 'Tiny', 'Small',
  'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'
);

CREATE TABLE wild_shape_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  edition game_edition NOT NULL DEFAULT 'pf1e',
  image_url TEXT, -- Supabase Storage URL

  -- Template Reference
  base_template_id UUID REFERENCES wild_shape_templates(id),
  is_custom BOOLEAN DEFAULT false,

  -- Form Data
  size creature_size NOT NULL,

  -- Tags for filtering
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Examples: ['Beast Shape I', 'Beast Shape II', 'Elemental Body I', 'terrestrial', 'aquatic', 'flying']

  -- Stat Modifications (JSONB)
  stat_modifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: {
  --   abilityDeltas: { str: +4, dex: -2, con: +2 },
  --   naturalArmor: +2,
  --   size: 'Large',
  --   movement: { land: 40, climb: 30 },
  --   senses: { lowLight: true, scent: true },
  --   naturalAttacks: [
  --     { name: 'Bite', type: 'primary', damage: '1d6', attackBonus: 0 },
  --     { name: 'Claw', type: 'primary', damage: '1d4', attackBonus: 0, count: 2 }
  --   ],
  --   specialAbilities: ['grab', 'pounce'],
  --   skillBonuses: { Stealth: +4, Perception: +4 },
  --   traits: ['scent']
  -- }

  -- Requirements
  required_druid_level INTEGER DEFAULT 4,
  required_spell_level TEXT, -- 'Beast Shape I', 'Beast Shape II', etc.

  -- User Notes
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_forms_owner ON wild_shape_forms(owner_id);
CREATE INDEX idx_forms_character ON wild_shape_forms(character_id);
CREATE INDEX idx_forms_tags ON wild_shape_forms USING GIN(tags);
CREATE INDEX idx_forms_edition ON wild_shape_forms(edition);

-- RLS Policies
ALTER TABLE wild_shape_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own forms"
  ON wild_shape_forms FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own forms"
  ON wild_shape_forms FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own forms"
  ON wild_shape_forms FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own forms"
  ON wild_shape_forms FOR DELETE
  USING (auth.uid() = owner_id);

-- ========================================
-- Table: wild_shape_templates
-- ========================================
CREATE TABLE wild_shape_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template Info
  name TEXT NOT NULL,
  edition game_edition NOT NULL,
  is_official BOOLEAN DEFAULT true, -- SRD-derived

  -- Same structure as wild_shape_forms
  size creature_size NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  stat_modifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  required_druid_level INTEGER DEFAULT 4,
  required_spell_level TEXT,

  -- Template Metadata
  source TEXT, -- "Pathfinder Core Rulebook", "Bestiary", etc.
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_templates_edition ON wild_shape_templates(edition);
CREATE INDEX idx_templates_tags ON wild_shape_templates USING GIN(tags);

-- RLS Policies
ALTER TABLE wild_shape_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are readable by all authenticated users"
  ON wild_shape_templates FOR SELECT
  TO authenticated
  USING (true);

-- ========================================
-- Table: custom_templates
-- ========================================
CREATE TABLE custom_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- Template Modifiers (JSONB)
  modifiers JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: {
  --   abilityDeltas: { cha: +4 },
  --   dr: ['5/evil'],
  --   resistances: { fire: 10 },
  --   specialAbilities: ['smite evil'],
  --   skillBonuses: { Perception: +2 }
  -- }

  tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['celestial', 'template', 'planar']

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_custom_templates_owner ON custom_templates(owner_id);

-- RLS Policies
ALTER TABLE custom_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own custom templates"
  ON custom_templates FOR ALL
  USING (auth.uid() = owner_id);

-- ========================================
-- Table: favorites
-- ========================================
CREATE TABLE favorites (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES wild_shape_forms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (profile_id, form_id)
);

-- RLS Policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (auth.uid() = profile_id);

-- ========================================
-- Table: activity_log
-- ========================================
CREATE TYPE activity_action AS ENUM (
  'assume_shape', 'revert_shape', 'create_form',
  'edit_form', 'delete_form', 'long_rest', 'uses_consumed'
);

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  action activity_action NOT NULL,

  payload JSONB DEFAULT '{}'::jsonb,
  -- Structure varies by action type

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_profile ON activity_log(profile_id, created_at DESC);
CREATE INDEX idx_activity_character ON activity_log(character_id, created_at DESC);

-- RLS Policies
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- ========================================
-- Storage Buckets
-- ========================================
-- Create storage bucket for form images
INSERT INTO storage.buckets (id, name, public)
VALUES ('form-images', 'form-images', true);

-- RLS for storage
CREATE POLICY "Users can upload own form images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'form-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own form images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'form-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Form images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'form-images');
