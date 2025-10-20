## 1. Project Overview

**Name:** Wild Shape Tracker  
**Platform:** React Native (Expo) Mobile App  
**Primary Edition:** Pathfinder 1e (v1.0)  
**Backend:** Supabase (PostgreSQL + Auth + Storage)  
**Offline Support:** Yes (TanStack Query with persistence)

---

## 2. Tech Stack

### Frontend
- **Framework:** React Native + Expo SDK 50+
- **Language:** TypeScript (strict mode)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Navigation:** React Navigation 6 (Stack + Bottom Tabs)
- **Animations:** React Native Reanimated 3 + Gesture Handler
- **State Management:** Zustand (global) + TanStack Query (server state)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React Native

### Backend (Supabase)
- **Database:** PostgreSQL 15+
- **Auth:** Email/Password, Magic Link
- **Storage:** User-uploaded form images
- **Real-time:** Not needed for v1
- **RLS:** Row Level Security enabled

### Development Tools
- **Linting:** ESLint + Prettier
- **Testing:** Jest + React Native Testing Library
- **Type Safety:** TypeScript + Supabase generated types
- **Version Control:** Git + GitHub

---

## 3. Database Schema (Supabase)

### Table: `profiles`
```sql
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
```

### Table: `characters`
```sql
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
```

### Table: `wild_shape_forms`
```sql
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
```

### Table: `wild_shape_templates`
```sql
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
```

### Table: `custom_templates`
```sql
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
```

### Table: `favorites`
```sql
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
```

### Table: `activity_log`
```sql
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
```

### Storage Buckets
```sql
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
```

---

## 4. TypeScript Type Definitions

### Core Types (`src/types/core.ts`)
```typescript
export type GameEdition = 'pf1e' | 'dnd5e' | 'pf2e';

export type Size = 
  | 'Fine' | 'Diminutive' | 'Tiny' | 'Small' 
  | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' | 'Colossal';

export type AttackType = 'primary' | 'secondary';

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface ACBreakdown {
  base: number; // 10
  armor: number;
  shield: number;
  dex: number; // modifier
  size: number; // size modifier
  natural: number;
  deflection: number;
  dodge: number;
  misc: number;
}

export interface Saves {
  fortitude: number;
  reflex: number;
  will: number;
}

export interface Movement {
  land: number;
  burrow?: number;
  climb?: number;
  swim?: number;
  fly?: {
    speed: number;
    maneuverability: 'Clumsy' | 'Poor' | 'Average' | 'Good' | 'Perfect';
  };
}

export interface Senses {
  darkvision?: number; // range in feet
  lowLight?: boolean;
  tremorsense?: number;
  blindsense?: number;
  blindsight?: number;
  scent?: boolean;
}

export interface NaturalAttack {
  name: string;
  type: AttackType;
  damage: string; // e.g., "1d6", "2d4"
  critRange?: string; // e.g., "19-20", "20"
  critMultiplier?: string; // e.g., "×2", "×3"
  count?: number; // for multiple attacks (2 claws)
  special?: string[]; // ['grab', 'trip']
}

export interface BaseCharacter {
  // Identity
  name: string;
  level: number;
  effectiveDruidLevel: number; // for wild shape calculations
  edition: GameEdition;
  
  // Core Stats
  abilityScores: AbilityScores;
  size: Size;
  
  // Combat
  ac: ACBreakdown;
  hp: {
    max: number;
    current: number;
    temp?: number;
  };
  bab: number; // Base Attack Bonus
  cmb: number; // Combat Maneuver Bonus
  cmd: number; // Combat Maneuver Defense
  
  // Defenses
  saves: Saves;
  dr?: string[]; // ['5/magic', '10/silver']
  resistances?: Record<string, number>; // { fire: 10, cold: 5 }
  immunities?: string[]; // ['poison', 'disease']
  
  // Skills
  skills: Record<string, number>; // skill name -> total bonus
  
  // Mobility & Perception
  movement: Movement;
  senses: Senses;
  
  // Features
  feats: string[];
  classFeatures: string[];
  traits: string[];
}

export interface WildShapeForm {
  id: string;
  name: string;
  imageUrl?: string;
  size: Size;
  tags: string[];
  
  // Modifications
  statModifications: {
    abilityDeltas?: Partial<AbilityScores>;
    naturalArmor?: number;
    sizeChange?: Size;
    movement?: Partial<Movement>;
    senses?: Partial<Senses>;
    naturalAttacks?: NaturalAttack[];
    specialAbilities?: string[];
    skillBonuses?: Record<string, number>;
    traits?: string[];
    dr?: string[];
    resistances?: Record<string, number>;
  };
  
  // Requirements
  requiredDruidLevel: number;
  requiredSpellLevel: string; // 'Beast Shape I', etc.
  
  // Metadata
  isCustom: boolean;
  baseTemplateId?: string;
  notes?: string;
}

export interface CustomTemplate {
  id: string;
  name: string;
  description?: string;
  modifiers: {
    abilityDeltas?: Partial<AbilityScores>;
    dr?: string[];
    resistances?: Record<string, number>;
    immunities?: string[];
    specialAbilities?: string[];
    skillBonuses?: Record<string, number>;
    naturalArmorBonus?: number;
  };
  tags: string[];
}

export interface ComputedCharacter extends BaseCharacter {
  activeForm?: {
    formId: string;
    formName: string;
    appliedTemplates: string[]; // IDs of custom templates applied
  };
  deltas: {
    [key: string]: {
      before: any;
      after: any;
    };
  };
}
```

### Pathfinder 1e Specific (`src/types/pf1e.ts`)
```typescript
export type BeastShapeLevel = 'I' | 'II' | 'III' | 'IV';
export type ElementalBodyLevel = 'I' | 'II' | 'III' | 'IV';
export type PlantShapeLevel = 'I' | 'II' | 'III';

export interface WildShapeSpellAccess {
  beastShape: BeastShapeLevel[];
  elementalBody: ElementalBodyLevel[];
  plantShape: PlantShapeLevel[];
}

export const WILD_SHAPE_PROGRESSION: Record<number, WildShapeSpellAccess> = {
  4: { beastShape: ['I'], elementalBody: [], plantShape: [] },
  6: { beastShape: ['I', 'II'], elementalBody: ['I'], plantShape: [] },
  8: { beastShape: ['I', 'II', 'III'], elementalBody: ['I', 'II'], plantShape: ['I'] },
  10: { beastShape: ['I', 'II', 'III', 'IV'], elementalBody: ['I', 'II', 'III'], plantShape: ['I', 'II'] },
  12: { beastShape: ['I', 'II', 'III', 'IV'], elementalBody: ['I', 'II', 'III', 'IV'], plantShape: ['I', 'II', 'III'] },
};

export const SIZE_MODIFIERS: Record<Size, {
  ac: number;
  attack: number;
  cmb: number;
  cmd: number;
  fly: number;
  stealth: number;
}> = {
  Fine: { ac: 8, attack: 8, cmb: -8, cmd: -8, fly: 8, stealth: 16 },
  Diminutive: { ac: 4, attack: 4, cmb: -4, cmd: -4, fly: 6, stealth: 12 },
  Tiny: { ac: 2, attack: 2, cmb: -2, cmd: -2, fly: 4, stealth: 8 },
  Small: { ac: 1, attack: 1, cmb: -1, cmd: -1, fly: 2, stealth: 4 },
  Medium: { ac: 0, attack: 0, cmb: 0, cmd: 0, fly: 0, stealth: 0 },
  Large: { ac: -1, attack: -1, cmb: 1, cmd: 1, fly: -2, stealth: -4 },
  Huge: { ac: -2, attack: -2, cmb: 2, cmd: 2, fly: -4, stealth: -8 },
  Gargantuan: { ac: -4, attack: -4, cmb: 4, cmd: 4, fly: -6, stealth: -12 },
  Colossal: { ac: -8, attack: -8, cmb: 8, cmd: 8, fly: -8, stealth: -16 },
};

export const ABILITY_MOD = (score: number): number => Math.floor((score - 10) / 2);
```

