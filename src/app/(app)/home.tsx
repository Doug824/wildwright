/**
 * Dashboard (Home) Screen
 *
 * Main dashboard showing active wildshape form, daily uses, and quick actions.
 * Entry point after character selection.
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { BarkCard } from '@/components/ui/BarkCard';
import { MistCard } from '@/components/ui/MistCard';
import { GlowHalo } from '@/components/ui/GlowHalo';
import { H2, H3 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { RuneProgress } from '@/components/ui/RuneProgress';
import { Stat } from '@/components/ui/Stat';
import { AttackRow } from '@/components/ui/AttackRow';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
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
});

export default function DashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeForm, setActiveForm] = useState<any>(null); // Will be populated from DB
  const [dailyUsesLeft, setDailyUsesLeft] = useState(2);
  const [totalDailyUses, setTotalDailyUses] = useState(4);
  const [selectedFormModal, setSelectedFormModal] = useState<any>(null);

  // Mock character name - will come from params/context
  const characterName = 'Thornclaw';

  // Mock favorite forms - will come from DB filtered by favorite status
  const favoriteForms = [
    {
      id: '1',
      name: 'Leopard',
      size: 'Large',
      spell: 'Beast Shape III',
      movement: '40 ft, Climb 20 ft',
      attacks: [
        { name: 'Bite', bonus: '+14', damage: '1d8+9', trait: 'Grab' },
        { name: 'Claw', bonus: '+14', damage: '1d4+9' },
        { name: 'Claw', bonus: '+14', damage: '1d4+9' },
      ],
      abilities: ['Pounce', 'Low-light vision', 'Scent'],
      stats: { hp: 64, ac: 19, speed: '40 ft' },
    },
    {
      id: '2',
      name: 'Bear',
      size: 'Large',
      spell: 'Beast Shape II',
      movement: '40 ft, Swim 20 ft',
      attacks: [
        { name: 'Bite', bonus: '+12', damage: '1d8+7' },
        { name: 'Claw', bonus: '+12', damage: '1d6+7', trait: 'Grab' },
        { name: 'Claw', bonus: '+12', damage: '1d6+7', trait: 'Grab' },
      ],
      abilities: ['Low-light vision', 'Scent'],
      stats: { hp: 70, ac: 17, speed: '40 ft' },
    },
  ];

  const handleAssumeShape = () => {
    router.push('/(app)/forms');
  };

  const handleViewPlaysheet = () => {
    if (activeForm) {
      router.push({
        pathname: '/(app)/playsheet',
        params: { formData: JSON.stringify(activeForm) }
      });
    }
  };

  const handleRest = () => {
    // Reset daily uses
    setDailyUsesLeft(totalDailyUses);
  };

  const handleBackToCharacterPicker = () => {
    router.back();
  };

  const handleLogout = () => {
    // TODO: Add auth logout
    router.replace('/(auth)/sign-in');
  };

  const handleOpenFormModal = (form: any) => {
    setSelectedFormModal(form);
  };

  const handleCloseFormModal = () => {
    setSelectedFormModal(null);
  };

  const handleAssumeFormFromModal = () => {
    if (selectedFormModal) {
      setActiveForm(selectedFormModal);
      setDailyUsesLeft(prev => Math.max(0, prev - 1));
      setSelectedFormModal(null);
      // TODO: Save to DB
    }
  };

  // Check if a form was assumed from the forms page
  useEffect(() => {
    if (params.assumedFormData) {
      try {
        const form = JSON.parse(params.assumedFormData as string);
        setActiveForm(form);
        setDailyUsesLeft(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error parsing assumed form data:', error);
      }
    }
  }, [params.assumedFormData]);

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
            <Text style={styles.welcomeText}>Welcome back,</Text>
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
                      {activeForm.size} • {activeForm.spell}
                    </Text>
                    <View style={styles.chipRow}>
                      {activeForm.abilities.slice(0, 3).map((ability: string, idx: number) => (
                        <Chip key={idx} label={ability} variant="mist" />
                      ))}
                    </View>
                  </View>
                  <RuneProgress used={dailyUsesLeft} total={totalDailyUses} label="Uses Left" />
                </View>

                <View style={styles.statsPreview}>
                  <View style={styles.statQuick}>
                    <Text style={styles.statLabel}>HP</Text>
                    <Text style={styles.statValue}>{activeForm.stats.hp}</Text>
                  </View>
                  <View style={styles.statQuick}>
                    <Text style={styles.statLabel}>AC</Text>
                    <Text style={styles.statValue}>{activeForm.stats.ac}</Text>
                  </View>
                  <View style={styles.statQuick}>
                    <Text style={styles.statLabel}>Speed</Text>
                    <Text style={styles.statValue}>{activeForm.stats.speed}</Text>
                  </View>
                </View>

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
                        {form.size} • {form.spell}
                      </Text>
                      <Text style={styles.favoriteMovement}>
                        {form.movement}
                      </Text>
                    </BarkCard>
                  </Pressable>
                ))}
              </View>
            ) : (
              <MistCard intensity="light">
                <Text style={{ textAlign: 'center', color: '#6B5344', padding: 20 }}>
                  No favorite forms yet. Star a form to add it here!
                </Text>
              </MistCard>
            )}
          </View>
        </ScrollView>

        {/* Form Detail Modal */}
        <Modal
          visible={!!selectedFormModal}
          transparent
          animationType="fade"
          onRequestClose={handleCloseFormModal}
        >
          <Pressable style={styles.modalOverlay} onPress={handleCloseFormModal}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <BarkCard>
                  <ScrollView style={styles.modalScroll}>
                    {selectedFormModal && (
                      <>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                          <View style={styles.modalHeaderContent}>
                            <Text style={styles.modalTitle}>{selectedFormModal.name}</Text>
                            <Text style={styles.modalSubtitle}>
                              {selectedFormModal.size} • {selectedFormModal.spell}
                            </Text>
                            <View style={styles.chipRow}>
                              {selectedFormModal.abilities.map((ability: string, idx: number) => (
                                <Chip key={idx} label={ability} variant="mist" />
                              ))}
                            </View>
                          </View>
                        </View>

                        {/* Stats */}
                        <View style={styles.modalSection}>
                          <Text style={styles.modalSectionTitle}>Stats</Text>
                          <View style={styles.statsRow}>
                            <Stat label="HP" value={selectedFormModal.stats.hp.toString()} />
                            <Stat label="AC" value={selectedFormModal.stats.ac.toString()} />
                            <Stat label="Speed" value={selectedFormModal.movement} />
                          </View>
                        </View>

                        {/* Attacks */}
                        <View style={styles.modalSection}>
                          <Text style={styles.modalSectionTitle}>Natural Attacks</Text>
                          {selectedFormModal.attacks.map((attack: any, idx: number) => (
                            <AttackRow
                              key={idx}
                              name={attack.name}
                              bonus={attack.bonus}
                              damage={attack.damage}
                              trait={attack.trait}
                            />
                          ))}
                        </View>

                        {/* Actions */}
                        <View style={styles.modalActions}>
                          <Button
                            variant="outline"
                            onPress={handleCloseFormModal}
                            style={{ flex: 1 }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onPress={handleAssumeFormFromModal}
                            style={{ flex: 1 }}
                          >
                            Assume Form
                          </Button>
                        </View>
                      </>
                    )}
                  </ScrollView>
                </BarkCard>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </LivingForestBg>
    </View>
  );
}
