/**
 * Game Calculation Utilities
 *
 * Functions for calculating ability modifiers, attack bonuses, AC, etc.
 */

import { AbilityScores, AbilityDeltas, BaseStats, StatModifications } from '@/types/firestore';
import { SIZE_MODIFIERS, CreatureSize } from '@/constants';

// ============================================================================
// ABILITY SCORES
// ============================================================================

/**
 * Calculate ability modifier from ability score
 */
export const calculateAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Apply ability deltas to base ability scores
 */
export const applyAbilityDeltas = (
  baseScores: AbilityScores,
  deltas: AbilityDeltas
): AbilityScores => {
  return {
    str: baseScores.str + (deltas.str || 0),
    dex: baseScores.dex + (deltas.dex || 0),
    con: baseScores.con + (deltas.con || 0),
    int: baseScores.int + (deltas.int || 0),
    wis: baseScores.wis + (deltas.wis || 0),
    cha: baseScores.cha + (deltas.cha || 0),
  };
};

// ============================================================================
// ARMOR CLASS
// ============================================================================

/**
 * Calculate AC with wild shape modifications
 */
export const calculateWildShapeAC = (
  baseAC: number,
  baseDex: number,
  wildShapeDex: number,
  naturalArmor: number,
  size: CreatureSize
): number => {
  const baseDexMod = calculateAbilityModifier(baseDex);
  const wildShapeDexMod = calculateAbilityModifier(wildShapeDex);
  const dexModChange = wildShapeDexMod - baseDexMod;
  const sizeModifier = SIZE_MODIFIERS[size]?.ac || 0;

  return baseAC + dexModChange + naturalArmor + sizeModifier;
};

// ============================================================================
// ATTACK BONUSES
// ============================================================================

/**
 * Calculate attack bonus for a natural attack
 */
export const calculateNaturalAttackBonus = (
  bab: number,
  strModifier: number,
  sizeModifier: number,
  attackBonus: number = 0
): number => {
  return bab + strModifier + sizeModifier + attackBonus;
};

/**
 * Calculate damage for a natural attack
 * Note: This is simplified - actual damage depends on many factors
 */
export const formatNaturalAttackDamage = (
  damage: string,
  strModifier: number,
  isPrimary: boolean
): string => {
  const multiplier = isPrimary ? 1.0 : 0.5;
  const damageBonus = Math.floor(strModifier * multiplier);

  if (damageBonus > 0) {
    return `${damage}+${damageBonus}`;
  } else if (damageBonus < 0) {
    return `${damage}${damageBonus}`;
  }
  return damage;
};

// ============================================================================
// HIT POINTS
// ============================================================================

/**
 * Calculate HP adjustment for constitution change
 */
export const calculateHPAdjustment = (
  baseConModifier: number,
  wildShapeConModifier: number,
  characterLevel: number
): number => {
  const conModChange = wildShapeConModifier - baseConModifier;
  return conModChange * characterLevel;
};

// ============================================================================
// SAVING THROWS
// ============================================================================

/**
 * Calculate saving throw adjustment for ability score change
 */
export const calculateSaveAdjustment = (
  baseAbilityModifier: number,
  wildShapeAbilityModifier: number
): number => {
  return wildShapeAbilityModifier - baseAbilityModifier;
};

// ============================================================================
// SKILLS
// ============================================================================

/**
 * Calculate skill bonus with wild shape modifications
 */
export const calculateWildShapeSkillBonus = (
  baseSkillBonus: number,
  baseAbilityModifier: number,
  wildShapeAbilityModifier: number,
  formSkillBonus: number = 0
): number => {
  const abilityModChange = wildShapeAbilityModifier - baseAbilityModifier;
  return baseSkillBonus + abilityModChange + formSkillBonus;
};

// ============================================================================
// WILD SHAPE ELIGIBILITY
// ============================================================================

/**
 * Check if a form is available at a given druid level
 */
export const isFormAvailable = (requiredLevel: number, druidLevel: number): boolean => {
  return druidLevel >= requiredLevel;
};

/**
 * Get forms available at a specific druid level
 */
export const filterFormsByLevel = <T extends { requiredDruidLevel: number }>(
  forms: T[],
  druidLevel: number
): T[] => {
  return forms.filter((form) => isFormAvailable(form.requiredDruidLevel, druidLevel));
};

// ============================================================================
// DAILY USES
// ============================================================================

/**
 * Calculate wild shape uses per day (PF1e)
 * Base: 1/day at level 4, +1/day every 2 levels after
 */
export const calculateDailyWildShapeUses = (druidLevel: number): number => {
  if (druidLevel < 4) return 0;
  return 1 + Math.floor((druidLevel - 4) / 2);
};

/**
 * Check if character can use wild shape
 */
export const canUseWildShape = (currentUses: number, maxUses: number | null): boolean => {
  if (maxUses === null) return true; // Infinite uses
  return currentUses < maxUses;
};

/**
 * Calculate remaining uses
 */
export const getRemainingUses = (currentUses: number, maxUses: number | null): number | null => {
  if (maxUses === null) return null; // Infinite
  return Math.max(0, maxUses - currentUses);
};
