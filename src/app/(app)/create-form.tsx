/**
 * Create Custom Form Screen
 *
 * Multi-step wizard for creating custom wildshape forms.
 * Saves to character's personal forms collection.
 */

import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useCharacter } from '@/contexts';
import { useCreateWildShapeForm } from '@/hooks/useWildShapeForms';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { Card } from '@/components/ui/Card';
import { H2 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { SPECIAL_ABILITIES } from '@/pf1e/specialAbilities';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingTop: 52,
    paddingBottom: 100,
  },
  cardMargin: {
    marginBottom: 12,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(42, 74, 58, 0.9)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7FD1A8',
    shadowColor: '#7FD1A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 10,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(42, 74, 58, 1)',
    transform: [{ scale: 0.95 }],
  },
  backText: {
    color: '#F9F5EB',
    fontSize: 12,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8DCC8',
  },
  stepDotActive: {
    backgroundColor: '#7FD1A8',
  },
  stepDotCompleted: {
    backgroundColor: '#2A4A3A',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B5344',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B7355',
    fontSize: 14,
    color: '#4A3426',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E8DCC8',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B7355',
  },
  sizeButtonActive: {
    backgroundColor: '#7FD1A8',
    borderColor: '#2A4A3A',
  },
  sizeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A3426',
  },
  attackCard: {
    padding: 12,
    backgroundColor: 'rgba(139, 115, 85, 0.1)',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#8B7355',
  },
  attackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  attackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A3426',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#B97A3D',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7FD1A8',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  bottomPadding: {
    height: 20,
  },
});

type Size = 'Fine' | 'Diminutive' | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' | 'Colossal';
type Tier = 'Beast Shape I' | 'Beast Shape II' | 'Beast Shape III' | 'Beast Shape IV' |
            'Elemental Body I' | 'Elemental Body II' | 'Elemental Body III' | 'Elemental Body IV' |
            'Plant Shape I' | 'Plant Shape II' | 'Plant Shape III';

interface Attack {
  name: string;
  damage: string;
  traits: string[];
}

interface FormData {
  // Step 1: Basic Info
  name: string;
  size: Size;
  tier: Tier;

  // Step 2: Stats
  movement: {
    land: number;
    climb: number;
    swim: number;
    fly: number;
    burrow: number;
  };

  // Step 3: Attacks
  naturalAttacks: Attack[];

  // Step 4: Abilities
  specialAbilities: Array<{
    name: string;
    description?: string;
  }>;
}

