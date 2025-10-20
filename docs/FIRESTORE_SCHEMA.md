# Firestore Database Schema

**Project:** WildWright - Wild Shape Tracker
**Database:** Firebase Firestore (NoSQL)
**Edition Support:** Pathfinder 1e (v1.0), with support for D&D 5e and PF2e planned

---

## Overview

This document describes the Firestore collections and document structure for WildWright. Unlike SQL databases, Firestore is a NoSQL document database with collections containing documents.

### Key Differences from SQL:
- **No foreign keys** - Use document references instead
- **No JOIN operations** - Denormalize data when needed
- **Security Rules** - Replace Row Level Security (RLS)
- **Auto-generated IDs** - Firestore generates unique IDs automatically
- **Native nested data** - No need for JSONB, objects are native

---

## Collections Structure

```
firestore/
├── users/                          # User profiles
│   └── {userId}/
│       └── (user data)
│
├── characters/                     # Player characters
│   └── {characterId}/
│       └── (character data)
│
├── wildShapeForms/                # User's custom wild shape forms
│   └── {formId}/
│       └── (form data)
│
└── wildShapeTemplates/            # Official SRD templates (read-only)
    └── {templateId}/
        └── (template data)
```

---

## Collection: `users`

**Purpose:** User profiles linked to Firebase Auth

