/**
 * Forms Screen
 *
 * Browse and manage saved wildshape forms.
 * Swipe cards with filters by size, spell tier, and tags.
 */

import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useCharacter } from '@/contexts';
import { useCharacterForms, useUpdateWildShapeForm, useDeleteWildShapeForm } from '@/hooks/useWildShapeForms';
import { WildShapeFormWithId, CharacterWithId } from '@/types/firestore';
import { computePF1e } from '@/pf1e';
import { characterToBaseCharacter } from '@/pf1e/adapters';
import { getTierForEDL } from '@/pf1e/tiers';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { BarkCard } from '@/components/ui/BarkCard';
import { MistCard } from '@/components/ui/MistCard';
import { H2, H3 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Toast } from '@/components/ui/Toast';
import { FormCardSkeleton } from '@/components/skeletons/FormCardSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';
import { error as hapticError, warning as hapticWarning } from '@/utils/haptics';

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
    marginBottom: 20,
  },
  title: {
    color: '#F9F5EB',
    fontSize: 28,
    fontWeight: '700',
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    marginBottom: 8,
  },
  subtitle: {
    color: '#D4C5A9',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  formCard: {
    marginBottom: 16,
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  formInfo: {
    flex: 1,
  },
  formName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A3426',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#4A3426',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#B97A3D',
    backgroundColor: 'rgba(185, 122, 61, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(185, 122, 61, 0.3)',
  },
  favoriteText: {
    fontSize: 20,
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
    color: '#4A3426',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: '#4A3426',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  createButton: {
    marginTop: 20,
  },
});

interface WildshapeForm {
  id: string;
  name: string;
  size: string;
  spell: string;
  tags: string[];
  isFavorite: boolean;
  movement?: string;
  attacks?: any[];
  abilities?: string[];
  stats?: any;
}

