/**
 * Character Context
 *
 * Provides global access to the currently selected character across the app.
 * Handles character loading, persistence, and switching with automatic caching
 * via React Query.
 *
 * ## Usage
 *
 * Wrap your app with `CharacterProvider` at a high level (typically in app layout):
 *
 * ```typescript
 * <CharacterProvider>
 *   <YourApp />
 * </CharacterProvider>
 * ```
 *
 * Then use the `useCharacter` hook in any component:
 *
 * ```typescript
 * function MyComponent() {
 *   const { character, characterId, isLoading } = useCharacter();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!character) return <SelectCharacterPrompt />;
 *
 *   return <div>Welcome, {character.name}!</div>;
 * }
 * ```
 *
 * ## Features
 *
 * - **Automatic Persistence**: Character selection persists across app restarts
 * - **React Query Integration**: Character data cached and auto-refetched
 * - **Global State**: No prop drilling needed for character data
 * - **Character Switching**: Built-in support for switching between characters
 *
 * @module CharacterContext
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { CharacterWithId } from '@/types/firestore';
import { useCharacter as useCharacterQuery } from '@/hooks/useCharacters';
import { getCurrentCharacterId, setCurrentCharacterId as saveCharacterId } from '@/lib/storage';

/**
 * Character Context Type Definition
 *
 * Provides access to the currently selected character and related operations.
 */
interface CharacterContextType {
  /** The ID of the currently selected character, or null if none selected */
  characterId: string | null;

  /** The full character data, or null if none selected or still loading */
  character: CharacterWithId | null;

  /** True while character data is being loaded from Firestore */
  isLoading: boolean;

  /** Error object if character loading failed, null otherwise */
  error: Error | null;

  /**
   * Manually refresh the character data from Firestore
   * Useful after external updates or to force a refetch
   */
  refreshCharacter: () => Promise<void>;

  /**
   * Switch to a different character
   * Updates both the context state and persisted storage
   *
   * @param id - The Firestore document ID of the character to switch to
   */
  switchCharacter: (id: string) => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

interface CharacterProviderProps {
  children: ReactNode;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load character ID from storage on mount
  useEffect(() => {
    const loadCharacterId = async () => {
      try {
        const storedId = await getCurrentCharacterId();
        setCharacterId(storedId);
      } catch (error) {
        console.error('Failed to load character ID:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadCharacterId();
  }, []);

  // Use React Query hook to fetch character data
  const {
    data: character,
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
  } = useCharacterQuery(characterId);

  // Loading is true if we haven't initialized OR if query is loading
  const isLoading = !isInitialized || isQueryLoading;
  const error = queryError as Error | null;

  const refreshCharacter = async () => {
    await refetch();
  };

  const switchCharacter = async (id: string) => {
    try {
      // Save to storage
      await saveCharacterId(id);
      // Update state (will trigger React Query refetch)
      setCharacterId(id);
    } catch (error) {
      console.error('Failed to switch character:', error);
      throw error;
    }
  };

  const value: CharacterContextType = {
    characterId,
    character: character || null,
    isLoading,
    error,
    refreshCharacter,
    switchCharacter,
  };

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
};

/**
 * Hook to access character context
 *
 * Must be used within a `CharacterProvider`. Throws an error if used outside the provider.
 *
 * @returns The character context with current character data and operations
 * @throws {Error} If used outside of CharacterProvider
 *
 * @example
 * ```typescript
 * function CharacterInfo() {
 *   const { character, isLoading, switchCharacter } = useCharacter();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!character) return <div>No character selected</div>;
 *
 *   return (
 *     <div>
 *       <h1>{character.name}</h1>
 *       <p>Level {character.level} {character.class}</p>
 *       <button onClick={() => switchCharacter('other-id')}>
 *         Switch Character
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useCharacter = (): CharacterContextType => {
  const context = React.useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
