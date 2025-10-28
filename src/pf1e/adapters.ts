/**
 * Type Adapters
 *
 * Convert between Firestore types and PF1e calculation types.
 */

import { Character, WildShapeForm, CharacterWithId, WildShapeFormWithId } from '@/types/firestore';
import { BaseCharacter, Form, Tier, ElementType, FormKind } from './types';

// ============================================================================
// CHARACTER CONVERSION
// ============================================================================

/**
 * Convert Firestore Character to PF1e BaseCharacter
 */
export function characterToBaseCharacter(character: Character | CharacterWithId): BaseCharacter {
  return {
    level: character.baseStats.level,
    effectiveDruidLevel: character.baseStats.effectiveDruidLevel,
    ability: character.baseStats.abilityScores,
    hp: character.baseStats.hp,
    bab: character.baseStats.bab,
    ac: {
      // Extract AC breakdown if stored, otherwise use defaults
      armor: 0, // TODO: Extract from gear/equipment
      shield: 0,
      natural: 0,
      deflection: 0,
      dodge: 0,
      misc: 0,
    },
    saves: {
      fortitude: character.baseStats.saves?.fortitude || 0,
      reflex: character.baseStats.saves?.reflex || 0,
      will: character.baseStats.saves?.will || 0,
    },
    movement: {
      land: character.baseStats.movement?.land || 30,
      swim: character.baseStats.movement?.swim,
      climb: character.baseStats.movement?.climb,
      fly: character.baseStats.movement?.fly,
    },
    senses: {
      // Convert senses array to structured format
      lowLight: character.baseStats.senses?.includes('low-light vision') || false,
      scent: character.baseStats.senses?.includes('scent') || false,
      darkvision: extractDarkvisionRange(character.baseStats.senses || []),
    },
    feats: character.features?.feats || [],
    traits: character.features?.raceTraits || [],
  };
}

/**
 * Extract darkvision range from senses array
 */
function extractDarkvisionRange(senses: string[]): number | undefined {
  const darkvision = senses.find((s) => s.toLowerCase().includes('darkvision'));
  if (!darkvision) return undefined;

  // Extract number from string like "darkvision 60 ft"
  const match = darkvision.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60; // Default to 60 if no number found
}

// ============================================================================
// FORM CONVERSION
// ============================================================================

/**
 * Convert Firestore WildShapeForm to PF1e Form
 */
export function wildShapeFormToForm(wildShapeForm: WildShapeForm | WildShapeFormWithId): Form {
  const formKind: FormKind = inferFormKind(wildShapeForm.requiredSpellLevel);

  return {
    id: 'id' in wildShapeForm ? wildShapeForm.id : wildShapeForm.name.toLowerCase().replace(/\s+/g, '-'),
    name: wildShapeForm.name,
    kind: formKind,
    baseSize: wildShapeForm.size,
    naturalAttacks: wildShapeForm.statModifications.naturalAttacks.map((attack) => ({
      type: inferAttackType(attack.name),
      dice: attack.damage,
      count: attack.count || 1,
      primary: attack.type === 'primary',
      traits: extractTraitsFromAttack(attack.name),
    })),
    movement: {
      land: wildShapeForm.statModifications.movement.land,
      swim: wildShapeForm.statModifications.movement.swim,
      climb: wildShapeForm.statModifications.movement.climb,
      fly: wildShapeForm.statModifications.movement.fly,
      burrow: wildShapeForm.statModifications.movement.burrow,
    },
    senses: {
      lowLight: wildShapeForm.statModifications.senses.lowLight,
      scent: wildShapeForm.statModifications.senses.scent,
      darkvision: wildShapeForm.statModifications.senses.darkvision,
      tremorsense: wildShapeForm.statModifications.senses.tremorsense,
    },
    traits: wildShapeForm.statModifications.specialAbilities,
    tags: wildShapeForm.tags,
    requirements: {
      spellEquivalent: wildShapeForm.requiredSpellLevel as Tier,
      minEDL: wildShapeForm.requiredDruidLevel,
    },
    element: inferElement(wildShapeForm.name, wildShapeForm.tags),
  };
}

/**
 * Infer form kind from spell level
 */
function inferFormKind(spellLevel: string): FormKind {
  if (spellLevel.includes('Elemental')) return 'Elemental';
  if (spellLevel.includes('Plant')) return 'Plant';
  return 'Animal'; // Default to Animal for Beast Shape
}

/**
 * Infer attack type from attack name
 */
function inferAttackType(attackName: string): Form['naturalAttacks'][0]['type'] {
  const name = attackName.toLowerCase();
  if (name.includes('bite')) return 'bite';
  if (name.includes('claw')) return 'claw';
  if (name.includes('gore')) return 'gore';
  if (name.includes('slam')) return 'slam';
  if (name.includes('talon')) return 'talon';
  if (name.includes('sting')) return 'sting';
  if (name.includes('tail')) return 'tail';
  if (name.includes('wing')) return 'wing';
  return 'other';
}

/**
 * Extract traits from attack name (e.g., "Bite (grab)" -> ["grab"])
 */
function extractTraitsFromAttack(attackName: string): string[] {
  const match = attackName.match(/\(([^)]+)\)/);
  if (!match) return [];
  return match[1].split(',').map((s) => s.trim().toLowerCase());
}

/**
 * Infer element from form name or tags
 */
function inferElement(name: string, tags: string[]): ElementType | undefined {
  const nameLower = name.toLowerCase();
  const allText = [nameLower, ...tags.map((t) => t.toLowerCase())].join(' ');

  if (allText.includes('air')) return 'Air';
  if (allText.includes('earth')) return 'Earth';
  if (allText.includes('fire')) return 'Fire';
  if (allText.includes('water')) return 'Water';

  return undefined;
}

// ============================================================================
// REVERSE CONVERSION (for saving computed results)
// ============================================================================

/**
 * Extract tier name from character's effective druid level
 * This is a helper to determine the best tier available
 */
export function getTierFromEDL(edl: number, formKind: FormKind): Tier {
  if (formKind === 'Animal') {
    if (edl >= 12) return 'Beast Shape III';
    if (edl >= 8) return 'Beast Shape III';
    if (edl >= 6) return 'Beast Shape II';
    return 'Beast Shape I';
  } else if (formKind === 'Elemental') {
    if (edl >= 12) return 'Elemental Body IV';
    if (edl >= 10) return 'Elemental Body III';
    if (edl >= 8) return 'Elemental Body II';
    return 'Elemental Body I';
  } else if (formKind === 'Plant') {
    if (edl >= 12) return 'Plant Shape III';
    if (edl >= 10) return 'Plant Shape II';
    return 'Plant Shape I';
  }

  return 'Beast Shape I'; // Fallback
}
