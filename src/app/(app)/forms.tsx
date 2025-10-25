/**
 * Forms Screen
 *
 * Browse and manage saved wildshape forms.
 * Swipe cards with filters by size, spell tier, and tags.
 */

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
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
    color: '#1A0F08',
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#B97A3D',
    backgroundColor: 'rgba(185, 122, 61, 0.1)',
  },
  favoriteButtonActive: {
    backgroundColor: 'rgba(185, 122, 61, 0.3)',
  },
  favoriteText: {
    fontSize: 18,
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
    color: '#1A0F08',
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
}

export default function FormsScreen() {
  const router = useRouter();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [forms, setForms] = useState<WildshapeForm[]>([
    // Mock data - will come from Firestore
    {
      id: '1',
      name: 'Leopard',
      size: 'Large',
      spell: 'Beast Shape III',
      tags: ['Pounce', 'Flanking', 'Planar'],
      isFavorite: true,
    },
    {
      id: '2',
      name: 'Brown Bear',
      size: 'Large',
      spell: 'Beast Shape II',
      tags: ['Grab', 'Powerful'],
      isFavorite: false,
    },
  ]);

  const filters = ['Small', 'Medium', 'Large', 'Huge', 'Beast I', 'Beast II', 'Beast III'];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const toggleFavorite = (formId: string) => {
    setForms(prev =>
      prev.map(form =>
        form.id === formId ? { ...form, isFavorite: !form.isFavorite } : form
      )
    );
  };

  const handleAssumeForm = (formId: string) => {
    // Set active form and navigate to playsheet
    router.push(`/(app)/playsheet?formId=${formId}`);
  };

  const handleCreateForm = () => {
    router.push('/(tabs)/character/forms/create');
  };

  const handleCloneFromLibrary = () => {
    router.push('/(app)/library');
  };

  const filteredForms = forms.filter(form => {
    if (selectedFilters.length === 0) return true;
    return selectedFilters.some(filter =>
      form.size === filter || form.spell.includes(filter)
    );
  });

  return (
    <View style={styles.container}>
      <LivingForestBg>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Your Forms</Text>
            <Text style={styles.subtitle}>
              {forms.length} wildshape {forms.length === 1 ? 'form' : 'forms'} ready
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
                <Button
                  variant="outline"
                  onPress={handleCreateForm}
                  fullWidth
                  style={styles.createButton}
                >
                  + Create Custom Form
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
                        {form.size} • {form.spell}
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
                    {form.tags.map((tag) => (
                      <Chip key={tag} label={tag} variant="mist" />
                    ))}
                  </View>

                  <Button onPress={() => handleAssumeForm(form.id)} fullWidth>
                    Assume This Form
                  </Button>
                </BarkCard>
              ))}

              {/* Create Button */}
              <Button
                variant="outline"
                onPress={handleCreateForm}
                fullWidth
                style={styles.createButton}
              >
                + Create New Form
              </Button>
            </>
          )}
        </ScrollView>
      </LivingForestBg>
    </View>
  );
}