---

## 5. Application Architecture

### Folder Structure
```
wild-shape-tracker/
├── app.json                    # Expo config
├── package.json
├── tsconfig.json
├── tailwind.config.js          # NativeWind config
├── .env.local                  # Supabase keys (gitignored)
│
├── src/
│   ├── app/                    # Expo Router (if using) or navigation
│   │   ├── (auth)/
│   │   │   ├── sign-in.tsx
│   │   │   ├── sign-up.tsx
│   │   │   └── magic-link.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx       # Dashboard
│   │   │   ├── forms.tsx       # Swipeable Forms
│   │   │   ├── character.tsx   # Character Editor
│   │   │   ├── library.tsx     # Template Library
│   │   │   └── settings.tsx
│   │   ├── form/
│   │   │   ├── [id].tsx        # Form Detail
│   │   │   ├── edit.tsx        # Form Editor
│   │   │   └── create.tsx
│   │   └── _layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                 # Base components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── Modal.tsx
│   │   ├── forms/
│   │   │   ├── WildShapeCard.tsx
│   │   │   ├── SwipeableCardDeck.tsx
│   │   │   ├── FormEditor.tsx
│   │   │   ├── StatDeltaRow.tsx
│   │   │   └── DiceInput.tsx
│   │   ├── character/
│   │   │   ├── BaseStatsEditor.tsx
│   │   │   ├── AbilityScoreInput.tsx
│   │   │   ├── ACBreakdownEditor.tsx
│   │   │   └── SkillsEditor.tsx
│   │   ├── dashboard/
│   │   │   ├── UsesCounter.tsx
│   │   │   ├── ActiveFormCard.tsx
│   │   │   └── QuickActionButtons.tsx
│   │   └── common/
│   │       ├── SizeBadge.tsx
│   │       ├── TagChip.tsx
│   │       ├── MovementPills.tsx
│   │       ├── ImagePicker.tsx
│   │       └── FilterBar.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   ├── queryClient.ts      # TanStack Query setup
│   │   └── storage.ts          # MMKV/AsyncStorage for offline
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCharacter.ts
│   │   ├── useForms.ts
│   │   ├── useTemplates.ts
│   │   ├── useCustomTemplates.ts
│   │   └── useOffline.ts
│   │
│   ├── stores/
│   │   ├── authStore.ts        # Zustand: auth state
│   │   ├── characterStore.ts   # Zustand: active character
│   │   └── uiStore.ts          # Zustand: theme, filters
│   │
│   ├── services/
│   │   ├── rules-engine/
│   │   │   ├── index.ts
│   │   │   ├── pf1eAdapter.ts
│   │   │   ├── calculator.ts
│   │   │   └── validators.ts
│   │   ├── forms.service.ts
│   │   ├── characters.service.ts
│   │   ├── templates.service.ts
│   │   └── images.service.ts
│   │
│   ├── types/
│   │   ├── core.ts
│   │   ├── pf1e.ts
│   │   ├── database.ts         # Supabase generated types
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── calculations.ts     # Helper math functions
│   │   ├── formatting.ts       # Display formatters
│   │   ├── validation.ts       # Zod schemas
│   │   └── constants.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   └── theme/
│       ├── colors.ts
│       ├── spacing.ts
│       └── typography.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_templates.sql
│   │   └── 003_seed_pf1e_templates.sql
│   └── seed.sql                # Initial template data
│
└── docs/
    ├── API.md
    ├── RULES_ENGINE.md
    └── CALCULATIONS.md
```

---

## 6. Rules Engine Design

### Core Calculator (`src/services/rules-engine/pf1eAdapter.ts`)

```typescript
import { BaseCharacter, WildShapeForm, ComputedCharacter, CustomTemplate } from '@/types/core';
import { ABILITY_MOD, SIZE_MODIFIERS } from '@/types/pf1e';

export class PF1eRulesEngine {
  /**
   * Apply wild shape transformation to base character
   */
  applyWildShape(
    baseChar: BaseCharacter,
    form: WildShapeForm,
    customTemplates: CustomTemplate[] = []
  ): ComputedCharacter {
    const computed: ComputedCharacter = JSON.parse(JSON.stringify(baseChar));
    computed.deltas = {};

    // 1. Apply custom templates first (e.g., Celestial)
    for (const template of customTemplates) {
      this.applyCustomTemplate(computed, template);
    }

    // 2. Apply size change
    if (form.statModifications.sizeChange) {
      this.applySizeChange(computed, baseChar.size, form.statModifications.sizeChange);
    }

    // 3. Apply ability score changes
    if (form.statModifications.abilityDeltas) {
      this.applyAbilityDeltas(computed, form.statModifications.abilityDeltas);
    }

    // 4. Recalculate derived stats (AC, saves, skills, etc.)
    this.recalculateDerivedStats(computed, baseChar);

    // 5. Apply natural armor
    if (form.statModifications.naturalArmor) {
      computed.ac.natural += form.statModifications.naturalArmor;
    }

    // 6. Apply movement modes
    if (form.statModifications.movement) {
      Object.assign(computed.movement, form.statModifications.movement);
    }

    // 7. Apply senses
    if (form.statModifications.senses) {
      Object.assign(computed.senses, form.statModifications.senses);
    }

    // 8. Apply skill bonuses
    if (form.statModifications.skillBonuses) {
      Object.entries(form.statModifications.skillBonuses).forEach(([skill, bonus]) => {
        computed.skills[skill] = (computed.skills[skill] || 0) + bonus;
      });
    }

    // 9. Store active form
    computed.activeForm = {
      formId: form.id,
      formName: form.name,
      appliedTemplates: customTemplates.map(t => t.id),
    };

    return computed;
  }

  private applySizeChange(char: ComputedCharacter, oldSize: Size, newSize: Size) {
    const oldMods = SIZE_MODIFIERS[oldSize];
    const newMods = SIZE_MODIFIERS[newSize];
    
    // Remove old size modifiers, apply new ones
    const sizeDelta = {
      ac: newMods.ac - oldMods.ac,
      attack: newMods.attack - oldMods.attack,
      cmb: newMods.cmb - oldMods.cmb,
      cmd: newMods.cmd - oldMods.cmd,
      stealth: newMods.stealth - oldMods.stealth,
    };

    char.size = newSize;
    char.ac.size = newMods.ac;
    char.cmb += sizeDelta.cmb;
    char.cmd += sizeDelta.cmd;
    
    if (char.skills['Stealth']) {
      char.skills['Stealth'] += sizeDelta.stealth;
    }

    char.deltas['size'] = { before: oldSize, after: newSize };
  }

  private applyAbilityDeltas(char: ComputedCharacter, deltas: Partial<AbilityScores>) {
    Object.entries(deltas).forEach(([ability, delta]) => {
      const key = ability as keyof AbilityScores;
      const oldScore = char.abilityScores[key];
      char.abilityScores[key] = oldScore + (delta || 0);
      
      char.deltas[`ability_${ability}`] = {
        before: oldScore,
        after: char.abilityScores[key],
      };
    });
  }

  private recalculateDerivedStats(computed: ComputedCharacter, original: BaseCharacter) {
    // Recalc AC (Dex modifier may have changed)
    const oldDexMod = ABILITY_MOD(original.abilityScores.dex);
    const newDexMod = ABILITY_MOD(computed.abilityScores.dex);
    computed.ac.dex = newDexMod;

    // Recalc CMB/CMD
    const strMod = ABILITY_MOD(computed.abilityScores.str);
    const dexMod = ABILITY_MOD(computed.abilityScores.dex);
    computed.cmb = computed.bab + strMod + computed.ac.size;
    computed.cmd = 10 + computed.bab + strMod + dexMod + computed.ac.size;

    // Recalc Saves (ability modifiers may have changed)
    const conMod = ABILITY_MOD(computed.abilityScores.con);
    const wisMod = ABILITY_MOD(computed.abilityScores.wis);
    const chaMod = ABILITY_MOD(computed.abilityScores.cha);
    
    // Note: This is simplified - you'll need base save values
    // computed.saves.fortitude = baseFort + conMod;
    // computed.saves.reflex = baseRef + dexMod;
    // computed.saves.will = baseWill + wisMod;

    // Recalc HP (Con modifier change affects HP)
    const oldConMod = ABILITY_MOD(original.abilityScores.con);
    const newConMod = ABILITY_MOD(computed.abilityScores.con);
    const conHpDelta = (newConMod - oldConMod) * computed.level;
    computed.hp.max += conHpDelta;
    computed.hp.current += conHpDelta;

    // Recalc Str/Dex based skills
    // Examples: Climb (Str), Stealth (Dex), etc.
    this.updateSkillsFromAbilities(computed, original);
  }

  private updateSkillsFromAbilities(computed: ComputedCharacter, original: BaseCharacter) {
    const abilitySkillMap: Record<string, keyof AbilityScores> = {
      'Acrobatics': 'dex',
      'Climb': 'str',
      'Escape Artist': 'dex',
      'Fly': 'dex',
      'Stealth': 'dex',
      'Swim': 'str',
      // Add more as needed
    };

    Object.entries(abilitySkillMap).forEach(([skill, ability]) => {
      if (computed.skills[skill] !== undefined) {
        const oldMod = ABILITY_MOD(original.abilityScores[ability]);
        const newMod = ABILITY_MOD(computed.abilityScores[ability]);
        const delta = newMod - oldMod;
        computed.skills[skill] += delta;
      }
    });
  }

  private applyCustomTemplate(char: ComputedCharacter, template: CustomTemplate) {
    if (template.modifiers.abilityDeltas) {
      this.applyAbilityDeltas(char, template.modifiers.abilityDeltas);
    }

    if (template.modifiers.naturalArmorBonus) {
      char.ac.natural += template.modifiers.naturalArmorBonus;
    }

    if (template.modifiers.dr) {
      char.dr = [...(char.dr || []), ...template.modifiers.dr];
    }

    if (template.modifiers.resistances) {
      char.resistances = { ...char.resistances, ...template.modifiers.resistances };
    }

    if (template.modifiers.immunities) {
      char.immunities = [...(char.immunities || []), ...template.modifiers.immunities];
    }

    if (template.modifiers.skillBonuses) {
      Object.entries(template.modifiers.skillBonuses).forEach(([skill, bonus]) => {
        char.skills[skill] = (char.skills[skill] || 0) + bonus;
      });
    }
  }

  /**
   * Check if a form is available at the given druid level
   */
  canUseForm(form: WildShapeForm, effectiveDruidLevel: number): boolean {
    return effectiveDruidLevel >= form.requiredDruidLevel;
  }

  /**
   * Get available spell levels at druid level
   */
  getAvailableSpellLevels(effectiveDruidLevel: number): string[] {
    const available: string[] = [];

    if (effectiveDruidLevel >= 4) available.push('Beast Shape I');
    if (effectiveDruidLevel >= 6) {
      available.push('Beast Shape II', 'Elemental Body I');
    }
    if (effectiveDruidLevel >= 8) {
      available.push('Beast Shape III', 'Elemental Body II', 'Plant Shape I');
    }
    if (effectiveDruidLevel >= 10) {
      available.push('Beast Shape IV', 'Elemental Body III', 'Plant Shape II');
    }
    if (effectiveDruidLevel >= 12) {
      available.push('Elemental Body IV', 'Plant Shape III');
    }

    return available;
  }
}
```

