/**
 * Wild Shape Forms Service
 *
 * Handles all Firestore operations for wildShapeForms collection.
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
  serverTimestamp,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import {
  WildShapeForm,
  CreateWildShapeForm,
  UpdateWildShapeForm,
  WildShapeFormWithId,
} from '@/types/firestore';

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new wild shape form
 */
export const createWildShapeForm = async (
  ownerId: string,
  formData: Omit<CreateWildShapeForm, 'ownerId'>
): Promise<string> => {
  try {
    const formsRef = collection(db, COLLECTIONS.WILD_SHAPE_FORMS);

    const newForm: CreateWildShapeForm = {
      ...formData,
      ownerId,
    };

    const docRef = await addDoc(formsRef, {
      ...newForm,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Create wild shape form error:', error);
    throw new Error('Failed to create wild shape form');
  }
};

// ============================================================================
// READ
// ============================================================================

/**
 * Get a single wild shape form by ID
 */
export const getWildShapeForm = async (formId: string): Promise<WildShapeFormWithId | null> => {
  try {
    const formDoc = await getDoc(doc(db, COLLECTIONS.WILD_SHAPE_FORMS, formId));

    if (!formDoc.exists()) {
      return null;
    }

    return {
      id: formDoc.id,
      ...formDoc.data(),
    } as WildShapeFormWithId;
  } catch (error) {
    console.error('Get wild shape form error:', error);
    throw new Error('Failed to get wild shape form');
  }
};

/**
 * Get all wild shape forms for a user
 */
export const getUserForms = async (userId: string): Promise<WildShapeFormWithId[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.WILD_SHAPE_FORMS),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WildShapeFormWithId[];
  } catch (error) {
    console.error('Get user forms error:', error);
    throw new Error('Failed to get wild shape forms');
  }
};

/**
 * Get wild shape forms for a specific character
 */
export const getCharacterForms = async (
  userId: string,
  characterId: string
): Promise<WildShapeFormWithId[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.WILD_SHAPE_FORMS),
      where('ownerId', '==', userId),
      where('characterId', '==', characterId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WildShapeFormWithId[];
  } catch (error) {
    console.error('Get character forms error:', error);
    throw new Error('Failed to get character wild shape forms');
  }
};

/**
 * Get forms available at a specific druid level
 */
export const getAvailableForms = async (
  userId: string,
  druidLevel: number,
  characterId?: string
): Promise<WildShapeFormWithId[]> => {
  try {
    let q;

    if (characterId) {
      q = query(
        collection(db, COLLECTIONS.WILD_SHAPE_FORMS),
        where('ownerId', '==', userId),
        where('characterId', '==', characterId),
        orderBy('requiredDruidLevel', 'asc')
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.WILD_SHAPE_FORMS),
        where('ownerId', '==', userId),
        orderBy('requiredDruidLevel', 'asc')
      );
    }

    const querySnapshot = await getDocs(q);

    const forms = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WildShapeFormWithId[];

    // Filter by druid level on client side
    return forms.filter((form) => form.requiredDruidLevel <= druidLevel);
  } catch (error) {
    console.error('Get available forms error:', error);
    throw new Error('Failed to get available forms');
  }
};

/**
 * Get forms by tags
 */
export const getFormsByTags = async (
  userId: string,
  tags: string[]
): Promise<WildShapeFormWithId[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.WILD_SHAPE_FORMS),
      where('ownerId', '==', userId),
      where('tags', 'array-contains-any', tags)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WildShapeFormWithId[];
  } catch (error) {
    console.error('Get forms by tags error:', error);
    throw new Error('Failed to get forms by tags');
  }
};

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update a wild shape form
 */
export const updateWildShapeForm = async (
  formId: string,
  updates: UpdateWildShapeForm
): Promise<void> => {
  try {
    const formRef = doc(db, COLLECTIONS.WILD_SHAPE_FORMS, formId);

    await updateDoc(formRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Update wild shape form error:', error);
    throw new Error('Failed to update wild shape form');
  }
};

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a wild shape form
 */
export const deleteWildShapeForm = async (formId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.WILD_SHAPE_FORMS, formId));
  } catch (error) {
    console.error('Delete wild shape form error:', error);
    throw new Error('Failed to delete wild shape form');
  }
};

/**
 * Delete all forms for a character
 */
export const deleteCharacterForms = async (
  userId: string,
  characterId: string
): Promise<void> => {
  try {
    const forms = await getCharacterForms(userId, characterId);

    const deletePromises = forms.map((form) => deleteWildShapeForm(form.id));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Delete character forms error:', error);
    throw new Error('Failed to delete character forms');
  }
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if user owns a form
 */
export const isFormOwner = async (formId: string, userId: string): Promise<boolean> => {
  try {
    const form = await getWildShapeForm(formId);
    return form?.ownerId === userId;
  } catch (error) {
    console.error('Check form owner error:', error);
    return false;
  }
};
