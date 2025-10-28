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
  // Beast Shape I - Small and Medium animals only
  'Beast Shape I': {
    Small: { dex: +2, naturalArmor: +1 },
    Medium: { str: +2, naturalArmor: +2 },
  },

  // Beast Shape II - Tiny to Large animals
  'Beast Shape II': {
    Tiny: { dex: +4, str: -2, naturalArmor: +1 },
    Small: { dex: +2, naturalArmor: +1 },
    Medium: { str: +2, naturalArmor: +2 },
    Large: { str: +4, dex: -2, naturalArmor: +4 },
  },

  // Beast Shape III - Diminutive/Huge animals OR Small/Medium magical beasts
  'Beast Shape III': {
    Diminutive: { dex: +6, str: -4, naturalArmor: +1 }, // Animal
    Tiny: { dex: +4, str: -2, naturalArmor: +1 },       // Animal (same as BS II)
    Small: { dex: +4, naturalArmor: +2 },                // Magical beast
    Medium: { str: +4, naturalArmor: +4 },               // Magical beast
    Large: { str: +4, dex: -2, naturalArmor: +4 },       // Animal (same as BS II)
    Huge: { str: +6, dex: -4, naturalArmor: +6 },        // Animal
  },

  // Beast Shape IV - Not used by Druids (they cap at Beast Shape III)
  'Beast Shape IV': {
    // Druids don't get this, but including for completeness
    Diminutive: { dex: +6, str: -4, naturalArmor: +1 },
    Tiny: { dex: +4, str: -2, naturalArmor: +1 },
    Small: { dex: +4, naturalArmor: +2 },
    Medium: { str: +4, naturalArmor: +4 },
    Large: { str: +4, dex: -2, naturalArmor: +4 },
    Huge: { str: +6, dex: -4, naturalArmor: +6 },
  },

  // Elemental Body I - Small elementals only
  // NOTE: Bonuses vary by element type (air/earth/fire/water)
  // Showing average - app should check element type for exact bonuses
  'Elemental Body I': {
    Small: { dex: +2, naturalArmor: +2 }, // Air/Fire get +2 Dex, Earth gets +2 Str, Water gets +2 Con
  },

  // Elemental Body II - Small and Medium elementals
  // NOTE: Bonuses vary by element type
  'Elemental Body II': {
    Small: { dex: +2, naturalArmor: +2 },  // Same as Elemental Body I
    Medium: { dex: +4, naturalArmor: +3 }, // Air/Fire get +4 Dex, Earth gets +4 Str, Water gets +4 Con
  },

  // Elemental Body III - Small, Medium, Large elementals
  // NOTE: Bonuses vary significantly by element type
  'Elemental Body III': {
    Small: { dex: +2, naturalArmor: +2 },         // Same as previous
    Medium: { dex: +4, naturalArmor: +3 },        // Same as previous
    Large: { str: +2, dex: +4, naturalArmor: +4 }, // VARIES: Air: +2 Str, +4 Dex; Earth: +6 Str, -2 Dex, +2 Con; etc.
  },

  // Elemental Body IV - Small, Medium, Large, Huge elementals
  // NOTE: Bonuses vary significantly by element type
  'Elemental Body IV': {
    Small: { dex: +2, naturalArmor: +2 },         // Same as previous
    Medium: { dex: +4, naturalArmor: +3 },        // Same as previous
    Large: { str: +2, dex: +4, naturalArmor: +4 }, // Same as previous
    Huge: { str: +4, dex: +6, naturalArmor: +4 },  // VARIES by element significantly
  },

  // Plant Shape I - Small and Medium plants
  'Plant Shape I': {
    Small: { con: +2, naturalArmor: +2 },
    Medium: { str: +2, con: +2, naturalArmor: +2 },
  },

  // Plant Shape II - Small, Medium, Large plants
  'Plant Shape II': {
    Small: { con: +2, naturalArmor: +2 },         // Same as Plant Shape I
    Medium: { str: +2, con: +2, naturalArmor: +2 }, // Same as Plant Shape I
    Large: { str: +4, con: +2, naturalArmor: +4 },
  },

  // Plant Shape III - Small, Medium, Large, Huge plants
  'Plant Shape III': {
    Small: { con: +2, naturalArmor: +2 },           // Same as previous
    Medium: { str: +2, con: +2, naturalArmor: +2 }, // Same as previous
    Large: { str: +4, con: +2, naturalArmor: +4 },  // Same as previous
    Huge: { str: +8, dex: -2, con: +4, naturalArmor: +6 },
  },
};

/**
 * Element-specific modifiers for Elemental Body spells
 * Elementals have different bonuses based on their element type
 */
export const ELEMENTAL_MODIFIERS: Record<string, Partial<Record<CreatureSize, SizeModifiers>>> = {
  'Air': {
    Small: { dex: +2, naturalArmor: +2 },         // Elemental Body I
    Medium: { dex: +4, naturalArmor: +3 },        // Elemental Body II
    Large: { str: +2, dex: +4, naturalArmor: +4 }, // Elemental Body III
    Huge: { str: +4, dex: +6, naturalArmor: +4 },  // Elemental Body IV
  },
  'Earth': {
    Small: { str: +2, naturalArmor: +4 },         // Elemental Body I
    Medium: { str: +4, naturalArmor: +5 },        // Elemental Body II
    Large: { str: +6, dex: -2, con: +2, naturalArmor: +6 }, // Elemental Body III
    Huge: { str: +8, dex: -2, con: +4, naturalArmor: +6 },  // Elemental Body IV
  },
  'Fire': {
    Small: { dex: +2, naturalArmor: +2 },         // Elemental Body I
    Medium: { dex: +4, naturalArmor: +3 },        // Elemental Body II
    Large: { dex: +4, con: +2, naturalArmor: +4 }, // Elemental Body III
    Huge: { dex: +6, con: +4, naturalArmor: +4 },  // Elemental Body IV
  },
  'Water': {
    Small: { con: +2, naturalArmor: +4 },         // Elemental Body I
    Medium: { con: +4, naturalArmor: +5 },        // Elemental Body II
    Large: { str: +2, dex: -2, con: +6, naturalArmor: +6 }, // Elemental Body III
    Huge: { str: +4, dex: -2, con: +8, naturalArmor: +6 },  // Elemental Body IV
  },
};

/**
 * Get size modifiers for a given tier and size
 * For elementals, also checks element type if provided
 */
export function getSizeModifiers(tier: Tier, size: CreatureSize, elementType?: string): SizeModifiers {
  // Check if this is an elemental form and we have element type
  if (tier.includes('Elemental') && elementType) {
    const normalized = elementType.charAt(0).toUpperCase() + elementType.slice(1).toLowerCase();
    return ELEMENTAL_MODIFIERS[normalized]?.[size] || SIZE_TO_ABILITY[tier]?.[size] || {};
  }

  return SIZE_TO_ABILITY[tier]?.[size] || {};
}
