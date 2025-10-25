/**
 * Character Picker Screen
 *
 * Entry point after authentication. Users select or create a character.
 * Empty state with CTA when no characters exist.
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/hooks';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { BarkCard } from '@/components/ui/BarkCard';
import { GlowHalo } from '@/components/ui/GlowHalo';
import { H2, H3 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    color: '#D4C5A9',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#F9F5EB',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: '#D4C5A9',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  characterCard: {
    marginBottom: 16,
    padding: 20,
  },
  characterName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A0F08',
    marginBottom: 4,
  },
  characterDetails: {
    fontSize: 14,
    color: '#4A3426',
    marginBottom: 12,
  },
  characterMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#6B5344',
  },
  createButton: {
    marginTop: 20,
  },
  logoutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(42, 74, 58, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#7FD1A8',
    shadowColor: '#7FD1A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 10,
  },
  logoutButtonPressed: {
    backgroundColor: 'rgba(42, 74, 58, 1)',
    transform: [{ scale: 0.95 }],
  },
  logoutText: {
    color: '#F9F5EB',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

interface Character {
  id: string;
  name: string;
  level: number;
  effectiveDruidLevel: number;
  createdAt: any;
}

export default function CharacterPickerScreen() {
  const router = useRouter();
  const { user, signOut: authSignOut } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, [user]);

  const loadCharacters = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, COLLECTIONS.CHARACTERS),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const chars = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Character[];

      setCharacters(chars);
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCharacter = (characterId: string) => {
    // Store selected character and navigate to app
    router.push(`/(app)/home?characterId=${characterId}`);
  };

  const handleCreateCharacter = () => {
    router.push('/(app)/character?new=true');
  };

  const handleLogout = async () => {
    try {
      await authSignOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <LivingForestBg>
        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <H2>Choose Your Druid</H2>
            <Text style={styles.subtitle}>
              Select a character to begin your wild journey
            </Text>
          </View>

          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <ActivityIndicator size="large" color="#7FC9C0" />
            </View>
          ) : characters.length === 0 ? (
            /* Empty State */
            <GlowHalo color="green">
              <BarkCard>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🌿</Text>
                  <Text style={styles.emptyTitle}>No Characters Yet</Text>
                  <Text style={styles.emptyText}>
                    Create your first druid character to start tracking your wildshape forms
                  </Text>
                  <Button onPress={handleCreateCharacter} fullWidth>
                    Create Your First Character
                  </Button>
                </View>
              </BarkCard>
            </GlowHalo>
          ) : (
            /* Character List */
            <>
              {characters.map((character) => (
                <Pressable
                  key={character.id}
                  onPress={() => handleSelectCharacter(character.id)}
                >
                  <BarkCard style={styles.characterCard}>
                    <Text style={styles.characterName}>{character.name}</Text>
                    <Text style={styles.characterDetails}>
                      Level {character.level} Druid • EDL {character.effectiveDruidLevel}
                    </Text>
                    <View style={styles.characterMeta}>
                      <Text style={styles.metaText}>
                        Created {new Date(character.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                      </Text>
                      <Text style={styles.metaText}>Tap to select →</Text>
                    </View>
                  </BarkCard>
                </Pressable>
              ))}

              {/* Create Another Button */}
              <Button
                variant="outline"
                onPress={handleCreateCharacter}
                fullWidth
                style={styles.createButton}
              >
                + Create Another Character
              </Button>
            </>
          )}
        </ScrollView>
      </LivingForestBg>
    </View>
  );
}