export default function CreateFormScreen() {
  const router = useRouter();

  // Get character from context
  const { characterId } = useCharacter();

  // Mutation for creating form
  const createForm = useCreateWildShapeForm();

  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSaving, setIsSaving] = React.useState(false);

  // Character ID is automatically available from context

  // Form State
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    size: 'Medium',
    tier: 'Beast Shape I',
    movement: {
      land: 30,
      climb: 0,
      swim: 0,
      fly: 0,
      burrow: 0,
    },
    naturalAttacks: [],
    specialAbilities: [],
  });

  // Current attack being edited
  const [editingAttack, setEditingAttack] = React.useState<Attack | null>(null);
  const [attackName, setAttackName] = React.useState('');
  const [attackDamage, setAttackDamage] = React.useState('');
  const [attackTraits, setAttackTraits] = React.useState<Set<string>>(new Set());

  // Ability being added
  const [abilityName, setAbilityName] = React.useState('');
  const [abilityDescription, setAbilityDescription] = React.useState('');

  const steps = [
    'Basic Info',
    'Movement',
    'Attacks',
    'Abilities',
    'Review',
  ];

  const sizes: Size[] = ['Fine', 'Diminutive', 'Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan', 'Colossal'];
  const tiers: Tier[] = [
    'Beast Shape I',
    'Beast Shape II',
    'Beast Shape III',
    'Beast Shape IV',
    'Elemental Body I',
    'Elemental Body II',
    'Elemental Body III',
    'Elemental Body IV',
    'Plant Shape I',
    'Plant Shape II',
    'Plant Shape III',
  ];

  const commonTraits = ['Grab', 'Trip', 'Pounce', 'Rake', 'Constrict', 'Poison', 'Burn'];

  // Group abilities by category
  const abilitiesByCategory = React.useMemo(() => {
    const categories = new Map<string, typeof SPECIAL_ABILITIES[string][]>();
    Object.values(SPECIAL_ABILITIES).forEach(ability => {
      const existing = categories.get(ability.category) || [];
      categories.set(ability.category, [...existing, ability]);
    });
    return categories;
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddAttack = () => {
    if (!attackName || !attackDamage) return;

    const newAttack: Attack = {
      name: attackName,
      damage: attackDamage,
      traits: Array.from(attackTraits),
    };

    setFormData(prev => ({
      ...prev,
      naturalAttacks: [...prev.naturalAttacks, newAttack],
    }));

    // Reset
    setAttackName('');
    setAttackDamage('');
    setAttackTraits(new Set());
    setEditingAttack(null);
  };

  const handleRemoveAttack = (index: number) => {
    setFormData(prev => ({
      ...prev,
      naturalAttacks: prev.naturalAttacks.filter((_, i) => i !== index),
    }));
  };

  const toggleAttackTrait = (trait: string) => {
    setAttackTraits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trait)) {
        newSet.delete(trait);
      } else {
        newSet.add(trait);
      }
      return newSet;
    });
  };

  const handleAddAbility = (abilityName: string) => {
    const existing = SPECIAL_ABILITIES[abilityName];
    setFormData(prev => ({
      ...prev,
      specialAbilities: [
        ...prev.specialAbilities,
        {
          name: abilityName,
          description: existing?.description,
        },
      ],
    }));
  };

  const handleAddCustomAbility = () => {
    if (!abilityName) return;

    setFormData(prev => ({
      ...prev,
      specialAbilities: [
        ...prev.specialAbilities,
        {
          name: abilityName,
          description: abilityDescription || undefined,
        },
      ],
    }));

    setAbilityName('');
    setAbilityDescription('');
  };

  const handleRemoveAbility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialAbilities: prev.specialAbilities.filter((_, i) => i !== index),
    }));
  };

  const getTierRequiredDruidLevel = (tier: Tier): number => {
    if (tier === 'Beast Shape I') return 4;
    if (tier === 'Beast Shape II' || tier === 'Elemental Body I') return 6;
    if (tier === 'Beast Shape III' || tier === 'Elemental Body II' || tier === 'Plant Shape I') return 8;
    if (tier === 'Beast Shape IV' || tier === 'Elemental Body III' || tier === 'Plant Shape II') return 10;
    if (tier === 'Elemental Body IV' || tier === 'Plant Shape III') return 12;
    return 4; // Default
  };

  const handleSave = async () => {
    if (!characterId) {
      alert('No character selected');
      return;
    }

    setIsSaving(true);

    try {
      // Determine edition and tags based on tier
      const edition = 'pf1e';
      const tags: string[] = [];
      if (formData.tier.includes('Elemental')) tags.push('elemental');
      else if (formData.tier.includes('Plant')) tags.push('plant');
      else tags.push('animal');

      // Create form using React Query mutation
      await createForm.mutateAsync({
        characterId: characterId,
        name: formData.name,
        edition: edition,
        imageUrl: null,
        templateId: null, // Custom forms don't have a template
        isCustom: true,
        size: formData.size,
        tags: tags,
        statModifications: {
          movement: formData.movement,
          naturalAttacks: formData.naturalAttacks,
          specialAbilities: formData.specialAbilities.map(a => a.name),
          senses: {
            lowLight: formData.specialAbilities.some(a => a.name.toLowerCase().includes('low-light')),
            scent: formData.specialAbilities.some(a => a.name.toLowerCase().includes('scent')),
            darkvision: formData.specialAbilities.some(a => a.name.toLowerCase().includes('darkvision')) ? 60 : undefined,
            tremorsense: formData.specialAbilities.some(a => a.name.toLowerCase().includes('tremorsense')) ? 60 : undefined,
          },
        },
        requiredDruidLevel: getTierRequiredDruidLevel(formData.tier),
        requiredSpellLevel: formData.tier,
        isFavorite: false,
        notes: null,
      });

      alert('Custom form created successfully!');
      router.back();
    } catch (error: unknown) {
      console.error('Error saving form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save form: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return formData.name.trim() !== '';
      case 1: // Movement
        return formData.movement.land > 0;
      case 2: // Attacks
        return formData.naturalAttacks.length > 0;
      case 3: // Abilities
        return true; // Optional
      case 4: // Review
        return true;
      default:
        return false;
    }
  };

  return (
    <View style={styles.container}>
      <LivingForestBg>
        {/* Back Button */}
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Cancel</Text>
        </Pressable>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <Card style={styles.cardMargin}>
            <H2>Create Custom Form</H2>
            <Text style={{ fontSize: 12, color: '#6B5344', marginTop: 4 }}>
              {steps[currentStep]} ({currentStep + 1} of {steps.length})
            </Text>

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepDot,
                    index === currentStep && styles.stepDotActive,
                    index < currentStep && styles.stepDotCompleted,
                  ]}
                />
              ))}
            </View>
          </Card>

          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <Card style={styles.cardMargin}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#4A3426', marginBottom: 12 }}>
                Basic Information
              </Text>

              <Text style={styles.label}>Form Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="e.g., Dire Wolf, Giant Eagle"
              />

              <Text style={styles.label}>Size *</Text>
              <View style={styles.sizeGrid}>
                {sizes.map(size => (
                  <Pressable
                    key={size}
                    style={[
                      styles.sizeButton,
                      formData.size === size && styles.sizeButtonActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, size }))}
                  >
                    <Text style={styles.sizeButtonText}>{size}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Spell Tier *</Text>
              <View style={styles.sizeGrid}>
                {tiers.map(tier => (
                  <Pressable
                    key={tier}
                    style={[
                      styles.sizeButton,
                      formData.tier === tier && styles.sizeButtonActive,
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, tier }))}
                  >
                    <Text style={styles.sizeButtonText}>{tier}</Text>
                  </Pressable>
                ))}
              </View>
            </Card>
          )}

          {/* Step 2: Movement */}
          {currentStep === 1 && (
            <Card style={styles.cardMargin}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#4A3426', marginBottom: 12 }}>
                Movement Speeds
              </Text>

              <Text style={styles.label}>Land Speed (ft) *</Text>
              <TextInput
                style={styles.input}
                value={String(formData.movement.land)}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  movement: { ...prev.movement, land: parseInt(text) || 0 }
                }))}
                keyboardType="numeric"
                placeholder="30"
              />

              <Text style={styles.label}>Climb Speed (ft)</Text>
              <TextInput
                style={styles.input}
                value={String(formData.movement.climb || '')}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  movement: { ...prev.movement, climb: parseInt(text) || 0 }
                }))}
                keyboardType="numeric"
                placeholder="0"
              />

              <Text style={styles.label}>Swim Speed (ft)</Text>
              <TextInput
                style={styles.input}
                value={String(formData.movement.swim || '')}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  movement: { ...prev.movement, swim: parseInt(text) || 0 }
                }))}
                keyboardType="numeric"
                placeholder="0"
              />

              <Text style={styles.label}>Fly Speed (ft)</Text>
              <TextInput
                style={styles.input}
                value={String(formData.movement.fly || '')}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  movement: { ...prev.movement, fly: parseInt(text) || 0 }
                }))}
                keyboardType="numeric"
                placeholder="0"
              />

              <Text style={styles.label}>Burrow Speed (ft)</Text>
              <TextInput
                style={styles.input}
                value={String(formData.movement.burrow || '')}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  movement: { ...prev.movement, burrow: parseInt(text) || 0 }
                }))}
                keyboardType="numeric"
                placeholder="0"
              />
            </Card>
          )}

          {/* Step 3: Attacks */}
          {currentStep === 2 && (
            <Card style={styles.cardMargin}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#4A3426', marginBottom: 12 }}>
                Natural Attacks
              </Text>

              {/* Existing Attacks */}
              {formData.naturalAttacks.map((attack, index) => (
                <View key={index} style={styles.attackCard}>
                  <View style={styles.attackHeader}>
                    <Text style={styles.attackTitle}>
                      {attack.name} ({attack.damage})
                    </Text>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => handleRemoveAttack(index)}
                    >
                      <Text style={styles.deleteButtonText}>✕</Text>
                    </Pressable>
                  </View>
                  {attack.traits.length > 0 && (
                    <View style={styles.chipRow}>
                      {attack.traits.map((trait, idx) => (
                        <Chip key={idx} label={trait} variant="mist" />
                      ))}
                    </View>
                  )}
                </View>
              ))}

              {/* Add Attack Form */}
              <View style={{ marginTop: 16, padding: 12, backgroundColor: 'rgba(185, 122, 61, 0.1)', borderRadius: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#4A3426', marginBottom: 8 }}>
                  Add Natural Attack
                </Text>

                <Text style={styles.label}>Attack Name</Text>
                <TextInput
                  style={styles.input}
                  value={attackName}
                  onChangeText={setAttackName}
                  placeholder="e.g., Bite, Claw, Gore"
                />

                <Text style={styles.label}>Damage</Text>
                <TextInput
                  style={styles.input}
                  value={attackDamage}
                  onChangeText={setAttackDamage}
                  placeholder="e.g., 1d6, 1d8+2"
                />

                <Text style={styles.label}>Special Traits (Optional)</Text>
                <View style={styles.chipRow}>
                  {commonTraits.map(trait => (
                    <Pressable
                      key={trait}
                      onPress={() => toggleAttackTrait(trait)}
                    >
                      <Chip
                        label={trait}
                        variant={attackTraits.has(trait) ? 'forest' : 'mist'}
                      />
                    </Pressable>
                  ))}
                </View>

                <Button
                  onPress={handleAddAttack}
                  fullWidth
                  style={{ marginTop: 12 }}
                  disabled={!attackName || !attackDamage}
                >
                  Add Attack
                </Button>
              </View>

              {formData.naturalAttacks.length === 0 && (
                <Text style={{ fontSize: 12, color: '#8B4513', marginTop: 8, fontStyle: 'italic' }}>
                  * At least one natural attack is required
                </Text>
              )}
            </Card>
          )}

          {/* Step 4: Abilities */}
          {currentStep === 3 && (
            <Card style={styles.cardMargin}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#4A3426', marginBottom: 12 }}>
                Special Abilities
              </Text>

              {/* Selected Abilities */}
              {formData.specialAbilities.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#2A4A3A', marginBottom: 8 }}>
                    SELECTED ABILITIES
                  </Text>
                  {formData.specialAbilities.map((ability, index) => (
                    <View key={index} style={[styles.attackCard, { marginTop: index > 0 ? 8 : 0 }]}>
                      <View style={styles.attackHeader}>
                        <Text style={styles.attackTitle}>{ability.name}</Text>
                        <Pressable
                          style={styles.deleteButton}
                          onPress={() => handleRemoveAbility(index)}
                        >
                          <Text style={styles.deleteButtonText}>✕</Text>
                        </Pressable>
                      </View>
                      {ability.description && (
                        <Text style={{ fontSize: 11, color: '#6B5344', marginTop: 4 }}>
                          {ability.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Standard Abilities by Category */}
              <ScrollView style={{ maxHeight: 300 }}>
                {Array.from(abilitiesByCategory.entries()).map(([category, abilities]) => (
                  <View key={category} style={styles.categorySection}>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <View style={styles.chipRow}>
                      {abilities.map(ability => {
                        const isSelected = formData.specialAbilities.some(a => a.name === ability.name);
                        return (
                          <Pressable
                            key={ability.name}
                            onPress={() => !isSelected && handleAddAbility(ability.name)}
                            disabled={isSelected}
                          >
                            <Chip
                              label={ability.name}
                              variant={isSelected ? 'disabled' : 'mist'}
                            />
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Custom Ability */}
              <View style={{ marginTop: 16, padding: 12, backgroundColor: 'rgba(185, 122, 61, 0.1)', borderRadius: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#4A3426', marginBottom: 8 }}>
                  Add Custom Ability
                </Text>

                <Text style={styles.label}>Ability Name</Text>
                <TextInput
                  style={styles.input}
                  value={abilityName}
                  onChangeText={setAbilityName}
                  placeholder="e.g., Custom Ability"
                />

                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={abilityDescription}
                  onChangeText={setAbilityDescription}
                  placeholder="Describe what this ability does..."
                  multiline
                />

                <Button
                  onPress={handleAddCustomAbility}
                  fullWidth
                  style={{ marginTop: 12 }}
                  disabled={!abilityName}
                >
                  Add Custom Ability
                </Button>
              </View>
            </Card>
          )}

          {/* Step 5: Review */}
          {currentStep === 4 && (
            <Card style={styles.cardMargin}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#4A3426', marginBottom: 12 }}>
                Review & Save
              </Text>

              <View style={{ marginBottom: 12 }}>
                <Text style={styles.label}>FORM NAME</Text>
                <Text style={{ fontSize: 16, color: '#4A3426' }}>{formData.name}</Text>
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={styles.label}>SIZE & TIER</Text>
                <Text style={{ fontSize: 14, color: '#4A3426' }}>
                  {formData.size} • {formData.tier}
                </Text>
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={styles.label}>MOVEMENT</Text>
                <Text style={{ fontSize: 14, color: '#4A3426' }}>
                  Land {formData.movement.land} ft
                  {formData.movement.climb > 0 && `, Climb ${formData.movement.climb} ft`}
                  {formData.movement.swim > 0 && `, Swim ${formData.movement.swim} ft`}
                  {formData.movement.fly > 0 && `, Fly ${formData.movement.fly} ft`}
                  {formData.movement.burrow > 0 && `, Burrow ${formData.movement.burrow} ft`}
                </Text>
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={styles.label}>NATURAL ATTACKS</Text>
                {formData.naturalAttacks.map((attack, index) => (
                  <Text key={index} style={{ fontSize: 14, color: '#4A3426', marginTop: 4 }}>
                    • {attack.name} ({attack.damage})
                    {attack.traits.length > 0 && ` — ${attack.traits.join(', ')}`}
                  </Text>
                ))}
              </View>

              {formData.specialAbilities.length > 0 && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.label}>SPECIAL ABILITIES</Text>
                  <View style={styles.chipRow}>
                    {formData.specialAbilities.map((ability, index) => (
                      <Chip key={index} label={ability.name} variant="mist" />
                    ))}
                  </View>
                </View>
              )}

              <Button
                onPress={handleSave}
                fullWidth
                style={{ marginTop: 16 }}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Custom Form'}
              </Button>
            </Card>
          )}

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {currentStep > 0 && (
              <Button variant="outline" onPress={handleBack} style={{ flex: 1 }}>
                Back
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button
                onPress={handleNext}
                style={{ flex: 1 }}
                disabled={!isStepValid()}
              >
                Next
              </Button>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </LivingForestBg>
    </View>
  );
}
