/**
 * Character Screen
 *
 * Edit character details: base stats, effective druid level, feats, traits.
 * This is the character editor within the app shell.
 */

import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '@/lib/firebase';
import { useAuth } from '@/hooks';
import { useCharacter } from '@/contexts';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { BarkCard } from '@/components/ui/BarkCard';
import { H2, H3 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
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
  subsectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A3426',
    marginBottom: 12,
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 115, 85, 0.3)',
  },
});

export default function CharacterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { character, characterId } = useCharacter();
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
  const [baseHP, setBaseHP] = useState('64');

  // Misc bonuses with labels
  interface MiscBonus {
    id: string;
    type: 'attack' | 'damage' | 'both';
    value: string;
    note: string;
  }

  const [miscBonuses, setMiscBonuses] = useState<MiscBonus[]>([]);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Load existing character data when editing
  useEffect(() => {
    if (!isNew && character) {
      console.log('[CHARACTER] Loading existing character:', character);
      setName(character.name || 'Character');

      // Load level - check multiple locations
      const charLevel = character.baseStats?.level || character.level || 1;
      setLevel(String(charLevel));

      // Load EDL - check multiple locations, default to character level
      const edl = character.baseStats?.effectiveDruidLevel
        || (character as any).effectiveDruidLevel
        || character.baseStats?.level
        || character.level
        || charLevel;
      setEffectiveDruidLevel(edl);

      // Load ability scores
      const abilities = character.baseStats?.abilityScores || (character.baseStats as any);
      setStr(String(abilities.str || 10));
      setDex(String(abilities.dex || 10));
      setConState(String(abilities.con || 10));
      setInt(String(abilities.int || 10));
      setWis(String(abilities.wis || 10));
      setCha(String(abilities.cha || 10));

      // Load combat stats
      const combatStats = (character as any).combatStats || {};
      setBaseHP(String(combatStats.baseHP || character.baseStats?.hp?.max || 0));
      setBaseAttackBonus(String(combatStats.baseAttackBonus || character.baseStats?.bab || 0));
      setBaseNaturalArmor(String(combatStats.baseNaturalArmor || 0));

      // Load saves
      const saves = character.baseStats?.saves || combatStats.saves || {};
      setFortSave(String(saves.fortitude || saves.fort || 0));
      setRefSave(String(saves.reflex || saves.ref || 0));
      setWillSave(String(saves.will || 0));

      // Load AC bonuses
      const acBonuses = combatStats.acBonuses || {};
      setArmorBonus(String(acBonuses.armor || 0));
      setDeflectionBonus(String(acBonuses.deflection || 0));
      setShieldBonus(String(acBonuses.shield || 0));
      setDodgeBonus(String(acBonuses.dodge || 0));

      // Load misc bonuses
      if (combatStats.miscBonuses && Array.isArray(combatStats.miscBonuses)) {
        setMiscBonuses(combatStats.miscBonuses);
      } else if (combatStats.miscAttackBonus || combatStats.miscDamageBonus) {
        // Migrate old single-value bonuses to new format
        const migrated: MiscBonus[] = [];
        if (combatStats.miscAttackBonus && combatStats.miscAttackBonus !== 0) {
          migrated.push({
            id: Date.now().toString(),
            type: 'attack',
            value: String(combatStats.miscAttackBonus),
            note: 'Mighty Fists'
          });
        }
        if (combatStats.miscDamageBonus && combatStats.miscDamageBonus !== 0) {
          migrated.push({
            id: (Date.now() + 1).toString(),
            type: 'damage',
            value: String(combatStats.miscDamageBonus),
            note: 'Mighty Fists'
          });
        }
        setMiscBonuses(migrated);
      }
    }
  }, [isNew, character]);

  // Misc bonus management
  const addMiscBonus = () => {
    setMiscBonuses([
      ...miscBonuses,
      {
        id: Date.now().toString(),
        type: 'attack',
        value: '0',
        note: ''
      }
    ]);
  };

  const updateMiscBonus = (id: string, field: keyof MiscBonus, value: string) => {
    setMiscBonuses(miscBonuses.map(bonus =>
      bonus.id === id ? { ...bonus, [field]: value } : bonus
    ));
  };

  const removeMiscBonus = (id: string) => {
    setMiscBonuses(miscBonuses.filter(bonus => bonus.id !== id));
  };

  const adjustEDL = (delta: number) => {
    setEffectiveDruidLevel(prev => Math.max(1, Math.min(30, prev + delta)));
  };

  const handleSave = async () => {
    if (!user) {
      setToastMessage('You must be logged in to save a character');
      setToastType('error');
      setToastVisible(true);
      return;
    }

    const characterData = {
      ownerId: user.uid, // CRITICAL: Required by Firestore rules
      name,
      class: 'Druid', // CRITICAL: Required for tier computation
      level: parseInt(level) || 1,
      baseStats: {
        level: parseInt(level) || 1,
        effectiveDruidLevel,
        abilityScores: {
          str: parseInt(str) || 10,
          dex: parseInt(dex) || 10,
          con: parseInt(con) || 10,
          int: parseInt(int) || 10,
          wis: parseInt(wis) || 10,
          cha: parseInt(cha) || 10,
        },
        ac: 10, // Will be calculated
        hp: {
          current: parseInt(baseHP) || 0,
          max: parseInt(baseHP) || 0,
        },
        saves: {
          fortitude: parseInt(fortSave) || 0,
          reflex: parseInt(refSave) || 0,
          will: parseInt(willSave) || 0,
        },
        bab: parseInt(baseAttackBonus) || 0,
        skills: {},
        movement: {
          land: 30, // Default
        },
        senses: [],
        size: 'Medium',
        traits: [],
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
        miscBonuses: miscBonuses.map(bonus => ({
          ...bonus,
          value: parseInt(bonus.value) || 0
        })),
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      if (isNew) {
        // Create new character
        await addDoc(collection(db, COLLECTIONS.CHARACTERS), characterData);
        setToastMessage('Character created successfully!');
        setToastType('success');
        setToastVisible(true);

        // Navigate after short delay so toast is visible
        setTimeout(() => {
          router.replace('/character-picker');
        }, 1500);
      } else {
        // Update existing character
        if (!characterId) {
          throw new Error('No character ID found for update');
        }

        const characterRef = doc(db, COLLECTIONS.CHARACTERS, characterId);
        await updateDoc(characterRef, {
          ...characterData,
          updatedAt: serverTimestamp(),
        });

        console.log('[CHARACTER] Character updated successfully:', characterId);
        setToastMessage('Changes saved successfully!');
        setToastType('success');
        setToastVisible(true);
      }
    } catch (error: any) {
      console.error('Error saving character:', error);
      setToastMessage(`Failed to save character: ${error.message}`);
      setToastType('error');
      setToastVisible(true);
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
            <Text style={styles.sectionTitle}>Ability Scores (with all gear)</Text>
            <Text style={styles.helpText}>
              Enter your total ability scores including all permanent bonuses from items, level-ups, etc.
            </Text>

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

            <Text style={styles.subsectionLabel}>Base Combat Stats</Text>
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

            <Text style={styles.subsectionLabel}>Saving Throws</Text>
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

            <Text style={styles.subsectionLabel}>AC Bonuses</Text>
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

            <Text style={styles.selectLabel}>Misc Bonuses (gear, buffs, magic items, etc.)</Text>
            <Text style={styles.helpText}>
              Add bonuses from Amulet of Mighty Fists, enhancement bonuses, buffs, etc. Each bonus can apply to attack, damage, or both.
            </Text>

            {miscBonuses.map((bonus) => (
              <View key={bonus.id} style={{ marginBottom: 16, padding: 12, backgroundColor: 'rgba(232, 220, 200, 0.3)', borderRadius: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Type</Text>
                    <View style={styles.selectRow}>
                      <Pressable onPress={() => updateMiscBonus(bonus.id, 'type', 'attack')}>
                        <Chip label="Attack" variant={bonus.type === 'attack' ? 'mist' : 'default'} />
                      </Pressable>
                      <Pressable onPress={() => updateMiscBonus(bonus.id, 'type', 'damage')}>
                        <Chip label="Damage" variant={bonus.type === 'damage' ? 'mist' : 'default'} />
                      </Pressable>
                      <Pressable onPress={() => updateMiscBonus(bonus.id, 'type', 'both')}>
                        <Chip label="Both" variant={bonus.type === 'both' ? 'mist' : 'default'} />
                      </Pressable>
                    </View>
                  </View>
                  <View style={{ width: 80 }}>
                    <Text style={styles.label}>Bonus</Text>
                    <TextInput
                      style={styles.input}
                      value={bonus.value}
                      onChangeText={(val) => updateMiscBonus(bonus.id, 'value', val)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#8B7355"
                    />
                  </View>
                </View>
                <View style={{ marginBottom: 8 }}>
                  <Text style={styles.label}>Note (what is this from?)</Text>
                  <TextInput
                    style={styles.input}
                    value={bonus.note}
                    onChangeText={(val) => updateMiscBonus(bonus.id, 'note', val)}
                    placeholder="e.g., Amulet of Mighty Fists +1"
                    placeholderTextColor="#8B7355"
                  />
                </View>
                <Button variant="danger" size="sm" onPress={() => removeMiscBonus(bonus.id)}>
                  Remove
                </Button>
              </View>
            ))}

            <Button variant="secondary" onPress={addMiscBonus} fullWidth>
              Add Misc Bonus
            </Button>
          </BarkCard>

          {/* Save Button */}
          <Button onPress={handleSave} fullWidth style={styles.saveButton}>
            {isNew ? 'Create Character' : 'Save Changes'}
          </Button>
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
