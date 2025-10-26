/**
 * Character Screen
 *
 * Edit character details: base stats, effective druid level, feats, traits.
 * This is the character editor within the app shell.
 */

import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/hooks';
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
    color: '#4A3426',
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
    minHeight: 16,
  },
  input: {
    backgroundColor: 'rgba(249, 245, 235, 0.8)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B7355',
    padding: 12,
    fontSize: 16,
    color: '#4A3426',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-start',
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
    color: '#4A3426',
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
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  selectLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A3426',
    marginBottom: 8,
    marginTop: 8,
  },
});

export default function CharacterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
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

  // Combat Stats
  const [baseAttackBonus, setBaseAttackBonus] = useState('7');
  const [baseNaturalArmor, setBaseNaturalArmor] = useState('0');
  const [dodgeBonus, setDodgeBonus] = useState('0');
  const [fortSave, setFortSave] = useState('8');
  const [refSave, setRefSave] = useState('5');
  const [willSave, setWillSave] = useState('8');
  const [armorBonus, setArmorBonus] = useState('0');
  const [deflectionBonus, setDeflectionBonus] = useState('0');
  const [shieldBonus, setShieldBonus] = useState('0');
  const [attackStatModifier, setAttackStatModifier] = useState<'STR' | 'DEX' | 'WIS'>('STR');
  const [damageStatModifier, setDamageStatModifier] = useState<'STR' | 'DEX' | 'WIS'>('STR');
  const [damageMultiplier, setDamageMultiplier] = useState<'1' | '1.5' | '2'>('1');
  const [baseHP, setBaseHP] = useState('64');
  const [miscAttackBonus, setMiscAttackBonus] = useState('0');
  const [miscDamageBonus, setMiscDamageBonus] = useState('0');

  // Feats/Traits
  const [activeFeats, setActiveFeats] = useState<Set<string>>(
    new Set(['Natural Spell'])
  );

  // TODO: Add custom feats/traits system - need to research which feats affect wildshape mechanics
  // and create a way for users to add custom feats with their effects
  const availableFeats = [
    'Natural Spell',
    'Planar Wild Shape',
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

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save a character');
      return;
    }

    const characterData = {
      ownerId: user.uid, // CRITICAL: Required by Firestore rules
      name,
      level: parseInt(level) || 1,
      effectiveDruidLevel,
      baseStats: {
        str: parseInt(str) || 10,
        dex: parseInt(dex) || 10,
        con: parseInt(con) || 10,
        int: parseInt(int) || 10,
        wis: parseInt(wis) || 10,
        cha: parseInt(cha) || 10,
      },
      combatStats: {
        baseAttackBonus: parseInt(baseAttackBonus) || 0,
        baseHP: parseInt(baseHP) || 0,
        baseNaturalArmor: parseInt(baseNaturalArmor) || 0,
        saves: {
          fort: parseInt(fortSave) || 0,
          ref: parseInt(refSave) || 0,
          will: parseInt(willSave) || 0,
        },
        acBonuses: {
          armor: parseInt(armorBonus) || 0,
          deflection: parseInt(deflectionBonus) || 0,
          shield: parseInt(shieldBonus) || 0,
          dodge: parseInt(dodgeBonus) || 0,
        },
        attackStatModifier,
        damageStatModifier,
        damageMultiplier,
        miscAttackBonus: parseInt(miscAttackBonus) || 0,
        miscDamageBonus: parseInt(miscDamageBonus) || 0,
      },
      feats: Array.from(activeFeats),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (isNew) {
        // Create new character
        await addDoc(collection(db, COLLECTIONS.CHARACTERS), characterData);
        Alert.alert('Success', 'Character created successfully!');
        router.replace('/character-picker');
      } else {
        // TODO: Update existing character
        Alert.alert('Success', 'Character saved!');
      }
    } catch (error: any) {
      console.error('Error saving character:', error);
      Alert.alert('Error', `Failed to save character: ${error.message}`);
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

          {/* Combat Stats */}
          <BarkCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Combat Stats</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statInput}>
                <Text style={styles.label}>BAB</Text>
                <TextInput
                  style={styles.input}
                  value={baseAttackBonus}
                  onChangeText={setBaseAttackBonus}
                  keyboardType="numeric"
                  placeholder="7"
                  placeholderTextColor="#8B7355"
                />
              </View>
              <View style={styles.statInput}>
                <Text style={styles.label}>Base HP</Text>
                <TextInput
                  style={styles.input}
                  value={baseHP}
                  onChangeText={setBaseHP}
                  keyboardType="numeric"
                  placeholder="64"
                  placeholderTextColor="#8B7355"
                />
              </View>
              <View style={styles.statInput}>
                <Text style={styles.label}>Nat Armor</Text>
                <TextInput
                  style={styles.input}
                  value={baseNaturalArmor}
                  onChangeText={setBaseNaturalArmor}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statInput}>
                <Text style={styles.label}>Fort</Text>
                <TextInput
                  style={styles.input}
                  value={fortSave}
                  onChangeText={setFortSave}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.statInput}>
                <Text style={styles.label}>Ref</Text>
                <TextInput
                  style={styles.input}
                  value={refSave}
                  onChangeText={setRefSave}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.statInput}>
                <Text style={styles.label}>Will</Text>
                <TextInput
                  style={styles.input}
                  value={willSave}
                  onChangeText={setWillSave}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statInput}>
                <Text style={styles.label}>Armor</Text>
                <TextInput
                  style={styles.input}
                  value={armorBonus}
                  onChangeText={setArmorBonus}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#8B7355"
                />
              </View>
              <View style={styles.statInput}>
                <Text style={styles.label}>Deflect</Text>
                <TextInput
                  style={styles.input}
                  value={deflectionBonus}
                  onChangeText={setDeflectionBonus}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#8B7355"
                />
              </View>
              <View style={styles.statInput}>
                <Text style={styles.label}>Shield</Text>
                <TextInput
                  style={styles.input}
                  value={shieldBonus}
                  onChangeText={setShieldBonus}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statInput}>
                <Text style={styles.label}>Dodge</Text>
                <TextInput
                  style={styles.input}
                  value={dodgeBonus}
                  onChangeText={setDodgeBonus}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            <Text style={styles.selectLabel}>Attack Stat Modifier</Text>
            <View style={styles.selectRow}>
              <View onTouchEnd={() => setAttackStatModifier('STR')}>
                <Chip label="STR" variant={attackStatModifier === 'STR' ? 'mist' : 'default'} />
              </View>
              <View onTouchEnd={() => setAttackStatModifier('DEX')}>
                <Chip label="DEX" variant={attackStatModifier === 'DEX' ? 'mist' : 'default'} />
              </View>
              <View onTouchEnd={() => setAttackStatModifier('WIS')}>
                <Chip label="WIS" variant={attackStatModifier === 'WIS' ? 'mist' : 'default'} />
              </View>
            </View>

            <Text style={styles.selectLabel}>Damage Stat Modifier</Text>
            <View style={styles.selectRow}>
              <View onTouchEnd={() => setDamageStatModifier('STR')}>
                <Chip label="STR" variant={damageStatModifier === 'STR' ? 'mist' : 'default'} />
              </View>
              <View onTouchEnd={() => setDamageStatModifier('DEX')}>
                <Chip label="DEX" variant={damageStatModifier === 'DEX' ? 'mist' : 'default'} />
              </View>
              <View onTouchEnd={() => setDamageStatModifier('WIS')}>
                <Chip label="WIS" variant={damageStatModifier === 'WIS' ? 'mist' : 'default'} />
              </View>
            </View>

            <Text style={styles.selectLabel}>Damage Multiplier</Text>
            <View style={styles.selectRow}>
              <View onTouchEnd={() => setDamageMultiplier('1')}>
                <Chip label="×1" variant={damageMultiplier === '1' ? 'mist' : 'default'} />
              </View>
              <View onTouchEnd={() => setDamageMultiplier('1.5')}>
                <Chip label="×1.5" variant={damageMultiplier === '1.5' ? 'mist' : 'default'} />
              </View>
              <View onTouchEnd={() => setDamageMultiplier('2')}>
                <Chip label="×2" variant={damageMultiplier === '2' ? 'mist' : 'default'} />
              </View>
            </View>

            <Text style={styles.selectLabel}>Misc Bonuses (from gear, buffs, etc.)</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statInput}>
                <Text style={styles.label}>Attack</Text>
                <TextInput
                  style={styles.input}
                  value={miscAttackBonus}
                  onChangeText={setMiscAttackBonus}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#8B7355"
                />
              </View>
              <View style={styles.statInput}>
                <Text style={styles.label}>Damage</Text>
                <TextInput
                  style={styles.input}
                  value={miscDamageBonus}
                  onChangeText={setMiscDamageBonus}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#8B7355"
                />
              </View>
            </View>

            <Text style={styles.helpText}>
              These stats are used to calculate your wildshape combat values. Misc bonuses include things like Amulet of Mighty Fists, enhancement bonuses, etc.
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
