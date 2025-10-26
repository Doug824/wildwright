/**
 * PF1e Computation Engine Tests
 *
 * Test the wild shape calculation engine with example forms.
 */

import { computePF1e } from '../compute';
import { BaseCharacter, Form } from '../types';

describe('PF1e Wild Shape Calculations', () => {
  // Sample base character (Level 8 Druid)
  const baseCharacter: BaseCharacter = {
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
      armor: 2, // Padded armor or similar
      shield: 0,
      natural: 0,
      deflection: 1, // Ring of Protection +1
      dodge: 1, // Dodge feat
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

  // Leopard form (Medium baseline)
  const leopardForm: Form = {
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

  describe('Beast Shape I - Medium Leopard', () => {
    it('should calculate stats correctly for Medium size', () => {
      const result = computePF1e({
        base: baseCharacter,
        form: leopardForm,
        tier: 'Beast Shape I',
        chosenSize: 'Medium',
      });

      // STR +2, DEX unchanged
      expect(result.ability.str).toBe(12); // 10 + 2
      expect(result.ability.dex).toBe(14); // Unchanged

      // Natural armor +2
      expect(result.ac.breakdown.natural).toBe(2);

      // Movement: take higher (40 ft land, 20 ft climb)
      expect(result.movement.land).toBe(40);
      expect(result.movement.climb).toBe(20);

      // Senses
      expect(result.senses.lowLight).toBe(true);
      expect(result.senses.scent).toBe(true);
    });
  });

  describe('Beast Shape II - Large Leopard', () => {
    it('should calculate stats correctly for Large size', () => {
      const result = computePF1e({
        base: baseCharacter,
        form: leopardForm,
        tier: 'Beast Shape II',
        chosenSize: 'Large',
      });

      // STR +4, DEX -2 for Large
      expect(result.ability.str).toBe(14); // 10 + 4
      expect(result.ability.dex).toBe(12); // 14 - 2

      // Natural armor +4
      expect(result.ac.breakdown.natural).toBe(4);

      // Size modifier: -1 for Large
      expect(result.ac.breakdown.size).toBe(-1);

      // Attacks should scale up
      expect(result.attacks.length).toBeGreaterThan(0);

      // Bite damage should scale to 1d8 (one step up from 1d6)
      const bite = result.attacks.find((a) => a.name === 'Bite');
      expect(bite).toBeDefined();
      expect(bite?.damageDice).toContain('1d8');

      // Traits should include pounce and grab (allowed by Beast Shape II)
      expect(result.traits).toContain('pounce');
      expect(result.traits).toContain('grab');
    });
  });

  describe('Beast Shape III - Huge Leopard', () => {
    it('should calculate stats correctly for Huge size', () => {
      const result = computePF1e({
        base: baseCharacter,
        form: leopardForm,
        tier: 'Beast Shape III',
        chosenSize: 'Huge',
      });

      // STR +6, DEX -4 for Huge
      expect(result.ability.str).toBe(16); // 10 + 6
      expect(result.ability.dex).toBe(10); // 14 - 4

      // Natural armor +6
      expect(result.ac.breakdown.natural).toBe(6);

      // Size modifier: -2 for Huge
      expect(result.ac.breakdown.size).toBe(-2);

      // Bite damage should scale to 2d6 (two steps up from 1d6)
      const bite = result.attacks.find((a) => a.name === 'Bite');
      expect(bite?.damageDice).toContain('2d6');
    });
  });

  describe('Elemental Body I - Small Air Elemental', () => {
    const airElementalForm: Form = {
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

    it('should calculate stats correctly for Small Air Elemental', () => {
      const result = computePF1e({
        base: baseCharacter,
        form: airElementalForm,
        tier: 'Elemental Body I',
        element: 'Air',
        chosenSize: 'Small',
      });

      // DEX +2 for Small Air Elemental
      expect(result.ability.dex).toBe(16); // 14 + 2

      // Natural armor +2
      expect(result.ac.breakdown.natural).toBe(2);

      // Fly 60 ft (Perfect)
      expect(result.movement.fly).toBe(60);
      expect(result.movement.flyManeuver).toBe('Perfect');

      // Darkvision
      expect(result.senses.darkvision).toBe(60);

      // Traits: whirlwind, air_subtype
      expect(result.traits).toContain('whirlwind');
      expect(result.traits).toContain('air_subtype');
    });
  });

  describe('Plant Shape I - Medium Plant', () => {
    const plantForm: Form = {
      id: 'shambling-mound',
      name: 'Shambling Mound',
      kind: 'Plant',
      baseSize: 'Medium',
      naturalAttacks: [{ type: 'slam', dice: '1d6', count: 2, primary: true, traits: ['grab'] }],
      movement: {
        land: 20,
        swim: 20,
      },
      senses: {
        darkvision: 60,
        lowLight: true,
      },
      traits: ['grab', 'constrict'],
    };

    it('should calculate stats correctly for Medium Plant', () => {
      const result = computePF1e({
        base: baseCharacter,
        form: plantForm,
        tier: 'Plant Shape I',
        chosenSize: 'Medium',
      });

      // STR +2, CON +2 for Medium Plant
      expect(result.ability.str).toBe(12); // 10 + 2
      expect(result.ability.con).toBe(16); // 14 + 2

      // Natural armor +2
      expect(result.ac.breakdown.natural).toBe(2);

      // Senses
      expect(result.senses.darkvision).toBe(60);
      expect(result.senses.lowLight).toBe(true);

      // Traits: grab and constrict allowed
      expect(result.traits).toContain('grab');
      expect(result.traits).toContain('constrict');
    });
  });

  describe('Damage Scaling', () => {
    it('should scale damage dice correctly across sizes', () => {
      // Test Small (1d4), Medium (1d6), Large (1d8), Huge (2d6)
      const sizes: Array<'Small' | 'Medium' | 'Large' | 'Huge'> = ['Small', 'Medium', 'Large', 'Huge'];
      const expectedBiteDamage = ['1d4', '1d6', '1d8', '2d6'];

      sizes.forEach((size, idx) => {
        const result = computePF1e({
          base: baseCharacter,
          form: leopardForm,
          tier: 'Beast Shape II',
          chosenSize: size,
        });

        const bite = result.attacks.find((a) => a.name === 'Bite');
        expect(bite?.damageDice).toContain(expectedBiteDamage[idx]);
      });
    });
  });
});
