/**
 * Wild Shape Templates Service
 *
 * Handles all Firestore operations for wildShapeTemplates collection.
 * Templates are read-only for regular users.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { WildShapeTemplate, WildShapeTemplateWithId, GameEdition } from '@/types/firestore';

// ============================================================================
// READ
// ============================================================================

/**
 * Get a single wild shape template by ID
 */
export const getTemplate = async (templateId: string): Promise<WildShapeTemplateWithId | null> => {
  try {
    const templateDoc = await getDoc(doc(db, COLLECTIONS.WILD_SHAPE_TEMPLATES, templateId));

    if (!templateDoc.exists()) {
      return null;
    }

    return {
      id: templateDoc.id,
      ...templateDoc.data(),
    } as WildShapeTemplateWithId;
  } catch (error) {
    console.error('Get template error:', error);
    throw new Error('Failed to get wild shape template');
  }
};

/**
 * Get all official templates
 */
export const getOfficialTemplates = async (): Promise<WildShapeTemplateWithId[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.WILD_SHAPE_TEMPLATES),
      where('isOfficial', '==', true),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WildShapeTemplateWithId[];
  } catch (error) {
    console.error('Get official templates error:', error);
    throw new Error('Failed to get official templates');
  }
};

/**
 * Get templates by edition
 */
export const getTemplatesByEdition = async (
  edition: GameEdition
): Promise<WildShapeTemplateWithId[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.WILD_SHAPE_TEMPLATES),
      where('edition', '==', edition),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WildShapeTemplateWithId[];
  } catch (error) {
    console.error('Get templates by edition error:', error);
    throw new Error('Failed to get templates');
  }
};

/**
 * Get templates available at a specific druid level
 */
export const getAvailableTemplates = async (
  edition: GameEdition,
  druidLevel: number
): Promise<WildShapeTemplateWithId[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.WILD_SHAPE_TEMPLATES),
      where('edition', '==', edition),
      orderBy('requiredDruidLevel', 'asc')
    );

    const querySnapshot = await getDocs(q);

    const templates = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WildShapeTemplateWithId[];

    // Filter by druid level on client side
    return templates.filter((template) => template.requiredDruidLevel <= druidLevel);
  } catch (error) {
    console.error('Get available templates error:', error);
    throw new Error('Failed to get available templates');
  }
};

/**
 * Get templates by tags
 */
export const getTemplatesByTags = async (
  edition: GameEdition,
  tags: string[]
): Promise<WildShapeTemplateWithId[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.WILD_SHAPE_TEMPLATES),
      where('edition', '==', edition),
      where('tags', 'array-contains-any', tags)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WildShapeTemplateWithId[];
  } catch (error) {
    console.error('Get templates by tags error:', error);
    throw new Error('Failed to get templates by tags');
  }
};

/**
 * Get templates by spell level requirement
 */
export const getTemplatesBySpellLevel = async (
  edition: GameEdition,
  requiredSpellLevel: string
): Promise<WildShapeTemplateWithId[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.WILD_SHAPE_TEMPLATES),
      where('edition', '==', edition),
      where('requiredSpellLevel', '==', requiredSpellLevel),
      orderBy('name', 'asc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WildShapeTemplateWithId[];
  } catch (error) {
    console.error('Get templates by spell level error:', error);
    throw new Error('Failed to get templates by spell level');
  }
};

/**
 * Search templates by name
 */
export const searchTemplates = async (
  edition: GameEdition,
  searchTerm: string
): Promise<WildShapeTemplateWithId[]> => {
  try {
    // Get all templates for the edition
    const templates = await getTemplatesByEdition(edition);

    // Filter by search term on client side (Firestore doesn't support full-text search)
    const searchLower = searchTerm.toLowerCase();
    return templates.filter((template) =>
      template.name.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    console.error('Search templates error:', error);
    throw new Error('Failed to search templates');
  }
};
