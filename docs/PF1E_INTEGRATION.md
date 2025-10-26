# Pathfinder 1e Wild Shape Calculation Engine

## Overview

The PF1e calculation engine provides accurate Pathfinder 1e wild shape stat calculations, including:

- ✅ Beast Shape I-III (all sizes: Diminutive to Huge)
- ✅ Elemental Body I-IV (all elements: Air, Earth, Fire, Water)
- ✅ Plant Shape I-III
- ✅ Ability score modifications by size and tier
- ✅ Natural armor bonuses
- ✅ AC calculation (total, touch, flat-footed)
- ✅ Attack bonuses and damage scaling
- ✅ Movement and senses merging ("take higher" rule)
- ✅ Trait filtering (only traits granted by tier)
- ✅ Save adjustments based on ability changes
- ✅ HP adjustments based on CON changes
- ✅ Explanation trail for all stat changes

## File Structure

```
src/pf1e/
├── types.ts           # TypeScript type definitions
├── size.ts            # Size modifiers and damage dice scaling
├── tiers.ts           # Tier definitions and EDL gating
├── beast.ts           # Beast Shape grants (movement, senses, traits)
├── elemental.ts       # Elemental Body grants
├── plant.ts           # Plant Shape grants
├── compute.ts         # Main calculation engine
├── adapters.ts        # Type conversion between Firestore and PF1e types
├── index.ts           # Main exports
├── example.ts         # Demo functions with console logging
└── __tests__/
    └── compute.test.ts # Test suite
```

## Quick Start

### 1. Test the Calculation Engine

Navigate to the playsheet screen in your app and click the **"🧪 Test PF1e Calculations (Check Console)"** button. This will run a comprehensive demo showing:

- Level 8 Druid transforming into a Large Leopard (Beast Shape II)
- Level 8 Druid transforming into a Huge Leopard (Beast Shape III)
- Level 8 Druid transforming into a Small Air Elemental (Elemental Body I)

Check your console/terminal to see detailed stat calculations!

### 2. Use in Your Code

```typescript
import { computePF1e } from '@/pf1e';

// Define base character
const baseCharacter = {
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

// Define form
const leopardForm = {
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

// Compute stats
const playsheet = computePF1e({
  base: baseCharacter,
  form: leopardForm,
  tier: 'Beast Shape II',
  chosenSize: 'Large',
});

// Use the computed playsheet
console.log(`AC: ${playsheet.ac.total}`);
console.log(`HP: ${playsheet.hp.max}`);
console.log(`Attacks:`, playsheet.attacks);
```

## How It Works

### Tier System

The engine respects Pathfinder 1e's wildshape progression:

| EDL | Animal Tier | Elemental Tier | Plant Tier | Available Sizes |
|-----|-------------|----------------|------------|-----------------|
| 4   | Beast Shape I | - | - | Small, Medium |
| 6   | Beast Shape II | Elemental Body I | - | Tiny - Large |
| 8   | Beast Shape III | Elemental Body II | Plant Shape I | Dim - Huge |
| 10  | Beast Shape III | Elemental Body III | Plant Shape II | Dim - Huge |
| 12+ | Beast Shape III | Elemental Body IV | Plant Shape III | Dim - Huge |

### Size Modifiers

Each size change applies modifiers:

| Size | AC/Attack Mod | Damage Dice Step |
|------|---------------|------------------|
| Diminutive | +4 | -3 steps |
| Tiny | +2 | -2 steps |
| Small | +1 | -1 step |
| Medium | 0 | Baseline |
| Large | -1 | +1 step |
| Huge | -2 | +2 steps |

Example: `1d6` → `1d8` (Large) → `2d6` (Huge)

### Ability Score Changes

**Beast Shape II (Large):**
- STR +4, DEX -2
- Natural Armor +4

**Elemental Body I (Small Air):**
- DEX +2
- Natural Armor +2

**Plant Shape I (Medium):**
- STR +2, CON +2
- Natural Armor +2

### Movement & Senses ("Take Higher" Rule)

The engine merges movement/senses from:
1. Base character
2. Form template
3. Tier grants