---

## 7. Key Features Implementation

### 7.1 Swipeable Card Deck Component

```typescript
// src/components/forms/SwipeableCardDeck.tsx
import React from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface SwipeableCardDeckProps {
  forms: WildShapeForm[];
  onFormChange: (index: number) => void;
  renderCard: (form: WildShapeForm) => React.ReactNode;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export function SwipeableCardDeck({ 
  forms, 
  onFormChange, 
  renderCard 
}: SwipeableCardDeckProps) {
  const translateX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD;
      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD;

      if (shouldSwipeRight && currentIndex > 0) {
        runOnJS(handleSwipe)('right');
      } else if (shouldSwipeLeft && currentIndex < forms.length - 1) {
        runOnJS(handleSwipe)('left');
      } else {
        translateX.value = withSpring(0);
      }
    });

  const handleSwipe = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' 
      ? currentIndex + 1 
      : currentIndex - 1;
    
    setCurrentIndex(newIndex);
    onFormChange(newIndex);
    translateX.value = withSpring(0);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        {renderCard(forms[currentIndex])}
      </Animated.View>
    </GestureDetector>
  );
}
```

### 7.2 Daily Uses Counter

```typescript
// src/components/dashboard/UsesCounter.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Minus, Plus, RotateCcw, Infinity } from 'lucide-react-native';

interface UsesCounterProps {
  current: number;
  max: number | null; // null = infinite
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
}

export function UsesCounter({ 
  current, 
  max, 
  onIncrement, 
  onDecrement, 
  onReset 
}: UsesCounterProps) {
  const isInfinite = max === null;
  const canIncrement = isInfinite || current < max;
  const canDecrement = current > 0;

  return (
    <View className="bg-slate-800 rounded-2xl p-6 items-center">
      <Text className="text-slate-400 text-sm font-medium mb-2">
        Daily Wild Shapes
      </Text>
      
      <View className="flex-row items-center gap-4">
        <TouchableOpacity
          onPress={onDecrement}
          disabled={!canDecrement}
          className={`w-12 h-12 rounded-full items-center justify-center ${
            canDecrement ? 'bg-emerald-600' : 'bg-slate-700'
          }`}
        >
          <Minus size={24} color="white" />
        </TouchableOpacity>

        <View className="items-center min-w-[100px]">
          {isInfinite ? (
            <Infinity size={48} color="#10b981" />
          ) : (
            <>
              <Text className="text-5xl font-bold text-white">
                {current}
              </Text>
              <Text className="text-slate-400 text-lg">
                / {max}
              </Text>
            </>
          )}
        </View>

        <TouchableOpacity
          onPress={onIncrement}
          disabled={!canIncrement}
          className={`w-12 h-12 rounded-full items-center justify-center ${
            canIncrement ? 'bg-emerald-600' : 'bg-slate-700'
          }`}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onReset}
        className="mt-4 flex-row items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg"
      >
        <RotateCcw size={16} color="#94a3b8" />
        <Text className="text-slate-300 font-medium">Long Rest</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 7.3 Form Editor with Validation

```typescript
// src/components/forms/FormEditor.tsx
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WildShapeForm } from '@/types/core';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  size: z.enum(['Tiny', 'Small', 'Medium', 'Large', 'Huge']),
  requiredDruidLevel: z.number().min(4).max(20),
  requiredSpellLevel: z.string(),
  tags: z.array(z.string()),
  statModifications: z.object({
    abilityDeltas: z.object({
      str: z.number().optional(),
      dex: z.number().optional(),
      con: z.number().optional(),
    }).optional(),
    naturalArmor: z.number().optional(),
    // ... more fields
  }),
});

type FormData = z.infer<typeof formSchema>;

export function FormEditor({ 
  initialData, 
  onSave 
}: { 
  initialData?: Partial<WildShapeForm>; 
  onSave: (data: FormData) => void;
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      requiredDruidLevel: 4,
      size: 'Medium',
      tags: [],
    },
  });

  return (
    <View className="flex-1 p-4">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Form Name"
            value={value}
            onChangeText={onChange}
            error={errors.name?.message}
            placeholder="e.g., Wolf"
          />
        )}
      />

      {/* More fields... */}

      <Button onPress={handleSubmit(onSave)}>
        Save Form
      </Button>
    </View>
  );
}
```

---

## 8. Offline Support Strategy

### 8.1 TanStack Query Configuration

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'WILDSHAPE_CACHE',
});

export { queryClient, asyncStoragePersister };
```

