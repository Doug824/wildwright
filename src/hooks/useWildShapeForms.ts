/**
 * useWildShapeForms Hooks
 *
 * TanStack Query hooks for wild shape forms with offline support.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserForms,
  getCharacterForms,
  getWildShapeForm,
  getAvailableForms,
  getFormsByTags,
  createWildShapeForm,
  updateWildShapeForm,
  deleteWildShapeForm,
} from '@/services';
import { CreateWildShapeForm, UpdateWildShapeForm } from '@/types/firestore';
import { QUERY_KEYS } from '@/constants';
import { useAuth } from './useAuth';

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all wild shape forms for current user
 */
export const useWildShapeForms = () => {
  const { uid } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.WILD_SHAPE_FORMS, uid],
    queryFn: () => getUserForms(uid!),
    enabled: !!uid,
  });
};

/**
 * Get wild shape forms for a specific character
 */
export const useCharacterForms = (characterId: string | null) => {
  const { uid } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.WILD_SHAPE_FORMS, uid, 'character', characterId],
    queryFn: () => getCharacterForms(uid!, characterId!),
    enabled: !!uid && !!characterId,
  });
};

/**
 * Get a single wild shape form by ID
 */
export const useWildShapeForm = (formId: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WILD_SHAPE_FORM, formId],
    queryFn: () => getWildShapeForm(formId!),
    enabled: !!formId,
  });
};

/**
 * Get forms available at a specific druid level
 */
export const useAvailableForms = (druidLevel: number, characterId?: string) => {
  const { uid } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.WILD_SHAPE_FORMS, uid, 'available', druidLevel, characterId],
    queryFn: () => getAvailableForms(uid!, druidLevel, characterId),
    enabled: !!uid && druidLevel >= 4,
  });
};

/**
 * Get forms by tags
 */
export const useFormsByTags = (tags: string[]) => {
  const { uid } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.WILD_SHAPE_FORMS, uid, 'tags', tags],
    queryFn: () => getFormsByTags(uid!, tags),
    enabled: !!uid && tags.length > 0,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new wild shape form
 */
export const useCreateWildShapeForm = () => {
  const queryClient = useQueryClient();
  const { uid } = useAuth();

  return useMutation({
    mutationFn: (data: Omit<CreateWildShapeForm, 'ownerId'>) => createWildShapeForm(uid!, data),
    onSuccess: () => {
      // Invalidate all form queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WILD_SHAPE_FORMS, uid] });
    },
  });
};

/**
 * Update a wild shape form
 */
export const useUpdateWildShapeForm = () => {
  const queryClient = useQueryClient();
  const { uid } = useAuth();

  return useMutation({
    mutationFn: ({ formId, updates }: { formId: string; updates: UpdateWildShapeForm }) =>
      updateWildShapeForm(formId, updates),
    onSuccess: (_, variables) => {
      // Invalidate specific form and all form queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WILD_SHAPE_FORM, variables.formId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WILD_SHAPE_FORMS, uid] });
    },
  });
};

/**
 * Delete a wild shape form
 */
export const useDeleteWildShapeForm = () => {
  const queryClient = useQueryClient();
  const { uid } = useAuth();

  return useMutation({
    mutationFn: (formId: string) => deleteWildShapeForm(formId),
    onSuccess: (_, formId) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.WILD_SHAPE_FORM, formId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WILD_SHAPE_FORMS, uid] });
    },
  });
};
