/**
 * Pathfinder 1e Wild Shape Calculation Engine
 *
 * Main exports for the PF1e wild shape calculation system.
 */

// Core computation
export { computePF1e } from './compute';

// Types
export type {
  Tier,
  ElementType,
  FormKind,
  FlyManeuverability,
  BaseCharacter,
  NaturalAttack,
  Form,
  Explain,
  ComputedAttack,
  ComputedPlaysheet,
  ComputeInput,
} from './types';

// Size utilities
export { SIZE_TO_HIT_AC, SIZE_TO_STEALTH, SIZE_TO_FLY, scaleDamageForSize, isSizeAllowedForTier } from './size';

// Tier utilities
export { EDL_TO_TIERS, getTierForEDL, getSizeModifiers } from './tiers';

// Beast Shape utilities
export { BEAST_GRANTS_BY_TIER, getBeastGrants, isTraitGrantedByTier } from './beast';

// Elemental Body utilities
export {
  ELEMENTAL_SIZE_BONUS,
  ELEMENTAL_GRANTS,
  getElementalSizeModifiers,
  getElementalGrants,
  getElementalMovementForTier,
} from './elemental';

// Plant Shape utilities
export {
  PLANT_SIZE_BONUS,
  PLANT_GRANTS,
  getPlantSizeModifiers,
  getPlantGrants,
  getPlantTraitsForTier,
  isPlantTraitGrantedByTier,
} from './plant';
