/**
 * Forms Screen
 *
 * Browse and manage saved wildshape forms.
 * Swipe cards with filters by size, spell tier, and tags.
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, query, getDocs, where, updateDoc, doc } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { getCurrentCharacterId } from '@/lib/storage';
import { WildShapeFormWithId } from '@/types/firestore';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { BarkCard } from '@/components/ui/BarkCard';
import { MistCard } from '@/components/ui/MistCard';
import { H2, H3 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';

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
      if (!characterId) {
        setLoading(false);
        return;
      }

      try {
        const formsQuery = query(
          collection(db, COLLECTIONS.WILD_SHAPE_FORMS),
          where('characterId', '==', characterId)
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
  }, [characterId]);

  const filters = ['Small', 'Medium', 'Large', 'Huge', 'Beast I', 'Beast II', 'Beast III'];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const toggleFavorite = async (formId: string) => {
    try {
      const form = forms.find(f => f.id === formId);
      if (!form) return;

      // Update in Firestore
      await updateDoc(doc(db, COLLECTIONS.WILD_SHAPE_FORMS, formId), {
        isFavorite: !form.isFavorite,
      });

      // Update local state
      setForms(prev =>
        prev.map(f =>
          f.id === formId ? { ...f, isFavorite: !f.isFavorite } : f
        )
      );
    } catch (error) {
      console.error('Error updating favorite:', error);
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

  const filteredForms = forms.filter(form => {
    if (selectedFilters.length === 0) return true;
    return selectedFilters.some(filter =>
      form.size === filter || form.requiredSpellLevel.includes(filter)
    );
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
              {forms.length} wildshape {forms.length === 1 ? 'form' : 'forms'} known
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
              {/* Filters */}
              <View style={styles.filterRow}>
                {filters.map((filter) => (
                  <Pressable key={filter} onPress={() => toggleFilter(filter)}>
                    <Chip
                      label={filter}
                      variant={selectedFilters.includes(filter) ? 'mist' : 'default'}
                    />
                  </Pressable>
                ))}
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

                  <Button onPress={() => handleAssumeForm(form.id)} fullWidth>
                    Assume This Form
                  </Button>
                </BarkCard>
              ))}
            </>
          )}
        </ScrollView>
      </LivingForestBg>
    </View>
  );
}
