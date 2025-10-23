/**
 * Wildshape Form Creation Wizard
 *
 * Multi-step form to create a new wildshape form for a character:
 * - Step 1: Basic Info (name, size, required level)
 * - Step 2: Ability Modifiers (STR/DEX/CON/INT/WIS/CHA)
 * - Step 3: Combat Stats (AC, movement speeds)
 * - Step 4: Natural Attacks (bite, claw, gore, etc.)
 * - Step 5: Senses & Traits (low-light, scent, special abilities)
 */

import { useState } from 'react';
import { ScrollView, View, Text, ImageBackground, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { H2, H3 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { useCreateWildShapeForm } from '@/hooks';
import type { CreatureSize, NaturalAttack } from '@/types/firestore';

const STEPS = ['Basic Info', 'Abilities', 'Combat', 'Attacks', 'Senses'];

const SIZES: CreatureSize[] = ['Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'];

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 15, 0.75)',
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
    color: '#C8E6D7', // Light green-tinted for visibility
    fontFamily: 'System',
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#1A0F08',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  threeColumnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  flexOne: {
    flex: 1,
  },
  thirdWidth: {
    flex: 1,
    minWidth: '30%',
  },
  sectionLabel: {
    color: '#4A3426',
    fontFamily: 'System',
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '600',
  },
  sizeSelector: {
    marginTop: 8,
  },
  sizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  errorText: {
    color: '#FFE5E5',
    fontFamily: 'System',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(139, 69, 69, 0.5)',
    padding: 12,
    borderRadius: 8,
  },
  successText: {
    color: '#C8E6D7',
    fontFamily: 'System',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(107, 159, 127, 0.3)',
    padding: 12,
    borderRadius: 8,
  },
});

