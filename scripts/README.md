# Scripts Directory

This directory contains utility scripts for the WildWright project.

## seedLibrary.ts

Populates the `wildShapeTemplates` Firestore collection with starter wildshape forms.

### Prerequisites

1. **Firebase Service Account Key**

   You need a Firebase service account key to run this script. Get one from the Firebase Console:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to **Project Settings** → **Service Accounts**
   - Click **Generate New Private Key**
   - Save the JSON file

2. **Setup (Choose one option)**

   **Option A: Place key file in scripts/**
   ```bash
   # Save the downloaded key as scripts/service-account-key.json
   # Make sure to add this to .gitignore (already included)
   ```

   **Option B: Use environment variable**
   ```bash
   export FIREBASE_SERVICE_ACCOUNT_KEY='<paste entire JSON here>'
   ```

### Usage

```bash
# Run the seed script
npm run seed-library
```

This will:
1. Read all JSON files from `scripts/seed-data/`
2. Transform them into Firestore `WildShapeTemplate` format
3. Batch write to the `wildShapeTemplates` collection
4. Display progress and completion status

### Seed Data Files

The `seed-data/` directory contains JSON files organized by creature type:
- `animals_land.json` - Terrestrial animals (wolf, bear, leopard, etc.)
- `animals_flying.json` - Flying animals (eagle, hawk, owl, bat)
- `reptiles_amphibians.json` - Reptiles and amphibians (snake, crocodile, frog)
- `aquatic.json` - Aquatic creatures (dolphin, shark)
- `plants.json` - Plant creatures (assassin vine, shambling mound, treant)
- `elementals_small.json` - Small elementals (air, earth, fire, water)
- `magical_beasts.json` - Magical beasts (basilisk, cockatrice, griffon)

### Adding More Creatures

To add more creatures to the library:

1. Create a new JSON file in `seed-data/` or edit an existing one
2. Follow the JSON structure:
   ```json
   {
     "name": "Creature Name",
     "slug": "creature-name",
     "type": "Animal|Elemental|Plant|Magical Beast",
     "size": "Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal",
     "speed": { "land": 40, "climb": 20, "fly": 60 },
     "senses": ["low-light vision", "scent"],
     "attacks": [
       { "name": "bite", "damage": "1d6", "riders": ["grab"] },
       { "name": "claw", "damage": "1d4", "count": 2 }
     ],
     "abilities": ["pounce", "grab"],
     "formTier": "Beast Shape II",
     "minEDL": 6,
     "tags": ["beast-shape-ii", "animal", "quadruped"],
     "source": "d20pfsrd",
     "notes": "Optional description"
   }
   ```
3. Run `npm run seed-library` to update the database

### Safety

- The script uses Firestore `batch.set()` which **overwrites** existing documents with the same slug
- Running the script multiple times is safe - it's idempotent
- No data is deleted, only created/updated

### Troubleshooting

**Error: No Firebase credentials found**
- Ensure you've set up the service account key (see Prerequisites)

**Error: Permission denied**
- Verify your service account has `Cloud Datastore User` role
- Check Firestore security rules allow writes to `wildShapeTemplates`

**Error: Module not found**
- Run `npm install` to install dependencies
