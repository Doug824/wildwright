/**
 * useWildShapeTemplates Hooks
 *
 * TanStack Query hooks for wild shape templates (read-only official forms).
 */

import { useQuery } from '@tanstack/react-query';
import {
  getTemplate,
  getOfficialTemplates,
  getTemplatesByEdition,
  getAvailableTemplates,
  getTemplatesByTags,
  getTemplatesBySpellLevel,
  searchTemplates,
} from '@/services';
import { GameEdition } from '@/types/firestore';
import { QUERY_KEYS } from '@/constants';

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get a single wild shape template by ID
 */
export const useWildShapeTemplate = (templateId: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WILD_SHAPE_TEMPLATE, templateId],
    queryFn: () => getTemplate(templateId!),
    enabled: !!templateId,
    staleTime: 1000 * 60 * 60, // Templates rarely change, cache for 1 hour
  });
};

/**
 * Get all official wild shape templates
 */
export const useOfficialTemplates = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.WILD_SHAPE_TEMPLATES, 'official'],
    queryFn: getOfficialTemplates,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

/**
 * Get templates by game edition
 */
export const useTemplatesByEdition = (edition: GameEdition) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WILD_SHAPE_TEMPLATES, 'edition', edition],
    queryFn: () => getTemplatesByEdition(edition),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

/**
 * Get templates available at a specific druid level
 */
export const useAvailableTemplates = (edition: GameEdition, druidLevel: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WILD_SHAPE_TEMPLATES, 'available', edition, druidLevel],
    queryFn: () => getAvailableTemplates(edition, druidLevel),
    enabled: druidLevel >= 4,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

/**
 * Get templates by tags
 */
export const useTemplatesByTags = (edition: GameEdition, tags: string[]) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WILD_SHAPE_TEMPLATES, 'tags', edition, tags],
    queryFn: () => getTemplatesByTags(edition, tags),
    enabled: tags.length > 0,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

/**
 * Get templates by spell level requirement
 */
export const useTemplatesBySpellLevel = (edition: GameEdition, requiredSpellLevel: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WILD_SHAPE_TEMPLATES, 'spellLevel', edition, requiredSpellLevel],
    queryFn: () => getTemplatesBySpellLevel(edition, requiredSpellLevel),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

/**
 * Search templates by name
 */
export const useSearchTemplates = (edition: GameEdition, searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.WILD_SHAPE_TEMPLATES, 'search', edition, searchTerm],
    queryFn: () => searchTemplates(edition, searchTerm),
    enabled: searchTerm.length >= 2, // Only search with 2+ characters
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};
