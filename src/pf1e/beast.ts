/**
 * Pathfinder 1e Beast Shape Grants
 *
 * Movement, senses, and traits granted by Beast Shape spells.
 */

import { Tier, FlyManeuverability } from './types';

// ============================================================================
// BEAST SHAPE GRANTS
// ============================================================================

export interface BeastGrants {
  movement: {
    climb?: number;
    fly?: number;
    swim?: number;
    burrow?: number;
  };
  senses: {
    darkvision?: number;
    lowLight?: boolean;
    scent?: boolean;
    blindsense?: number;
  };
  traits: string[]; // Special abilities granted by tier
  flyManeuver?: FlyManeuverability;
}

/**
 * Movement, senses, and traits granted by each Beast Shape tier
 * These are the MAXIMUM values the spell grants
 * Actual values use "take higher" between base, form, and tier
 */
export const BEAST_GRANTS_BY_TIER: Record<string, BeastGrants> = {
  'Beast Shape I': {
    movement: {
      climb: 30,
      fly: 30,
      swim: 30,
    },
    senses: {
      darkvision: 60,
      lowLight: true,
      scent: true,
    },
    traits: [],
    flyManeuver: 'Average',
  },

  'Beast Shape II': {
    movement: {
      climb: 60,
      fly: 60,
      swim: 60,
    },
    senses: {
      darkvision: 60,
      lowLight: true,
      scent: true,
    },
    traits: ['grab', 'pounce', 'trip'],
    flyManeuver: 'Good',
  },

  'Beast Shape III': {
    movement: {
      burrow: 30,
      climb: 90,
      fly: 90,
      swim: 90,
    },
    senses: {
      darkvision: 60,
      lowLight: true,
      scent: true,
      blindsense: 30,
    },
    traits: [
      'constrict',
      'ferocity',
      'grab',
      'jet',
      'poison',
      'pounce',
      'rake',
      'trample',
      'trip',
      'web',
    ],
    flyManeuver: 'Good',
  },

  'Beast Shape IV': {
    movement: {
      burrow: 30,
      climb: 90,
      fly: 90,
      swim: 90,
    },
    senses: {
      darkvision: 60,
      lowLight: true,
      scent: true,
      blindsense: 30,
    },
    traits: [
      'constrict',
      'ferocity',
      'grab',
      'jet',
      'poison',
      'pounce',
      'rake',
      'trample',
      'trip',
      'web',
    ],
    flyManeuver: 'Good',
  },
};

/**
 * Get beast grants for a tier
 */
export function getBeastGrants(tier: Tier): BeastGrants | null {
  return BEAST_GRANTS_BY_TIER[tier] || null;
}

/**
 * Check if a trait is granted by the tier
 * Form native traits are ONLY granted if the tier allows them
 */
export function isTraitGrantedByTier(trait: string, tier: Tier): boolean {
  const grants = BEAST_GRANTS_BY_TIER[tier];
  if (!grants) return false;
  return grants.traits.includes(trait.toLowerCase());
}
