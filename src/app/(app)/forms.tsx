/**
 * Forms Screen
 *
 * Browse and manage saved wildshape forms.
 * Swipe cards with filters by size, spell tier, and tags.
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, query, getDocs, where, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { getCurrentCharacterId } from '@/lib/storage';
import { useAuth } from '@/hooks';
import { WildShapeFormWithId } from '@/types/firestore';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { BarkCard } from '@/components/ui/BarkCard';
import { MistCard } from '@/components/ui/MistCard';
import { H2, H3 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Toast } from '@/components/ui/Toast';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
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
  const params = useLocalSearchParams();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [forms, setForms] = useState<WildShapeFormWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const { user } = useAuth(); // Get authenticated user
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);

  // Load characterId from storage
  useEffect(() => {
    const loadCharacterId = async () => {
      const charId = await getCurrentCharacterId();
      setCharacterId(charId);
    };
    loadCharacterId();
  }, []);

  // Fetch user's learned forms from Firestore
  useEffect(() => {
    const fetchForms = async () => {
      if (!characterId || !user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const formsQuery = query(
          collection(db, COLLECTIONS.WILD_SHAPE_FORMS),
          where('characterId', '==', characterId),
          where('ownerId', '==', user.uid) // Required to match Firestore security rules
        );
        const snapshot = await getDocs(formsQuery);

        const formsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as WildShapeFormWithId[];

        setForms(formsData);
      } catch (error) {
        console.error('Error fetching forms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [characterId, user?.uid]);

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

      // Update in Firestore
      await updateDoc(doc(db, COLLECTIONS.WILD_SHAPE_FORMS, formId), {
        isFavorite: newFavoriteStatus,
      });

      // Update local state
      setForms(prev =>
        prev.map(f =>
          f.id === formId ? { ...f, isFavorite: newFavoriteStatus } : f
        )
      );

      // Show success toast
      setToastMessage(newFavoriteStatus ? `${form.name} added to favorites!` : `${form.name} removed from favorites`);
      setToastType('success');
      setToastVisible(true);
    } catch (error: any) {
      console.error('Error updating favorite:', error);

      // Show error toast
      setToastMessage(`Failed to update favorite: ${error.message}`);
      setToastType('error');
      setToastVisible(true);
    }
  };

  const handleAssumeForm = (formId: string) => {
    // TODO: Set active form in DB/context
    // For now, pass the form data via params
    // In production, this would save the form as active in Firestore
    const form = forms.find(f => f.id === formId);
    if (form) {
      router.push({
        pathname: '/(app)/home',
        params: {
          assumedFormId: formId,
          assumedFormData: JSON.stringify(form)
        }
      });
    }
  };

  const handleCloneFromLibrary = () => {
    router.push('/(app)/library');
  };

  const handleDeleteForm = (formId: string, formName: string) => {
    // Show confirmation dialog
    setDeleteConfirmation({ id: formId, name: formName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    const { id, name } = deleteConfirmation;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, COLLECTIONS.WILD_SHAPE_FORMS, id));

      // Update local state
      setForms(prev => prev.filter(f => f.id !== id));

      // Show success toast
      setToastMessage(`${name} deleted successfully`);
      setToastType('success');
      setToastVisible(true);
    } catch (error: any) {
      console.error('Error deleting form:', error);

      // Show error toast
      setToastMessage(`Failed to delete form: ${error.message}`);
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
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#7FD1A8" />
            <Text style={{ color: '#F9F5EB', marginTop: 16, fontSize: 16 }}>
              Loading forms...
            </Text>
          </View>
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
                <Button onPress={handleCloneFromLibrary} fullWidth>
                  Browse Library
                </Button>
              </View>
            </BarkCard>
          ) : (
            <>
              {/* Clear Filters Button */}
              {selectedFilters.length > 0 && (
                <Button variant="outline" onPress={clearFilters} fullWidth style={{ marginBottom: 12 }}>
                  Clear All Filters
                </Button>
              )}

              {/* Size Filters */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#D4C5A9', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
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
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: '#D4C5A9', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
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
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#D4C5A9', fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
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
