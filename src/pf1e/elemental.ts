/**
 * Pathfinder 1e Elemental Body Grants
 *
 * Element-specific bonuses, movement, senses, and traits for Elemental Body spells.
 */

import { Tier, ElementType, FlyManeuverability } from './types';
import { CreatureSize } from '@/types/firestore';
import { SizeModifiers } from './tiers';

// ============================================================================
// ELEMENTAL SIZE BONUSES
// ============================================================================

/**
 * Elemental Body size-based ability and natural armor bonuses
 * Organized by tier, then element, then size
 */
export const ELEMENTAL_SIZE_BONUS: Record<
  string,
  Partial<Record<ElementType, Partial<Record<CreatureSize, SizeModifiers>>>>
> = {
  'Elemental Body I': {
    Air: {
      Small: { dex: +2, naturalArmor: +2 },
    },
    Earth: {
      Small: { str: +2, naturalArmor: +4 },
    },
    Fire: {
      Small: { dex: +2, naturalArmor: +2 },
    },
    Water: {
      Small: { con: +2, naturalArmor: +4 },
    },
  },

  'Elemental Body II': {
    Air: {
      Medium: { dex: +4, naturalArmor: +3 },
    },
    Earth: {
      Medium: { str: +4, naturalArmor: +5 },
    },
    Fire: {
      Medium: { dex: +4, naturalArmor: +3 },
    },
    Water: {
      Medium: { con: +4, naturalArmor: +5 },
    },
  },

  'Elemental Body III': {
    Air: {
      Large: { str: +2, dex: +4, naturalArmor: +4 },
    },
    Earth: {
      Large: { str: +6, dex: -2, con: +2, naturalArmor: +6 },
    },
    Fire: {
      Large: { dex: +4, con: +2, naturalArmor: +4 },
    },
    Water: {
      Large: { str: +2, dex: -2, con: +6, naturalArmor: +6 },
    },
  },

  'Elemental Body IV': {
    Air: {
      Huge: { str: +4, dex: +6, naturalArmor: +4 },
    },
    Earth: {
      Huge: { str: +8, dex: -2, con: +4, naturalArmor: +6 },
    },
    Fire: {
      Huge: { dex: +6, con: +4, naturalArmor: +4 },
    },
    Water: {
      Huge: { str: +4, dex: -2, con: +8, naturalArmor: +6 },
    },
  },
};

/**
 * Get elemental size modifiers for tier, element, and size
 */
export function getElementalSizeModifiers(
  tier: Tier,
  element: ElementType,
  size: CreatureSize
): SizeModifiers {
  return ELEMENTAL_SIZE_BONUS[tier]?.[element]?.[size] || {};
}

// ============================================================================
// ELEMENTAL GRANTS
// ============================================================================

export interface ElementalGrants {
  movement: {
    land?: number;
    fly?: number;
    flyManeuver?: FlyManeuverability;
    swim?: number;
    burrow?: number;
  };
  senses: {
    darkvision?: number;
  };
  traits: string[];
}

/**
 * Movement, senses, and traits granted by element type
 * Independent of tier (though tier affects size/stats)
 */
export const ELEMENTAL_GRANTS: Record<ElementType, ElementalGrants> = {
  Air: {
    movement: {
      fly: 60,
      flyManeuver: 'Perfect',
    },
    senses: {
      darkvision: 60,
    },
    traits: ['whirlwind', 'air_subtype'],
  },

  Earth: {
    movement: {
      burrow: 20,
    },
    senses: {
      darkvision: 60,
    },
    traits: ['earth_glide', 'earth_subtype'],
  },

  Fire: {
    movement: {
      land: 50,
    },
    senses: {
      darkvision: 60,
    },
    traits: ['burn', 'fire_immunity', 'cold_vulnerability', 'fire_subtype'],
  },

  Water: {
    movement: {
      swim: 60,
    },
    senses: {
      darkvision: 60,
    },
    traits: ['drench', 'water_mastery', 'water_subtype'],
  },
};

/**
 * Get elemental grants for an element
 */
export function getElementalGrants(element: ElementType): ElementalGrants {
  return ELEMENTAL_GRANTS[element];
}

/**
 * Enhanced movement for higher-tier elementals
 */
export function getElementalMovementForTier(
  element: ElementType,
  tier: Tier
): Partial<ElementalGrants['movement']> {
  const base = ELEMENTAL_GRANTS[element].movement;

  // Elemental Body III and IV grant enhanced movement
  if (tier === 'Elemental Body III' || tier === 'Elemental Body IV') {
    if (element === 'Air') {
      return { ...base, fly: tier === 'Elemental Body IV' ? 120 : base.fly };
    }
    if (element === 'Water') {
      return { ...base, swim: tier === 'Elemental Body IV' ? 120 : base.swim };
    }
  }

  return base;
}
