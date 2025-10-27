/**
 * Special Abilities Database
 *
 * Descriptions for all common Pathfinder 1e special abilities
 * that can appear on wildshape forms.
 */

export interface SpecialAbility {
  name: string;
  category: 'Movement' | 'Senses' | 'Combat' | 'Elemental' | 'Plant' | 'Defensive';
  description: string;
}

export const SPECIAL_ABILITIES: Record<string, SpecialAbility> = {
  // Movement
  'Climb': {
    name: 'Climb',
    category: 'Movement',
    description: 'A creature with a climb speed receives a +8 racial bonus on all Climb checks. It can always choose to take 10 on a Climb check even if it\'s rushed or threatened; it retains its Dexterity bonus to AC while climbing but can\'t Run.',
  },
  'Swim': {
    name: 'Swim',
    category: 'Movement',
    description: 'A creature with a swim speed moves through water (or other fluid terrain) at its listed speed; it may also attempt Swim checks for special maneuvers (depending on terrain or if underwater).',
  },
  'Fly': {
    name: 'Fly',
    category: 'Movement',
    description: 'A creature with a fly speed can move through the air at its listed speed. The "maneuverability" (Poor, Average, Good, Perfect) determines bonuses/penalties to fly checks (e.g., turn, climb, dive).',
  },
  'Burrow': {
    name: 'Burrow',
    category: 'Movement',
    description: 'A creature with a burrow speed can tunnel through dirt (and possibly other materials as specified) at its listed speed. It usually cannot charge or run while burrowing; some leave no usable tunnel behind.',
  },

  // Senses
  'Darkvision': {
    name: 'Darkvision',
    category: 'Senses',
    description: 'A creature with darkvision can see in total darkness (black-and-white only) out to a specified range. It still cannot discern color, and invisible creatures remain invisible.',
  },
  'Low-light vision': {
    name: 'Low-light vision',
    category: 'Senses',
    description: 'A creature with low-light vision can see twice as far as a human in dim light (i.e., treat light levels one step better). Normal vision in bright light; suffers normal penalties in darkness unless it has darkvision.',
  },
  'Low-Light Vision': {
    name: 'Low-Light Vision',
    category: 'Senses',
    description: 'A creature with low-light vision can see twice as far as a human in dim light (i.e., treat light levels one step better). Normal vision in bright light; suffers normal penalties in darkness unless it has darkvision.',
  },
  'Scent': {
    name: 'Scent',
    category: 'Senses',
    description: 'A creature with scent can detect opponents by smell and pinpoint their square even if they are invisible or behind obstacles, subject to line of effect and type of target.',
  },
  'Blindsense': {
    name: 'Blindsense',
    category: 'Senses',
    description: 'A creature with blindsense notices things in range by non-visual sense (smell, vibration, hearing), and doesn\'t need Perception checks to pinpoint creatures in range, though it is still denied full sight and suffers normal miss chance vs. invisibility.',
  },
  'Tremorsense': {
    name: 'Tremorsense',
    category: 'Senses',
    description: 'A creature with tremorsense is sensitive to vibrations in the ground and can automatically pinpoint the location of anything in contact with the ground (or water surface for aquatic creatures) within the listed range.',
  },

  // Combat
  'Pounce': {
    name: 'Pounce',
    category: 'Combat',
    description: 'If a creature with this special attack makes a charge, it can make a full attack (including rake attacks if it also has the rake ability).',
  },
  'Grab': {
    name: 'Grab',
    category: 'Combat',
    description: 'If a creature with this special attack hits with the indicated attack (often claw or bite), it deals normal damage and can attempt to start a grapple as a free action without provoking an attack of opportunity. It usually gets a +4 racial bonus to CMB for the grapple.',
  },
  'Constrict': {
    name: 'Constrict',
    category: 'Combat',
    description: 'A creature with constrict deals additional bludgeoning damage (given in its stat-block) every time it makes a successful grapple check (in addition to any other effects).',
  },
  'Rake': {
    name: 'Rake',
    category: 'Combat',
    description: 'A creature with rake gains extra natural attacks (typically two claws) if it begins its turn grappling a foe. If it also has pounce, it can gain those rake attacks on a charge full attack as well.',
  },
  'Trip': {
    name: 'Trip',
    category: 'Combat',
    description: 'A creature with this special attack can attempt to trip its opponent as a free action without provoking an attack of opportunity if it hits with the indicated attack.',
  },
  'Trample': {
    name: 'Trample',
    category: 'Combat',
    description: 'A creature with trample can automatically overrun creatures smaller than itself as a full-round action, dealing damage equal to its slam damage + 1½× Strength modifier. The target may attempt a Reflex save for half.',
  },
  'Rend': {
    name: 'Rend',
    category: 'Combat',
    description: 'If a creature with rend hits with two or more natural attacks on the same round against the same opponent, it deals additional damage (listed in its stat block) once per round.',
  },
  'Ferocity': {
    name: 'Ferocity',
    category: 'Combat',
    description: 'A creature with ferocity remains conscious and can act while negative HP (down to –9 HP) as long as it is not blinded, helpless, or the target of a coup de grace.',
  },
  'Powerful Charge': {
    name: 'Powerful Charge',
    category: 'Combat',
    description: 'A creature with powerful charge deals extra damage when it makes a charge attack with a specific natural weapon (usually gore or slam).',
  },

  // Elemental
  'Whirlwind': {
    name: 'Whirlwind',
    category: 'Elemental',
    description: 'A creature (or elemental) with this ability can cause a spinning windstorm—a moving whirlwind that does damage and may move creatures caught within. (Used typically by elementals)',
  },
  'Burn': {
    name: 'Burn',
    category: 'Elemental',
    description: 'A creature with this special attack inflicts fire damage in addition to normal damage on a hit; the target may also catch fire (Reflex save) and continue to take fire damage for additional rounds.',
  },
  'Drench': {
    name: 'Drench',
    category: 'Elemental',
    description: 'A creature with drench (often aquatic or water-themed) may extinguish fires or cause targets to be soaked/flavored for further effects (less common in core SRD, but seen in Bestiary options).',
  },
  'Earth Glide': {
    name: 'Earth Glide',
    category: 'Elemental',
    description: 'A creature with earth glide can move through dirt, rock, or similar subterranean media as if it were air (often without provoking attacks of opportunity and leaving no tunnel).',
  },
  'Vortex': {
    name: 'Vortex',
    category: 'Elemental',
    description: 'A creature with vortex (often a water elemental or similar) can create strong swirling water or a whirlpool effect around itself that pulls in opponents and deals damage or restricts movement.',
  },

  // Plant
  'Poison': {
    name: 'Poison',
    category: 'Plant',
    description: 'A creature with poison uses a poison effect—when it hits with a specified attack, the target must make a Fortitude save or suffer the poison\'s effect (which includes onset, frequency, effect, cure).',
  },
  'Regeneration': {
    name: 'Regeneration',
    category: 'Plant',
    description: 'A creature with regeneration heals a fixed number of hit points each round (like fast healing). It can regrow severed body parts and cannot die as long as the regeneration functions. Some damage types (fire, acid, etc.) might suppress the regeneration for a round.',
  },
  'Damage Reduction': {
    name: 'Damage Reduction',
    category: 'Plant',
    description: 'The creature ignores (reduces) a specified amount of physical damage from weapons unless the attack meets special conditions/materials listed (for example DR 5/silver means it ignores 5 damage from attacks that are not silver). DR does not apply to energy damage, spells, or some special ability damage.',
  },
  'DR': {
    name: 'DR',
    category: 'Defensive',
    description: 'The creature ignores (reduces) a specified amount of physical damage from weapons unless the attack meets special conditions/materials listed (for example DR 5/silver means it ignores 5 damage from attacks that are not silver). DR does not apply to energy damage, spells, or some special ability damage.',
  },

  // Defensive
  'Energy Resistance': {
    name: 'Energy Resistance',
    category: 'Defensive',
    description: 'The creature reduces damage from a specified energy type (acid, cold, electricity, fire, sonic) by a fixed amount. Spells or effects that deal that energy type have the damage reduced by that amount.',
  },
  'Immunity': {
    name: 'Immunity',
    category: 'Defensive',
    description: 'The creature is completely immune to a specific effect (an energy type, condition, or spell).',
  },
};

/**
 * Get ability description by name (case-insensitive)
 */
export function getAbilityDescription(abilityName: string): SpecialAbility | null {
  // Try exact match first
  if (SPECIAL_ABILITIES[abilityName]) {
    return SPECIAL_ABILITIES[abilityName];
  }

  // Try case-insensitive match
  const key = Object.keys(SPECIAL_ABILITIES).find(
    k => k.toLowerCase() === abilityName.toLowerCase()
  );

  return key ? SPECIAL_ABILITIES[key] : null;
}

/**
 * Get all abilities in a category
 */
export function getAbilitiesByCategory(category: SpecialAbility['category']): SpecialAbility[] {
  return Object.values(SPECIAL_ABILITIES).filter(ability => ability.category === category);
}
