/**
 * Pathfinder 1e Tier Definitions
 *
 * Druid level gating and tier-specific ability/natural armor bonuses.
 */

import { Tier } from './types';
import { CreatureSize } from '@/types/firestore';

// ============================================================================
// EDL TO AVAILABLE TIERS
// ============================================================================

export interface TierAvailability {
  animal: Tier;
  elemental?: Tier;
  plant?: Tier;
  sizes: CreatureSize[];
}

/**
 * Effective Druid Level (EDL) to available tiers and sizes
 * Based on Druid Wild Shape progression
 */
export const EDL_TO_TIERS: Record<number, TierAvailability> = {
  4: {
    animal: 'Beast Shape I',
    sizes: ['Small', 'Medium'],
  },
  6: {
    animal: 'Beast Shape II',
    elemental: 'Elemental Body I',
    sizes: ['Tiny', 'Small', 'Medium', 'Large'],
  },
  8: {
    animal: 'Beast Shape III',
    elemental: 'Elemental Body II',
    plant: 'Plant Shape I',
    sizes: ['Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge'],
  },
  10: {
    animal: 'Beast Shape III',
    elemental: 'Elemental Body III',
    plant: 'Plant Shape II',
    sizes: ['Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge'],
  },
  12: {
    animal: 'Beast Shape III',
    elemental: 'Elemental Body IV',
    plant: 'Plant Shape III',
    sizes: ['Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge'],
  },
  // 14+ keeps the same tiers
  14: {
    animal: 'Beast Shape III',
    elemental: 'Elemental Body IV',
    plant: 'Plant Shape III',
    sizes: ['Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge'],
  },
  16: {
    animal: 'Beast Shape III',
    elemental: 'Elemental Body IV',
    plant: 'Plant Shape III',
    sizes: ['Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge'],
  },
  18: {
    animal: 'Beast Shape III',
    elemental: 'Elemental Body IV',
    plant: 'Plant Shape III',
    sizes: ['Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge'],
  },
  20: {
    animal: 'Beast Shape III',
    elemental: 'Elemental Body IV',
    plant: 'Plant Shape III',
    sizes: ['Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge'],
  },
};

/**
 * Get tier availability for a given EDL
 * Falls back to nearest lower level if exact match not found
 */
export function getTierForEDL(edl: number): TierAvailability | null {
  if (edl < 4) return null;

  // Find the highest available tier <= edl
  const levels = Object.keys(EDL_TO_TIERS)
    .map(Number)
    .filter((lvl) => lvl <= edl)
    .sort((a, b) => b - a);

  return levels.length > 0 ? EDL_TO_TIERS[levels[0]] : null;
}

// ============================================================================
// SIZE-BASED ABILITY & NATURAL ARMOR BONUSES
// ============================================================================

export interface SizeModifiers {
  str?: number;
  dex?: number;
  con?: number;
  naturalArmor?: number;
}

/**
 * Size-specific ability/natural armor adjustments by tier
 * These are "size bonuses" from the spell descriptions
 */
export const SIZE_TO_ABILITY: Record<Tier, Partial<Record<CreatureSize, SizeModifiers>>> = {
  // Beast Shape I
  'Beast Shape I': {
    Small: { dex: +2, naturalArmor: +1 },
    Medium: { str: +2, naturalArmor: +2 },
  },

  // Beast Shape II
  'Beast Shape II': {
    Tiny: { dex: +4, str: -2, naturalArmor: +1 },
    Large: { str: +4, dex: -2, naturalArmor: +4 },
  },

  // Beast Shape III
  'Beast Shape III': {
    Diminutive: { dex: +6, str: -4, naturalArmor: +1 },
    Huge: { str: +6, dex: -4, naturalArmor: +6 },
    // Magical beast variants (small/medium)
    Small: { dex: +4, naturalArmor: +2 },
    Medium: { str: +4, naturalArmor: +4 },
  },

  // Beast Shape IV (rarely used but included for completeness)
  'Beast Shape IV': {
    Diminutive: { dex: +6, str: -4, naturalArmor: +1 },
    Huge: { str: +6, dex: -4, naturalArmor: +6 },
  },

  // Elemental Body tiers (handled in elemental.ts)
  'Elemental Body I': {},
  'Elemental Body II': {},
  'Elemental Body III': {},
  'Elemental Body IV': {},

  // Plant Shape tiers (handled in plant.ts)
  'Plant Shape I': {},
  'Plant Shape II': {},
  'Plant Shape III': {},
};

/**
 * Get size modifiers for a given tier and size
 */
export function getSizeModifiers(tier: Tier, size: CreatureSize): SizeModifiers {
  return SIZE_TO_ABILITY[tier]?.[size] || {};
}
