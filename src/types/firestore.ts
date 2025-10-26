/**
 * Firestore Database Types
 *
 * Type definitions for all Firestore collections and documents.
 * Based on docs/FIRESTORE_SCHEMA.md
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type GameEdition = 'pf1e' | 'dnd5e' | 'pf2e';

export type CreatureSize =
  | 'Fine'
  | 'Diminutive'
  | 'Tiny'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'Huge'
  | 'Gargantuan'
  | 'Colossal';

export type ThemeMode = 'light' | 'dark';
export type DefaultView = 'cards' | 'list';

// ============================================================================
// USER PROFILE
// ============================================================================

export interface UserProfile {
  // Document ID matches Firebase Auth UID
  email: string;
  displayName: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// CHARACTER
// ============================================================================

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface HitPoints {
  current: number;
  max: number;
}

export interface SavingThrows {
  fortitude: number;
  reflex: number;
  will: number;
}

export interface Movement {
  land: number;
  swim?: number;
  climb?: number;
  fly?: number;
}

export interface BaseStats {
  level: number;
  effectiveDruidLevel: number;
  abilityScores: AbilityScores;
  ac: number;
  hp: HitPoints;
  saves: SavingThrows;
  bab: number;
  skills: Record<string, number>; // { "Perception": 12, "Stealth": 8 }
  movement: Movement;
  senses: string[]; // ['low-light vision', 'scent']
  size: string; // 'Medium', 'Small', etc.
  traits: string[]; // ['elf', 'druid']
}

export interface CharacterFeatures {
  feats: string[];
  classFeatures: string[];
  raceTraits: string[];
  wildShapeVariants: string[];
}

export interface CharacterPreferences {
  autoResetTime: string; // "04:00"
  theme: ThemeMode;
  defaultView: DefaultView;
}

export interface Character {
  // Document ID: auto-generated
  ownerId: string; // Reference to users/{userId}
  name: string;
  edition: GameEdition;
  baseStats: BaseStats;
  features: CharacterFeatures;
  dailyUsesMax: number | null; // null = infinite
  dailyUsesCurrent: number;
  preferences: CharacterPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// WILD SHAPE FORMS
// ============================================================================

export interface AbilityDeltas {
  str?: number;
  dex?: number;
  con?: number;
  int?: number;
  wis?: number;
  cha?: number;
}

export interface FormMovement {
  land?: number;
  swim?: number;
  climb?: number;
  fly?: number;
  burrow?: number;
}

export interface FormSenses {
  lowLight?: boolean;
  darkvision?: number; // Distance in feet
  scent?: boolean;
  tremorsense?: number; // Distance in feet
}

export type NaturalAttackType = 'primary' | 'secondary';

export interface NaturalAttack {
  name: string;
  type: NaturalAttackType;
  damage: string; // '1d6', '2d4', etc.
  attackBonus: number;
  count?: number; // For multiple attacks (e.g., 2 claws)
}

export interface StatModifications {
  abilityDeltas: AbilityDeltas;
  naturalArmor: number;
  size: string;
  movement: FormMovement;
  senses: FormSenses;
  naturalAttacks: NaturalAttack[];
  specialAbilities: string[]; // ['grab', 'pounce', 'rake']
  skillBonuses: Record<string, number>; // { "Stealth": 4, "Perception": 2 }
  traits: string[]; // ['scent', 'aquatic']
}

export interface WildShapeForm {
  // Document ID: auto-generated
  ownerId: string; // Reference to users/{userId}
  characterId: string | null; // Reference to characters/{id}, null = shared

  // Basic Info
  name: string;
  edition: GameEdition;
  imageUrl: string | null; // Firebase Storage URL

  // Template Reference
  baseTemplateId: string | null; // Reference to wildShapeTemplates/{id}
  isCustom: boolean;

  // Form Properties
  size: CreatureSize;
  tags: string[]; // ['Beast Shape I', 'terrestrial', 'flying']
  statModifications: StatModifications;

  // Requirements
  requiredDruidLevel: number;
  requiredSpellLevel: string; // 'Beast Shape I', 'Beast Shape II', etc.

  // User Preferences
  isFavorite?: boolean; // Show on home screen as favorite

  // User Notes
  notes: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================================================
// WILD SHAPE TEMPLATES
// ============================================================================

export interface WildShapeTemplate {
  // Document ID: auto-generated

  // Template Info
  name: string;
  edition: GameEdition;
  isOfficial: boolean; // true for SRD data

  // Same structure as WildShapeForm
  size: CreatureSize;
  tags: string[];
  statModifications: StatModifications;
  requiredDruidLevel: number;
  requiredSpellLevel: string;

  // Template Metadata
  source: string; // "Pathfinder Core Rulebook", "Bestiary"
  description: string | null;

  createdAt: Timestamp;
}

// ============================================================================
// FIRESTORE QUERY TYPES
// ============================================================================

// For creating new documents (without auto-generated fields)
export type CreateUserProfile = Omit<UserProfile, 'createdAt' | 'updatedAt'>;
export type CreateCharacter = Omit<Character, 'createdAt' | 'updatedAt'>;
export type CreateWildShapeForm = Omit<WildShapeForm, 'createdAt' | 'updatedAt'>;

// For updating documents (partial updates)
export type UpdateCharacter = Partial<Omit<Character, 'ownerId' | 'createdAt' | 'updatedAt'>>;
export type UpdateWildShapeForm = Partial<Omit<WildShapeForm, 'ownerId' | 'createdAt' | 'updatedAt'>>;
export type UpdateUserProfile = Partial<Omit<UserProfile, 'email' | 'createdAt' | 'updatedAt'>>;

// ============================================================================
// HELPER TYPES
// ============================================================================

// For documents with Firestore-generated IDs
export interface FirestoreDocument {
  id: string;
}

// Full document types with IDs
export type CharacterWithId = Character & FirestoreDocument;
export type WildShapeFormWithId = WildShapeForm & FirestoreDocument;
export type WildShapeTemplateWithId = WildShapeTemplate & FirestoreDocument;
export type UserProfileWithId = UserProfile & FirestoreDocument;
