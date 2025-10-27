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
  // Beast Shape I (Small and Medium animals)
  'Beast Shape I': {
    Small: { dex: +2, naturalArmor: +1 },
    Medium: { str: +2, naturalArmor: +2 },
  },

  // Beast Shape II (Tiny to Large animals)
  'Beast Shape II': {
    Tiny: { dex: +4, str: -2, naturalArmor: +1 },
    Small: { dex: +2, naturalArmor: +1 },
    Medium: { str: +2, naturalArmor: +2 },
    Large: { str: +4, dex: -2, naturalArmor: +4 },
  },

  // Beast Shape III (Diminutive to Huge animals, Small/Medium magical beasts)
  'Beast Shape III': {
    Diminutive: { dex: +6, str: -4, naturalArmor: +1 },
    Tiny: { dex: +4, str: -2, naturalArmor: +1 },
    Small: { dex: +4, naturalArmor: +2 },
    Medium: { str: +4, naturalArmor: +4 },
    Large: { str: +4, dex: -2, naturalArmor: +4 },
    Huge: { str: +6, dex: -4, naturalArmor: +6 },
  },

  // Beast Shape IV (Diminutive to Huge animals, Tiny to Large magical beasts)
  'Beast Shape IV': {
    Diminutive: { dex: +6, str: -4, naturalArmor: +1 },
    Tiny: { dex: +8, str: -2, naturalArmor: +3 },
    Small: { dex: +4, str: +2, naturalArmor: +2 },
    Medium: { str: +4, dex: +2, naturalArmor: +4 },
    Large: { str: +6, dex: -2, con: +2, naturalArmor: +6 },
    Huge: { str: +8, dex: -4, con: +4, naturalArmor: +8 },
  },

  // Elemental Body I (Small or Medium elementals)
  'Elemental Body I': {
    Small: { dex: +2, naturalArmor: +2 },
    Medium: { str: +2, naturalArmor: +4 },
  },

  // Elemental Body II (Small to Large elementals)
  'Elemental Body II': {
    Small: { dex: +4, naturalArmor: +3 },
    Medium: { str: +4, naturalArmor: +6 },
    Large: { str: +4, dex: -2, con: +4, naturalArmor: +6 },
  },

  // Elemental Body III (Small to Huge elementals)
  'Elemental Body III': {
    Small: { dex: +6, naturalArmor: +4 },
    Medium: { str: +6, naturalArmor: +8 },
    Large: { str: +6, dex: -2, con: +6, naturalArmor: +8 },
    Huge: { str: +8, dex: -2, con: +6, naturalArmor: +10 },
  },

  // Elemental Body IV (Small to Huge elementals)
  'Elemental Body IV': {
    Small: { dex: +8, naturalArmor: +5 },
    Medium: { str: +8, naturalArmor: +10 },
    Large: { str: +8, dex: -2, con: +8, naturalArmor: +10 },
    Huge: { str: +10, dex: -2, con: +8, naturalArmor: +12 },
  },

  // Plant Shape I (Small or Medium plants)
  'Plant Shape I': {
    Small: { con: +2, naturalArmor: +2 },
    Medium: { str: +2, con: +2, naturalArmor: +2 },
  },

  // Plant Shape II (Small to Large plants)
  'Plant Shape II': {
    Small: { dex: +2, con: +4, naturalArmor: +4 },
    Medium: { str: +4, dex: +2, con: +4, naturalArmor: +4 },
    Large: { str: +6, dex: -2, con: +6, naturalArmor: +6 },
  },

  // Plant Shape III (Small to Huge plants)
  'Plant Shape III': {
    Small: { dex: +4, con: +6, naturalArmor: +6 },
    Medium: { str: +6, dex: +4, con: +6, naturalArmor: +6 },
    Large: { str: +8, dex: -2, con: +8, naturalArmor: +8 },
    Huge: { str: +10, dex: -2, con: +10, naturalArmor: +10 },
  },
};

/**
 * Get size modifiers for a given tier and size
 */
export function getSizeModifiers(tier: Tier, size: CreatureSize): SizeModifiers {
  return SIZE_TO_ABILITY[tier]?.[size] || {};
}
