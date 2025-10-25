/**
 * Character Screen
 *
 * Edit character details: base stats, effective druid level, feats, traits.
 * This is the character editor within the app shell.
 */

import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { BarkCard } from '@/components/ui/BarkCard';
import { H2, H3 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
    marginBottom: 24,
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
  sectionCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A0F08',
    marginBottom: 16,
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  inputRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3426',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(249, 245, 235, 0.8)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B7355',
    padding: 12,
    fontSize: 16,
    color: '#1A0F08',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statInput: {
    width: '30%',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#4A3426',
    fontWeight: '600',
    marginBottom: 8,
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A0F08',
    textAlign: 'center',
    marginBottom: 12,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  sliderButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(127, 209, 168, 0.3)',
    borderWidth: 2,
    borderColor: '#7FD1A8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderButtonText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A4A3A',
  },
  featRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#6B5344',
    fontStyle: 'italic',
    marginTop: 8,
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 40,
  },
});

export default function CharacterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isNew = params.new === 'true';

  // Character state
  const [name, setName] = useState('Thornclaw');
  const [level, setLevel] = useState('10');
  const [effectiveDruidLevel, setEffectiveDruidLevel] = useState(10);

  // Base stats
  const [str, setStr] = useState('10');
  const [dex, setDex] = useState('14');
  const [con, setConState] = useState('14');
  const [int, setInt] = useState('12');
  const [wis, setWis] = useState('18');
  const [cha, setCha] = useState('10');

  // Feats/Traits
  const [activeFeats, setActiveFeats] = useState<Set<string>>(
    new Set(['Natural Spell', 'Wildshape Focus'])
  );

  const availableFeats = [
    'Natural Spell',
    'Wildshape Focus',
    'Powerful Shape',
    'Planar Wild Shape',
    'Elemental Wild Shape',
    'Beast Totem',
  ];

  const toggleFeat = (feat: string) => {
    setActiveFeats(prev => {
      const newSet = new Set(prev);
      if (newSet.has(feat)) {
        newSet.delete(feat);
      } else {
        newSet.add(feat);
      }
      return newSet;
    });
  };

  const adjustEDL = (delta: number) => {
    setEffectiveDruidLevel(prev => Math.max(1, Math.min(20, prev + delta)));
  };

  const handleSave = () => {
    // TODO: Save to Firestore
    alert('Character saved!');
    if (isNew) {
      // Navigate back to character picker after creating
      router.replace('/character-picker');
    }
  };

  return (
    <View style={styles.container}>
      <LivingForestBg>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isNew ? 'Create Character' : 'Edit Character'}
            </Text>
            <Text style={styles.subtitle}>
              Configure your druid's base stats and abilities
            </Text>
          </View>

          {/* Basic Info */}
          <BarkCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Character Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter name..."
                placeholderTextColor="#8B7355"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Level</Text>
              <TextInput
                style={styles.input}
                value={level}
                onChangeText={setLevel}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor="#8B7355"
              />
            </View>

            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Effective Druid Level (EDL)</Text>
              <Text style={styles.sliderValue}>{effectiveDruidLevel}</Text>
              <View style={styles.sliderButtons}>
                <View style={styles.sliderButton} onTouchEnd={() => adjustEDL(-1)}>
                  <Text style={styles.sliderButtonText}>−</Text>
                </View>
                <View style={styles.sliderButton} onTouchEnd={() => adjustEDL(+1)}>
                  <Text style={styles.sliderButtonText}>+</Text>
                </View>
              </View>
              <Text style={styles.helpText}>
                Affects wildshape limits and available forms
              </Text>
            </View>
          </BarkCard>

          {/* Base Stats */}
          <BarkCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Base Ability Scores</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statInput}>
                <Text style={styles.label}>STR</Text>
                <TextInput
                  style={styles.input}
                  value={str}
                  onChangeText={setStr}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.statInput}>
                <Text style={styles.label}>DEX</Text>
                <TextInput
                  style={styles.input}
                  value={dex}
                  onChangeText={setDex}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.statInput}>
                <Text style={styles.label}>CON</Text>
                <TextInput
                  style={styles.input}
                  value={con}
                  onChangeText={setConState}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.statInput}>
                <Text style={styles.label}>INT</Text>
                <TextInput
                  style={styles.input}
                  value={int}
                  onChangeText={setInt}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.statInput}>
                <Text style={styles.label}>WIS</Text>
                <TextInput
                  style={styles.input}
                  value={wis}
                  onChangeText={setWis}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.statInput}>
                <Text style={styles.label}>CHA</Text>
                <TextInput
                  style={styles.input}
                  value={cha}
                  onChangeText={setCha}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <Text style={styles.helpText}>
              These are your character's natural ability scores
            </Text>
          </BarkCard>

          {/* Feats & Traits */}
          <BarkCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Feats & Traits</Text>
            <Text style={styles.helpText}>
              Select the feats and traits that affect your wildshape
            </Text>

            <View style={styles.featRow}>
              {availableFeats.map((feat) => (
                <View key={feat} onTouchEnd={() => toggleFeat(feat)}>
                  <Chip
                    label={feat}
                    variant={activeFeats.has(feat) ? 'mist' : 'default'}
                  />
                </View>
              ))}
            </View>
          </BarkCard>

          {/* Save Button */}
          <Button onPress={handleSave} fullWidth style={styles.saveButton}>
            {isNew ? 'Create Character' : 'Save Changes'}
          </Button>
        </ScrollView>
      </LivingForestBg>
    </View>
  );
}
