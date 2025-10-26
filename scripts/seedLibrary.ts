/**
 * Seed Script: Populate wildShapeTemplates Collection
 *
 * This script reads JSON data files and populates the Firestore
 * wildShapeTemplates collection with starter forms.
 *
 * Usage:
 *   1. Ensure FIREBASE_SERVICE_ACCOUNT_KEY env var is set OR
 *      Place service-account-key.json in scripts/
 *   2. Run: npm run seed-library
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TYPES
// ============================================================================

interface JsonCreature {
  name: string;
  slug: string;
  type: string;
  size: string;
  speed: {
    land?: number;
    fly?: number;
    swim?: number;
    climb?: number;
    burrow?: number;
    flyManeuver?: string;
  };
  senses: string[];
  attacks: {
    name: string;
    damage: string;
    count?: number;
    riders?: string[];
    conditional?: string;
  }[];
  abilities: string[];
  formTier: string;
  minEDL: number;
  tags: string[];
  source: string;
  notes?: string;
}

interface FormSenses {
  lowLight?: boolean;
  darkvision?: number;
  scent?: boolean;
  tremorsense?: number;
  blindsense?: number;
}

interface FormMovement {
  land?: number;
  swim?: number;
  climb?: number;
  fly?: number;
  burrow?: number;
}

interface NaturalAttack {
  name: string;
  type: 'primary' | 'secondary';
  damage: string;
  attackBonus: number;
  count?: number;
}

interface StatModifications {
  abilityDeltas: Record<string, never>;
  naturalArmor: number;
  size: string;
  movement: FormMovement;
  senses: FormSenses;
  naturalAttacks: NaturalAttack[];
  specialAbilities: string[];
  skillBonuses: Record<string, never>;
  traits: string[];
}

interface WildShapeTemplate {
  name: string;
  edition: 'pf1e';
  isOfficial: boolean;
  size: string;
  tags: string[];
  statModifications: StatModifications;
  requiredDruidLevel: number;
  requiredSpellLevel: string;
  source: string;
  description: string | null;
  createdAt: admin.firestore.Timestamp;
}

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

/**
 * Parse senses array into structured FormSenses object
 */
function parseSenses(senses: string[]): FormSenses {
  const result: FormSenses = {};

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

/**
 * Transform speed object to FormMovement
 */
function parseMovement(speed: JsonCreature['speed']): FormMovement {
  const result: FormMovement = {};

  if (speed.land) result.land = speed.land;
  if (speed.swim) result.swim = speed.swim;
  if (speed.climb) result.climb = speed.climb;
  if (speed.fly) result.fly = speed.fly;
  if (speed.burrow) result.burrow = speed.burrow;

  return result;
}

/**
 * Transform attacks to NaturalAttack array
 *
 * Primary attacks: First attack is usually primary
 * Secondary attacks: Additional attacks (claws, etc.) are secondary
 */
function parseAttacks(attacks: JsonCreature['attacks']): NaturalAttack[] {
  return attacks.map((attack, index) => ({
    name: attack.name.charAt(0).toUpperCase() + attack.name.slice(1),
    type: index === 0 ? 'primary' : 'secondary',
    damage: attack.damage,
    attackBonus: 0, // Will be calculated by PF1e engine
    count: attack.count || 1,
  }));
}

/**
 * Generate a description based on creature data
 */
function generateDescription(creature: JsonCreature): string {
  const typeMap: Record<string, string> = {
    'Animal': 'a natural creature',
    'Elemental': 'an elemental being',
    'Plant': 'a plant creature',
    'Magical Beast': 'a magical beast',
  };

  const baseDesc = typeMap[creature.type] || 'a creature';
  return `${creature.name} is ${baseDesc} from the ${creature.source}.`;
}

/**
 * Transform JSON creature to Firestore WildShapeTemplate
 */
function transformCreature(creature: JsonCreature): WildShapeTemplate {
  return {
    name: creature.name,
    edition: 'pf1e',
    isOfficial: true,
    size: creature.size,
    tags: creature.tags,
    statModifications: {
      abilityDeltas: {}, // Calculated by tier in PF1e engine
      naturalArmor: 0, // Calculated by tier in PF1e engine
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

/**
 * Load all JSON files from seed-data directory
 */
function loadAllCreatures(): JsonCreature[] {
  const seedDataPath = path.join(__dirname, 'seed-data');
  const files = fs.readdirSync(seedDataPath).filter((f) => f.endsWith('.json'));

  const allCreatures: JsonCreature[] = [];

  files.forEach((file) => {
    const filePath = path.join(seedDataPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    allCreatures.push(...data);
    console.log(`📄 Loaded ${data.length} creatures from ${file}`);
  });

  return allCreatures;
}

/**
 * Seed Firestore with all creatures
 */
async function seedLibrary() {
  const db = admin.firestore();
  const creatures = loadAllCreatures();

  console.log(`\n🌱 Seeding ${creatures.length} creatures to Firestore...`);

  // Use batched writes (max 500 per batch)
  const batchSize = 500;
  let batch = db.batch();
  let batchCount = 0;
  let totalWritten = 0;

  for (const creature of creatures) {
    const template = transformCreature(creature);
    const docRef = db.collection('wildShapeTemplates').doc(creature.slug);

    batch.set(docRef, template);
    batchCount++;

    // Commit batch when it reaches 500 or at the end
    if (batchCount === batchSize) {
      await batch.commit();
      totalWritten += batchCount;
      console.log(`✅ Written ${totalWritten}/${creatures.length} creatures...`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  // Commit remaining documents
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
