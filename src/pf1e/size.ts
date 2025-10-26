/**
 * Pathfinder 1e Size Modifiers
 *
 * Size-based modifiers for AC, attacks, stealth, and damage dice scaling.
 */

import { CreatureSize } from '@/types/firestore';

// ============================================================================
// SIZE MODIFIERS (PF1e Core Rulebook)
// ============================================================================

/**
 * Attack & AC modifiers by size
 * Positive values benefit smaller creatures (bonus to hit/AC)
 * Negative values benefit larger creatures (penalty to hit/AC but bigger damage)
 */
export const SIZE_TO_HIT_AC: Record<CreatureSize, number> = {
  Fine: +8,
  Diminutive: +4,
  Tiny: +2,
  Small: +1,
  Medium: 0,
  Large: -1,
  Huge: -2,
  Gargantuan: -4,
  Colossal: -8,
};

/**
 * Stealth size modifiers
 * Used for Skills tab highlighting
 */
export const SIZE_TO_STEALTH: Record<CreatureSize, number> = {
  Fine: +16,
  Diminutive: +12,
  Tiny: +8,
  Small: +4,
  Medium: 0,
  Large: -4,
  Huge: -8,
  Gargantuan: -12,
  Colossal: -16,
};

/**
 * Fly skill size modifiers
 */
export const SIZE_TO_FLY: Record<CreatureSize, number> = {
  Fine: +8,
  Diminutive: +6,
  Tiny: +4,
  Small: +2,
  Medium: 0,
  Large: -2,
  Huge: -4,
  Gargantuan: -6,
  Colossal: -8,
};

// ============================================================================
// DAMAGE DICE SCALING
// ============================================================================

/**
 * Damage dice progression table (PF1e standard)
 * From smallest to largest
 */
const DAMAGE_STEP = [
  '1',
  '1d2',
  '1d3',
  '1d4',
  '1d6',
  '1d8',
  '2d6',
  '3d6',
  '4d6',
  '6d6',
  '8d6',
  '12d6',
  '16d6',
] as const;

/**
 * Find dice in progression table
 */
function findDiceIndex(dice: string): number {
  const idx = DAMAGE_STEP.indexOf(dice as any);
  return idx >= 0 ? idx : DAMAGE_STEP.indexOf('1d6'); // Default to 1d6 if not found
}

/**
 * Adjust dice by N steps in progression table
 */
function stepDice(dice: string, steps: number): string {
  const idx = findDiceIndex(dice);
  const newIdx = Math.max(0, Math.min(DAMAGE_STEP.length - 1, idx + steps));
  return DAMAGE_STEP[newIdx];
}

/**
 * Get size difference in steps
 */
function getSizeDifference(from: CreatureSize, to: CreatureSize): number {
  const order: CreatureSize[] = [
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
  return order.indexOf(to) - order.indexOf(from);
}

/**
 * Scale damage dice for size change
 *
 * Each step up in size increases damage one step
 * Each step down in size decreases damage one step
 *
 * @param dice - Base damage dice (e.g., "1d6")
 * @param fromSize - Original size
 * @param toSize - New size
 * @returns Scaled damage dice
 */
export function scaleDamageForSize(
  dice: string,
  fromSize: CreatureSize,
  toSize: CreatureSize
): string {
  const delta = getSizeDifference(fromSize, toSize);
  return stepDice(dice, delta);
}

/**
 * Helper to check if a size is valid for a tier
 */
export function isSizeAllowedForTier(
  size: CreatureSize,
  allowedSizes: CreatureSize[]
): boolean {
  return allowedSizes.includes(size);
}
