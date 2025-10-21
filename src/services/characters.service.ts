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
 * Create a new character
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
 * Get a single character by ID
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
 * Get all characters for a user
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
 * Get characters by edition
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
 * Update a character
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
 * Update character's daily uses
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
 * Reset daily uses (typically called at start of new day)
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
 * Delete a character
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
 * Check if user owns a character
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
