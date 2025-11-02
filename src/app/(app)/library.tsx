/**
 * Library Screen
 *
 * Browse pre-built wildshape form templates.
 * Read-only templates that can be cloned into your personal forms.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useCharacter } from '@/contexts';
import { useOfficialTemplates } from '@/hooks/useWildShapeTemplates';
import { useCreateWildShapeForm, useCharacterForms } from '@/hooks/useWildShapeForms';
import { WildShapeTemplate, WildShapeTemplateWithId, CreatureSize } from '@/types/firestore';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { BarkCard } from '@/components/ui/BarkCard';
import { MistCard } from '@/components/ui/MistCard';
import { H2, H3 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Stat } from '@/components/ui/Stat';
import { Toast } from '@/components/ui/Toast';
import { TemplateCardSkeleton } from '@/components/skeletons/TemplateCardSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';
import { success as hapticSuccess, mediumImpact } from '@/utils/haptics';
import { getAbilityDescription, SpecialAbility } from '@/pf1e/specialAbilities';

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
  templateCard: {
    marginBottom: 16,
    padding: 20,
  },
  templateHeader: {
    marginBottom: 12,
  },
  templateName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A0F08',
    marginBottom: 4,
  },
  templateSubtitle: {
    fontSize: 14,
    color: '#4A3426',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 115, 85, 0.3)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  clonedBadge: {
    backgroundColor: 'rgba(127, 209, 168, 0.2)',
    borderColor: '#7FD1A8',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  clonedText: {
    color: '#2A4A3A',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  searchBar: {
    backgroundColor: 'rgba(232, 220, 200, 0.9)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B7355',
    padding: 12,
    marginBottom: 16,
    color: '#1A0F08',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#F9F5EB',
    borderRadius: 12,
    padding: 20,
    maxWidth: 500,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#B97A3D',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4A3426',
  },
  modalCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7FD1A8',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#4A3426',
    lineHeight: 20,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#B97A3D',
    fontWeight: '700',
  },
});

interface TemplateForm {
  id: string;
  name: string;
  size: string;
  spell: string;
  tags: string[];
  ac: string;
  hp: string;
  speed: string;
  isCloned?: boolean;
}

export default function LibraryScreen() {
  const router = useRouter();

  // Get character from context
  const { character, characterId } = useCharacter();

  // Get templates using React Query
  const { data: templates = [], isLoading: templatesLoading } = useOfficialTemplates();

  // Get character's forms to check which templates have been cloned
  const { data: characterForms = [] } = useCharacterForms(characterId);

  // Mutation for cloning templates
  const createForm = useCreateWildShapeForm();

  // Track which templates have been cloned
  const clonedTemplateIds = useMemo(() => {
    return new Set(characterForms.map(form => form.templateId).filter(Boolean));
  }, [characterForms]);

  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'cr-asc' | 'cr-desc' | 'size-asc' | 'size-desc' | 'recent'>('name-asc');
  const [edlMin, setEdlMin] = useState<string>('');
  const [edlMax, setEdlMax] = useState<string>('');
  const [showLearnedOnly, setShowLearnedOnly] = useState(false);
  const [hideLearnedForms, setHideLearnedForms] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Ability modal state
  const [selectedAbility, setSelectedAbility] = useState<SpecialAbility | null>(null);
  const [showAbilityModal, setShowAbilityModal] = useState(false);

  const loading = templatesLoading;

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Data fetching handled by React Query hooks above

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
    setSearchQuery('');
    setSortBy('name-asc');
    setEdlMin('');
    setEdlMax('');
    setShowLearnedOnly(false);
    setHideLearnedForms(false);
  };

  const handleClone = async (templateId: string) => {
    if (!characterId) {
      setToastMessage('Please select a character first.');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        console.error('Template not found:', templateId);
        return;
      }

      // Check if already cloned using our memoized set
      if (clonedTemplateIds.has(templateId)) {
        setToastMessage(`${template.name} is already in your Forms!`);
        setToastType('info');
        setToastVisible(true);
        return;
      }

      // Medium haptic for form learning
      await mediumImpact();

      // Create a new form using React Query mutation
      await createForm.mutateAsync({
        characterId: characterId,
        name: template.name,
        edition: template.edition,
        imageUrl: null,
        templateId: templateId,
        isCustom: false,
        size: template.size,
        tags: template.tags,
        statModifications: template.statModifications,
        requiredDruidLevel: template.requiredDruidLevel,
        requiredSpellLevel: template.requiredSpellLevel,
        isFavorite: false,
        notes: template.description,
      });

      // Success haptic
      await hapticSuccess();

      // Show success toast
      setToastMessage(`${template.name} learned! Check Forms tab.`);
      setToastType('success');
      setToastVisible(true);
    } catch (error: unknown) {
      console.error('Error cloning form:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToastMessage(`Error: ${errorMessage}`);
      setToastType('error');
      setToastVisible(true);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleViewDetails = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // Pass template data to playsheet for preview
    // Note: This won't have computed stats, just template data
    router.push({
      pathname: '/(app)/playsheet',
      params: {
        templateData: JSON.stringify(template),
        backTo: 'library', // Track where we came from
      }
    });
  };

  // Ability description handler
  const handleAbilityPress = (abilityName: string) => {
    const ability = getAbilityDescription(abilityName);
    if (ability) {
      setSelectedAbility(ability);
      setShowAbilityModal(true);
    }
  };

  // Helper function to format movement
  const formatMovement = (movement: Record<string, number>) => {
    const parts = [];
    if (movement.land) parts.push(`${movement.land} ft`);
    if (movement.fly) parts.push(`fly ${movement.fly} ft`);
    if (movement.swim) parts.push(`swim ${movement.swim} ft`);
    if (movement.climb) parts.push(`climb ${movement.climb} ft`);
    if (movement.burrow) parts.push(`burrow ${movement.burrow} ft`);
    return parts.join(', ');
  };

  // Size order for sorting
  const sizeOrder: Record<string, number> = {
    'Diminutive': 1,
    'Tiny': 2,
    'Small': 3,
    'Medium': 4,
    'Large': 5,
    'Huge': 6,
    'Gargantuan': 7,
    'Colossal': 8
  };

  const filteredAndSortedTemplates = useMemo(() => {
    // First, filter by search query
    let results = templates.filter(template => {
      // Search filter (case-insensitive)
      const matchesSearch = debouncedSearch === '' ||
        template.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        template.requiredSpellLevel.toLowerCase().includes(debouncedSearch.toLowerCase());

      if (!matchesSearch) return false;

      // EDL Range filter
      const minEDL = edlMin ? parseInt(edlMin, 10) : 0;
      const maxEDL = edlMax ? parseInt(edlMax, 10) : Infinity;
      const matchesEDL = template.requiredDruidLevel >= minEDL && template.requiredDruidLevel <= maxEDL;

      if (!matchesEDL) return false;

      // Learned/Unlearned filter
      const isLearned = clonedTemplateIds.has(template.id);
      if (showLearnedOnly && !isLearned) return false;
      if (hideLearnedForms && isLearned) return false;

      // Category filters
      if (selectedFilters.length === 0) return true;

      // Separate filters by category
      const selectedSizes = selectedFilters.filter(f => sizeFilters.includes(f));
      const selectedTypes = selectedFilters.filter(f => typeFilters.includes(f));
      const selectedSpeeds = selectedFilters.filter(f => speedFilters.includes(f));

      // Check size filter (OR within category)
      const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(template.size);

      // Check type filter (OR within category)
      const templateType = template.tags.find(tag =>
        tag.includes('animal') || tag.includes('elemental') || tag.includes('plant') || tag.includes('magical-beast')
      );
      const matchesType = selectedTypes.length === 0 || selectedTypes.some(type => {
        if (type === 'Animal') return templateType?.includes('animal');
        if (type === 'Elemental') return templateType?.includes('elemental');
        if (type === 'Plant') return templateType?.includes('plant');
        if (type === 'Magical Beast') return templateType?.includes('magical-beast');
        return false;
      });

      // Check speed filter (OR within category)
      const matchesSpeed = selectedSpeeds.length === 0 || selectedSpeeds.some(speed => {
        const movement = template.statModifications.movement;
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

    // Then, sort the filtered results
    results.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'cr-asc':
          return a.requiredDruidLevel - b.requiredDruidLevel;
        case 'cr-desc':
          return b.requiredDruidLevel - a.requiredDruidLevel;
        case 'size-asc':
          return (sizeOrder[a.size] || 0) - (sizeOrder[b.size] || 0);
        case 'size-desc':
          return (sizeOrder[b.size] || 0) - (sizeOrder[a.size] || 0);
        case 'recent':
          // Fallback to name if no timestamp available
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return results;
  }, [templates, debouncedSearch, selectedFilters, sortBy, edlMin, edlMax, showLearnedOnly, hideLearnedForms, clonedTemplateIds, sizeFilters, typeFilters, speedFilters]);

  if (loading) {
    return (
      <View style={styles.container}>
        <LivingForestBg>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header skeleton */}
            <View style={styles.header}>
              <Skeleton width={180} height={32} borderRadius={8} style={{ marginBottom: 8 }} />
              <Skeleton width={220} height={16} borderRadius={4} />
            </View>

            {/* Filter chips skeleton */}
            <View style={styles.filterRow}>
              <Skeleton width={75} height={32} borderRadius={16} style={{ marginRight: 8 }} />
              <Skeleton width={85} height={32} borderRadius={16} style={{ marginRight: 8 }} />
              <Skeleton width={65} height={32} borderRadius={16} style={{ marginRight: 8 }} />
              <Skeleton width={95} height={32} borderRadius={16} />
            </View>

            {/* Template cards skeleton */}
            <TemplateCardSkeleton />
            <TemplateCardSkeleton />
            <TemplateCardSkeleton />
            <TemplateCardSkeleton />
            <TemplateCardSkeleton />
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
            <Text style={styles.title}>Template Library</Text>
            <Text style={styles.subtitle}>
              {filteredAndSortedTemplates.length} of {templates.length} forms
              {(selectedFilters.length > 0 || debouncedSearch) && (
                <Text style={{ color: '#7FD1A8' }}>
                  {' '}• {selectedFilters.length > 0 && `${selectedFilters.length} filters`}
                  {selectedFilters.length > 0 && debouncedSearch && ', '}
                  {debouncedSearch && 'searching'}
                </Text>
              )}
            </Text>
          </View>

          {/* Search Bar */}
          <TextInput
            style={styles.searchBar}
            placeholder="Search forms by name or ability..."
            placeholderTextColor="#8B7355"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Sort Dropdown */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#D4C5A9', fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
              SORT BY
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
              <Pressable onPress={() => setSortBy('name-asc')}>
                <Chip label="Name (A-Z)" variant={sortBy === 'name-asc' ? 'mist' : 'default'} />
              </Pressable>
              <Pressable onPress={() => setSortBy('name-desc')}>
                <Chip label="Name (Z-A)" variant={sortBy === 'name-desc' ? 'mist' : 'default'} />
              </Pressable>
              <Pressable onPress={() => setSortBy('cr-asc')}>
                <Chip label="EDL (Low)" variant={sortBy === 'cr-asc' ? 'mist' : 'default'} />
              </Pressable>
              <Pressable onPress={() => setSortBy('cr-desc')}>
                <Chip label="EDL (High)" variant={sortBy === 'cr-desc' ? 'mist' : 'default'} />
              </Pressable>
              <Pressable onPress={() => setSortBy('size-asc')}>
                <Chip label="Size (Small)" variant={sortBy === 'size-asc' ? 'mist' : 'default'} />
              </Pressable>
              <Pressable onPress={() => setSortBy('size-desc')}>
                <Chip label="Size (Large)" variant={sortBy === 'size-desc' ? 'mist' : 'default'} />
              </Pressable>
            </ScrollView>
          </View>

          {/* Clear Filters Button */}
          {(selectedFilters.length > 0 || debouncedSearch || sortBy !== 'name-asc' || edlMin || edlMax || showLearnedOnly || hideLearnedForms) && (
            <Button variant="outline" onPress={clearFilters} fullWidth style={{ marginBottom: 12 }}>
              Clear All Filters & Sort
            </Button>
          )}

          {/* Advanced Filters */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: '#D4C5A9', fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
              ADVANCED FILTERS
            </Text>

            {/* EDL Range */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
              <Text style={{ color: '#D4C5A9', fontSize: 12, fontWeight: '600' }}>EDL:</Text>
              <TextInput
                style={[styles.searchBar, { width: 60, padding: 8, marginBottom: 0, textAlign: 'center' }]}
                placeholder="Min"
                placeholderTextColor="#8B7355"
                value={edlMin}
                onChangeText={setEdlMin}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={{ color: '#D4C5A9', fontSize: 12 }}>to</Text>
              <TextInput
                style={[styles.searchBar, { width: 60, padding: 8, marginBottom: 0, textAlign: 'center' }]}
                placeholder="Max"
                placeholderTextColor="#8B7355"
                value={edlMax}
                onChangeText={setEdlMax}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            {/* Learned Filter Toggles */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => {
                  setShowLearnedOnly(!showLearnedOnly);
                  if (!showLearnedOnly) setHideLearnedForms(false);
                }}
                style={{ flex: 1 }}
              >
                <Chip
                  label="Show Learned Only"
                  variant={showLearnedOnly ? 'mist' : 'default'}
                />
              </Pressable>
              <Pressable
                onPress={() => {
                  setHideLearnedForms(!hideLearnedForms);
                  if (!hideLearnedForms) setShowLearnedOnly(false);
                }}
                style={{ flex: 1 }}
              >
                <Chip
                  label="Hide Learned"
                  variant={hideLearnedForms ? 'mist' : 'default'}
                />
              </Pressable>
            </View>
          </View>

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

          {/* Templates List */}
          {filteredAndSortedTemplates.length === 0 ? (
            <MistCard style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: '#1A0F08', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                No forms found
              </Text>
              <Text style={{ color: '#4A3426', fontSize: 14, textAlign: 'center' }}>
                Try adjusting your search or filters
              </Text>
            </MistCard>
          ) : (
            filteredAndSortedTemplates.map((template) => (
            <BarkCard key={template.id} style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateSubtitle}>
                  {template.size} • {template.requiredSpellLevel}
                </Text>
              </View>

              <View style={styles.chipRow}>
                {template.statModifications.specialAbilities.slice(0, 4).map((ability, idx) => (
                  <Pressable key={idx} onPress={() => handleAbilityPress(ability)}>
                    <Chip label={ability} variant="mist" />
                  </Pressable>
                ))}
              </View>

              <View style={styles.statsPreview}>
                <Stat label="EDL" value={template.requiredDruidLevel.toString()} />
                <Stat label="Speed" value={formatMovement(template.statModifications.movement)} />
              </View>

              {clonedTemplateIds.has(template.id) ? (
                <View style={styles.clonedBadge}>
                  <Text style={styles.clonedText}>✓ Learned!</Text>
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  <Button
                    onPress={() => handleClone(template.id)}
                    style={{ flex: 1 }}
                  >
                    Learn Form
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => handleViewDetails(template.id)}
                    style={{ flex: 1 }}
                  >
                    Details
                  </Button>
                </View>
              )}
            </BarkCard>
          ))
          )}
        </ScrollView>

        {/* Toast Notification */}
        <Toast
          message={toastMessage}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
          type={toastType}
        />

        {/* Ability Description Modal */}
        <Modal
          visible={showAbilityModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAbilityModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowAbilityModal(false)}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              {selectedAbility && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalCategory}>
                        {selectedAbility.category}
                      </Text>
                      <Text style={styles.modalTitle}>
                        {selectedAbility.name}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.closeButton}
                      onPress={() => setShowAbilityModal(false)}
                    >
                      <Text style={styles.closeButtonText}>×</Text>
                    </Pressable>
                  </View>
                  <ScrollView>
                    <Text style={styles.modalDescription}>
                      {selectedAbility.description}
                    </Text>
                  </ScrollView>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      </LivingForestBg>
    </View>
  );
}
