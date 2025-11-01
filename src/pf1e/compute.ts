/**
 * Pathfinder 1e Wild Shape Computation Engine
 *
 * Main calculation pipeline for computing wild shape stats.
 * Handles Beast Shape, Elemental Body, and Plant Shape transformations.
 */

import { CreatureSize, AbilityScores } from '@/types/firestore';
import {
  ComputeInput,
  ComputedPlaysheet,
  ComputedAttack,
  Explain,
  Tier,
  BaseCharacter,
  Form,
} from './types';
import { SIZE_TO_HIT_AC, scaleDamageForSize } from './size';
import { getSizeModifiers } from './tiers';
import { getBeastGrants, isTraitGrantedByTier } from './beast';
import { getElementalSizeModifiers, getElementalGrants, getElementalMovementForTier } from './elemental';
import { getPlantSizeModifiers, getPlantGrants, isPlantTraitGrantedByTier } from './plant';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Take the higher of two optional numbers
 */
function maxOr(base?: number, grant?: number): number | undefined {
  if (base == null) return grant;
  if (grant == null) return base;
  return Math.max(base, grant);
}

/**
 * Calculate ability modifier from ability score
 */
function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Merge traits, checking if they're granted by tier
 * Only include form traits if the tier allows them
 */
function mergeTraits(
  formTraits: string[],
  tierTraits: string[],
  tier: Tier,
  formKind: 'Animal' | 'Magical Beast' | 'Elemental' | 'Plant'
): string[] {
  const allowed: string[] = [];

  // Add tier-granted traits
  allowed.push(...tierTraits);

  // Add form traits if they're allowed by the tier
  for (const trait of formTraits) {
    const traitLower = trait.toLowerCase();

    // Check if trait is allowed
    if (formKind === 'Animal' || formKind === 'Magical Beast') {
      if (isTraitGrantedByTier(traitLower, tier)) {
        allowed.push(trait);
      }
    } else if (formKind === 'Plant') {
      if (isPlantTraitGrantedByTier(traitLower, tier)) {
        allowed.push(trait);
      }
    } else {
      // Elementals: all native traits allowed
      allowed.push(trait);
    }
  }

  // Deduplicate
  return Array.from(new Set(allowed));
}

// ============================================================================
// MAIN COMPUTATION PIPELINE
// ============================================================================

/**
 * Compute PF1e wild shape playsheet
 *
 * Takes base character, form, and tier information
 * Returns complete computed stats with explanation trail
 */
