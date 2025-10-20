// WildWright TypeScript Type Definitions
// Extracted from PROJECT_SCHEMA.md Section 4

// ========================================
// Core Types (src/types/core.ts)
// ========================================

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

// ========================================
// Pathfinder 1e Specific (src/types/pf1e.ts)
// ========================================

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
