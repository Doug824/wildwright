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
  // Handle both old and new character structures
  const abilityScores = character.baseStats.abilityScores || {
    str: (character.baseStats as any).str || 10,
    dex: (character.baseStats as any).dex || 10,
    con: (character.baseStats as any).con || 10,
    int: (character.baseStats as any).int || 10,
    wis: (character.baseStats as any).wis || 10,
    cha: (character.baseStats as any).cha || 10,
  };

  // Handle both old and new HP structures
  // Check BOTH locations and use whichever has a non-zero value
  let hp: { current: number; max: number };

  console.log('[ADAPTER] Character HP debug:', {
    'baseStats.hp': character.baseStats.hp,
    'combatStats.baseHP': (character as any).combatStats?.baseHP,
    'combatStats': (character as any).combatStats
  });

  // Try baseStats.hp first
  if (typeof character.baseStats.hp === 'object' && character.baseStats.hp !== null && character.baseStats.hp.max > 0) {
    hp = character.baseStats.hp;
    console.log('[ADAPTER] Using baseStats.hp:', hp);
  } else if (typeof character.baseStats.hp === 'number' && character.baseStats.hp > 0) {
    // Old structure: hp as number in baseStats
    hp = { current: character.baseStats.hp, max: character.baseStats.hp };
    console.log('[ADAPTER] Using baseStats.hp as number:', hp);
  } else if ((character as any).combatStats?.baseHP && (character as any).combatStats.baseHP > 0) {
    // HP stored in combatStats (common for older characters)
    const baseHP = (character as any).combatStats.baseHP;
    hp = { current: baseHP, max: baseHP };
    console.log('[ADAPTER] Using combatStats.baseHP:', hp);
  } else {
    // Absolute fallback - use 1 so it's obvious something is wrong
    console.warn('[ADAPTER] Character HP not found in any expected location, defaulting to 1');
    hp = { current: 1, max: 1 };
  }

  // Extract BAB - check baseStats first, then combatStats
  const bab = character.baseStats.bab ?? (character as any).combatStats?.baseAttackBonus ?? 0;

  // Extract AC bonuses from combatStats if available
  const acBonuses = (character as any).combatStats?.acBonuses || {};
  const baseNaturalArmor = (character as any).combatStats?.baseNaturalArmor || 0;

  // Extract level - check multiple locations
  const level = character.baseStats.level ?? character.level ?? (character as any).combatStats?.level ?? 1;

  console.log('[ADAPTER] Level debug:', {
    'baseStats.level': character.baseStats.level,
    'character.level': character.level,
    'combatStats.level': (character as any).combatStats?.level,
    'using': level
  });

  // Extract attack/damage bonuses from combatStats
  const combatStats = (character as any).combatStats || {};

  // Calculate misc bonuses from new array format or use old single values
  let miscAttackBonus = 0;
  let miscDamageBonus = 0;

  if (combatStats.miscBonuses && Array.isArray(combatStats.miscBonuses)) {
    // New format: sum up all bonuses by type
    combatStats.miscBonuses.forEach((bonus: any) => {
      const value = typeof bonus.value === 'number' ? bonus.value : parseInt(bonus.value) || 0;
      if (bonus.type === 'attack' || bonus.type === 'both') {
        miscAttackBonus += value;
      }
      if (bonus.type === 'damage' || bonus.type === 'both') {
        miscDamageBonus += value;
      }
    });
  } else {
    // Old format: single values
    miscAttackBonus = combatStats.miscAttackBonus || 0;
    miscDamageBonus = combatStats.miscDamageBonus || 0;
  }

  console.log('[ADAPTER] Misc bonuses:', {
    miscAttackBonus,
    miscDamageBonus,
  });

  return {
    level,
    effectiveDruidLevel: character.baseStats.effectiveDruidLevel,
    ability: abilityScores,
    hp,
    bab,
    ac: {
      armor: acBonuses.armor || 0,
      shield: acBonuses.shield || 0,
      natural: baseNaturalArmor,
      deflection: acBonuses.deflection || 0,
      dodge: acBonuses.dodge || 0,
      misc: 0, // Not currently tracked in character builder
    },
    saves: {
      fortitude: character.baseStats.saves?.fortitude || (character as any).combatStats?.saves?.fort || 0,
      reflex: character.baseStats.saves?.reflex || (character as any).combatStats?.saves?.ref || 0,
      will: character.baseStats.saves?.will || (character as any).combatStats?.saves?.will || 0,
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
    miscAttackBonus,
    miscDamageBonus,
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
