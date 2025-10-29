/**
 * Characters Service
 *
 * Handles all Firestore operations for characters collection.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import {
  Character,
  CreateCharacter,
  UpdateCharacter,
  CharacterWithId,
} from '@/types/firestore';

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new character in Firestore
 *
 * Automatically sets the ownerId, createdAt, and updatedAt timestamps.
 *
 * @param ownerId - The ID of the user who owns this character
 * @param characterData - Character data including name, class, level, stats, etc.
 * @returns The Firestore document ID of the newly created character
 * @throws {Error} If character creation fails
 *
 * @example
 * ```typescript
 * const characterId = await createCharacter('user123', {
 *   name: 'Elara',
 *   class: 'Druid',
 *   level: 5,
 *   edition: 'pf1e',
 *   baseStats: { str: 10, dex: 14, con: 12, int: 13, wis: 16, cha: 8 },
 *   // ... other fields
 * });
 * ```
 */
export const createCharacter = async (
  ownerId: string,
  characterData: Omit<CreateCharacter, 'ownerId'>
): Promise<string> => {
  try {
    const charactersRef = collection(db, COLLECTIONS.CHARACTERS);

    const newCharacter: CreateCharacter = {
      ...characterData,
      ownerId,
    };

    const docRef = await addDoc(charactersRef, {
      ...newCharacter,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Create character error:', error);
    throw new Error('Failed to create character');
  }
};

// ============================================================================
// READ
// ============================================================================

/**
 * Get a single character by ID from Firestore
 *
 * @param characterId - The Firestore document ID of the character
 * @returns The character with ID, or null if not found
 * @throws {Error} If the query fails
 *
 * @example
 * ```typescript
 * const character = await getCharacter('abc123');
 * if (character) {
 *   console.log(`Found character: ${character.name}`);
 * }
 * ```
 */
export const getCharacter = async (characterId: string): Promise<CharacterWithId | null> => {
  try {
    const characterDoc = await getDoc(doc(db, COLLECTIONS.CHARACTERS, characterId));

    if (!characterDoc.exists()) {
      return null;
    }

    return {
      id: characterDoc.id,
      ...characterDoc.data(),
    } as CharacterWithId;
  } catch (error) {
    console.error('Get character error:', error);
    throw new Error('Failed to get character');
  }
};

/**
 * Get all characters owned by a user
 *
 * Returns characters sorted by creation date (newest first).
 *
 * @param userId - The user's ID (from Firebase Auth)
 * @returns Array of characters owned by the user (may be empty)
 * @throws {Error} If the query fails
 *
 * @example
 * ```typescript
 * const characters = await getUserCharacters('user123');
 * console.log(`User has ${characters.length} characters`);
 * ```
 */
export const getUserCharacters = async (userId: string): Promise<CharacterWithId[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CHARACTERS),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CharacterWithId[];
  } catch (error) {
    console.error('Get user characters error:', error);
    throw new Error('Failed to get characters');
  }
};

/**
 * Get all characters for a specific game edition
 *
 * Useful for filtering characters by game system (e.g., 'pf1e', 'pf2e').
 *
 * @param userId - The user's ID (from Firebase Auth)
 * @param edition - The game edition to filter by (e.g., 'pf1e')
 * @returns Array of characters for the specified edition
 * @throws {Error} If the query fails
 *
 * @example
 * ```typescript
 * const pf1eCharacters = await getCharactersByEdition('user123', 'pf1e');
 * ```
 */
export const getCharactersByEdition = async (
  userId: string,
  edition: string
): Promise<CharacterWithId[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.CHARACTERS),
      where('ownerId', '==', userId),
      where('edition', '==', edition),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CharacterWithId[];
  } catch (error) {
    console.error('Get characters by edition error:', error);
    throw new Error('Failed to get characters');
  }
};

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update character data in Firestore
 *
 * Automatically updates the `updatedAt` timestamp.
 * Only updates the fields provided in the updates object.
 *
 * @param characterId - The Firestore document ID of the character
 * @param updates - Partial character data to update
 * @throws {Error} If the update fails
 *
 * @example
 * ```typescript
 * // Update just the level
 * await updateCharacter('abc123', { level: 6 });
 *
 * // Update multiple fields
 * await updateCharacter('abc123', {
 *   level: 6,
 *   dailyUsesMax: 3,
 *   dailyUsesCurrent: 3,
 * });
 * ```
 */
export const updateCharacter = async (
  characterId: string,
  updates: UpdateCharacter
): Promise<void> => {
  try {
    const characterRef = doc(db, COLLECTIONS.CHARACTERS, characterId);

    await updateDoc(characterRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update character error:', error);
    throw new Error('Failed to update character');
  }
};

/**
 * Update character's current daily wild shape uses
 *
 * Convenience method for updating only the dailyUsesCurrent field.
 *
 * @param characterId - The Firestore document ID of the character
 * @param dailyUsesCurrent - The new current uses value
 * @throws {Error} If the update fails
 *
 * @example
 * ```typescript
 * // After using wild shape
 * await updateDailyUses('abc123', 2); // 2 uses remaining
 * ```
 */
export const updateDailyUses = async (
  characterId: string,
  dailyUsesCurrent: number
): Promise<void> => {
  try {
    await updateCharacter(characterId, { dailyUsesCurrent });
  } catch (error) {
    console.error('Update daily uses error:', error);
    throw new Error('Failed to update daily uses');
  }
};

/**
 * Reset character's daily wild shape uses to maximum
 *
 * Typically called at the start of a new adventuring day.
 * Sets dailyUsesCurrent back to dailyUsesMax.
 *
 * @param characterId - The Firestore document ID of the character
 * @throws {Error} If character not found or update fails
 *
 * @example
 * ```typescript
 * // At the start of a new day
 * await resetDailyUses('abc123');
 * ```
 */
export const resetDailyUses = async (characterId: string): Promise<void> => {
  try {
    const character = await getCharacter(characterId);

    if (!character) {
      throw new Error('Character not found');
    }

    await updateDailyUses(characterId, character.dailyUsesMax || 0);
  } catch (error) {
    console.error('Reset daily uses error:', error);
    throw new Error('Failed to reset daily uses');
  }
};

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a character from Firestore
 *
 * WARNING: This permanently deletes the character. Consider showing
 * a confirmation dialog before calling this function.
 *
 * @param characterId - The Firestore document ID of the character to delete
 * @throws {Error} If the deletion fails
 *
 * @example
 * ```typescript
 * // After user confirms deletion
 * await deleteCharacter('abc123');
 * ```
 */
export const deleteCharacter = async (characterId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CHARACTERS, characterId));
  } catch (error) {
    console.error('Delete character error:', error);
    throw new Error('Failed to delete character');
  }
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if a user owns a character
 *
 * Useful for authorization checks before allowing operations.
 *
 * @param characterId - The Firestore document ID of the character
 * @param userId - The user's ID (from Firebase Auth)
 * @returns true if the user owns the character, false otherwise
 *
 * @example
 * ```typescript
 * const canEdit = await isCharacterOwner('abc123', 'user123');
 * if (canEdit) {
 *   // Allow editing
 * }
 * ```
 */
export const isCharacterOwner = async (
  characterId: string,
  userId: string
): Promise<boolean> => {
  try {
    const character = await getCharacter(characterId);
    return character?.ownerId === userId;
  } catch (error) {
    console.error('Check character owner error:', error);
    return false;
  }
};
