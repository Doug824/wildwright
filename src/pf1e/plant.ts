/**
 * Pathfinder 1e Plant Shape Grants
 *
 * Size-based bonuses, senses, and traits for Plant Shape spells.
 */

import { Tier } from './types';
import { CreatureSize } from '@/types/firestore';
import { SizeModifiers } from './tiers';

// ============================================================================
// PLANT SIZE BONUSES
// ============================================================================

/**
 * Plant Shape size-based ability and natural armor bonuses
 * Note: Con bonuses in Plant Shape are "enhancement" bonuses in some texts,
 * but we treat them as size bonuses for calculation simplicity
 */
export const PLANT_SIZE_BONUS: Record<
  string,
  Partial<Record<CreatureSize, SizeModifiers>>
> = {
  'Plant Shape I': {
    Small: { con: +2, naturalArmor: +2 },
    Medium: { str: +2, con: +2, naturalArmor: +2 },
  },

  'Plant Shape II': {
    Large: { str: +4, con: +2, naturalArmor: +4 },
  },

  'Plant Shape III': {
    Huge: { str: +8, dex: -2, con: +4, naturalArmor: +6 },
  },
};

/**
 * Get plant size modifiers for tier and size
 */
export function getPlantSizeModifiers(tier: Tier, size: CreatureSize): SizeModifiers {
  return PLANT_SIZE_BONUS[tier]?.[size] || {};
}

// ============================================================================
// PLANT GRANTS
// ============================================================================

export interface PlantGrants {
  senses: {
    darkvision?: number;
    lowLight?: boolean;
  };
  traits: string[];
}

/**
 * Common plant grants
 * Note: Traits like constrict, grab, poison are only granted if the
 * native form has them AND the tier allows them
 */
export const PLANT_GRANTS: PlantGrants = {
  senses: {
    darkvision: 60,
    lowLight: true,
  },
  traits: [
    'constrict',
    'grab',
    'poison',
  ],
};

/**
 * Get plant grants
 */
export function getPlantGrants(): PlantGrants {
  return PLANT_GRANTS;
}

/**
 * Plant Shape III grants additional abilities
 */
export function getPlantTraitsForTier(tier: Tier): string[] {
  const baseTraits = PLANT_GRANTS.traits;

  if (tier === 'Plant Shape III') {
    return [...baseTraits, 'damage_reduction', 'regeneration', 'trample'];
  }

  return baseTraits;
}

/**
 * Check if a trait is granted by Plant Shape tier
 */
export function isPlantTraitGrantedByTier(trait: string, tier: Tier): boolean {
  const grants = getPlantTraitsForTier(tier);
  return grants.includes(trait.toLowerCase());
}
