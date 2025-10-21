/**
 * useCharacters Hooks
 *
 * TanStack Query hooks for character data with offline support.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  updateDailyUses,
  resetDailyUses,
} from '@/services';
import { CharacterWithId, CreateCharacter, UpdateCharacter } from '@/types/firestore';
import { QUERY_KEYS } from '@/constants';
import { useAuth } from './useAuth';

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all characters for current user
 */
export const useCharacters = () => {
  const { uid } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.CHARACTERS, uid],
    queryFn: () => getUserCharacters(uid!),
    enabled: !!uid,
  });
};

/**
 * Get a single character by ID
 */
export const useCharacter = (characterId: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CHARACTER, characterId],
    queryFn: () => getCharacter(characterId!),
    enabled: !!characterId,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new character
 */
export const useCreateCharacter = () => {
  const queryClient = useQueryClient();
  const { uid } = useAuth();

  return useMutation({
    mutationFn: (data: Omit<CreateCharacter, 'ownerId'>) => createCharacter(uid!, data),
    onSuccess: () => {
      // Invalidate and refetch characters list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHARACTERS, uid] });
    },
  });
};

/**
 * Update a character
 */
export const useUpdateCharacter = () => {
  const queryClient = useQueryClient();
  const { uid } = useAuth();

  return useMutation({
    mutationFn: ({ characterId, updates }: { characterId: string; updates: UpdateCharacter }) =>
      updateCharacter(characterId, updates),
    onSuccess: (_, variables) => {
      // Invalidate specific character and characters list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHARACTER, variables.characterId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHARACTERS, uid] });
    },
  });
};

/**
 * Delete a character
 */
export const useDeleteCharacter = () => {
  const queryClient = useQueryClient();
  const { uid } = useAuth();

  return useMutation({
    mutationFn: (characterId: string) => deleteCharacter(characterId),
    onSuccess: (_, characterId) => {
      // Remove from cache and invalidate list
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.CHARACTER, characterId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHARACTERS, uid] });
    },
  });
};

/**
 * Update character's daily wild shape uses
 */
export const useUpdateDailyUses = () => {
  const queryClient = useQueryClient();
  const { uid } = useAuth();

  return useMutation({
    mutationFn: ({ characterId, uses }: { characterId: string; uses: number }) =>
      updateDailyUses(characterId, uses),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHARACTER, variables.characterId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHARACTERS, uid] });
    },
  });
};

/**
 * Reset character's daily wild shape uses
 */
export const useResetDailyUses = () => {
  const queryClient = useQueryClient();
  const { uid } = useAuth();

  return useMutation({
    mutationFn: (characterId: string) => resetDailyUses(characterId),
    onSuccess: (_, characterId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHARACTER, characterId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHARACTERS, uid] });
    },
  });
};
