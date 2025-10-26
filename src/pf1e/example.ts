/**
 * PF1e Calculation Engine Example
 *
 * Run this to test the calculation engine with console logs.
 * Usage: import and call demonstrateCalculations() in your app
 */

import { computePF1e } from './compute';
import { BaseCharacter, Form } from './types';

/**
 * Example: Level 8 Druid transforming into a Leopard
 */
export function demonstrateCalculations() {
  console.log('\n='.repeat(60));
  console.log('🐆 PATHFINDER 1E WILD SHAPE CALCULATION DEMO');
  console.log('='.repeat(60));

  // Base character (Level 8 Druid)
  const druid: BaseCharacter = {
    level: 8,
    effectiveDruidLevel: 8,
    ability: {
      str: 10,
      dex: 14,
      con: 14,
      int: 12,
      wis: 18,
      cha: 8,
    },
    hp: { max: 64, current: 64 },
    bab: 6,
    ac: {
      armor: 2,
      shield: 0,
      natural: 0,
      deflection: 1,
      dodge: 1,
      misc: 0,
    },
    saves: {
      fortitude: 6,
      reflex: 3,
      will: 10,
    },
    movement: {
      land: 30,
    },
    senses: {},
  };

  console.log('\n📊 BASE CHARACTER (Level 8 Druid)');
  console.log('  STR: 10 (+0) | DEX: 14 (+2) | CON: 14 (+2)');
  console.log('  HP: 64 | BAB: +6 | AC: 14 (10 + 2 armor + 1 deflection + 1 dodge)');
  console.log('  Saves: Fort +6, Ref +3, Will +10');

  // Leopard form
  const leopard: Form = {
    id: 'leopard',
    name: 'Leopard',
    kind: 'Animal',
    baseSize: 'Medium',
    naturalAttacks: [
      { type: 'bite', dice: '1d6', primary: true, traits: ['grab'] },
      { type: 'claw', dice: '1d3', count: 2, primary: false },
    ],
    movement: {
      land: 40,
      climb: 20,
    },
    senses: {
      lowLight: true,
      scent: true,
    },
    traits: ['pounce', 'grab'],
    tags: ['Quadruped', 'Feline'],
  };

  console.log('\n🐆 LEOPARD FORM (Native Stats)');
  console.log('  Size: Medium');
  console.log('  Movement: 40 ft land, 20 ft climb');
  console.log('  Attacks: Bite (1d6), 2 Claws (1d3)');
  console.log('  Traits: Pounce, Grab');

  // Test 1: Beast Shape II - Large Leopard
  console.log('\n' + '='.repeat(60));
  console.log('🔮 TEST 1: Beast Shape II - LARGE LEOPARD (EDL 6+)');
  console.log('='.repeat(60));

  const largeLeopard = computePF1e({
    base: druid,
    form: leopard,
    tier: 'Beast Shape II',
    chosenSize: 'Large',
  });

  console.log('\n✅ COMPUTED STATS:');
  console.log(`  Size: ${largeLeopard.size}`);
  console.log(
    `  STR: ${largeLeopard.ability.str} (+${Math.floor((largeLeopard.ability.str - 10) / 2)}) [Base 10 + 4 size]`
  );
  console.log(
    `  DEX: ${largeLeopard.ability.dex} (+${Math.floor((largeLeopard.ability.dex - 10) / 2)}) [Base 14 - 2 size]`
  );
  console.log(
    `  CON: ${largeLeopard.ability.con} (+${Math.floor((largeLeopard.ability.con - 10) / 2)})`
  );
  console.log(`  HP: ${largeLeopard.hp.max} (${largeLeopard.hp.max - druid.hp.max} change)`);
  console.log(`  AC: ${largeLeopard.ac.total} (Touch: ${largeLeopard.ac.touch}, FF: ${largeLeopard.ac.flatFooted})`);
  console.log('  AC Breakdown:');
  Object.entries(largeLeopard.ac.breakdown).forEach(([key, value]) => {
    if (value !== 0 && key !== 'base') {
      console.log(`    ${key}: ${value > 0 ? '+' : ''}${value}`);
    }
  });
  console.log(
    `  Saves: Fort +${largeLeopard.saves.fortitude}, Ref +${largeLeopard.saves.reflex}, Will +${largeLeopard.saves.will}`
  );
  console.log(
    `  Movement: ${largeLeopard.movement.land} ft land${largeLeopard.movement.climb ? `, ${largeLeopard.movement.climb} ft climb` : ''}`
  );
  console.log('  Senses:', Object.entries(largeLeopard.senses).filter(([, v]) => v).map(([k, v]) => `${k} ${typeof v === 'number' ? v + ' ft' : ''}`).join(', '));

  console.log('\n⚔️  ATTACKS:');
  largeLeopard.attacks.forEach((attack) => {
    const bonus = attack.attackBonus >= 0 ? `+${attack.attackBonus}` : `${attack.attackBonus}`;
    const traitsStr = attack.traits && attack.traits.length > 0 ? ` (${attack.traits.join(', ')})` : '';
    console.log(
      `  ${attack.name}${attack.count > 1 ? ` (×${attack.count})` : ''}: ${bonus} to hit, ${attack.damageDice} damage${traitsStr}`
    );
  });

  console.log('\n🔍 TRAITS:');
  largeLeopard.traits.forEach((trait) => {
    console.log(`  • ${trait}`);
  });

  // Test 2: Beast Shape III - Huge Leopard
  console.log('\n' + '='.repeat(60));
  console.log('🔮 TEST 2: Beast Shape III - HUGE LEOPARD (EDL 8+)');
  console.log('='.repeat(60));

  const hugeLeopard = computePF1e({
    base: druid,
    form: leopard,
    tier: 'Beast Shape III',
    chosenSize: 'Huge',
  });

  console.log('\n✅ COMPUTED STATS:');
  console.log(`  Size: ${hugeLeopard.size}`);
  console.log(
    `  STR: ${hugeLeopard.ability.str} (+${Math.floor((hugeLeopard.ability.str - 10) / 2)}) [Base 10 + 6 size]`
  );
  console.log(
    `  DEX: ${hugeLeopard.ability.dex} (+${Math.floor((hugeLeopard.ability.dex - 10) / 2)}) [Base 14 - 4 size]`
  );
  console.log(`  HP: ${hugeLeopard.hp.max}`);
  console.log(`  AC: ${hugeLeopard.ac.total} (Natural Armor: +${hugeLeopard.ac.breakdown.natural}, Size: ${hugeLeopard.ac.breakdown.size})`);

  console.log('\n⚔️  ATTACKS:');
  hugeLeopard.attacks.forEach((attack) => {
    const bonus = attack.attackBonus >= 0 ? `+${attack.attackBonus}` : `${attack.attackBonus}`;
    console.log(`  ${attack.name}: ${bonus} to hit, ${attack.damageDice} damage`);
  });

  // Test 3: Small Air Elemental
  console.log('\n' + '='.repeat(60));
  console.log('🔮 TEST 3: Elemental Body I - SMALL AIR ELEMENTAL (EDL 6+)');
  console.log('='.repeat(60));

  const airElemental: Form = {
    id: 'air-elemental',
    name: 'Air Elemental',
    kind: 'Elemental',
    baseSize: 'Small',
    element: 'Air',
    naturalAttacks: [{ type: 'slam', dice: '1d4', primary: true }],
    movement: {
      fly: 60,
    },
    senses: {
      darkvision: 60,
    },
    traits: [],
  };

  const smallAir = computePF1e({
    base: druid,
    form: airElemental,
    tier: 'Elemental Body I',
    element: 'Air',
    chosenSize: 'Small',
  });

  console.log('\n✅ COMPUTED STATS:');
  console.log(`  Size: ${smallAir.size}`);
  console.log(
    `  DEX: ${smallAir.ability.dex} (+${Math.floor((smallAir.ability.dex - 10) / 2)}) [Base 14 + 2 size]`
  );
  console.log(`  AC: ${smallAir.ac.total}`);
  console.log(`  Movement: Fly ${smallAir.movement.fly} ft (${smallAir.movement.flyManeuver})`);

  console.log('\n⚔️  ATTACKS:');
  smallAir.attacks.forEach((attack) => {
    const bonus = attack.attackBonus >= 0 ? `+${attack.attackBonus}` : `${attack.attackBonus}`;
    console.log(`  ${attack.name}: ${bonus} to hit, ${attack.damageDice} damage`);
  });

  console.log('\n🔍 TRAITS:');
  smallAir.traits.forEach((trait) => {
    console.log(`  • ${trait}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✨ DEMO COMPLETE!');
  console.log('='.repeat(60) + '\n');
}

/**
 * Quick test with just a simple Leopard transformation
 */
export function quickTest() {
  const druid: BaseCharacter = {
    level: 8,
    effectiveDruidLevel: 8,
    ability: { str: 10, dex: 14, con: 14, int: 12, wis: 18, cha: 8 },
    hp: { max: 64, current: 64 },
    bab: 6,
    ac: { armor: 2, shield: 0, natural: 0, deflection: 1, dodge: 1, misc: 0 },
    saves: { fortitude: 6, reflex: 3, will: 10 },
    movement: { land: 30 },
    senses: {},
  };

  const leopard: Form = {
    id: 'leopard',
    name: 'Leopard',
    kind: 'Animal',
    baseSize: 'Medium',
    naturalAttacks: [
      { type: 'bite', dice: '1d6', primary: true, traits: ['grab'] },
      { type: 'claw', dice: '1d3', count: 2, primary: false },
    ],
    movement: { land: 40, climb: 20 },
    senses: { lowLight: true, scent: true },
    traits: ['pounce', 'grab'],
  };

  const result = computePF1e({
    base: druid,
    form: leopard,
    tier: 'Beast Shape II',
    chosenSize: 'Large',
  });

  console.log('Quick Test Result:', JSON.stringify(result, null, 2));
}
