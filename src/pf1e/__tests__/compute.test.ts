/**
 * Unit tests for PF1e Wild Shape Computation Engine
 *
 * Tests the core calculation logic for Beast Shape, Elemental Body, and Plant Shape.
 */

import { computePF1e } from '../compute';
import { ComputeInput, BaseCharacter, Form } from '../types';

describe('computePF1e', () => {
  // ============================================================================
  // TEST DATA: Base Character
  // ============================================================================

  const baseCharacter: BaseCharacter = {
    level: 5,
    effectiveDruidLevel: 5,
    ability: {
      str: 10, // +0
      dex: 14, // +2
      con: 12, // +1
      int: 12, // +1
      wis: 16, // +3
      cha: 10, // +0
    },
    hp: {
      max: 40,
      current: 40,
    },
    bab: 3,
    ac: {
      armor: 2,
      shield: 0,
      natural: 0,
      deflection: 0,
      dodge: 1,
      misc: 0,
    },
    saves: {
      fortitude: 4,
      reflex: 3,
      will: 6,
    },
    movement: {
      land: 30,
    },
    senses: {},
  };

  // ============================================================================
  // TEST DATA: Dire Wolf (Beast Shape II, Large)
  // ============================================================================

  const direWolfForm: Form = {
    id: 'dire-wolf',
    name: 'Dire Wolf',
    kind: 'Animal',
    baseSize: 'Large',
    naturalAttacks: [
      {
        type: 'bite',
        dice: '1d8', // At Medium baseline
        primary: true,
        traits: ['trip'],
      },
    ],
    movement: {
      land: 50,
    },
    senses: {
      lowLight: true,
      scent: true,
    },
    traits: ['scent', 'low-light vision', 'trip'],
    tags: ['Quadruped', 'Canine'],
  };

  // ============================================================================
  // TEST: Beast Shape II (Large)
  // ============================================================================

  describe('Beast Shape II (Large)', () => {
    it('should apply correct size modifiers for Large creature', () => {
      const input: ComputeInput = {
        base: baseCharacter,
        form: direWolfForm,
        tier: 'Beast Shape II',
        chosenSize: 'Large',
      };

      const result = computePF1e(input);

      // Beast Shape II on Large: +4 STR, -2 DEX, +4 CON
      expect(result.size).toBe('Large');
      expect(result.ability.str).toBe(14); // 10 + 4
      expect(result.ability.dex).toBe(12); // 14 - 2
      expect(result.ability.con).toBe(16); // 12 + 4

      // Size modifier for Large = -1
      expect(result.ac.size).toBe(-1);
    });

    it('should include special abilities granted by form', () => {
      const input: ComputeInput = {
        base: baseCharacter,
        form: direWolfForm,
        tier: 'Beast Shape II',
        chosenSize: 'Large',
      };

      const result = computePF1e(input);

      // Beast Shape II grants: scent, low-light vision
      expect(result.senses.scent).toBe(true);
      expect(result.senses.lowLight).toBe(true);
    });
  });

  // ============================================================================
  // TEST: Movement
  // ============================================================================

  describe('Movement', () => {
    it('should use form movement speeds', () => {
      const input: ComputeInput = {
        base: baseCharacter,
        form: direWolfForm,
        tier: 'Beast Shape II',
        chosenSize: 'Large',
      };

      const result = computePF1e(input);

      // Dire wolf has 50 ft land speed
      expect(result.movement.land).toBe(50);
    });
  });

  // ============================================================================
  // TEST: Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle forms with no natural attacks', () => {
      const pacifistForm: Form = {
        ...direWolfForm,
        name: 'Pacifist Creature',
        naturalAttacks: [],
      };

      const input: ComputeInput = {
        base: baseCharacter,
        form: pacifistForm,
        tier: 'Beast Shape II',
        chosenSize: 'Medium',
      };

      const result = computePF1e(input);

      expect(result.attacks).toEqual([]);
    });
  });
});