export default function WildShapeFormCreateScreen() {
  const router = useRouter();
  const { characterId } = useLocalSearchParams<{ characterId: string }>();
  const { mutate: createForm, isPending } = useCreateWildShapeForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [size, setSize] = useState<CreatureSize>('Medium');
  const [requiredDruidLevel, setRequiredDruidLevel] = useState('4');
  const [requiredSpellLevel, setRequiredSpellLevel] = useState('Beast Shape I');

  // Step 2: Ability Modifiers (deltas from base form)
  const [strDelta, setStrDelta] = useState('+0');
  const [dexDelta, setDexDelta] = useState('+0');
  const [conDelta, setConDelta] = useState('+0');
  const [intDelta, setIntDelta] = useState('2');
  const [wisDelta, setWisDelta] = useState('10');
  const [chaDelta, setCha Delta] = useState('10');

  // Step 3: Combat Stats
  const [naturalArmor, setNaturalArmor] = useState('10');
  const [movementLand, setMovementLand] = useState('30');
  const [movementSwim, setMovementSwim] = useState('0');
  const [movementClimb, setMovementClimb] = useState('0');
  const [movementFly, setMovementFly] = useState('0');

  // Step 4: Natural Attacks (we'll build an interface for this)
  const [attacks, setAttacks] = useState<NaturalAttack[]>([]);

  // Step 5: Senses
  const [lowLight, setLowLight] = useState(false);
  const [darkvision, setDarkvision] = useState('0');
  const [scent, setScent] = useState(false);

  const canProceed = () => {
    if (currentStep === 0) {
      return name.trim().length > 0 && parseInt(requiredDruidLevel) > 0;
    }
    return true; // Other steps are more flexible
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
    if (!characterId) {
      setError('No character ID provided');
      return;
    }

    setError(null);
    setSuccess(null);

    const formData = {
      characterId,
      name: name.trim(),
      size,
      requiredDruidLevel: parseInt(requiredDruidLevel),
      requiredSpellLevel,
      statModifications: {
        abilityDeltas: {
          str: strDelta ? parseInt(strDelta) : undefined,
          dex: dexDelta ? parseInt(dexDelta) : undefined,
          con: conDelta ? parseInt(conDelta) : undefined,
          int: intDelta ? parseInt(intDelta) : undefined,
          wis: wisDelta ? parseInt(wisDelta) : undefined,
          cha: chaDelta ? parseInt(chaDelta) : undefined,
        },
        naturalArmor: parseInt(naturalArmor),
        size,
        movement: {
          land: parseInt(movementLand) || undefined,
          swim: parseInt(movementSwim) || undefined,
          climb: parseInt(movementClimb) || undefined,
          fly: parseInt(movementFly) || undefined,
        },
        naturalAttacks: attacks,
        senses: {
          lowLight,
          darkvision: parseInt(darkvision) || undefined,
          scent,
        },
      },
    };

    createForm(formData, {
      onSuccess: () => {
        setSuccess(`${name} form has been created!`);
        setTimeout(() => router.back(), 2000);
      },
      onError: (error: any) => {
        setError(error.message || 'Could not create wildshape form');
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../../../../assets/forest-background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={{ width: '100%', height: '100%' }}
      >
        <View style={styles.darkOverlay}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
              {/* Header */}
              <View style={styles.header}>
                <H2>Create Wildshape Form</H2>
                <Text style={styles.subtitle}>
                  Add a new animal form for your druid
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
                    label="Form Name"
                    value={name}
                    onChangeText={setName}
                    placeholder="Leopard, Bear, Eagle..."
                    autoCapitalize="words"
                  />

                  <View style={styles.twoColumnRow}>
                    <View style={styles.flexOne}>
                      <Input
                        label="Required Druid Level"
                        value={requiredDruidLevel}
                        onChangeText={setRequiredDruidLevel}
                        placeholder="4"
                        keyboardType="number-pad"
                      />
                    </View>

                    <View style={styles.flexOne}>
                      <Input
                        label="Spell Level"
                        value={requiredSpellLevel}
                        onChangeText={setRequiredSpellLevel}
                        placeholder="Beast Shape I"
                      />
                    </View>
                  </View>

                  <View style={styles.sizeSelector}>
                    <Text style={styles.sectionLabel}>Size</Text>
                    <View style={styles.sizeButtons}>
                      {SIZES.map((sizeOption) => (
                        <Button
                          key={sizeOption}
                          variant={size === sizeOption ? 'primary' : 'outline'}
                          size="sm"
                          onPress={() => setSize(sizeOption)}
                        >
                          {sizeOption}
                        </Button>
                      ))}
                    </View>
                  </View>
                </Card>
              )}

              {/* Step 2: Ability Modifiers */}
              {currentStep === 1 && (
                <Card>
                  <H3 style={styles.sectionTitle}>Ability Score Changes</H3>
                  <Text style={styles.subtitle}>
                    Enter bonuses/penalties applied when shapeshifting
                  </Text>

                  <View style={styles.threeColumnRow}>
                    <View style={styles.thirdWidth}>
                      <Input
                        label="STR"
                        value={strDelta}
                        onChangeText={setStrDelta}
                        placeholder="+0"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.thirdWidth}>
                      <Input
                        label="DEX"
                        value={dexDelta}
                        onChangeText={setDexDelta}
                        placeholder="+0"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.thirdWidth}>
                      <Input
                        label="CON"
                        value={conDelta}
                        onChangeText={setConDelta}
                        placeholder="+0"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.threeColumnRow}>
                    <View style={styles.thirdWidth}>
                      <Input
                        label="INT"
                        value={intDelta}
                        onChangeText={setIntDelta}
                        placeholder="2"
                        keyboardType="number-pad"
                        helper="Animal INT"
                      />
                    </View>
                    <View style={styles.thirdWidth}>
                      <Input
                        label="WIS"
                        value={wisDelta}
                        onChangeText={setWisDelta}
                        placeholder="10"
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.thirdWidth}>
                      <Input
                        label="CHA"
                        value={chaDelta}
                        onChangeText={setChaDelta}
                        placeholder="10"
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

                  <Input
                    label="Natural Armor AC"
                    value={naturalArmor}
                    onChangeText={setNaturalArmor}
                    placeholder="10"
                    keyboardType="number-pad"
                    helper="Total AC in this form"
                  />

                  <Text style={styles.sectionLabel}>Movement Speeds (ft)</Text>
                  <View style={styles.twoColumnRow}>
                    <View style={styles.flexOne}>
                      <Input
                        label="Land"
                        value={movementLand}
                        onChangeText={setMovementLand}
                        placeholder="30"
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.flexOne}>
                      <Input
                        label="Swim"
                        value={movementSwim}
                        onChangeText={setMovementSwim}
                        placeholder="0"
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.twoColumnRow}>
                    <View style={styles.flexOne}>
                      <Input
                        label="Climb"
                        value={movementClimb}
                        onChangeText={setMovementClimb}
                        placeholder="0"
                        keyboardType="number-pad"
                      />
                    </View>
                    <View style={styles.flexOne}>
                      <Input
                        label="Fly"
                        value={movementFly}
                        onChangeText={setMovementFly}
                        placeholder="0"
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                </Card>
              )}

              {/* Step 4: Natural Attacks - Simplified for now */}
              {currentStep === 3 && (
                <Card>
                  <H3 style={styles.sectionTitle}>Natural Attacks</H3>
                  <Text style={styles.subtitle}>
                    Coming soon! For now, you can add attacks after creation.
                  </Text>
                </Card>
              )}

              {/* Step 5: Senses */}
              {currentStep === 4 && (
                <Card>
                  <H3 style={styles.sectionTitle}>Senses & Traits</H3>

                  <Input
                    label="Darkvision (ft)"
                    value={darkvision}
                    onChangeText={setDarkvision}
                    placeholder="0"
                    keyboardType="number-pad"
                    helper="0 for none, 60 for standard darkvision"
                  />

                  <Text style={styles.sectionLabel}>Special Senses</Text>
                  <Text style={styles.subtitle}>
                    Low-light vision and scent tracking available
                  </Text>
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
                    {currentStep === STEPS.length - 1 ? 'Create Form' : 'Next'}
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
