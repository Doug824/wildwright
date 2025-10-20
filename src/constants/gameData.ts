/**
 * Game Data Constants
 *
 * Constants for game systems, creature sizes, and other game-related data.
 */

import { GameEdition, CreatureSize } from '@/types/firestore';

// ============================================================================
// GAME EDITIONS
// ============================================================================

export const GAME_EDITIONS: Record<GameEdition, string> = {
  pf1e: 'Pathfinder 1e',
  dnd5e: 'D&D 5e',
  pf2e: 'Pathfinder 2e',
};

export const DEFAULT_EDITION: GameEdition = 'pf1e';

// ============================================================================
// CREATURE SIZES
// ============================================================================

export const CREATURE_SIZES: CreatureSize[] = [
  'Fine',
  'Diminutive',
  'Tiny',
  'Small',
  'Medium',
  'Large',
  'Huge',
  'Gargantuan',
  'Colossal',
];

export const SIZE_MODIFIERS: Record<CreatureSize, { ac: number; attack: number }> = {
  Fine: { ac: 8, attack: 8 },
  Diminutive: { ac: 4, attack: 4 },
  Tiny: { ac: 2, attack: 2 },
  Small: { ac: 1, attack: 1 },
  Medium: { ac: 0, attack: 0 },
  Large: { ac: -1, attack: -1 },
  Huge: { ac: -2, attack: -2 },
  Gargantuan: { ac: -4, attack: -4 },
  Colossal: { ac: -8, attack: -8 },
};

// ============================================================================
// WILD SHAPE SPELL LEVELS (PF1E)
// ============================================================================

export const PF1E_WILD_SHAPE_SPELLS = [
  'Beast Shape I',
  'Beast Shape II',
  'Beast Shape III',
  'Beast Shape IV',
  'Elemental Body I',
  'Elemental Body II',
  'Elemental Body III',
  'Elemental Body IV',
  'Plant Shape I',
  'Plant Shape II',
  'Plant Shape III',
] as const;

export type PF1eWildShapeSpell = typeof PF1E_WILD_SHAPE_SPELLS[number];

// Minimum druid level required for each spell
export const PF1E_SPELL_REQUIREMENTS: Record<PF1eWildShapeSpell, number> = {
  'Beast Shape I': 4,
  'Beast Shape II': 6,
  'Beast Shape III': 8,
  'Beast Shape IV': 10,
  'Elemental Body I': 8,
  'Elemental Body II': 10,
  'Elemental Body III': 12,
  'Elemental Body IV': 14,
  'Plant Shape I': 10,
  'Plant Shape II': 12,
  'Plant Shape III': 14,
};

// ============================================================================
// COMMON TAGS
// ============================================================================

export const COMMON_FORM_TAGS = {
  // Spell types
  SPELL: PF1E_WILD_SHAPE_SPELLS,

  // Movement types
  MOVEMENT: ['terrestrial', 'aquatic', 'flying', 'burrowing'] as const,

  // Body types
  BODY_TYPE: ['quadruped', 'biped', 'serpentine', 'amorphous'] as const,

  // Environments
  ENVIRONMENT: [
    'forest',
    'desert',
    'arctic',
    'aquatic',
    'mountain',
    'plains',
    'swamp',
    'underground',
  ] as const,

  // Combat roles
  ROLE: ['tank', 'damage', 'mobility', 'utility', 'stealth'] as const,
} as const;

// ============================================================================
// ABILITY SCORES
// ============================================================================

export const ABILITY_SCORES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

export const ABILITY_NAMES: Record<typeof ABILITY_SCORES[number], string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export const ABILITY_SHORT_NAMES: Record<typeof ABILITY_SCORES[number], string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
};

// Calculate ability modifier from score
export const calculateAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

// ============================================================================
// COMMON SKILLS (PF1E)
// ============================================================================

export const PF1E_SKILLS = [
  'Acrobatics',
  'Appraise',
  'Bluff',
  'Climb',
  'Craft',
  'Diplomacy',
  'Disable Device',
  'Disguise',
  'Escape Artist',
  'Fly',
  'Handle Animal',
  'Heal',
  'Intimidate',
  'Knowledge (arcana)',
  'Knowledge (dungeoneering)',
  'Knowledge (engineering)',
  'Knowledge (geography)',
  'Knowledge (history)',
  'Knowledge (local)',
  'Knowledge (nature)',
  'Knowledge (nobility)',
  'Knowledge (planes)',
  'Knowledge (religion)',
  'Linguistics',
  'Perception',
  'Perform',
  'Profession',
  'Ride',
  'Sense Motive',
  'Sleight of Hand',
  'Spellcraft',
  'Stealth',
  'Survival',
  'Swim',
  'Use Magic Device',
] as const;

// ============================================================================
// SPECIAL ABILITIES
// ============================================================================

export const COMMON_SPECIAL_ABILITIES = [
  'grab',
  'pounce',
  'rake',
  'trip',
  'constrict',
  'poison',
  'swallow whole',
  'trample',
  'web',
  'breath weapon',
] as const;

// ============================================================================
// SENSES
// ============================================================================

export const COMMON_SENSES = [
  'low-light vision',
  'darkvision',
  'scent',
  'tremorsense',
  'blindsense',
  'blindsight',
] as const;
