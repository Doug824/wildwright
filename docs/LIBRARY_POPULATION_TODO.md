# Library Population TODO

## Overview
Users need pre-populated wildshape forms in the Library tab so they don't have to manually create every form from scratch.

## What to Add

Create a collection of starter forms in `wildShapeTemplates` (Firestore) with common animal, elemental, and plant forms that users can clone to their personal forms list.

## Recommended Starter Forms

### Beast Shape I (EDL 4+) - Small/Medium
- **Badger** (Small): Bite, 2 claws, scent
- **Wolf** (Medium): Bite, low-light vision, scent, trip
- **Eagle** (Small): Bite, 2 talons, fly 80 ft (average), low-light vision
- **Viper** (Small): Bite (poison), scent, swim 20 ft

### Beast Shape II (EDL 6+) - Tiny/Small/Medium/Large
- **Leopard** (Medium → Large): Bite (grab), 2 claws, pounce, climb 20 ft ✅ Already created
- **Bear** (Large): Bite, 2 claws, scent, grab
- **Tiger** (Large): Bite (grab), 2 claws, pounce, rake
- **Giant Spider** (Large): Bite (poison), web, climb 30 ft
- **Dire Bat** (Large): Bite, fly 40 ft (good), blindsense 40 ft

### Beast Shape III (EDL 8+) - Diminutive/Tiny/Small/Medium/Large/Huge
- **Dire Bear** (Large/Huge): Bite, 2 claws, grab, scent
- **Dire Tiger** (Large/Huge): Bite (grab), 2 claws, pounce, rake
- **Allosaurus** (Huge): Bite, 2 claws, pounce
- **Triceratops** (Huge): Gore, trample
- **Roc** (Huge): Bite, 2 talons, fly 120 ft (average)

### Elemental Body I-IV (EDL 6+)
- **Small Air Elemental**: Fly 60 ft (perfect), whirlwind, darkvision
- **Small Earth Elemental**: Burrow 20 ft, earth glide, darkvision
- **Small Fire Elemental**: Burn, fire immunity, cold vulnerability
- **Small Water Elemental**: Swim 60 ft, drench, water mastery

(Repeat for Medium, Large, Huge sizes as EDL increases)

### Plant Shape I-III (EDL 8+)
- **Shambling Mound** (Large): 2 slams (grab), constrict, immunity to electricity
- **Treant** (Huge): 2 slams, trample, animate trees

## Data Format

Each form should include:
```typescript
{
  name: string,
  edition: 'pf1e',
  isOfficial: true,
  size: CreatureSize,
  tags: ['Beast Shape II', 'terrestrial', 'predator'],
  statModifications: {
    abilityDeltas: {}, // Empty - calculated by tier
    naturalArmor: 0, // Base natural armor if any
    size: 'Medium',
    movement: { land: 40, climb: 20 },
    senses: { lowLight: true, scent: true },
    naturalAttacks: [
      { name: 'Bite', type: 'primary', damage: '1d6', attackBonus: 0, count: 1 },
      { name: 'Claw', type: 'secondary', damage: '1d3', attackBonus: 0, count: 2 },
    ],
    specialAbilities: ['pounce', 'grab'],
    skillBonuses: {},
    traits: [],
  },
  requiredDruidLevel: 6,
  requiredSpellLevel: 'Beast Shape II',
  source: 'Pathfinder Core Rulebook',
  description: 'A sleek, powerful feline predator known for its speed and climbing ability.',
}
```

## How to Populate

1. Create a seed script: `scripts/seedLibrary.ts`
2. Use Firestore Admin SDK to batch write forms
3. Run once to populate the library
4. Users can then browse Library tab and clone forms to their personal list

## Implementation Priority

**Phase 1** (MVP):
- 10 most popular forms (Wolf, Leopard, Bear, Tiger, Dire Bear, Air Elemental, etc.)

**Phase 2**:
- Full Beast Shape I-III coverage (30-40 forms)
- All 4 elemental types at all sizes

**Phase 3**:
- Plant shapes
- Exotic/unusual forms
- User submissions?

## Integration with PF1e Engine

When a user clones a form from the library:
1. Copy template to their `wildShapeForms` collection
2. When they assume the form, use `computePF1e()` to calculate stats based on:
   - Their character's ability scores
   - Their EDL (determines available tier)
   - The form's base stats
   - Size selection (if tier allows size variation)

The library templates just store the **base form data** - all stat calculations happen at runtime using the PF1e engine! 🎲

---

**Status**: ✅ COMPLETE - Seed script ready to run!

## How to Use

1. **Get Firebase Service Account Key**
   - Visit Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Save as `scripts/service-account-key.json`

2. **Run the Seed Script**
   ```bash
   npm run seed-library
   ```

3. **Verify in Firestore**
   - Check the `wildShapeTemplates` collection in Firebase Console
   - Should see 24 starter forms

See `scripts/README.md` for detailed instructions.

**Dependencies**:
- PF1e engine ✅ Complete
- Seed script ✅ Complete
- JSON data ✅ Complete (24 starter forms)
