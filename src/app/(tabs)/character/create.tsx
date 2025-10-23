/**
 * Character Creation Wizard
 *
 * Multi-step form to create a new Pathfinder character with:
 * - Step 1: Basic Info (name, level, edition)
 * - Step 2: Ability Scores
 * - Step 3: Combat Stats
 */

import { useState } from 'react';
import { ScrollView, View, Text, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { H2, H3 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { useCreateCharacter } from '@/hooks';
import type { GameEdition, AbilityScores, ACBreakdown } from '@/types/firestore';

const STEPS = ['Basic Info', 'Abilities', 'Combat Stats'];

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 15, 0.75)',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  container: {
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    color: '#C8E6D7', // Light green-tinted parchment for visibility on dark bg
    fontFamily: 'System',
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#3D2817', // Deep brown for readability on parchment
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  flexOne: {
    flex: 1,
  },
  editionSelector: {
    marginTop: 8,
  },
  editionLabel: {
    color: '#4A3426', // Brown for better contrast
    fontFamily: 'System',
    fontSize: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  editionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  abilityScoresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  halfWidth: {
    flex: 1,
    minWidth: '45%',
  },
  sectionLabel: {
    color: '#4A3426', // Brown for better contrast
    fontFamily: 'System',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '600',
  },
  threeColumnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  thirdWidth: {
    flex: 1,
    minWidth: '30%',
  },
  twoColumnRowNoWrap: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  errorText: {
    color: '#FFE5E5', // Light red for visibility on dark bg
    fontFamily: 'System',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(139, 69, 69, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  successText: {
    color: '#C8E6D7', // Light green for visibility on dark bg
    fontFamily: 'System',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(107, 159, 127, 0.3)',
    padding: 12,
    borderRadius: 8,
  },
});

export default function CharacterCreateScreen() {
  const router = useRouter();
  const { mutate: createCharacter, isPending } = useCreateCharacter();

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [level, setLevel] = useState('1');
  const [druidLevel, setDruidLevel] = useState('1');
  const [edition, setEdition] = useState<GameEdition>('pf1e');

  // Step 2: Ability Scores
  const [str, setStr] = useState('10');
  const [dex, setDex] = useState('10');
  const [con, setCon] = useState('10');
  const [int, setInt] = useState('10');
  const [wis, setWis] = useState('10');
  const [cha, setCha] = useState('10');

  // Step 3: Combat Stats
  const [acBase, setAcBase] = useState('10');
  const [acArmor, setAcArmor] = useState('0');
  const [acShield, setAcShield] = useState('0');
  const [acNatural, setAcNatural] = useState('0');
  const [hpMax, setHpMax] = useState('8');
  const [bab, setBab] = useState('0');
  const [fortSave, setFortSave] = useState('2');
  const [refSave, setRefSave] = useState('0');
  const [willSave, setWillSave] = useState('2');

  const canProceed = () => {
    if (currentStep === 0) {
      return name.trim().length > 0 && parseInt(level) > 0;
    }
    if (currentStep === 1) {
      const allScores = [str, dex, con, int, wis, cha];
      return allScores.every((s) => !isNaN(parseInt(s)) && parseInt(s) >= 1);
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setError(null);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setError(null);
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
    setError(null);
    setSuccess(null);

    const abilityScores: AbilityScores = {
      str: parseInt(str),
      dex: parseInt(dex),
      con: parseInt(con),
      int: parseInt(int),
      wis: parseInt(wis),
      cha: parseInt(cha),
    };

    const dexMod = Math.floor((abilityScores.dex - 10) / 2);

    const ac: ACBreakdown = {
      base: parseInt(acBase),
      armor: parseInt(acArmor),
      shield: parseInt(acShield),
      dex: dexMod,
      size: 0,
      natural: parseInt(acNatural),
      deflection: 0,
      dodge: 0,
      misc: 0,
    };

    const characterData = {
      name: name.trim(),
      edition,
      baseStats: {
        level: parseInt(level),
        effectiveDruidLevel: parseInt(druidLevel),
        abilityScores,
        ac,
        hp: {
          max: parseInt(hpMax),
          current: parseInt(hpMax),
        },
        bab: parseInt(bab),
        cmb: 0, // Will be calculated
        cmd: 0, // Will be calculated
        saves: {
          fortitude: parseInt(fortSave),
          reflex: parseInt(refSave),
          will: parseInt(willSave),
        },
        skills: {},
        movement: {
          land: 30,
        },
        senses: {},
        size: 'Medium' as const,
        traits: [],
      },
      features: {
        feats: [],
        classFeatures: [],
        raceTraits: [],
        wildShapeVariants: [],
      },
      dailyUsesMax: null, // Infinite uses initially
      dailyUsesCurrent: 0,
      preferences: {
        defaultFormView: 'stats',
        autoCalculateDailies: true,
      },
    };

    createCharacter(characterData, {
      onSuccess: () => {
        setSuccess(`${name} has been created!`);
        setTimeout(() => router.back(), 2000);
      },
      onError: (error: any) => {
        setError(error.message || 'Could not create character');
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../../../assets/forest-background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={{ width: '100%', height: '100%' }}
      >
        <View style={styles.darkOverlay}>
          <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <H2>Create Character</H2>
            <Text style={styles.subtitle}>
              Build your druid for wild shape tracking
            </Text>
          </View>

          {/* Progress Indicator */}
          <ProgressSteps steps={STEPS} currentStep={currentStep} />

          {/* Error Message */}
          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Success Message */}
          {success && <Text style={styles.successText}>{success}</Text>}

          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <Card>
              <H3 style={styles.sectionTitle}>Basic Information</H3>

              <Input
                label="Character Name"
                value={name}
                onChangeText={setName}
                placeholder="Moonfire the Wise"
                autoCapitalize="words"
              />

              <View style={styles.twoColumnRow}>
                <View style={styles.flexOne}>
                  <Input
                    label="Level"
                    value={level}
                    onChangeText={setLevel}
                    placeholder="1"
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.flexOne}>
                  <Input
                    label="Druid Level"
                    value={druidLevel}
                    onChangeText={setDruidLevel}
                    placeholder="1"
                    keyboardType="number-pad"
                    helper="Effective level"
                  />
                </View>
              </View>

              <View style={styles.editionSelector}>
                <Text style={styles.editionLabel}>
                  Game Edition
                </Text>
                <View style={styles.editionButtons}>
                  {(['pf1e', 'dnd5e', 'pf2e'] as GameEdition[]).map((ed) => (
                    <Button
                      key={ed}
                      variant={edition === ed ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => setEdition(ed)}
                    >
                      {ed === 'pf1e' ? 'PF1e' : ed === 'dnd5e' ? 'D&D 5e' : 'PF2e'}
                    </Button>
                  ))}
                </View>
              </View>
            </Card>
          )}

          {/* Step 2: Ability Scores */}
          {currentStep === 1 && (
            <Card>
              <H3 style={styles.sectionTitle}>Ability Scores</H3>

              <View style={styles.abilityScoresRow}>
                <View style={styles.halfWidth}>
                  <Input
                    label="Strength"
                    value={str}
                    onChangeText={setStr}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="Dexterity"
                    value={dex}
                    onChangeText={setDex}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.abilityScoresRow}>
                <View style={styles.halfWidth}>
                  <Input
                    label="Constitution"
                    value={con}
                    onChangeText={setCon}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="Intelligence"
                    value={int}
                    onChangeText={setInt}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.abilityScoresRow}>
                <View style={styles.halfWidth}>
                  <Input
                    label="Wisdom"
                    value={wis}
                    onChangeText={setWis}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Input
                    label="Charisma"
                    value={cha}
                    onChangeText={setCha}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </Card>
          )}

          {/* Step 3: Combat Stats */}
          {currentStep === 2 && (
            <Card>
              <H3 style={styles.sectionTitle}>Combat Statistics</H3>

              <Text style={styles.sectionLabel}>
                ARMOR CLASS
              </Text>
              <View style={styles.threeColumnRow}>
                <View style={styles.thirdWidth}>
                  <Input
                    label="Base"
                    value={acBase}
                    onChangeText={setAcBase}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.thirdWidth}>
                  <Input
                    label="Armor"
                    value={acArmor}
                    onChangeText={setAcArmor}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.thirdWidth}>
                  <Input
                    label="Shield"
                    value={acShield}
                    onChangeText={setAcShield}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Text style={styles.sectionLabel}>
                HIT POINTS & BAB
              </Text>
              <View style={styles.twoColumnRowNoWrap}>
                <View style={styles.flexOne}>
                  <Input
                    label="Max HP"
                    value={hpMax}
                    onChangeText={setHpMax}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.flexOne}>
                  <Input
                    label="Base Attack"
                    value={bab}
                    onChangeText={setBab}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Text style={styles.sectionLabel}>
                SAVING THROWS
              </Text>
              <View style={styles.threeColumnRow}>
                <View style={styles.thirdWidth}>
                  <Input
                    label="Fortitude"
                    value={fortSave}
                    onChangeText={setFortSave}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.thirdWidth}>
                  <Input
                    label="Reflex"
                    value={refSave}
                    onChangeText={setRefSave}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.thirdWidth}>
                  <Input
                    label="Will"
                    value={willSave}
                    onChangeText={setWillSave}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </Card>
          )}

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            <View style={styles.flexOne}>
              <Button variant="outline" onPress={handleBack} fullWidth>
                {currentStep === 0 ? 'Cancel' : 'Back'}
              </Button>
            </View>

            <View style={styles.flexOne}>
              <Button
                onPress={handleNext}
                loading={isPending}
                disabled={!canProceed()}
                fullWidth
              >
                {currentStep === STEPS.length - 1 ? 'Create' : 'Next'}
              </Button>
            </View>
          </View>
          </View>
        </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}