### Document Structure
```typescript
{
  // Document ID: matches Firebase Auth UID
  email: string;                    // User's email
  displayName: string | null;       // Optional display name
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Example Document
```json
{
  "email": "druid@example.com",
  "displayName": "Eldrin the Wise",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

### Security Rules
- Users can only read/write their own profile
- Profile created automatically on first auth

---

## Collection: `characters`

**Purpose:** Player character sheets and stats

### Document Structure
```typescript
{
  // Document ID: auto-generated
  ownerId: string;                  // Reference to users/{userId}
  name: string;
  edition: 'pf1e' | 'dnd5e' | 'pf2e';

  // Base Stats (nested object)
  baseStats: {
    level: number;
    effectiveDruidLevel: number;
    abilityScores: {
      str: number;
      dex: number;
      con: number;
      int: number;
      wis: number;
      cha: number;
    };
    ac: number;
    hp: {
      current: number;
      max: number;
    };
    saves: {
      fortitude: number;
      reflex: number;
      will: number;
    };
    bab: number;
    skills: Record<string, number>;  // { Perception: 12, Stealth: 8, ... }
    movement: {
      land: number;
      swim?: number;
      climb?: number;
      fly?: number;
    };
    senses: string[];                // ['low-light vision', 'scent']
    size: string;                    // 'Medium', 'Small', etc.
    traits: string[];                // ['elf', 'druid']
  };

  // Features & Modifiers
  features: {
    feats: string[];
    classFeatures: string[];
    raceTraits: string[];
    wildShapeVariants: string[];
  };

  // Daily Wild Shape Uses
  dailyUsesMax: number | null;      // null = infinite
  dailyUsesCurrent: number;

  // User Preferences
  preferences: {
    autoResetTime: string;          // "04:00"
    theme: 'light' | 'dark';
    defaultView: 'cards' | 'list';
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Example Document
```json
{
  "ownerId": "user123",
  "name": "Eldrin Moonwhisper",
  "edition": "pf1e",
  "baseStats": {
    "level": 8,
    "effectiveDruidLevel": 8,
    "abilityScores": {
      "str": 10,
      "dex": 14,
      "con": 12,
      "int": 13,
      "wis": 18,
      "cha": 10
    },
    "ac": 16,
    "hp": { "current": 52, "max": 52 },
    "saves": { "fortitude": 8, "reflex": 5, "will": 10 },
    "bab": 6,
    "skills": {
      "Perception": 15,
      "Stealth": 8,
      "Knowledge (nature)": 12
    },
    "movement": { "land": 30 },
    "senses": ["low-light vision"],
    "size": "Medium",
    "traits": ["elf", "druid"]
  },
  "features": {
    "feats": ["Natural Spell", "Augment Summoning"],
    "classFeatures": ["Wild Empathy", "Woodland Stride", "Trackless Step"],
    "raceTraits": ["Elven Immunities"],
    "wildShapeVariants": ["Beast Shape II", "Elemental Body I"]
  },
  "dailyUsesMax": 8,
  "dailyUsesCurrent": 8,
  "preferences": {
    "autoResetTime": "04:00",
    "theme": "dark",
    "defaultView": "cards"
  },
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

### Indexes
- `ownerId` (for querying user's characters)
- `edition` (for filtering by game system)

### Security Rules
- Users can only read/write their own characters
- ownerId must match authenticated user on create

---

## Collection: `wildShapeForms`

**Purpose:** User's custom wild shape forms (linked to characters)

### Document Structure
```typescript
{
  // Document ID: auto-generated
  ownerId: string;                  // Reference to users/{userId}
  characterId: string | null;       // Reference to characters/{id}, null = shared across chars

  // Basic Info
  name: string;
  edition: 'pf1e' | 'dnd5e' | 'pf2e';
  imageUrl: string | null;          // Firebase Storage URL

  // Template Reference
  baseTemplateId: string | null;    // Reference to wildShapeTemplates/{id}
  isCustom: boolean;

  // Form Properties
  size: 'Fine' | 'Diminutive' | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' | 'Colossal';

  // Tags for filtering
  tags: string[];                   // ['Beast Shape I', 'terrestrial', 'flying']

  // Stat Modifications
  statModifications: {
    abilityDeltas: {
      str?: number;
      dex?: number;
      con?: number;
      int?: number;
      wis?: number;
      cha?: number;
    };
    naturalArmor: number;
    size: string;
    movement: {
      land?: number;
      swim?: number;
      climb?: number;
      fly?: number;
      burrow?: number;
    };
    senses: {
      lowLight?: boolean;
      darkvision?: number;
      scent?: boolean;
      tremorsense?: number;
    };
    naturalAttacks: Array<{
      name: string;
      type: 'primary' | 'secondary';
      damage: string;               // '1d6', '2d4', etc.
      attackBonus: number;
      count?: number;               // for multiple attacks (2 claws)
    }>;
    specialAbilities: string[];     // ['grab', 'pounce', 'rake']
    skillBonuses: Record<string, number>;
    traits: string[];
  };

  // Requirements
  requiredDruidLevel: number;
  requiredSpellLevel: string;       // 'Beast Shape I', 'Beast Shape II', etc.

  // User Notes
  notes: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Example Document
```json
{
  "ownerId": "user123",
  "characterId": "char456",
  "name": "Dire Wolf",
  "edition": "pf1e",
  "imageUrl": "https://storage.googleapis.com/.../dire-wolf.jpg",
  "baseTemplateId": "template789",
  "isCustom": false,
  "size": "Large",
  "tags": ["Beast Shape II", "terrestrial", "quadruped"],
  "statModifications": {
    "abilityDeltas": {
      "str": 4,
      "dex": -2,
      "con": 4
    },
    "naturalArmor": 2,
    "size": "Large",
    "movement": {
      "land": 50
    },
    "senses": {
      "lowLight": true,
      "scent": true
    },
    "naturalAttacks": [
      {
        "name": "Bite",
        "type": "primary",
        "damage": "1d8",
        "attackBonus": 0
      }
    ],
    "specialAbilities": ["trip"],
    "skillBonuses": {
      "Perception": 2,
      "Stealth": 2,
      "Survival": 2
    },
    "traits": ["scent"]
  },
  "requiredDruidLevel": 6,
  "requiredSpellLevel": "Beast Shape II",
  "notes": "Great for combat and tracking",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

### Indexes
- `ownerId` (for querying user's forms)
- `characterId` (for querying character's forms)
- `tags` (array-contains for filtering)
- `edition` (for filtering by game system)

### Security Rules
- Users can only read/write their own forms
- ownerId must match authenticated user

---

## Collection: `wildShapeTemplates`

**Purpose:** Official SRD-derived templates (read-only for users)

### Document Structure
```typescript
{
  // Document ID: auto-generated

  // Template Info
  name: string;
  edition: 'pf1e' | 'dnd5e' | 'pf2e';
  isOfficial: boolean;              // true for SRD data

  // Same structure as wildShapeForms
  size: string;
  tags: string[];
  statModifications: { /* same as above */ };
  requiredDruidLevel: number;
  requiredSpellLevel: string;

  // Template Metadata
  source: string;                   // "Pathfinder Core Rulebook", "Bestiary"
  description: string | null;

  createdAt: Timestamp;
}
```

### Example Document
```json
{
  "name": "Brown Bear",
  "edition": "pf1e",
  "isOfficial": true,
  "size": "Large",
  "tags": ["Beast Shape I", "terrestrial", "quadruped"],
  "statModifications": {
    "abilityDeltas": {
      "str": 4,
      "dex": -2,
      "con": 2
    },
    "naturalArmor": 2,
    "size": "Large",
    "movement": { "land": 40 },
    "senses": { "lowLight": true, "scent": true },
    "naturalAttacks": [
      { "name": "Bite", "type": "primary", "damage": "1d6", "attackBonus": 0 },
      { "name": "Claw", "type": "primary", "damage": "1d4", "attackBonus": 0, "count": 2 }
    ],
    "specialAbilities": ["grab"],
    "skillBonuses": { "Perception": 4 },
    "traits": ["scent"]
  },
  "requiredDruidLevel": 4,
  "requiredSpellLevel": "Beast Shape I",
  "source": "Pathfinder Bestiary",
  "description": "A powerful omnivore found in temperate forests",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

### Indexes
- `edition` (for filtering by game system)
- `tags` (array-contains for filtering)

### Security Rules
- Read-only for all authenticated users
- Only admins can write (via backend/scripts)

---

## Firestore Security Rules

Create `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(ownerId) {
      return isAuthenticated() && request.auth.uid == ownerId;
    }

    // Users collection
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }

    // Characters collection
    match /characters/{characterId} {
      allow read: if isAuthenticated() && resource.data.ownerId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.ownerId == request.auth.uid;
    }

    // Wild Shape Forms collection
    match /wildShapeForms/{formId} {
      allow read: if isAuthenticated() && resource.data.ownerId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.ownerId == request.auth.uid;
    }

    // Wild Shape Templates collection (read-only)
    match /wildShapeTemplates/{templateId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only allow via admin SDK
    }
  }
}
```

---

## Migration from SQL Schema

### Key Changes:
1. **UUIDs → Firestore IDs**: Use auto-generated document IDs
2. **REFERENCES → ownerId fields**: Store user ID string instead of foreign key
3. **JSONB → Native objects**: Firestore handles nested data natively
4. **ENUM → String validation**: Use string fields, validate in security rules
5. **Timestamps**: Use Firestore `Timestamp` type
6. **Arrays**: Use native Firestore arrays for tags, features, etc.
7. **Indexes**: Created automatically or via Firebase Console

### Data Denormalization:
- Character data stored in document (no JOIN needed)
- Forms reference characterId but are independent documents
- Templates are separate, referenced by ID

---

## Next Steps

1. **Set up Firebase Project** in Firebase Console
2. **Enable Firestore** in the console
3. **Deploy Security Rules** from `firestore.rules`
4. **Create indexes** as needed (Firestore will prompt)
5. **Seed template data** for PF1e wild shape forms
6. **Set up Firebase Storage** for form images
