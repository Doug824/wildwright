/**
 * Seed Script: Populate wildShapeTemplates Collection
 * JavaScript version (no TypeScript required)
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

function initializeFirebase() {
  const serviceAccountPath = path.join(__dirname, 'service-account-key.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized with service account key');
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialized with environment variable');
  } else {
    console.error('❌ No Firebase credentials found!');
    console.error('Please either:');
    console.error('  1. Place service-account-key.json in scripts/');
    console.error('  2. Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable');
    process.exit(1);
  }
}

// ============================================================================
// TRANSFORMATION LOGIC
// ============================================================================

function parseSenses(senses) {
  const result = {};

  senses.forEach((sense) => {
    const lower = sense.toLowerCase();

    if (lower === 'low-light vision') {
      result.lowLight = true;
    } else if (lower === 'scent' || lower === 'keen scent') {
      result.scent = true;
    } else if (lower.startsWith('darkvision')) {
      const match = lower.match(/darkvision\s+(\d+)/);
      result.darkvision = match ? parseInt(match[1], 10) : 60;
    } else if (lower.startsWith('tremorsense')) {
      const match = lower.match(/tremorsense\s+(\d+)/);
      result.tremorsense = match ? parseInt(match[1], 10) : 30;
    } else if (lower.startsWith('blindsense') || lower.startsWith('blindsight')) {
      const match = lower.match(/(?:blindsense|blindsight)\s+(\d+)/);
      result.blindsense = match ? parseInt(match[1], 10) : 30;
    }
  });

  return result;
}

function parseMovement(speed) {
  const result = {};

  if (speed.land) result.land = speed.land;
  if (speed.swim) result.swim = speed.swim;
  if (speed.climb) result.climb = speed.climb;
  if (speed.fly) result.fly = speed.fly;
  if (speed.burrow) result.burrow = speed.burrow;

  return result;
}

function parseAttacks(attacks) {
  return attacks.map((attack, index) => ({
    name: attack.name.charAt(0).toUpperCase() + attack.name.slice(1),
    type: index === 0 ? 'primary' : 'secondary',
    damage: attack.damage,
    attackBonus: 0,
    count: attack.count || 1,
  }));
}

function generateDescription(creature) {
  const typeMap = {
    'Animal': 'a natural creature',
    'Elemental': 'an elemental being',
    'Plant': 'a plant creature',
    'Magical Beast': 'a magical beast',
  };

  const baseDesc = typeMap[creature.type] || 'a creature';
  return `${creature.name} is ${baseDesc} from the ${creature.source}.`;
}

function transformCreature(creature) {
  return {
    name: creature.name,
    edition: 'pf1e',
    isOfficial: true,
    size: creature.size,
    tags: creature.tags,
    statModifications: {
      abilityDeltas: {},
      naturalArmor: 0,
      size: creature.size,
      movement: parseMovement(creature.speed),
      senses: parseSenses(creature.senses),
      naturalAttacks: parseAttacks(creature.attacks),
      specialAbilities: creature.abilities,
      skillBonuses: {},
      traits: [],
    },
    requiredDruidLevel: creature.minEDL,
    requiredSpellLevel: creature.formTier,
    source: creature.source === 'd20pfsrd' ? 'Pathfinder Core Rulebook' : creature.source,
    description: creature.notes || generateDescription(creature),
    createdAt: admin.firestore.Timestamp.now(),
  };
}

// ============================================================================
// SEED LOGIC
// ============================================================================

function loadAllCreatures() {
  const seedDataPath = path.join(__dirname, 'seed-data');
  const files = fs.readdirSync(seedDataPath)
    .filter((f) => f.endsWith('.json'))
    .filter((f) => f !== 'abilities.json');

  const allCreatures = [];

  files.forEach((file) => {
    const filePath = path.join(seedDataPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    allCreatures.push(...data);
    console.log(`📄 Loaded ${data.length} creatures from ${file}`);
  });

  return allCreatures;
}

async function seedLibrary() {
  const db = admin.firestore();
  const creatures = loadAllCreatures();

  console.log(`\n🌱 Seeding ${creatures.length} creatures to Firestore...`);

  const batchSize = 500;
  let batch = db.batch();
  let batchCount = 0;
  let totalWritten = 0;

  for (const creature of creatures) {
    const template = transformCreature(creature);
    const docRef = db.collection('wildShapeTemplates').doc(creature.slug);

    batch.set(docRef, template);
    batchCount++;

    if (batchCount === batchSize) {
      await batch.commit();
      totalWritten += batchCount;
      console.log(`✅ Written ${totalWritten}/${creatures.length} creatures...`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    totalWritten += batchCount;
  }

  console.log(`\n🎉 Successfully seeded ${totalWritten} creatures!`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🌟 WildWright Library Seeder\n');

  initializeFirebase();

  try {
    await seedLibrary();
  } catch (error) {
    console.error('❌ Error seeding library:', error);
    process.exit(1);
  }

  console.log('\n✅ Seed complete!');
  process.exit(0);
}

main();
