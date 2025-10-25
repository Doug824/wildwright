/**
 * Library Screen
 *
 * Browse pre-built wildshape form templates.
 * Read-only templates that can be cloned into your personal forms.
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
import { Stat } from '@/components/ui/Stat';

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
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [clonedForms, setClonedForms] = useState<Set<string>>(new Set());

  // Mock template data - will come from Firestore
  const templates: TemplateForm[] = [
    {
      id: 't1',
      name: 'Leopard',
      size: 'Large',
      spell: 'Beast Shape III',
      tags: ['Pounce', 'Flanking', 'Grab'],
      ac: '19',
      hp: '64',
      speed: '40 ft',
    },
    {
      id: 't2',
      name: 'Brown Bear',
      size: 'Large',
      spell: 'Beast Shape II',
      tags: ['Grab', 'Powerful Build'],
      ac: '17',
      hp: '72',
      speed: '30 ft',
    },
    {
      id: 't3',
      name: 'Eagle',
      size: 'Small',
      spell: 'Beast Shape I',
      tags: ['Flight', 'Keen Senses'],
      ac: '16',
      hp: '32',
      speed: '10 ft, fly 80 ft',
    },
    {
      id: 't4',
      name: 'Dire Wolf',
      size: 'Large',
      spell: 'Beast Shape III',
      tags: ['Trip', 'Scent', 'Pack Tactics'],
      ac: '18',
      hp: '68',
      speed: '50 ft',
    },
  ];

  const filters = ['Small', 'Medium', 'Large', 'Huge', 'Beast I', 'Beast II', 'Beast III'];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleClone = (templateId: string) => {
    // Clone template to user's forms
    setClonedForms(prev => new Set(prev).add(templateId));
    // TODO: Actually create the form in Firestore
    alert('Form cloned! Check your Forms tab.');
  };

  const handleViewDetails = (templateId: string) => {
    // Navigate to detailed view
    router.push(`/(app)/playsheet?templateId=${templateId}`);
  };

  const filteredTemplates = templates.filter(template => {
    if (selectedFilters.length === 0) return true;
    return selectedFilters.some(filter =>
      template.size === filter || template.spell.includes(filter)
    );
  });

  return (
    <View style={styles.container}>
      <LivingForestBg>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Template Library</Text>
            <Text style={styles.subtitle}>
              {templates.length} pre-built forms to explore
            </Text>
          </View>

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

          {/* Templates List */}
          {filteredTemplates.map((template) => (
            <BarkCard key={template.id} style={styles.templateCard}>
              <View style={styles.templateHeader}>
                <Text style={styles.templateName}>{template.name}</Text>
                <Text style={styles.templateSubtitle}>
                  {template.size} • {template.spell}
                </Text>
              </View>

              <View style={styles.chipRow}>
                {template.tags.map((tag) => (
                  <Chip key={tag} label={tag} variant="mist" />
                ))}
              </View>

              <View style={styles.statsPreview}>
                <Stat label="AC" value={template.ac} />
                <Stat label="HP" value={template.hp} />
                <Stat label="Speed" value={template.speed} />
              </View>

              {clonedForms.has(template.id) ? (
                <View style={styles.clonedBadge}>
                  <Text style={styles.clonedText}>✓ Cloned to Your Forms</Text>
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  <Button
                    onPress={() => handleClone(template.id)}
                    style={{ flex: 1 }}
                  >
                    Clone Form
                  </Button>
                  <Button
                    variant="outline"
                    onPress={() => handleViewDetails(template.id)}
                    style={{ flex: 1 }}
                  >
                    View Details
                  </Button>
                </View>
              )}
            </BarkCard>
          ))}
        </ScrollView>
      </LivingForestBg>
    </View>
  );
}
