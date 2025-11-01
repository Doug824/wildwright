/**
 * Dashboard (Home) Screen
 *
 * Main dashboard showing active wildshape form, daily uses, and quick actions.
 * Entry point after character selection.
 */

import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCharacter } from '@/contexts';
import { useCharacters } from '@/hooks/useCharacters';
import { useCharacterForms } from '@/hooks/useWildShapeForms';
import { Character, CharacterWithId, CreatureSize, WildShapeFormWithId } from '@/types/firestore';
import { computePF1e } from '@/pf1e';
import { characterToBaseCharacter } from '@/pf1e/adapters';
import { getTierForEDL } from '@/pf1e/tiers';
import { Tier } from '@/pf1e/types';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { BarkCard } from '@/components/ui/BarkCard';
import { MistCard } from '@/components/ui/MistCard';
import { GlowHalo } from '@/components/ui/GlowHalo';
import { H2, H3 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Stat } from '@/components/ui/Stat';
import { AttackRow } from '@/components/ui/AttackRow';
import { CharacterHeaderSkeleton } from '@/components/skeletons/CharacterHeaderSkeleton';
import { FormCardSkeleton } from '@/components/skeletons/FormCardSkeleton';
import { heavyImpact, success as hapticSuccess, lightImpact } from '@/utils/haptics';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    color: '#D4C5A9',
    fontSize: 16,
    marginBottom: 8,
  },
  characterName: {
    color: '#F9F5EB',
    fontSize: 28,
    fontWeight: '700',
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  activeFormCard: {
    marginBottom: 16,
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  formInfo: {
    flex: 1,
  },
  formName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A3426',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B5344',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 115, 85, 0.3)',
  },
  statQuick: {
    marginRight: 16,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B5344',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3426',
  },
  emptyFormCard: {
    marginBottom: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3426',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#4A3426',
    textAlign: 'center',
    marginBottom: 20,
  },
  quickActions: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9F5EB',
    marginBottom: 12,
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  favoritesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  favoriteCard: {
    flex: 1,
    minWidth: 140,
    maxWidth: '48%',
    marginHorizontal: 4,
    marginBottom: 12,
    padding: 14,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A3426',
    marginBottom: 4,
  },
  favoriteSubtitle: {
    fontSize: 11,
    color: '#6B5344',
    marginBottom: 2,
  },
  favoriteMovement: {
    fontSize: 10,
    color: '#8B7355',
    marginTop: 4,
    fontStyle: 'italic',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(42, 74, 58, 0.9)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7FD1A8',
    shadowColor: '#7FD1A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 10,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(42, 74, 58, 1)',
    transform: [{ scale: 0.95 }],
  },
  backText: {
    color: '#F9F5EB',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(42, 74, 58, 0.9)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7FD1A8',
    zIndex: 10,
  },
  logoutButtonPressed: {
    backgroundColor: 'rgba(42, 74, 58, 1)',
    transform: [{ scale: 0.95 }],
  },
  logoutText: {
    color: '#F9F5EB',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalScroll: {
    maxHeight: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A3426',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B5344',
    marginBottom: 8,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A3426',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  selectorSection: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A3426',
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectorButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B7355',
    backgroundColor: 'rgba(139, 115, 85, 0.1)',
  },
  selectorButtonActive: {
    backgroundColor: '#7FD1A8',
    borderColor: '#2A4A3A',
  },
  selectorButtonText: {
    fontSize: 13,
    color: '#4A3426',
    fontWeight: '500',
  },
  selectorButtonTextActive: {
    color: '#2A4A3A',
    fontWeight: '700',
  },
});

