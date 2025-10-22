/**
 * Character List Screen
 *
 * Displays all user's characters in a scrollable grid.
 * Shows character name, level, and key stats on each card.
 */

import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Stat } from '@/components/ui/Stat';
import { useCharacters } from '@/hooks';

export default function CharacterListScreen() {
  const router = useRouter();
  const { data: characters, isLoading, error } = useCharacters();

  if (isLoading) {
    return (
      <View className="flex-1 bg-forest-700 items-center justify-center">
        <ActivityIndicator size="large" color="#7FC9C0" />
        <Text className="text-parchment-200 font-ui mt-4">
          Loading characters...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-forest-700 items-center justify-center px-4">
        <Text className="text-red-400 font-ui text-center mb-4">
          Error loading characters
        </Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-forest-700 px-4">
      <View className="py-12">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <H2>My Characters</H2>
          <Button
            size="sm"
            onPress={() => router.push('/character/create')}
          >
            + New
          </Button>
        </View>

        {/* Character Grid */}
        {characters && characters.length > 0 ? (
          <View className="gap-4">
            {characters.map((character) => {
              const totalAC =
                (character.baseStats.ac?.base || 10) +
                (character.baseStats.ac?.armor || 0) +
                (character.baseStats.ac?.shield || 0) +
                (character.baseStats.ac?.dex || 0) +
                (character.baseStats.ac?.natural || 0);

              const wisScore = character.baseStats.abilityScores?.wis || 10;

              return (
                <Pressable
                  key={character.id}
                  onPress={() => router.push(`/character/${character.id}`)}
                >
                  <Card>
                    {/* Character Header */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="font-display text-parchment-50 text-xl font-bold">
                          {character.name}
                        </Text>
                        <Text className="font-ui text-parchment-300 text-sm">
                          Level {character.baseStats.level} Druid
                        </Text>
                      </View>
                      <Chip
                        label={
                          character.edition === 'pf1e'
                            ? 'PF1e'
                            : character.edition === 'dnd5e'
                            ? 'D&D 5e'
                            : 'PF2e'
                        }
                      />
                    </View>

                    {/* Stats */}
                    <View className="flex-row flex-wrap border-t border-bronze-500/40 pt-3">
                      <Stat
                        label="HP"
                        value={`${character.baseStats.hp?.current || 0}/${
                          character.baseStats.hp?.max || 0
                        }`}
                      />
                      <Stat label="AC" value={totalAC.toString()} />
                      <Stat
                        label="Wisdom"
                        value={wisScore.toString()}
                        sub={`+${Math.floor((wisScore - 10) / 2)}`}
                      />
                    </View>

                    {/* Daily Uses */}
                    {character.dailyUsesMax !== null && (
                      <View className="mt-3 pt-3 border-t border-bronze-500/40">
                        <Text className="font-ui text-parchment-300 text-xs">
                          Wild Shape Uses: {character.dailyUsesCurrent}/
                          {character.dailyUsesMax}
                        </Text>
                      </View>
                    )}
                  </Card>
                </Pressable>
              );
            })}
          </View>
        ) : (
          // Empty State
          <Card>
            <View className="items-center py-8">
              <Text className="font-display text-parchment-200 text-xl mb-2">
                No Characters Yet
              </Text>
              <Text className="font-ui text-parchment-300 text-center mb-6">
                Create your first druid to start tracking wild shapes
              </Text>
              <Button onPress={() => router.push('/character/create')}>
                Create Character
              </Button>
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