export function computePF1e(input: ComputeInput): ComputedPlaysheet {
  const { base, form, tier } = input;
  const explain: Explain[] = [];

  // ============================================================================
  // 1. DETERMINE FINAL SIZE
  // ============================================================================

  const size: CreatureSize = input.chosenSize ?? form.baseSize;

  // ============================================================================
  // 2. COMPUTE ABILITY SCORES & NATURAL ARMOR
  // ============================================================================

  let ability: AbilityScores = { ...base.ability };
  let naturalArmorBonus = 0;
  let movement = { ...form.movement };
  let senses = { ...form.senses };
  let traits: string[] = [];
  let flyManeuver = form.movement.flyManeuver;

  // Beast Shape
  if (tier.startsWith('Beast Shape')) {
    const sizeModifiers = getSizeModifiers(tier, size);
    const grants = getBeastGrants(tier);

    if (!grants) {
      throw new Error(`Invalid Beast Shape tier: ${tier}`);
    }

    // Apply ability bonuses
    if (sizeModifiers.str) {
      ability.str += sizeModifiers.str;
      explain.push({
        target: 'ability.str',
        label: `${tier} (${size})`,
        delta: sizeModifiers.str,
        source: 'tier',
      });
    }
    if (sizeModifiers.dex) {
      ability.dex += sizeModifiers.dex;
      explain.push({
        target: 'ability.dex',
        label: `${tier} (${size})`,
        delta: sizeModifiers.dex,
        source: 'tier',
      });
    }
    if (sizeModifiers.con) {
      ability.con += sizeModifiers.con;
      explain.push({
        target: 'ability.con',
        label: `${tier} (${size})`,
        delta: sizeModifiers.con,
        source: 'tier',
      });
    }
    if (sizeModifiers.naturalArmor) {
      naturalArmorBonus += sizeModifiers.naturalArmor;
      explain.push({
        target: 'ac.natural',
        label: `${tier} (${size})`,
        delta: sizeModifiers.naturalArmor,
        source: 'tier',
      });
    }

    // Merge movement (take higher)
    movement = {
      land: maxOr(base.movement.land, maxOr(form.movement.land, grants.movement.fly ? undefined : form.movement.land)),
      climb: maxOr(base.movement.climb, maxOr(form.movement.climb, grants.movement.climb)),
      swim: maxOr(base.movement.swim, maxOr(form.movement.swim, grants.movement.swim)),
      burrow: maxOr(base.movement.burrow, maxOr(form.movement.burrow, grants.movement.burrow)),
      fly: maxOr(base.movement.fly, maxOr(form.movement.fly, grants.movement.fly)),
      flyManeuver: form.movement.fly || grants.movement.fly ? grants.flyManeuver : base.movement.flyManeuver,
    };

    flyManeuver = movement.flyManeuver;

    // Merge senses (take higher)
    senses = {
      darkvision: maxOr(base.senses.darkvision, maxOr(form.senses.darkvision, grants.senses.darkvision)),
      lowLight: base.senses.lowLight || form.senses.lowLight || grants.senses.lowLight || false,
      scent: base.senses.scent || form.senses.scent || grants.senses.scent || false,
      blindsense: maxOr(base.senses.blindsense, maxOr(form.senses.blindsense, grants.senses.blindsense)),
      tremorsense: maxOr(base.senses.tremorsense, form.senses.tremorsense),
    };

    // Merge traits
    traits = mergeTraits(form.traits, grants.traits, tier, form.kind);
  }

  // Elemental Body
  else if (tier.startsWith('Elemental Body')) {
    if (!input.element) {
      throw new Error('Elemental Body requires element parameter');
    }

    console.log('[COMPUTE] Elemental transformation:', JSON.stringify({
      tier,
      element: input.element,
      size,
      'ability before': { ...ability }
    }, null, 2));

    const sizeModifiers = getElementalSizeModifiers(tier, input.element, size);
    console.log('[COMPUTE] Size modifiers:', JSON.stringify(sizeModifiers, null, 2));

    const grants = getElementalGrants(input.element);
    const elementMovement = getElementalMovementForTier(input.element, tier);

    // Apply ability bonuses
    if (sizeModifiers.str) {
      console.log('[COMPUTE] Applying STR:', sizeModifiers.str, 'to', ability.str);
      ability.str += sizeModifiers.str;
      explain.push({
        target: 'ability.str',
        label: `${tier} ${input.element} (${size})`,
        delta: sizeModifiers.str,
        source: 'tier',
      });
    }
    if (sizeModifiers.dex) {
      console.log('[COMPUTE] Applying DEX:', sizeModifiers.dex, 'to', ability.dex);
      ability.dex += sizeModifiers.dex;
      explain.push({
        target: 'ability.dex',
        label: `${tier} ${input.element} (${size})`,
        delta: sizeModifiers.dex,
        source: 'tier',
      });
    }
    if (sizeModifiers.con) {
      console.log('[COMPUTE] Applying CON:', sizeModifiers.con, 'to', ability.con);
      ability.con += sizeModifiers.con;
      explain.push({
        target: 'ability.con',
        label: `${tier} ${input.element} (${size})`,
        delta: sizeModifiers.con,
        source: 'tier',
      });
    }

    console.log('[COMPUTE] Ability after modifiers:', JSON.stringify(ability, null, 2));
    if (sizeModifiers.naturalArmor) {
      naturalArmorBonus += sizeModifiers.naturalArmor;
      explain.push({
        target: 'ac.natural',
        label: `${tier} ${input.element} (${size})`,
        delta: sizeModifiers.naturalArmor,
        source: 'tier',
      });
    }

    // Merge movement
    movement = {
      land: maxOr(base.movement.land, maxOr(form.movement.land, elementMovement.land)),
      climb: maxOr(base.movement.climb, form.movement.climb),
      swim: maxOr(base.movement.swim, maxOr(form.movement.swim, elementMovement.swim)),
      burrow: maxOr(base.movement.burrow, maxOr(form.movement.burrow, elementMovement.burrow)),
      fly: maxOr(base.movement.fly, maxOr(form.movement.fly, elementMovement.fly)),
      flyManeuver: elementMovement.flyManeuver || form.movement.flyManeuver || base.movement.flyManeuver,
    };

    flyManeuver = movement.flyManeuver;

    // Merge senses
    senses = {
      darkvision: maxOr(base.senses.darkvision, maxOr(form.senses.darkvision, grants.senses.darkvision)),
      lowLight: base.senses.lowLight || form.senses.lowLight || false,
      scent: base.senses.scent || form.senses.scent || false,
      tremorsense: maxOr(base.senses.tremorsense, form.senses.tremorsense),
      blindsense: maxOr(base.senses.blindsense, form.senses.blindsense),
    };

    // Merge traits
    traits = [...form.traits, ...grants.traits];
  }

  // Plant Shape
  else if (tier.startsWith('Plant Shape')) {
    const sizeModifiers = getPlantSizeModifiers(tier, size);
    const grants = getPlantGrants();

    // Apply ability bonuses
    if (sizeModifiers.str) {
      ability.str += sizeModifiers.str;
      explain.push({
        target: 'ability.str',
        label: `${tier} (${size})`,
        delta: sizeModifiers.str,
        source: 'tier',
      });
    }
    if (sizeModifiers.dex) {
      ability.dex += sizeModifiers.dex;
      explain.push({
        target: 'ability.dex',
        label: `${tier} (${size})`,
        delta: sizeModifiers.dex,
        source: 'tier',
      });
    }
    if (sizeModifiers.con) {
      ability.con += sizeModifiers.con;
      explain.push({
        target: 'ability.con',
        label: `${tier} (${size})`,
        delta: sizeModifiers.con,
        source: 'tier',
      });
    }
    if (sizeModifiers.naturalArmor) {
      naturalArmorBonus += sizeModifiers.naturalArmor;
      explain.push({
        target: 'ac.natural',
        label: `${tier} (${size})`,
        delta: sizeModifiers.naturalArmor,
        source: 'tier',
      });
    }

    // Movement (plants typically have reduced movement)
    movement = {
      land: form.movement.land || 5, // 5 ft if no movement
      climb: form.movement.climb,
      swim: form.movement.swim,
      burrow: form.movement.burrow,
      fly: form.movement.fly,
      flyManeuver: form.movement.flyManeuver,
    };

    // Merge senses
    senses = {
      darkvision: maxOr(base.senses.darkvision, maxOr(form.senses.darkvision, grants.senses.darkvision)),
      lowLight: base.senses.lowLight || form.senses.lowLight || grants.senses.lowLight || false,
      scent: base.senses.scent || form.senses.scent || false,
      tremorsense: maxOr(base.senses.tremorsense, form.senses.tremorsense),
      blindsense: maxOr(base.senses.blindsense, form.senses.blindsense),
    };

    // Merge traits
    traits = mergeTraits(form.traits, grants.traits, tier, 'Plant');
  }

  // ============================================================================
  // 3. COMPUTE AC
  // ============================================================================

  const sizeACMod = SIZE_TO_HIT_AC[size] ?? 0;
  const strMod = abilityMod(ability.str);
  const dexMod = abilityMod(ability.dex);
  const wisMod = abilityMod(ability.wis);
  const natural = (base.ac.natural || 0) + naturalArmorBonus;

  const acBreakdown = {
    base: 10,
    armor: base.ac.armor || 0,
    shield: base.ac.shield || 0,
    natural,
    deflection: base.ac.deflection || 0,
    dodge: base.ac.dodge || 0,
    size: sizeACMod,
    dex: dexMod,
    misc: base.ac.misc || 0,
  };

  console.log('[COMPUTE] AC calculation:', JSON.stringify({
    'base.ac.armor': base.ac.armor,
    'base.ac.shield': base.ac.shield,
    'base.ac.natural': base.ac.natural,
    'base.ac.deflection': base.ac.deflection,
    'base.ac.dodge': base.ac.dodge,
    'naturalArmorBonus': naturalArmorBonus,
    'sizeACMod': sizeACMod,
    'dexMod': dexMod,
    'ability.dex': ability.dex,
    'acBreakdown': acBreakdown
  }, null, 2));

  const totalAC = Object.values(acBreakdown).reduce((sum, val) => sum + (val || 0), 0);
  const touchAC = 10 + dexMod + sizeACMod + (base.ac.deflection || 0) + (base.ac.dodge || 0) + (base.ac.misc || 0);
  const flatFootedAC = totalAC - dexMod;

  console.log('[COMPUTE] Final AC:', JSON.stringify({ totalAC, touchAC, flatFootedAC }));

  // ============================================================================
  // 4. COMPUTE SAVES
  // ============================================================================

  const baseFortMod = abilityMod(base.ability.con);
  const newFortMod = abilityMod(ability.con);
  const fortDelta = newFortMod - baseFortMod;

  const baseRefMod = abilityMod(base.ability.dex);
  const newRefMod = abilityMod(ability.dex);
  const refDelta = newRefMod - baseRefMod;

  const baseWillMod = abilityMod(base.ability.wis);
  const newWillMod = abilityMod(ability.wis);
  const willDelta = newWillMod - baseWillMod;

  const savesExplain: Explain[] = [];
  if (fortDelta !== 0) {
    savesExplain.push({
      target: 'saves.fortitude',
      label: 'CON change',
      delta: fortDelta,
      source: 'calc',
    });
  }
  if (refDelta !== 0) {
    savesExplain.push({
      target: 'saves.reflex',
      label: 'DEX change',
      delta: refDelta,
      source: 'calc',
    });
  }
  if (willDelta !== 0) {
    savesExplain.push({
      target: 'saves.will',
      label: 'WIS change',
      delta: willDelta,
      source: 'calc',
    });
  }

  const saves = {
    fortitude: base.saves.fortitude + fortDelta,
    reflex: base.saves.reflex + refDelta,
    will: base.saves.will + willDelta,
    explain: savesExplain,
  };

  // ============================================================================
  // 5. COMPUTE HP
  // ============================================================================

  console.log('[COMPUTE] HP calculation:', {
    'base.hp': base.hp,
    'base.level': base.level,
    'baseFortMod': baseFortMod,
    'newFortMod': newFortMod,
    'base.ability.con': base.ability.con,
    'ability.con': ability.con
  });

  const hpDelta = (newFortMod - baseFortMod) * base.level;
  const hp = {
    max: base.hp.max + hpDelta,
    current: base.hp.current + hpDelta,
  };

  console.log('[COMPUTE] Final HP:', { hpDelta, hp });

  if (hpDelta !== 0) {
    explain.push({
      target: 'hp.max',
      label: `CON change (${newFortMod - baseFortMod} × ${base.level} levels)`,
      delta: hpDelta,
      source: 'calc',
    });
  }

  // ============================================================================
  // 6. COMPUTE ATTACKS
  // ============================================================================

  // Determine which ability modifier to use for attack
  const attackStatModifier = base.attackStatModifier || 'STR';
  let attackAbilityMod = strMod;
  if (attackStatModifier === 'DEX') attackAbilityMod = dexMod;
  else if (attackStatModifier === 'WIS') attackAbilityMod = wisMod;

  // Determine which ability modifier to use for damage
  const damageStatModifier = base.damageStatModifier || 'STR';
  let damageAbilityMod = strMod;
  if (damageStatModifier === 'DEX') damageAbilityMod = dexMod;
  else if (damageStatModifier === 'WIS') damageAbilityMod = wisMod;

  const damageMultiplier = base.damageMultiplier || 1;
  const miscAttackBonus = base.miscAttackBonus || 0;
  const miscDamageBonus = base.miscDamageBonus || 0;

  console.log('[COMPUTE] Attack calculation:', {
    attackStatModifier,
    attackAbilityMod,
    damageStatModifier,
    damageAbilityMod,
    damageMultiplier,
    miscAttackBonus,
    miscDamageBonus,
  });

  const attacks: ComputedAttack[] = form.naturalAttacks.map((attack) => {
    const count = attack.count ?? 1;
    const isPrimary = attack.primary !== false;

    // Attack bonus: BAB + Attack Stat Mod + Size + Misc Attack Bonus
    const attackBonus = base.bab + attackAbilityMod + sizeACMod + (isPrimary ? 0 : -5) + miscAttackBonus;

    // Damage dice scaled for size
    const scaledDice = scaleDamageForSize(attack.dice, 'Medium', size);

    // Damage modifier: Apply multiplier to stat mod only, then add misc damage bonus
    // For primary attacks: full multiplier, for secondary: half of stat mod first, then apply multiplier
    let baseDmgMod = isPrimary ? damageAbilityMod : Math.floor(damageAbilityMod / 2);
    const dmgModWithMultiplier = Math.floor(baseDmgMod * damageMultiplier);
    const totalDmgMod = dmgModWithMultiplier + miscDamageBonus;

    const damageDice = `${scaledDice}${totalDmgMod !== 0 ? (totalDmgMod > 0 ? `+${totalDmgMod}` : `${totalDmgMod}`) : ''}`;

    return {
      name: attack.type.charAt(0).toUpperCase() + attack.type.slice(1),
      count,
      attackBonus,
      damageDice,
      traits: attack.traits,
      explain: [
        { target: 'attack', label: 'BAB', delta: base.bab, source: 'base' },
        { target: 'attack', label: `${attackStatModifier} mod`, delta: attackAbilityMod, source: 'calc' },
        { target: 'attack', label: 'Size', delta: sizeACMod, source: 'size' },
        ...(miscAttackBonus !== 0 ? [{ target: 'attack' as const, label: 'Misc', delta: miscAttackBonus, source: 'base' as const }] : []),
        { target: 'damage', label: 'Size scaling', delta: scaledDice, source: 'size' },
        { target: 'damage', label: `${damageStatModifier} (${isPrimary ? 'primary' : 'secondary'})`, delta: baseDmgMod, source: 'calc' },
        ...(damageMultiplier !== 1 ? [{ target: 'damage' as const, label: `×${damageMultiplier} multiplier`, delta: dmgModWithMultiplier - baseDmgMod, source: 'calc' as const }] : []),
        ...(miscDamageBonus !== 0 ? [{ target: 'damage' as const, label: 'Misc', delta: miscDamageBonus, source: 'base' as const }] : []),
      ],
    };
  });

  // ============================================================================
  // 7. RETURN COMPUTED PLAYSHEET
  // ============================================================================

  return {
    size,
    ability,
    hp,
    ac: {
      total: totalAC,
      touch: touchAC,
      flatFooted: flatFootedAC,
      breakdown: acBreakdown,
      explain: explain.filter((e) => e.target.startsWith('ac')),
    },
    saves,
    movement: {
      land: movement.land ?? base.movement.land ?? 30,
      fly: movement.fly,
      flyManeuver: flyManeuver,
      swim: movement.swim,
      climb: movement.climb,
      burrow: movement.burrow,
    },
    senses,
    traits,
    attacks,
    explain,
  };
}