### 8.2 Offline Mutations Queue

```typescript
// src/hooks/useOffline.ts
import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

export function useOffline() {
  const netInfo = useNetInfo();

  useEffect(() => {
    if (netInfo.isConnected && netInfo.isInternetReachable) {
      // Sync queued mutations when back online
      queryClient.resumePausedMutations();
    }
  }, [netInfo.isConnected, netInfo.isInternetReachable]);

  return {
    isOffline: !netInfo.isConnected || !netInfo.isInternetReachable,
  };
}
```

---

## 9. Starter PF1e Templates (Seed Data)

```sql
-- supabase/migrations/003_seed_pf1e_templates.sql

-- Beast Shape I Templates (Druid Level 4+)
INSERT INTO wild_shape_templates (name, edition, size, tags, stat_modifications, required_druid_level, required_spell_level, source) VALUES
(
  'Wolf',
  'pf1e',
  'Medium',
  ARRAY['Beast Shape I', 'terrestrial', 'predator'],
  '{
    "abilityDeltas": {"str": 2, "dex": 4, "con": 4},
    "naturalArmor": 2,
    "movement": {"land": 50},
    "senses": {"lowLight": true, "scent": true},
    "naturalAttacks": [
      {"name": "Bite", "type": "primary", "damage": "1d6", "count": 1, "special": ["trip"]}
    ],
    "skillBonuses": {"Survival": 4}
  }'::jsonb,
  4,
  'Beast Shape I',
  'Pathfinder Bestiary'
),
(
  'Eagle',
  'pf1e',
  'Small',
  ARRAY['Beast Shape I', 'flying', 'predator'],
  '{
    "abilityDeltas": {"str": -4, "dex": 4, "con": 0},
    "naturalArmor": 1,
    "movement": {"land": 10, "fly": {"speed": 80, "maneuverability": "Average"}},
    "senses": {"lowLight": true},
    "naturalAttacks": [
      {"name": "Talons", "type": "primary", "damage": "1d4", "count": 2},
      {"name": "Bite", "type": "secondary", "damage": "1d4", "count": 1}
    ],
    "skillBonuses": {"Perception": 8}
  }'::jsonb,
  4,
  'Beast Shape I',
  'Pathfinder Bestiary'
),
(
  'Leopard',
  'pf1e',
  'Medium',
  ARRAY['Beast Shape I', 'terrestrial', 'predator'],
  '{
    "abilityDeltas": {"str": 2, "dex": 6, "con": 2},
    "naturalArmor": 1,
    "movement": {"land": 50, "climb": 20},
    "senses": {"lowLight": true, "scent": true},
    "naturalAttacks": [
      {"name": "Bite", "type": "primary", "damage": "1d6", "count": 1},
      {"name": "Claw", "type": "primary", "damage": "1d3", "count": 2}
    ],
    "skillBonuses": {"Stealth": 8, "Acrobatics": 4}
  }'::jsonb,
  4,
  'Beast Shape I',
  'Pathfinder Bestiary'
);

-- Beast Shape II Templates (Druid Level 6+)
INSERT INTO wild_shape_templates (name, edition, size, tags, stat_modifications, required_druid_level, required_spell_level, source) VALUES
(
  'Dire Wolf',
  'pf1e',
  'Large',
  ARRAY['Beast Shape II', 'terrestrial', 'predator'],
  '{
    "abilityDeltas": {"str": 8, "dex": 2, "con": 6},
    "naturalArmor": 3,
    "sizeChange": "Large",
    "movement": {"land": 50},
    "senses": {"lowLight": true, "scent": true},
    "naturalAttacks": [
      {"name": "Bite", "type": "primary", "damage": "1d8", "count": 1, "special": ["trip"]}
    ],
    "skillBonuses": {"Survival": 2, "Perception": 2}
  }'::jsonb,
  6,
  'Beast Shape II',
  'Pathfinder Bestiary'
),
(
  'Giant Eagle',
  'pf1e',
  'Large',
  ARRAY['Beast Shape II', 'flying', 'predator'],
  '{
    "abilityDeltas": {"str": 6, "dex": 2, "con": 4},
    "naturalArmor": 3,
    "sizeChange": "Large",
    "movement": {"land": 10, "fly": {"speed": 80, "maneuverability": "Average"}},
    "senses": {"lowLight": true},
    "naturalAttacks": [
      {"name": "Talons", "type": "primary", "damage": "1d8", "count": 2},
      {"name": "Bite", "type": "secondary", "damage": "1d6", "count": 1}
    ],
    "specialAbilities": ["grab"],
    "skillBonuses": {"Perception": 4}
  }'::jsonb,
  6,
  'Beast Shape II',
  'Pathfinder Bestiary'
),
(
  'Tiger',
  'pf1e',
  'Large',
  ARRAY['Beast Shape II', 'terrestrial', 'predator'],
  '{
    "abilityDeltas": {"str": 10, "dex": 4, "con": 6},
    "naturalArmor": 3,
    "sizeChange": "Large",
    "movement": {"land": 40},
    "senses": {"lowLight": true, "scent": true},
    "naturalAttacks": [
      {"name": "Bite", "type": "primary", "damage": "2d6", "count": 1},
      {"name": "Claw", "type": "primary", "damage": "1d8", "count": 2, "special": ["grab"]}
    ],
    "specialAbilities": ["grab", "pounce", "rake"],
    "skillBonuses": {"Stealth": 4, "Acrobatics": 4, "Perception": 4}
  }'::jsonb,
  6,
  'Beast Shape II',
  'Pathfinder Bestiary'
);

-- Elemental Body I Templates (Druid Level 6+)
INSERT INTO wild_shape_templates (name, edition, size, tags, stat_modifications, required_druid_level, required_spell_level, source) VALUES
(
  'Small Fire Elemental',
  'pf1e',
  'Small',
  ARRAY['Elemental Body I', 'elemental', 'fire'],
  '{
    "abilityDeltas": {"dex": 4, "con": 2},
    "naturalArmor": 2,
    "movement": {"land": 50},
    "senses": {"darkvision": 60},
    "naturalAttacks": [
      {"name": "Slam", "type": "primary", "damage": "1d4", "count": 1, "special": ["burn"]}
    ],
    "traits": ["fire subtype", "immunity to fire", "vulnerability to cold"],
    "immunities": ["fire"]
  }'::jsonb,
  6,
  'Elemental Body I',
  'Pathfinder Bestiary'
),
(
  'Small Earth Elemental',
  'pf1e',
  'Small',
  ARRAY['Elemental Body I', 'elemental', 'earth'],
  '{
    "abilityDeltas": {"str": 2, "con": 2},
    "naturalArmor": 4,
    "movement": {"land": 20, "burrow": 20},
    "senses": {"darkvision": 60, "tremorsense": 60},
    "naturalAttacks": [
      {"name": "Slam", "type": "primary", "damage": "1d6", "count": 1}
    ],
    "traits": ["earth subtype", "earth glide"]
  }'::jsonb,
  6,
  'Elemental Body I',
  'Pathfinder Bestiary'
);
```

---

## 10. UI/UX Design Specifications

### Color Palette (Fantasy/Mystical Theme)
```typescript
// src/theme/colors.ts
export const colors = {
  // Primary - Emerald (Nature/Druid theme)
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    900: '#064e3b',
  },
  
  // Secondary - Amber (Wild/Primal theme)
  secondary: {
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
  },
  
  // Dark theme base
  slate: {
    50: '#f8fafc',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  // Accent - Purple (Magic theme)
  accent: {
    500: '#8b5cf6',
    600: '#7c3aed',
  },
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};
```

### Typography
```typescript
// src/theme/typography.ts
export const typography = {
  fonts: {
    heading: 'Cinzel-Bold', // Fantasy serif for headers
    body: 'Inter-Regular', // Clean sans-serif for body
    mono: 'JetBrainsMono-Regular', // For stats/numbers
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
};
```

