/**
 * Character List Screen
 *
 * Displays all user's characters in a scrollable grid.
 * Shows character name, level, and key stats on each card.
 */

import { ScrollView, View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Stat } from '@/components/ui/Stat';
import { useCharacters } from '@/hooks';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3A2E',
    paddingHorizontal: 16,
  },
  content: {
    paddingVertical: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  characterGrid: {
    gap: 16,
  },
  characterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontFamily: 'System',
    color: '#F9F5EB',
    fontSize: 20,
    fontWeight: 'bold',
  },
  characterSubtitle: {
    fontFamily: 'System',
    color: '#D4C5A9',
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: 'rgba(185, 122, 61, 0.4)',
    paddingTop: 12,
  },
  dailyUses: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(185, 122, 61, 0.4)',
  },
  dailyUsesText: {
    fontFamily: 'System',
    color: '#D4C5A9',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontFamily: 'System',
    color: '#E8DCC8',
    fontSize: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'System',
    color: '#D4C5A9',
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1A3A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#E8DCC8',
    fontFamily: 'System',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#1A3A2E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#EF4444',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default function CharacterListScreen() {
  const router = useRouter();
  const { data: characters, isLoading, error } = useCharacters();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7FC9C0" />
        <Text style={styles.loadingText}>
          Loading characters...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading characters
        </Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
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
          <View style={styles.characterGrid}>
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
                    <View style={styles.characterHeader}>
                      <View style={styles.characterInfo}>
                        <Text style={styles.characterName}>
                          {character.name}
                        </Text>
                        <Text style={styles.characterSubtitle}>
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
                    <View style={styles.stats}>
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
                      <View style={styles.dailyUses}>
                        <Text style={styles.dailyUsesText}>
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
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                No Characters Yet
              </Text>
              <Text style={styles.emptySubtitle}>
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
