/**
 * Character Context
 *
 * Provides global access to the currently selected character across the app.
 * Handles character loading, persistence, and switching.
 */

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { CharacterWithId } from '@/types/firestore';
import { useCharacter as useCharacterQuery } from '@/hooks/useCharacters';
import { getCurrentCharacterId, setCurrentCharacterId as saveCharacterId } from '@/lib/storage';

interface CharacterContextType {
  characterId: string | null;
  character: CharacterWithId | null;
  isLoading: boolean;
  error: Error | null;
  refreshCharacter: () => Promise<void>;
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
 * Throws error if used outside CharacterProvider
 */
export const useCharacter = (): CharacterContextType => {
  const context = React.useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
