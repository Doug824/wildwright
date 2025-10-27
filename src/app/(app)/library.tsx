/**
 * Library Screen
 *
 * Browse pre-built wildshape form templates.
 * Read-only templates that can be cloned into your personal forms.
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, query, getDocs, addDoc, where, Timestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { getCurrentCharacterId } from '@/lib/storage';
import { useAuth } from '@/hooks';
import { WildShapeTemplate, WildShapeTemplateWithId, CreatureSize } from '@/types/firestore';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { BarkCard } from '@/components/ui/BarkCard';
import { MistCard } from '@/components/ui/MistCard';
import { H2, H3 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Stat } from '@/components/ui/Stat';
import { Toast } from '@/components/ui/Toast';

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
  const params = useLocalSearchParams();
  const { user } = useAuth(); // Get authenticated user
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [templates, setTemplates] = useState<WildShapeTemplateWithId[]>([]);
  const [clonedForms, setClonedForms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Load characterId from storage
  useEffect(() => {
    const loadCharacterId = async () => {
      const charId = await getCurrentCharacterId();
      setCharacterId(charId);
    };
    loadCharacterId();
  }, []);

  // Fetch templates from Firestore
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templatesQuery = query(collection(db, COLLECTIONS.WILD_SHAPE_TEMPLATES));
        const snapshot = await getDocs(templatesQuery);

        const templatesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as WildShapeTemplateWithId[];

        setTemplates(templatesData);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

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

  const handleClone = async (templateId: string) => {
    const userId = user?.uid; // Use Firebase Auth user
    console.log('Clone attempt:', { userId, characterId, templateId });

    if (!userId || !characterId) {
      const message = `Please select a character first. (userId: ${userId ? 'OK' : 'MISSING'}, characterId: ${characterId ? 'OK' : 'MISSING'})`;
      console.error(message);
      setToastMessage(message);
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

      console.log('Cloning template:', template.name);

      // Check if form already exists
      const existingFormsQuery = query(
        collection(db, COLLECTIONS.WILD_SHAPE_FORMS),
        where('characterId', '==', characterId),
        where('ownerId', '==', userId),
        where('baseTemplateId', '==', templateId)
      );
      const existingSnapshot = await getDocs(existingFormsQuery);

      if (!existingSnapshot.empty) {
        // Form already exists
        setToastMessage(`${template.name} is already in your Forms!`);
        setToastType('info');
        setToastVisible(true);
        setClonedForms(prev => new Set(prev).add(templateId));
        return;
      }

      // Create a new form in wildShapeForms collection
      const docRef = await addDoc(collection(db, COLLECTIONS.WILD_SHAPE_FORMS), {
        ownerId: userId,
        characterId: characterId,
        name: template.name,
        edition: template.edition,
        imageUrl: null,
        baseTemplateId: templateId,
        isCustom: false,
        size: template.size,
        tags: template.tags,
        statModifications: template.statModifications,
        requiredDruidLevel: template.requiredDruidLevel,
        requiredSpellLevel: template.requiredSpellLevel,
        isFavorite: false,
        notes: template.description,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log('Form created successfully with ID:', docRef.id);
      setClonedForms(prev => new Set(prev).add(templateId));

      // Show success toast
      setToastMessage(`${template.name} learned! Check Forms tab.`);
      setToastType('success');
      setToastVisible(true);
    } catch (error: any) {
      console.error('Error cloning form:', error);

      // Show error toast
      setToastMessage(`Error: ${error.message}`);
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

  const filteredTemplates = templates.filter(template => {
    if (selectedFilters.length === 0) return true;

    // Separate filters by category
    const selectedSizes = selectedFilters.filter(f => sizeFilters.includes(f));
    const selectedTypes = selectedFilters.filter(f => typeFilters.includes(f));
    const selectedSpeeds = selectedFilters.filter(f => speedFilters.includes(f));

    // Check size filter (OR within category)
    const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(template.size);

    // Check type filter (OR within category)
    // Type comes from the seed data - need to check tags or derive from requiredSpellLevel
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

  if (loading) {
    return (
      <View style={styles.container}>
        <LivingForestBg>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#7FD1A8" />
            <Text style={{ color: '#F9F5EB', marginTop: 16, fontSize: 16 }}>
              Loading library...
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
            <Text style={styles.title}>Template Library</Text>
            <Text style={styles.subtitle}>
              {filteredTemplates.length} of {templates.length} forms
              {selectedFilters.length > 0 && (
                <Text style={{ color: '#7FD1A8' }}> • {selectedFilters.length} filters active</Text>
              )}
            </Text>
          </View>

          {/* Filters */}
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

          {/* Templates List */}
          {filteredTemplates.map((template) => (
            <BarkCard key={template.id} style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateSubtitle}>
                  {template.size} • {template.requiredSpellLevel}
                </Text>
              </View>

              <View style={styles.chipRow}>
                {template.statModifications.specialAbilities.slice(0, 4).map((ability, idx) => (
                  <Chip key={idx} label={ability} variant="mist" />
                ))}
              </View>

              <View style={styles.statsPreview}>
                <Stat label="EDL" value={template.requiredDruidLevel.toString()} />
                <Stat label="Speed" value={formatMovement(template.statModifications.movement)} />
              </View>

              {clonedForms.has(template.id) ? (
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
          ))}
        </ScrollView>

        {/* Toast Notification */}
        <Toast
          message={toastMessage}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
          type={toastType}
        />
      </LivingForestBg>
    </View>
  );
}
