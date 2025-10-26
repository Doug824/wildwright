/**
 * Pathfinder 1e Wild Shape Calculation Types
 *
 * Types specific to the PF1e calculation engine.
 * Works alongside the main Firestore types.
 */

import { CreatureSize, AbilityScores } from '@/types/firestore';

// ============================================================================
// TIER & SPELL TYPES
// ============================================================================

export type Tier =
  | 'Beast Shape I'
  | 'Beast Shape II'
  | 'Beast Shape III'
  | 'Beast Shape IV'
  | 'Elemental Body I'
  | 'Elemental Body II'
  | 'Elemental Body III'
  | 'Elemental Body IV'
  | 'Plant Shape I'
  | 'Plant Shape II'
  | 'Plant Shape III';

export type ElementType = 'Air' | 'Earth' | 'Fire' | 'Water';
export type FormKind = 'Animal' | 'Magical Beast' | 'Elemental' | 'Plant';
export type FlyManeuverability = 'Clumsy' | 'Poor' | 'Average' | 'Good' | 'Perfect';

// ============================================================================
// BASE CHARACTER FOR CALCULATIONS
// ============================================================================

export interface BaseCharacter {
  level: number;
  effectiveDruidLevel: number; // EDL for wild shape gating
  ability: AbilityScores;
  hp: { max: number; current: number };
  bab: number;
  ac: {
    armor: number;
    shield: number;
    natural: number;
    deflection: number;
    dodge: number;
    misc: number;
  };
  saves: { fortitude: number; reflex: number; will: number };
  movement: {
    land?: number;
    fly?: number;
    flyManeuver?: FlyManeuverability;
    swim?: number;
    climb?: number;
    burrow?: number;
  };
  senses: {
    darkvision?: number;
    lowLight?: boolean;
    scent?: boolean;
    tremorsense?: number;
    blindsense?: number;
  };
  feats?: string[];
  traits?: string[];
}

// ============================================================================
// NATURAL ATTACK
// ============================================================================

export interface NaturalAttack {
  type: 'bite' | 'claw' | 'gore' | 'slam' | 'talon' | 'sting' | 'tail' | 'wing' | 'other';
  dice: string; // e.g., "1d6" baseline at Medium
  count?: number; // default 1
  primary?: boolean; // default true
  traits?: string[]; // e.g., ["grab", "trip"]
}

// ============================================================================
// FORM DEFINITION
// ============================================================================

export interface Form {
  id: string;
  name: string;
  kind: FormKind;
  archetype?: string; // e.g., "Quadruped", "Feline"
  baseSize: CreatureSize; // Native size of the creature
  naturalAttacks: NaturalAttack[]; // Dice given at Medium baseline
  movement: {
    land?: number;
    fly?: number;
    flyManeuver?: FlyManeuverability;
    swim?: number;
    climb?: number;
    burrow?: number;
  };
  senses: {
    darkvision?: number;
    lowLight?: boolean;
    scent?: boolean;
    blindsense?: number;
    tremorsense?: number;
  };
  traits: string[]; // e.g., ["pounce", "grab", "trip"]
  tags?: string[]; // e.g., ["Quadruped", "Feline"]
  requirements?: {
    spellEquivalent?: Tier;
    minEDL?: number;
  };
  // Optional for elementals
  element?: ElementType;
}

// ============================================================================
// EXPLANATION STACK
// ============================================================================

export interface Explain {
  target: string; // e.g., "ac.total", "attack.bite.attackBonus"
  label: string; // "Beast Shape II — size bonus"
  delta: number | string;
  source: 'base' | 'form' | 'tier' | 'size' | 'calc' | 'condition' | 'manual';
}

// ============================================================================
// COMPUTED ATTACK
// ============================================================================

export interface ComputedAttack {
  name: string; // "Bite", "Claw"
  count: number; // 1 or 2
  attackBonus: number; // to-hit
  damageDice: string; // e.g., "1d8+7"
  traits?: string[]; // e.g., ["Grab"]
  explain: Explain[];
}

// ============================================================================
// COMPUTED PLAYSHEET
// ============================================================================

export interface ComputedPlaysheet {
  size: CreatureSize;
  ability: AbilityScores;
  hp: { max: number; current: number; temp?: number };
  ac: {
    total: number;
    touch: number;
    flatFooted: number;
    breakdown: {
      base: number;
      armor: number;
      shield: number;
      natural: number;
      deflection: number;
      dodge: number;
      size: number;
      dex: number;
      misc: number;
    };
    explain: Explain[];
  };
  saves: {
    fortitude: number;
    reflex: number;
    will: number;
    explain: Explain[];
  };
  movement: {
    land: number;
    fly?: number;
    flyManeuver?: FlyManeuverability;
    swim?: number;
    climb?: number;
    burrow?: number;
  };
  senses: {
    darkvision?: number;
    lowLight?: boolean;
    scent?: boolean;
    tremorsense?: number;
    blindsense?: number;
  };
  traits: string[];
  attacks: ComputedAttack[];
  explain: Explain[]; // General notes
}

// ============================================================================
// COMPUTE INPUT
// ============================================================================

export interface ComputeInput {
  base: BaseCharacter;
  form: Form;
  chosenSize?: CreatureSize; // Optional if user wants size variant
  tier: Tier;
  element?: ElementType; // Required when tier is Elemental Body
}