export default function DashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get character from context (includes automatic loading/caching)
  const { character, characterId, isLoading: characterLoading, switchCharacter } = useCharacter();

  // Get all characters for switching
  const { data: allCharacters = [] } = useCharacters();

  // Get all forms for this character using React Query
  const { data: allForms, isLoading: formsLoading } = useCharacterForms(characterId);

  // Filter for favorite forms
  const favoriteForms = useMemo(() => {
    return allForms?.filter(form => form.isFavorite === true) || [];
  }, [allForms]);

  const [activeForm, setActiveForm] = useState<WildShapeFormWithId | null>(null); // Will be computed playsheet
  const [showCharacterSwitcher, setShowCharacterSwitcher] = useState(false);
  const [switchingCharacter, setSwitchingCharacter] = useState(false);

  const loading = characterLoading || formsLoading;

  const characterName = character?.name || 'Loading...';

  // Helper function to format movement
  const formatMovement = (movement: any) => {
    const parts = [];
    if (movement.land) parts.push(`${movement.land} ft`);
    if (movement.fly) parts.push(`fly ${movement.fly} ft`);
    if (movement.swim) parts.push(`swim ${movement.swim} ft`);
    if (movement.climb) parts.push(`climb ${movement.climb} ft`);
    if (movement.burrow) parts.push(`burrow ${movement.burrow} ft`);
    return parts.join(', ');
  };

  // Data fetching is now handled by React Query hooks above
  // Forms automatically refetch on focus due to React Query config

  const handleAssumeShape = () => {
    router.push('/(app)/forms');
  };

  const handleViewPlaysheet = () => {
    if (!activeForm) return;

    // If we have computed data, pass it along
    if (activeForm.computed) {
      router.push({
        pathname: '/(app)/playsheet',
        params: {
          formData: JSON.stringify(activeForm),
          computedData: JSON.stringify(activeForm.computed),
          backTo: 'home',
        }
      });
    } else {
      // Otherwise, pass the raw form data
      router.push({
        pathname: '/(app)/playsheet',
        params: {
          formData: JSON.stringify(activeForm),
          backTo: 'home',
        }
      });
    }
  };

  const handleRest = () => {
    // TODO: Implement rest functionality when daily uses tracking is added
  };

  const handleBackToCharacterPicker = () => {
    router.replace('/character-picker');
  };

  const handleLogout = () => {
    // TODO: Add auth logout
    router.replace('/(auth)/sign-in');
  };

  const handleSwitchCharacter = async (newCharacterId: string) => {
    if (newCharacterId === characterId) {
      setShowCharacterSwitcher(false);
      return;
    }

    // Light haptic for selection
    await lightImpact();

    try {
      setSwitchingCharacter(true);
      await switchCharacter(newCharacterId);
      setShowCharacterSwitcher(false);
      // Clear active form when switching characters
      setActiveForm(null);
      // Success haptic
      await hapticSuccess();
    } catch (error: unknown) {
      console.error('Failed to switch character:', error);
      alert('Failed to switch character. Please try again.');
    } finally {
      setSwitchingCharacter(false);
    }
  };

  const handleOpenFormModal = (form: any) => {
    // Navigate directly to playsheet for preview instead of showing modal
    router.push({
      pathname: '/(app)/playsheet',
      params: {
        formData: JSON.stringify(form),
        fromForms: 'true', // This tells playsheet to show "Assume This Form" button
      }
    });
  };

  // Check if a form was assumed from the forms page
  useEffect(() => {
    if (params.assumedFormData) {
      try {
        const form = JSON.parse(params.assumedFormData as string);
        setActiveForm(form);
      } catch (error) {
        console.error('Error parsing assumed form data:', error);
      }
    }
  }, [params.assumedFormData]);

  // Check if form should be cleared (reverted)
  useEffect(() => {
    if (params.clearActiveForm === 'true') {
      setActiveForm(null);
      // Note: Don't restore uses - they're already consumed
    }
  }, [params.clearActiveForm]);

  // Show loading state while fetching character
  if (loading) {
    return (
      <View style={styles.container}>
        <LivingForestBg>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Character header skeleton */}
            <CharacterHeaderSkeleton />

            {/* Active form skeleton */}
            <FormCardSkeleton />

            {/* Quick actions skeleton */}
            <View style={styles.quickActionsRow}>
              <BarkCard style={{ flex: 1, padding: 16 }}>
                <View style={{ height: 20 }} />
              </BarkCard>
              <BarkCard style={{ flex: 1, padding: 16 }}>
                <View style={{ height: 20 }} />
              </BarkCard>
            </View>

            {/* Favorite forms section skeleton */}
            <View style={{ marginTop: 24 }}>
              <CharacterHeaderSkeleton />
              <FormCardSkeleton />
              <FormCardSkeleton />
            </View>
          </ScrollView>
        </LivingForestBg>
      </View>
    );
  }

  // Show error if no character found
  if (!character) {
    return (
      <View style={styles.container}>
        <LivingForestBg>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: '#F9F5EB', fontSize: 20, fontWeight: '700', marginBottom: 16 }}>
              Character Not Found
            </Text>
            <Button onPress={() => router.replace('/character-picker')}>
              Back to Character Picker
            </Button>
          </View>
        </LivingForestBg>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LivingForestBg>
        {/* Back Button */}
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed
          ]}
          onPress={handleBackToCharacterPicker}
        >
          <Text style={styles.backText}>← Characters</Text>
        </Pressable>

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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              {allCharacters.length > 1 && (
                <Pressable
                  onPress={() => setShowCharacterSwitcher(true)}
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: '#7FD1A8',
                    backgroundColor: 'rgba(127, 209, 168, 0.2)',
                  }}
                >
                  <Text style={{ color: '#F9F5EB', fontSize: 12, fontWeight: '600' }}>
                    Switch Character
                  </Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.characterName}>{characterName}</Text>
          </View>

          {/* Active Form or Empty State */}
          {activeForm ? (
            <GlowHalo color="green">
              <BarkCard style={styles.activeFormCard}>
                <View style={styles.formHeader}>
                  <View style={styles.formInfo}>
                    <Text style={styles.formName}>{activeForm.name}</Text>
                    <Text style={styles.formSubtitle}>
                      {activeForm.size} • {activeForm.requiredSpellLevel || activeForm.spell || 'Wild Shape'}
                    </Text>
                    <View style={styles.chipRow}>
                      {(activeForm.statModifications?.specialAbilities || activeForm.abilities || []).slice(0, 3).map((ability: string, idx: number) => (
                        <Chip key={idx} label={ability} variant="mist" />
                      ))}
                    </View>
                  </View>
                </View>

                {activeForm.computed ? (
                  /* Show computed stats if available */
                  <View style={styles.statsPreview}>
                    <View style={styles.statQuick}>
                      <Text style={styles.statLabel}>HP</Text>
                      <Text style={styles.statValue}>{activeForm.computed.hp.max}</Text>
                    </View>
                    <View style={styles.statQuick}>
                      <Text style={styles.statLabel}>AC</Text>
                      <Text style={styles.statValue}>{activeForm.computed.ac.total}</Text>
                    </View>
                    <View style={styles.statQuick}>
                      <Text style={styles.statLabel}>Speed</Text>
                      <Text style={styles.statValue}>{activeForm.computed.movement.land} ft</Text>
                    </View>
                  </View>
                ) : (
                  /* Show basic movement for non-computed forms */
                  <View style={styles.statsPreview}>
                    <View style={styles.statQuick}>
                      <Text style={styles.statLabel}>Movement</Text>
                      <Text style={styles.statValue}>
                        {activeForm.statModifications?.movement.land || 30} ft
                      </Text>
                    </View>
                  </View>
                )}

                <Button onPress={handleViewPlaysheet} fullWidth style={{ marginTop: 16 }}>
                  View Full Playsheet
                </Button>
              </BarkCard>
            </GlowHalo>
          ) : (
            <MistCard intensity="medium">
              <View style={styles.emptyFormCard}>
                <Text style={styles.emptyIcon}>🐺</Text>
                <Text style={styles.emptyTitle}>No Form Assumed</Text>
                <Text style={styles.emptyText}>
                  Choose a wildshape form to begin your transformation
                </Text>
                <Button onPress={handleAssumeShape}>
                  Wildshape
                </Button>
              </View>
            </MistCard>
          )}

          {/* Favorites */}
          <View>
            <Text style={styles.sectionTitle}>Favorite Forms</Text>
            {favoriteForms.length > 0 ? (
              <View style={styles.favoritesRow}>
                {favoriteForms.map((form) => (
                  <Pressable key={form.id} onPress={() => handleOpenFormModal(form)} style={styles.favoriteCard}>
                    <BarkCard>
                      <Text style={styles.favoriteName}>{form.name}</Text>
                      <Text style={styles.favoriteSubtitle}>
                        {form.size} • {form.requiredSpellLevel}
                      </Text>
                      <Text style={styles.favoriteMovement}>
                        {formatMovement(form.statModifications.movement)}
                      </Text>
                    </BarkCard>
                  </Pressable>
                ))}
              </View>
            ) : (
              <MistCard intensity="light">
                <Text style={{ textAlign: 'center', color: '#D4C5A9', padding: 20 }}>
                  No favorite forms yet. Star a form to add it here!
                </Text>
              </MistCard>
            )}
          </View>
        </ScrollView>


        {/* Character Switcher Modal */}
        <Modal
          visible={showCharacterSwitcher}
          transparent
          animationType="fade"
          onRequestClose={() => !switchingCharacter && setShowCharacterSwitcher(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => !switchingCharacter && setShowCharacterSwitcher(false)}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{ width: '90%', maxWidth: 500 }}
            >
              <BarkCard style={{ padding: 24 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#4A3426', marginBottom: 8 }}>
                  Switch Character
                </Text>
                <Text style={{ fontSize: 14, color: '#6B5344', marginBottom: 20 }}>
                  Select a character to switch to:
                </Text>

                <ScrollView style={{ maxHeight: 400 }}>
                  {allCharacters.map((char) => (
                    <Pressable
                      key={char.id}
                      onPress={() => !switchingCharacter && handleSwitchCharacter(char.id)}
                      disabled={switchingCharacter}
                      style={{
                        padding: 16,
                        marginBottom: 12,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: char.id === characterId ? '#7FD1A8' : '#8B7355',
                        backgroundColor: char.id === characterId ? 'rgba(127, 209, 168, 0.2)' : 'rgba(232, 220, 200, 0.3)',
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 18, fontWeight: '700', color: '#4A3426', marginBottom: 4 }}>
                            {char.name}
                          </Text>
                          <Text style={{ fontSize: 14, color: '#6B5344' }}>
                            Level {char.baseStats.level} {char.baseStats.class}
                          </Text>
                        </View>
                        {char.id === characterId && (
                          <Text style={{ fontSize: 20, marginLeft: 8 }}>✓</Text>
                        )}
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>

                {switchingCharacter && (
                  <View style={{ marginTop: 16, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#7FD1A8" />
                    <Text style={{ color: '#6B5344', marginTop: 8 }}>Switching character...</Text>
                  </View>
                )}

                <Button
                  variant="outline"
                  onPress={() => setShowCharacterSwitcher(false)}
                  fullWidth
                  style={{ marginTop: 16 }}
                  disabled={switchingCharacter}
                >
                  Cancel
                </Button>
              </BarkCard>
            </Pressable>
          </Pressable>
        </Modal>
      </LivingForestBg>
    </View>
  );
}