### Component Styling Examples

```typescript
// Wild Shape Card with gradient and glassmorphism
<View className="relative w-full h-96 rounded-3xl overflow-hidden">
  {/* Background image with overlay */}
  <Image source={{ uri: form.imageUrl }} className="absolute inset-0" />
  <LinearGradient
    colors={['transparent', 'rgba(0,0,0,0.8)']}
    className="absolute inset-0"
  />
  
  {/* Content */}
  <View className="absolute bottom-0 p-6 w-full">
    <Text className="text-3xl font-bold text-white mb-2">
      {form.name}
    </Text>
    <View className="flex-row gap-2">
      <Badge variant="size">{form.size}</Badge>
      {form.tags.map(tag => (
        <Badge key={tag} variant="tag">{tag}</Badge>
      ))}
    </View>
  </View>
</View>
```

---

## 11. Development Milestones

### Phase 1: Foundation (Week 1-2)
- [ ] Initialize Expo project with TypeScript
- [ ] Configure NativeWind, React Navigation
- [ ] Set up Supabase project, generate types
- [ ] Create database schema and migrations
- [ ] Implement authentication (email/password, magic link)
- [ ] Set up offline support (TanStack Query + AsyncStorage)
- [ ] Create base UI components library

### Phase 2: Character Management (Week 3)
- [ ] Build character creation wizard
- [ ] Implement base stats editor (ability scores, AC, HP, saves, BAB)
- [ ] Create skills editor
- [ ] Add effective druid level input
- [ ] Implement character CRUD operations
- [ ] Add character selection/switching

### Phase 3: Forms Library (Week 4)
- [ ] Seed PF1e template database (15-20 forms)
- [ ] Build template library screen with filters
- [ ] Implement form cloning from templates
- [ ] Create custom form editor
- [ ] Add image upload functionality
- [ ] Implement favorites system
- [ ] Build search and tag filtering

### Phase 4: Rules Engine (Week 5)
- [ ] Implement PF1e rules calculator
- [ ] Add size change logic
- [ ] Calculate ability score impacts
- [ ] Compute AC, CMB, CMD changes
- [ ] Handle natural attacks rendering
- [ ] Apply skill bonuses and penalties
- [ ] Add movement and senses logic
- [ ] Create stat comparison/delta display

### Phase 5: Swipe UX & Daily Uses (Week 6)
- [ ] Build swipeable card deck with Reanimated
- [ ] Create wild shape card component
- [ ] Implement daily uses counter (finite/infinite)
- [ ] Add long rest reset functionality
- [ ] Build dashboard with quick access
- [ ] Create "Assume Shape" flow
- [ ] Add undo/revert functionality

### Phase 6: Custom Templates (Week 7)
- [ ] Build custom template creator
- [ ] Implement template application to forms
- [ ] Add template library management
- [ ] Create celestial/fiendish/template examples
- [ ] Add multi-template stacking logic

### Phase 7: Polish & Testing (Week 8-9)
- [ ] Implement dark theme
- [ ] Add loading states and error handling
- [ ] Create onboarding flow
- [ ] Test offline functionality thoroughly
- [ ] Add form validation everywhere
- [ ] Performance optimization (FlatList, memoization)
- [ ] Accessibility pass (screen readers, touch targets)
- [ ] Bug fixes and edge cases

### Phase 8: Beta Release (Week 10)
- [ ] TestFlight/Play Internal setup
- [ ] Create landing page
- [ ] Write user documentation
- [ ] Beta testing with 5-10 users
- [ ] Collect and implement feedback
- [ ] Prepare for public release

---

## 12. API Service Layer Structure

### 12.1 Characters Service
```typescript
// src/services/characters.service.ts
import { supabase } from '@/lib/supabase';
import { BaseCharacter, GameEdition } from '@/types/core';
import { Database } from '@/types/database';

type CharacterRow = Database['public']['Tables']['characters']['Row'];
type CharacterInsert = Database['public']['Tables']['characters']['Insert'];

export const charactersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as CharacterRow[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as CharacterRow;
  },

  async create(character: CharacterInsert) {
    const { data, error } = await supabase
      .from('characters')
      .insert(character)
      .select()
      .single();
    
    if (error) throw error;
    return data as CharacterRow;
  },

  async update(id: string, updates: Partial<CharacterInsert>) {
    const { data, error } = await supabase
      .from('characters')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as CharacterRow;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateDailyUses(id: string, current: number) {
    return this.update(id, { daily_uses_current: current });
  },

  async resetDailyUses(id: string) {
    const character = await this.getById(id);
    return this.update(id, { 
      daily_uses_current: character.daily_uses_max || 0 
    });
  },
};
```

### 12.2 Forms Service
```typescript
// src/services/forms.service.ts
import { supabase } from '@/lib/supabase';
import { WildShapeForm } from '@/types/core';
import { Database } from '@/types/database';

type FormRow = Database['public']['Tables']['wild_shape_forms']['Row'];
type FormInsert = Database['public']['Tables']['wild_shape_forms']['Insert'];

export const formsService = {
  async getAllForCharacter(characterId: string) {
    const { data, error } = await supabase
      .from('wild_shape_forms')
      .select('*')
      .eq('character_id', characterId)
      .order('name');
    
    if (error) throw error;
    return data as FormRow[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('wild_shape_forms')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as FormRow;
  },

  async create(form: FormInsert) {
    const { data, error } = await supabase
      .from('wild_shape_forms')
      .insert(form)
      .select()
      .single();
    
    if (error) throw error;
    return data as FormRow;
  },

  async update(id: string, updates: Partial<FormInsert>) {
    const { data, error } = await supabase
      .from('wild_shape_forms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as FormRow;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('wild_shape_forms')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async cloneFromTemplate(templateId: string, characterId: string) {
    // Get template
    const { data: template } = await supabase
      .from('wild_shape_templates')
      .select('*')
      .eq('id', templateId)
      .single();
    
    if (!template) throw new Error('Template not found');

    // Create new form from template
    const newForm: FormInsert = {
      owner_id: (await supabase.auth.getUser()).data.user!.id,
      character_id: characterId,
      name: template.name,
      edition: template.edition,
      size: template.size,
      tags: template.tags,
      stat_modifications: template.stat_modifications,
      required_druid_level: template.required_druid_level,
      required_spell_level: template.required_spell_level,
      base_template_id: template.id,
      is_custom: false,
    };

    return this.create(newForm);
  },

  async searchByTags(characterId: string, tags: string[]) {
    const { data, error } = await supabase
      .from('wild_shape_forms')
      .select('*')
      .eq('character_id', characterId)
      .overlaps('tags', tags);
    
    if (error) throw error;
    return data as FormRow[];
  },

  async filterBySize(characterId: string, sizes: string[]) {
    const { data, error } = await supabase
      .from('wild_shape_forms')
      .select('*')
      .eq('character_id', characterId)
      .in('size', sizes);
    
    if (error) throw error;
    return data as FormRow[];
  },
};
```

### 12.3 Templates Service
```typescript
// src/services/templates.service.ts
import { supabase } from '@/lib/supabase';
import { GameEdition } from '@/types/core';

export const templatesService = {
  async getAllByEdition(edition: GameEdition) {
    const { data, error } = await supabase
      .from('wild_shape_templates')
      .select('*')
      .eq('edition', edition)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getAvailableForLevel(edition: GameEdition, druidLevel: number) {
    const { data, error } = await supabase
      .from('wild_shape_templates')
      .select('*')
      .eq('edition', edition)
      .lte('required_druid_level', druidLevel)
      .order('required_druid_level');
    
    if (error) throw error;
    return data;
  },

  async searchByTags(edition: GameEdition, tags: string[]) {
    const { data, error } = await supabase
      .from('wild_shape_templates')
      .select('*')
      .eq('edition', edition)
      .overlaps('tags', tags);
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('wild_shape_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
};
```