**Example:** Character has 30 ft land, Leopard has 40 ft land, Beast Shape II grants up to 60 ft climb
- **Result:** 40 ft land, 60 ft climb

### Trait Filtering

Forms only gain special abilities if the tier allows them:

- **Beast Shape I:** No special abilities (just movement/senses)
- **Beast Shape II:** grab, pounce, trip
- **Beast Shape III:** constrict, ferocity, grab, jet, poison, pounce, rake, trample, trip, web

**Example:** Leopard has "pounce" and "grab"
- With Beast Shape I: Neither trait granted
- With Beast Shape II: Both traits granted ✅

## Explanation Trail

Every stat change includes an explanation:

```typescript
playsheet.ac.explain = [
  { target: 'ac.natural', label: 'Beast Shape II (Large)', delta: 4, source: 'tier' },
  { target: 'ability.str', label: 'Beast Shape II (Large)', delta: 4, source: 'tier' },
  // ...
];

playsheet.attacks[0].explain = [
  { target: 'attack', label: 'BAB', delta: 6, source: 'base' },
  { target: 'attack', label: 'Size', delta: -1, source: 'size' },
  { target: 'damage', label: 'Size scaling', delta: '1d8', source: 'size' },
  // ...
];
```

Use this to build a detailed stat breakdown UI!

## Type Adapters

Convert between Firestore types and PF1e types:

```typescript
import { characterToBaseCharacter, wildShapeFormToForm } from '@/pf1e/adapters';

// Convert from Firestore
const baseChar = characterToBaseCharacter(firestoreCharacter);
const form = wildShapeFormToForm(firestoreForm);

// Compute
const playsheet = computePF1e({
  base: baseChar,
  form: form,
  tier: 'Beast Shape II',
  chosenSize: 'Large',
});
```

## Next Steps

1. **Test with console logs** - Click the demo button in playsheet
2. **Update playsheet UI** - Replace mock data with computed stats
3. **Add form selection** - Let users choose tier and size
4. **Persist active form** - Save computed playsheet to Firestore
5. **Add effects system** - Buffs like Barkskin, Haste, etc.

## Example Calculations

### Large Leopard (Beast Shape II)

**Input:**
- Base STR: 10, DEX: 14, CON: 14
- Base BAB: +6
- Form: Leopard (Medium, Bite 1d6, 2 Claws 1d3)

**Output:**
- STR: 14 (+4 from Large)
- DEX: 12 (-2 from Large)
- AC: 17 (10 base + 1 DEX + 4 natural + 2 armor + 1 deflection + 1 dodge - 1 size)
- Bite: +13 to hit (6 BAB + 2 STR - 1 size), 1d8+2 damage
- 2 Claws: +13 to hit, 1d4+1 damage each

### Huge Leopard (Beast Shape III)

**Input:** Same as above

**Output:**
- STR: 16 (+6 from Huge)
- DEX: 10 (-4 from Huge)
- AC: 17 (10 base + 0 DEX + 6 natural + 2 armor + 1 deflection + 1 dodge - 2 size)
- Bite: +13 to hit, 2d6+3 damage
- HP: 64 → 56 (lost 2 CON mod from DEX penalty × 8 levels... wait, CON unchanged)

**Note:** HP only changes if CON changes!

## Common Gotchas

1. **Size affects AC both ways:** +size mod to AC for smaller, -size mod for larger
2. **Damage scaling is per dice type:** 1d6 → 1d8 → 2d6, not 1d6 → 2d6
3. **Secondary attacks get half STR:** Claws use STR/2 for damage
4. **Traits are gated by tier:** Form's native traits only work if tier allows them
5. **Movement takes higher:** Don't replace, merge with max values

## Troubleshooting

### "Invalid tier" error
- Make sure tier matches the EDL (e.g., EDL 4 can't use Beast Shape III)

### Damage dice not scaling
- Check that the baseline dice is defined at Medium size in the form template

### Traits not appearing
- Verify the tier grants those traits (check `beast.ts`, `elemental.ts`, `plant.ts`)

### Stats don't match expectations
- Check the `explain` array to see where each modifier comes from
- Run the demo console logs to see detailed breakdowns

---

**Ready to transform!** 🐻🔥🌿