export default function FormsScreen() {
  const router = useRouter();

  // Get character from context
  const { character, characterId } = useCharacter();

  // Get forms using React Query
  const { data: forms = [], isLoading } = useCharacterForms(characterId);

  // Mutations
  const updateForm = useUpdateWildShapeForm();
  const deleteForm = useDeleteWildShapeForm();

  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);

  const loading = isLoading;

  // Data fetching handled by React Query hooks
  // Auto-refetches on focus due to React Query config

  // Filter categories
  const sizeFilters = ['Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'];
  const typeFilters = ['Animal', 'Elemental', 'Plant', 'Magical Beast'];
  const speedFilters = ['Swim', 'Climb', 'Land', 'Fly', 'Burrow'];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const toggleFavorite = async (formId: string) => {
    try {
      const form = forms.find(f => f.id === formId);
      if (!form) return;

      const newFavoriteStatus = !form.isFavorite;

      // Update using React Query mutation
      await updateForm.mutateAsync({
        formId,
        updates: { isFavorite: newFavoriteStatus },
      });

      // Show success toast
      setToastMessage(newFavoriteStatus ? `${form.name} added to favorites!` : `${form.name} removed from favorites`);
      setToastType('success');
      setToastVisible(true);
    } catch (error: unknown) {
      console.error('Error updating favorite:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToastMessage(`Failed to update favorite: ${errorMessage}`);
      setToastType('error');
      setToastVisible(true);
    }
  };

  const handleAssumeForm = async (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (!form || !character) return;

    try {

      // Convert to PF1e format
      const baseChar = characterToBaseCharacter(character);

      // Convert form to PF1e format
      const pf1eForm = {
        id: form.id,
        name: form.name,
        kind: form.tags?.includes('elemental') ? 'Elemental' :
              form.tags?.includes('plant') ? 'Plant' :
              form.tags?.includes('magical-beast') ? 'Magical Beast' : 'Animal',
        baseSize: form.size,
        naturalAttacks: form.statModifications.naturalAttacks.map(attack => ({
          type: attack.name.toLowerCase() as any,
          dice: attack.damage,
          primary: true,
          traits: attack.traits || [],
        })),
        movement: form.statModifications.movement,
        senses: form.statModifications.senses || {},
        traits: form.statModifications.specialAbilities || [],
      };

      // Get tier for character level - check multiple locations for EDL
      const edl = character.baseStats.effectiveDruidLevel
        || character.baseStats.level
        || (character as any).effectiveDruidLevel
        || (character as any).level
        || 1;
      const tierAvailability = getTierForEDL(edl);
      if (!tierAvailability) {
        setToastMessage('Character level too low for Wild Shape');
        setToastType('error');
        setToastVisible(true);
        return;
      }

      // Determine tier based on form kind
      let tier;
      if (pf1eForm.kind === 'Elemental' && tierAvailability.elemental) {
        tier = tierAvailability.elemental;
      } else if (pf1eForm.kind === 'Plant' && tierAvailability.plant) {
        tier = tierAvailability.plant;
      } else {
        tier = tierAvailability.animal;
      }

      // Extract element type for Elemental forms
      let element: 'Air' | 'Earth' | 'Fire' | 'Water' | undefined;
      if (pf1eForm.kind === 'Elemental') {
        const nameLower = form.name.toLowerCase();
        const allText = [nameLower, ...form.tags.map((t: string) => t.toLowerCase())].join(' ');
        if (allText.includes('air')) element = 'Air';
        else if (allText.includes('earth')) element = 'Earth';
        else if (allText.includes('fire')) element = 'Fire';
        else if (allText.includes('water')) element = 'Water';
      }

      // Compute stats
      const computedPlaysheet = computePF1e({
        base: baseChar,
        form: pf1eForm as any,
        tier,
        chosenSize: form.size,
        element,
      });

      // Navigate with computed data
      router.push({
        pathname: '/(app)/home',
        params: {
          assumedFormId: formId,
          assumedFormData: JSON.stringify({
            ...form,
            computed: computedPlaysheet,
            tier,
          })
        }
      });
    } catch (error: unknown) {
      console.error('Error computing form stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToastMessage(`Failed to assume form: ${errorMessage}`);
      setToastType('error');
      setToastVisible(true);
    }
  };

  const handleCloneFromLibrary = () => {
    router.push('/(app)/library');
  };

  const handleDeleteForm = async (formId: string, formName: string) => {
    // Warning haptic for destructive action
    await hapticWarning();
    // Show confirmation dialog
    setDeleteConfirmation({ id: formId, name: formName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    const { id, name } = deleteConfirmation;

    // Error haptic for deletion
    await hapticError();

    try {
      // Delete using React Query mutation
      await deleteForm.mutateAsync(id);

      // Show success toast
      setToastMessage(`${name} deleted successfully`);
      setToastType('success');
      setToastVisible(true);
    } catch (error: unknown) {
      console.error('Error deleting form:', error);

      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToastMessage(`Failed to delete form: ${errorMessage}`);
      setToastType('error');
      setToastVisible(true);
    } finally {
      setDeleteConfirmation(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation(null);
  };

  const handleViewDetails = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;

    // Navigate to playsheet with form data
    router.push({
      pathname: '/(app)/playsheet',
      params: {
        formData: JSON.stringify(form),
        fromForms: 'true', // Flag to show "Assume Form" button instead of Revert/Switch
        backTo: 'forms', // Track where we came from
      }
    });
  };

  const filteredForms = forms.filter(form => {
    if (selectedFilters.length === 0) return true;

    // Separate filters by category
    const selectedSizes = selectedFilters.filter(f => sizeFilters.includes(f));
    const selectedTypes = selectedFilters.filter(f => typeFilters.includes(f));
    const selectedSpeeds = selectedFilters.filter(f => speedFilters.includes(f));

    // Check size filter (OR within category)
    const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(form.size);

    // Check type filter (OR within category)
    const formType = form.tags?.find(tag =>
      tag.includes('animal') || tag.includes('elemental') || tag.includes('plant') || tag.includes('magical-beast')
    );
    const matchesType = selectedTypes.length === 0 || selectedTypes.some(type => {
      if (type === 'Animal') return formType?.includes('animal');
      if (type === 'Elemental') return formType?.includes('elemental');
      if (type === 'Plant') return formType?.includes('plant');
      if (type === 'Magical Beast') return formType?.includes('magical-beast');
      return false;
    });

    // Check speed filter (OR within category)
    const matchesSpeed = selectedSpeeds.length === 0 || selectedSpeeds.some(speed => {
      const movement = form.statModifications.movement;
      if (speed === 'Swim') return !!movement.swim;
      if (speed === 'Climb') return !!movement.climb;
      if (speed === 'Land') return !!movement.land;
      if (speed === 'Fly') return !!movement.fly;
      if (speed === 'Burrow') return !!movement.burrow;
      return false;
    });

    // All categories must match (AND logic between categories)
    return matchesSize && matchesType && matchesSpeed;
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <LivingForestBg>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header skeleton */}
            <View style={styles.header}>
              <Skeleton width={150} height={32} borderRadius={8} style={{ marginBottom: 8 }} />
              <Skeleton width={200} height={16} borderRadius={4} />
            </View>

            {/* Filter chips skeleton */}
            <View style={styles.filterRow}>
              <Skeleton width={80} height={32} borderRadius={16} style={{ marginRight: 8 }} />
              <Skeleton width={90} height={32} borderRadius={16} style={{ marginRight: 8 }} />
              <Skeleton width={70} height={32} borderRadius={16} style={{ marginRight: 8 }} />
              <Skeleton width={100} height={32} borderRadius={16} />
            </View>

            {/* Form cards skeleton */}
            <FormCardSkeleton />
            <FormCardSkeleton />
            <FormCardSkeleton />
            <FormCardSkeleton />
          </ScrollView>
        </LivingForestBg>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LivingForestBg>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your Forms</Text>
            <Text style={styles.subtitle}>
              {filteredForms.length} of {forms.length} forms
              {selectedFilters.length > 0 && (
                <Text style={{ color: '#7FD1A8' }}> • {selectedFilters.length} filters active</Text>
              )}
            </Text>
          </View>

          {forms.length === 0 ? (
            /* Empty State */
            <BarkCard>
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🦅</Text>
                <Text style={styles.emptyTitle}>No Forms Yet</Text>
                <Text style={styles.emptyText}>
                  Create custom forms or clone from the library to get started
                </Text>
                <Button onPress={() => router.push('/(app)/create-form')} fullWidth style={{ marginBottom: 12 }}>
                  + Create Custom Form
                </Button>
                <Button variant="outline" onPress={handleCloneFromLibrary} fullWidth>
                  Browse Library
                </Button>
              </View>
            </BarkCard>
          ) : (
            <>
              {/* Quick Actions */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <Button onPress={() => router.push('/(app)/create-form')} style={{ flex: 1 }}>
                  + Create Form
                </Button>
                <Button variant="outline" onPress={handleCloneFromLibrary} style={{ flex: 1 }}>
                  Browse Library
                </Button>
              </View>

              {/* Clear Filters Button */}
              {selectedFilters.length > 0 && (
                <Button variant="outline" onPress={clearFilters} fullWidth style={{ marginBottom: 12 }}>
                  Clear All Filters
                </Button>
              )}

              {/* Size Filters */}
              <View style={{ marginBottom: 6 }}>
                <Text style={{ color: '#D4C5A9', fontSize: 11, fontWeight: '700', marginBottom: 3 }}>
                  SIZE
                </Text>
                <View style={styles.filterRow}>
                  {sizeFilters.map((filter) => (
                    <Pressable key={filter} onPress={() => toggleFilter(filter)}>
                      <Chip
                        label={filter}
                        variant={selectedFilters.includes(filter) ? 'mist' : 'default'}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Type Filters */}
              <View style={{ marginBottom: 6 }}>
                <Text style={{ color: '#D4C5A9', fontSize: 11, fontWeight: '700', marginBottom: 3 }}>
                  TYPE
                </Text>
                <View style={styles.filterRow}>
                  {typeFilters.map((filter) => (
                    <Pressable key={filter} onPress={() => toggleFilter(filter)}>
                      <Chip
                        label={filter}
                        variant={selectedFilters.includes(filter) ? 'mist' : 'default'}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Speed Filters */}
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: '#D4C5A9', fontSize: 11, fontWeight: '700', marginBottom: 3 }}>
                  MOVEMENT
                </Text>
                <View style={styles.filterRow}>
                  {speedFilters.map((filter) => (
                    <Pressable key={filter} onPress={() => toggleFilter(filter)}>
                      <Chip
                        label={filter}
                        variant={selectedFilters.includes(filter) ? 'mist' : 'default'}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Forms List */}
              {filteredForms.map((form) => (
                <BarkCard key={form.id} style={styles.formCard}>
                  <View style={styles.formHeader}>
                    <View style={styles.formInfo}>
                      <Text style={styles.formName}>{form.name}</Text>
                      <Text style={styles.formSubtitle}>
                        {form.size} • {form.requiredSpellLevel}
                      </Text>
                    </View>
                    <Pressable
                      style={[
                        styles.favoriteButton,
                        form.isFavorite && styles.favoriteButtonActive
                      ]}
                      onPress={() => toggleFavorite(form.id)}
                    >
                      <Text style={styles.favoriteText}>
                        {form.isFavorite ? '⭐' : '☆'}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.chipRow}>
                    {form.statModifications.specialAbilities.slice(0, 4).map((ability, idx) => (
                      <Chip key={idx} label={ability} variant="mist" />
                    ))}
                  </View>

                  <View style={styles.formActions}>
                    <Button onPress={() => handleAssumeForm(form.id)} style={{ flex: 1 }}>
                      Assume
                    </Button>
                    <Button
                      variant="outline"
                      onPress={() => handleViewDetails(form.id)}
                      style={{ flex: 1 }}
                    >
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      onPress={() => handleDeleteForm(form.id, form.name)}
                      style={{ flex: 1 }}
                    >
                      Delete
                    </Button>
                  </View>
                </BarkCard>
              ))}
            </>
          )}
        </ScrollView>

        {/* Toast Notification */}
        <Toast
          message={toastMessage}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
          type={toastType}
        />

        {/* Delete Confirmation Dialog */}
        {deleteConfirmation && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
            <View style={{
              backgroundColor: '#F9F5EB',
              borderRadius: 12,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              borderWidth: 2,
              borderColor: '#8B7355',
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#4A3426', marginBottom: 12 }}>
                Delete Form?
              </Text>
              <Text style={{ fontSize: 14, color: '#6B5344', marginBottom: 24 }}>
                Are you sure you want to delete "{deleteConfirmation.name}"? This cannot be undone.
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Button variant="outline" onPress={cancelDelete} style={{ flex: 1 }}>
                  Cancel
                </Button>
                <Button onPress={confirmDelete} style={{ flex: 1 }}>
                  Delete
                </Button>
              </View>
            </View>
          </View>
        )}
      </LivingForestBg>
    </View>
  );
}