### 12.4 Custom Templates Service
```typescript
// src/services/customTemplates.service.ts
import { supabase } from '@/lib/supabase';
import { CustomTemplate } from '@/types/core';

export const customTemplatesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('custom_templates')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as CustomTemplate[];
  },

  async create(template: Omit<CustomTemplate, 'id'>) {
    const { data, error } = await supabase
      .from('custom_templates')
      .insert({
        owner_id: (await supabase.auth.getUser()).data.user!.id,
        ...template,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as CustomTemplate;
  },

  async update(id: string, updates: Partial<CustomTemplate>) {
    const { data, error } = await supabase
      .from('custom_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as CustomTemplate;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('custom_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
```

### 12.5 Images Service
```typescript
// src/services/images.service.ts
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export const imagesService = {
  async uploadFormImage(formId: string, imageUri: string): Promise<string> {
    const userId = (await supabase.auth.getUser()).data.user!.id;
    
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert to blob
    const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });

    // Upload to Supabase Storage
    const filePath = `${userId}/${formId}.jpg`;
    const { data, error } = await supabase.storage
      .from('form-images')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('form-images')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  async deleteFormImage(formId: string) {
    const userId = (await supabase.auth.getUser()).data.user!.id;
    const filePath = `${userId}/${formId}.jpg`;

    const { error } = await supabase.storage
      .from('form-images')
      .remove([filePath]);

    if (error) throw error;
  },

  async pickImage(): Promise<string | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }

    return null;
  },

  async takePhoto(): Promise<string | null> {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }

    return null;
  },
};
```

---

## 13. React Hooks (TanStack Query)

### 13.1 Character Hooks
```typescript
// src/hooks/useCharacter.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { charactersService } from '@/services/characters.service';
import { useCharacterStore } from '@/stores/characterStore';

export function useCharacters() {
  return useQuery({
    queryKey: ['characters'],
    queryFn: charactersService.getAll,
  });
}

export function useCharacter(id: string) {
  return useQuery({
    queryKey: ['characters', id],
    queryFn: () => charactersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: charactersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      charactersService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({ queryKey: ['characters', data.id] });
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: charactersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}

export function useUpdateDailyUses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, current }: { id: string; current: number }) =>
      charactersService.updateDailyUses(id, current),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['characters', data.id] });
    },
  });
}

export function useResetDailyUses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: charactersService.resetDailyUses,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['characters', data.id] });
    },
  });
}
```

### 13.2 Forms Hooks
```typescript
// src/hooks/useForms.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsService } from '@/services/forms.service';

export function useForms(characterId: string) {
  return useQuery({
    queryKey: ['forms', characterId],
    queryFn: () => formsService.getAllForCharacter(characterId),
    enabled: !!characterId,
  });
}

export function useForm(id: string) {
  return useQuery({
    queryKey: ['forms', 'detail', id],
    queryFn: () => formsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formsService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['forms', data.character_id] 
      });
    },
  });
}

export function useUpdateForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      formsService.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['forms', data.character_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['forms', 'detail', data.id] 
      });
    },
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: formsService.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });
}

export function useCloneFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, characterId }: { 
      templateId: string; 
      characterId: string 
    }) => formsService.cloneFromTemplate(templateId, characterId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['forms', data.character_id] 
      });
    },
  });
}
```

### 13.3 Templates Hooks
```typescript
// src/hooks/useTemplates.ts
import { useQuery } from '@tanstack/react-query';
import { templatesService } from '@/services/templates.service';
import { GameEdition } from '@/types/core';

export function useTemplates(edition: GameEdition) {
  return useQuery({
    queryKey: ['templates', edition],
    queryFn: () => templatesService.getAllByEdition(edition),
  });
}

export function useAvailableTemplates(edition: GameEdition, druidLevel: number) {
  return useQuery({
    queryKey: ['templates', edition, 'level', druidLevel],
    queryFn: () => templatesService.getAvailableForLevel(edition, druidLevel),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['templates', 'detail', id],
    queryFn: () => templatesService.getById(id),
    enabled: !!id,
  });
}
```

---

## 14. Zustand Stores

### 14.1 Auth Store
```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, session: null });
  },

  sendMagicLink: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'wildshape://auth',
      },
    });
    if (error) throw error;
  },

  setUser: (user) => set({ user, loading: false }),
}));
```

### 14.2 Character Store
```typescript
// src/stores/characterStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseCharacter, ComputedCharacter, WildShapeForm } from '@/types/core';

interface CharacterState {
  activeCharacterId: string | null;
  activeCharacter: BaseCharacter | null;
  computedCharacter: ComputedCharacter | null;
  activeFormId: string | null;
  
  setActiveCharacter: (id: string, character: BaseCharacter) => void;
  clearActiveCharacter: () => void;
  applyForm: (computed: ComputedCharacter, formId: string) => void;
  revertForm: () => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      activeCharacterId: null,
      activeCharacter: null,
      computedCharacter: null,
      activeFormId: null,

      setActiveCharacter: (id, character) =>
        set({
          activeCharacterId: id,
          activeCharacter: character,
          computedCharacter: null,
          activeFormId: null,
        }),

      clearActiveCharacter: () =>
        set({
          activeCharacterId: null,
          activeCharacter: null,
          computedCharacter: null,
          activeFormId: null,
        }),

      applyForm: (computed, formId) =>
        set({
          computedCharacter: computed,
          activeFormId: formId,
        }),

      revertForm: () =>
        set({
          computedCharacter: null,
          activeFormId: null,
        }),
    }),
    {
      name: 'character-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 14.3 UI Store
```typescript
// src/stores/uiStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UIState {
  theme: 'light' | 'dark';
  formsView: 'cards' | 'list' | 'grid';
  filterTags: string[];
  filterSizes: string[];
  searchQuery: string;
  showOnlyFavorites: boolean;
  
  setTheme: (theme: 'light' | 'dark') => void;
  setFormsView: (view: 'cards' | 'list' | 'grid') => void;
  setFilterTags: (tags: string[]) => void;
  setFilterSizes: (sizes: string[]) => void;
  setSearchQuery: (query: string) => void;
  toggleFavorites: () => void;
  resetFilters: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      formsView: 'cards',
      filterTags: [],
      filterSizes: [],
      searchQuery: '',
      showOnlyFavorites: false,

      setTheme: (theme) => set({ theme }),
      setFormsView: (view) => set({ formsView: view }),
      setFilterTags: (tags) => set({ filterTags: tags }),
      setFilterSizes: (sizes) => set({ filterSizes: sizes }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleFavorites: () =>
        set((state) => ({ showOnlyFavorites: !state.showOnlyFavorites })),
      resetFilters: () =>
        set({
          filterTags: [],
          filterSizes: [],
          searchQuery: '',
          showOnlyFavorites: false,
        }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

---

## 15. Validation Schemas (Zod)

```typescript
// src/utils/validation.ts
import { z } from 'zod';

export const abilityScoreSchema = z.number().int().min(1).max(50);

export const abilityScoresSchema = z.object({
  str: abilityScoreSchema,
  dex: abilityScoreSchema,
  con: abilityScoreSchema,
  int: abilityScoreSchema,
  wis: abilityScoreSchema,
  cha: abilityScoreSchema,
});

export const characterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  level: z.number().int().min(1).max(20),
  effectiveDruidLevel: z.number().int().min(1).max(20),
  edition: z.enum(['pf1e', 'dnd5e', 'pf2e']),
  abilityScores: abilityScoresSchema,
  daily_uses_max: z.number().int().min(0).nullable(),
});

export const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  size: z.enum([
    'Fine',
    'Diminutive',
    'Tiny',
    'Small',
    'Medium',
    'Large',
    'Huge',
    'Gargantuan',
    'Colossal',
  ]),
  tags: z.array(z.string()),
  requiredDruidLevel: z.number().int().min(1).max(20),
  requiredSpellLevel: z.string(),
  notes: z.string().optional(),
});

export const customTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  tags: z.array(z.string()),
});
```

---

## 16. Environment Variables

```bash
# .env.local
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENVIRONMENT=development
```

---

## 17. Package Dependencies

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "^3.4.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-gesture-handler": "~2.14.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/query-async-storage-persister": "^5.17.0",
    "zustand": "^4.4.7",
    
    "nativewind": "^4.0.0",
    "tailwindcss": "^3.4.0",
    
    "react-hook-form": "^7.49.0",
    "@hookform/resolvers": "^3.3.3",
    "zod": "^3.22.4",
    
    "lucide-react-native": "^0.309.0",
    "expo-image-picker": "~14.7.1",
    "expo-file-system": "~16.0.6",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@react-native-community/netinfo": "^11.2.0",
    
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.45",
    "@types/react-native": "~0.73.0",
    "typescript": "^5.3.0",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0",
    "eslint": "^8.56.0",
    "eslint-config-expo": "^7.0.0",
    "prettier": "^3.1.1",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.2"
  }
}
```

---

## 18. Getting Started Commands

```bash
# Initialize project
npx create-expo-app@latest wild-shape-tracker --template blank-typescript

# Install dependencies
cd wild-shape-tracker
npm install

# Configure Supabase
npx supabase init
npx supabase start
npx supabase db reset

# Generate TypeScript types from Supabase
npx supabase gen types typescript --project-id <project-id> > src/types/database.ts

# Start development server
npx expo start

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android

# Build for production
eas build --platform ios
eas build --platform android
```

---

## 19. Testing Strategy

### Unit Tests
- Rules engine calculations (ability mod, size changes, AC, CMB/CMD)
- Form validation schemas
- Utility functions (formatting, calculations)

### Integration Tests
- Character CRUD operations
- Form application flow
- Authentication flow
- Offline sync behavior

### E2E Tests (Detox)
- Complete character creation flow
- Apply wild shape form
- Daily uses management
- Long rest reset

---

## 20. Future Enhancements (Post-v1)

1. **Multiple Game System Support**
   - D&D 5e full implementation
   - Pathfinder 2e wild order support
   - Starfinder options

2. **Advanced Features**
   - Polymorph spell support
   - Companion animal tracking
   - Summoned creature manager
   - Spell slot tracker integration

3. **Social Features**
   - Share forms with party members
   - Community form library with ratings
   - GM approval workflow for custom content

4. **Integration**
   - Roll20 integration
   - Foundry VTT sync
   - D&D Beyond character import
   - Pathbuilder integration

5. **Premium Features

---

## 25. Analytics & Telemetry (Privacy-First)

```typescript
// src/lib/analytics.ts
// Privacy-respecting analytics (no PII)
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    // Only track usage patterns, no personal data
    console.log('Analytics:', event, properties);
    // Implement with PostHog, Mixpanel, or similar
  },

  // Example events
  formCreated: (edition: string, size: string) => {
    analytics.track('form_created', { edition, size });
  },

  wildShapeApplied: (edition: string, druidLevel: number) => {
    analytics.track('wild_shape_applied', { edition, druidLevel });
  },

  characterCreated: (edition: string) => {
    analytics.track('character_created', { edition });
  },
};
```

---

## 26. App Configuration Files

### `app.json` (Expo Config)
```json
{
  "expo": {
    "name": "Wild Shape Tracker",
    "slug": "wild-shape-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f172a"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.wildshape.tracker",
      "infoPlist": {
        "NSCameraUsageDescription": "This app needs access to the camera to capture form images.",
        "NSPhotoLibraryUsageDescription": "This app needs access to your photo library to select form images."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0f172a"
      },
      "package": "com.wildshape.tracker",
      "permissions": ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-router",
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you select images for your wild shape forms."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
        secondary: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        accent: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      fontFamily: {
        heading: ['Cinzel-Bold'],
        body: ['Inter-Regular'],
        mono: ['JetBrainsMono-Regular'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
```

### `tsconfig.json`
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "jsx": "react-native",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/services/*": ["./src/services/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

---

## 27. Component Examples

### 27.1 Stat Delta Display Component
```typescript
// src/components/common/StatDeltaRow.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

interface StatDeltaRowProps {
  label: string;
  before: number | string;
  after: number | string;
  showDelta?: boolean;
}

export function StatDeltaRow({ 
  label, 
  before, 
  after, 
  showDelta = true 
}: StatDeltaRowProps) {
  const delta = typeof before === 'number' && typeof after === 'number'
    ? after - before
    : null;

  const getDeltaColor = (value: number) => {
    if (value > 0) return 'text-green-500';
    if (value < 0) return 'text-red-500';
    return 'text-slate-400';
  };

  return (
    <View className="flex-row items-center justify-between py-3 px-4 bg-slate-800/50 rounded-lg mb-2">
      <Text className="text-slate-300 font-medium flex-1">{label}</Text>
      
      <View className="flex-row items-center gap-2">
        <Text className="text-slate-400 font-mono">{before}</Text>
        <ArrowRight size={16} color="#94a3b8" />
        <Text className="text-white font-mono font-bold">{after}</Text>
        
        {showDelta && delta !== null && delta !== 0 && (
          <Text className={`font-mono font-bold ml-2 ${getDeltaColor(delta)}`}>
            ({delta > 0 ? '+' : ''}{delta})
          </Text>
        )}
      </View>
    </View>
  );
}
```

### 27.2 Size Badge Component
```typescript
// src/components/common/SizeBadge.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Size } from '@/types/core';

interface SizeBadgeProps {
  size: Size;
}

const SIZE_COLORS: Record<Size, string> = {
  Fine: 'bg-purple-500/20 text-purple-300',
  Diminutive: 'bg-purple-500/20 text-purple-300',
  Tiny: 'bg-blue-500/20 text-blue-300',
  Small: 'bg-cyan-500/20 text-cyan-300',
  Medium: 'bg-green-500/20 text-green-300',
  Large: 'bg-yellow-500/20 text-yellow-300',
  Huge: 'bg-orange-500/20 text-orange-300',
  Gargantuan: 'bg-red-500/20 text-red-300',
  Colossal: 'bg-red-600/20 text-red-400',
};

export function SizeBadge({ size }: SizeBadgeProps) {
  const colorClass = SIZE_COLORS[size];

  return (
    <View className={`px-3 py-1 rounded-full ${colorClass}`}>
      <Text className="text-xs font-bold uppercase tracking-wide">
        {size}
      </Text>
    </View>
  );
}
```

### 27.3 Natural Attack Display
```typescript
// src/components/forms/NaturalAttackCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { NaturalAttack } from '@/types/core';
import { Swords } from 'lucide-react-native';

interface NaturalAttackCardProps {
  attack: NaturalAttack;
  attackBonus: number; // Calculated from BAB + Str/Dex
}

export function NaturalAttackCard({ attack, attackBonus }: NaturalAttackCardProps) {
  const isPrimary = attack.type === 'primary';
  const finalBonus = isPrimary ? attackBonus : attackBonus - 5;

  return (
    <View className="bg-slate-800 rounded-xl p-4 mb-3 border border-slate-700">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Swords size={20} color="#10b981" />
          <Text className="text-white font-bold text-lg">
            {attack.name}
            {attack.count && attack.count > 1 && ` (×${attack.count})`}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded ${isPrimary ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
          <Text className={`text-xs font-bold ${isPrimary ? 'text-emerald-300' : 'text-amber-300'}`}>
            {attack.type.toUpperCase()}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-4">
        <View>
          <Text className="text-slate-400 text-xs mb-1">Attack</Text>
          <Text className="text-white font-mono font-bold">
            +{finalBonus}
          </Text>
        </View>

        <View>
          <Text className="text-slate-400 text-xs mb-1">Damage</Text>
          <Text className="text-white font-mono font-bold">
            {attack.damage}
          </Text>
        </View>

        {attack.critRange && (
          <View>
            <Text className="text-slate-400 text-xs mb-1">Crit</Text>
            <Text className="text-white font-mono font-bold">
              {attack.critRange}/{attack.critMultiplier || '×2'}
            </Text>
          </View>
        )}
      </View>

      {attack.special && attack.special.length > 0 && (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {attack.special.map((ability) => (
            <View key={ability} className="bg-purple-500/20 px-2 py-1 rounded">
              <Text className="text-purple-300 text-xs font-medium">
                {ability}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
```

### 27.4 Filter Bar Component
```typescript
// src/components/common/FilterBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';

interface FilterBarProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
}

export function FilterBar({ 
  tags, 
  selectedTags, 
  onTagToggle, 
  onClearAll 
}: FilterBarProps) {
  if (tags.length === 0) return null;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-slate-400 font-medium">Filter by Tags</Text>
        {selectedTags.length > 0 && (
          <TouchableOpacity
            onPress={onClearAll}
            className="flex-row items-center gap-1"
          >
            <X size={16} color="#94a3b8" />
            <Text className="text-slate-400 text-sm">Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="flex-row gap-2"
      >
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              onPress={() => onTagToggle(tag)}
              className={`px-4 py-2 rounded-full ${
                isSelected 
                  ? 'bg-emerald-600' 
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              <Text
                className={`font-medium ${
                  isSelected ? 'text-white' : 'text-slate-300'
                }`}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
```

---

## 28. Screen Layout Examples

### 28.1 Dashboard Screen
```typescript
// src/app/(tabs)/index.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useCharacterStore } from '@/stores/characterStore';
import { useCharacter } from '@/hooks/useCharacter';
import { UsesCounter } from '@/components/dashboard/UsesCounter';
import { ActiveFormCard } from '@/components/dashboard/ActiveFormCard';
import { Sparkles, User } from 'lucide-react-native';

export default function DashboardScreen() {
  const { activeCharacterId, computedCharacter, activeFormId } = useCharacterStore();
  const { data: character } = useCharacter(activeCharacterId || '');

  if (!character || !activeCharacterId) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-950 p-6">
        <User size={64} color="#475569" />
        <Text className="text-slate-400 text-lg mt-4">
          No character selected
        </Text>
        <TouchableOpacity className="mt-4 bg-emerald-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Create Character</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="p-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-slate-400 text-sm mb-1">Character</Text>
          <Text className="text-white text-3xl font-bold">
            {character.name}
          </Text>
          <Text className="text-slate-400 text-sm mt-1">
            Level {character.base_stats.level} Druid • {character.edition.toUpperCase()}
          </Text>
        </View>

        {/* Daily Uses Counter */}
        <UsesCounter
          current={character.daily_uses_current || 0}
          max={character.daily_uses_max}
          onIncrement={() => {/* implement */}}
          onDecrement={() => {/* implement */}}
          onReset={() => {/* implement */}}
        />

        {/* Active Form */}
        {computedCharacter && activeFormId && (
          <View className="mt-6">
            <Text className="text-slate-400 text-sm mb-3 flex-row items-center gap-2">
              <Sparkles size={16} color="#10b981" />
              Currently Wild Shaped
            </Text>
            <ActiveFormCard 
              computed={computedCharacter}
              formId={activeFormId}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View className="mt-6">
          <Text className="text-slate-400 text-sm mb-3">Quick Actions</Text>
          <View className="gap-3">
            <TouchableOpacity className="bg-slate-800 p-4 rounded-xl flex-row items-center justify-between">
              <Text className="text-white font-medium">Browse Wild Shapes</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-slate-800 p-4 rounded-xl flex-row items-center justify-between">
              <Text className="text-white font-medium">Edit Character</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
```

### 28.2 Forms Library Screen
```typescript
// src/app/(tabs)/forms.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useCharacterStore } from '@/stores/characterStore';
import { useForms } from '@/hooks/useForms';
import { useUIStore } from '@/stores/uiStore';
import { WildShapeCard } from '@/components/forms/WildShapeCard';
import { FilterBar } from '@/components/common/FilterBar';
import { Grid, List, Heart } from 'lucide-react-native';

export default function FormsScreen() {
  const { activeCharacterId } = useCharacterStore();
  const { data: forms, isLoading } = useForms(activeCharacterId || '');
  const { formsView, setFormsView, filterTags, setFilterTags } = useUIStore();

  // Extract unique tags from all forms
  const allTags = React.useMemo(() => {
    if (!forms) return [];
    const tags = new Set<string>();
    forms.forEach((form) => form.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [forms]);

  // Filter forms
  const filteredForms = React.useMemo(() => {
    if (!forms) return [];
    if (filterTags.length === 0) return forms;
    return forms.filter((form) =>
      filterTags.some((tag) => form.tags.includes(tag))
    );
  }, [forms, filterTags]);

  const handleTagToggle = (tag: string) => {
    setFilterTags(
      filterTags.includes(tag)
        ? filterTags.filter((t) => t !== tag)
        : [...filterTags, tag]
    );
  };

  return (
    <View className="flex-1 bg-slate-950">
      <View className="p-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-2xl font-bold">Wild Shapes</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setFormsView('cards')}
              className={`p-2 rounded-lg ${
                formsView === 'cards' ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
            >
              <Grid size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFormsView('list')}
              className={`p-2 rounded-lg ${
                formsView === 'list' ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
            >
              <List size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <FilterBar
          tags={allTags}
          selectedTags={filterTags}
          onTagToggle={handleTagToggle}
          onClearAll={() => setFilterTags([])}
        />
      </View>

      {/* Forms List */}
      <FlatList
        data={filteredForms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WildShapeCard form={item} />
        )}
        contentContainerClassName="px-6 pb-6"
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-slate-400">No forms found</Text>
          </View>
        }
      />
    </View>
  );
}
```

---

## 29. Documentation Structure

Create these documentation files in `/docs`:

### `README.md` - Project Overview
### `SETUP.md` - Development Environment Setup
### `API.md` - API Service Documentation
### `RULES_ENGINE.md` - PF1e Rules Implementation
### `CALCULATIONS.md` - Stat Calculation Reference
### `CONTRIBUTING.md` - Contribution Guidelines
### `CHANGELOG.md` - Version History

---

## 30. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx expo export
```

---

## 31. Final Checklist Before Launch

- [ ] All database migrations tested and documented
- [ ] Seed data for 15+ PF1e templates
- [ ] Authentication flow fully tested
- [ ] Offline mode works correctly
- [ ] Image upload/download tested
- [ ] Rules engine calculations verified against rulebook
- [ ] All screens have loading/error states
- [ ] Dark theme fully implemented
- [ ] Accessibility tested with screen reader
- [ ] Privacy policy and terms of service written
- [ ] App store assets prepared (screenshots, description)
- [ ] Beta testing completed with feedback addressed
- [ ] Performance profiling completed
- [ ] Security audit passed
- [ ] Backup/restore functionality tested

---

## 32. Support & Maintenance Plan

### User Support Channels
- In-app feedback form
- Email: support@wildshapetracker.app
- Discord community server
- GitHub issues for bug reports

### Update Cadence
- **Hotfixes**: Within 24-48 hours for critical bugs
- **Minor updates**: Bi-weekly (bug fixes, small features)
- **Major updates**: Quarterly (new editions, major features)

### Monitoring
- Crash reporting (Sentry)
- Performance monitoring (Expo Application Services)
- User analytics (PostHog/Mixpanel)
- Database performance (Supabase Dashboard)

---

## Summary

This comprehensive schema provides everything needed to build the Wild Shape Tracker app with Claude Code. The project is structured for:

✅ **Clear architecture** with separation of concerns  
✅ **Type safety** throughout with TypeScript and Zod  
✅ **Offline-first** capability with TanStack Query  
✅ **Scalable database** schema with proper RLS  
✅ **Smooth UX** with Reanimated animations  
✅ **Maintainable codebase** with clear patterns  
✅ **Production-ready** features and security  