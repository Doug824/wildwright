/**
 * Character Creation Wizard
 *
 * Multi-step form to create a new Pathfinder character with:
 * - Step 1: Basic Info (name, level, edition)
 * - Step 2: Ability Scores
 * - Step 3: Combat Stats
 */

import { useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { H2, H3 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressSteps } from '@/components/ui/ProgressSteps';
import { useCreateCharacter } from '@/hooks';
import type { GameEdition, AbilityScores, ACBreakdown } from '@/types/firestore';

const STEPS = ['Basic Info', 'Abilities', 'Combat Stats'];

export default function CharacterCreateScreen() {
  const router = useRouter();
  const { mutate: createCharacter, isPending } = useCreateCharacter();

  const [currentStep, setCurrentStep] = useState(0);

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
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
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
        Alert.alert('Success!', `${name} has been created!`, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message || 'Could not create character');
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-forest-700 px-4">
      <View className="py-12">
        {/* Header */}
        <View className="items-center mb-6">
          <H2 className="mb-2">Create Character</H2>
          <Text className="text-parchment-300 font-ui text-center">
            Build your druid for wild shape tracking
          </Text>
        </View>

        {/* Progress Indicator */}
        <ProgressSteps steps={STEPS} currentStep={currentStep} />

        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <Card>
            <H3 className="mb-4 text-bronze-500">Basic Information</H3>

            <Input
              label="Character Name"
              value={name}
              onChangeText={setName}
              placeholder="Moonfire the Wise"
              autoCapitalize="words"
            />

            <View className="flex-row gap-4">
              <Input
                label="Level"
                value={level}
                onChangeText={setLevel}
                placeholder="1"
                keyboardType="number-pad"
                containerClassName="flex-1"
              />

              <Input
                label="Druid Level"
                value={druidLevel}
                onChangeText={setDruidLevel}
                placeholder="1"
                keyboardType="number-pad"
                containerClassName="flex-1"
                helper="Effective level"
              />
            </View>

            <View className="mt-2">
              <Text className="text-parchment-200 font-ui text-sm mb-2 uppercase tracking-wide">
                Game Edition
              </Text>
              <View className="flex-row gap-2">
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
            <H3 className="mb-4 text-bronze-500">Ability Scores</H3>

            <View className="flex-row flex-wrap gap-2">
              <Input
                label="Strength"
                value={str}
                onChangeText={setStr}
                keyboardType="number-pad"
                containerClassName="flex-1 min-w-[45%]"
              />
              <Input
                label="Dexterity"
                value={dex}
                onChangeText={setDex}
                keyboardType="number-pad"
                containerClassName="flex-1 min-w-[45%]"
              />
            </View>

            <View className="flex-row flex-wrap gap-2">
              <Input
                label="Constitution"
                value={con}
                onChangeText={setCon}
                keyboardType="number-pad"
                containerClassName="flex-1 min-w-[45%]"
              />
              <Input
                label="Intelligence"
                value={int}
                onChangeText={setInt}
                keyboardType="number-pad"
                containerClassName="flex-1 min-w-[45%]"
              />
            </View>

            <View className="flex-row flex-wrap gap-2">
              <Input
                label="Wisdom"
                value={wis}
                onChangeText={setWis}
                keyboardType="number-pad"
                containerClassName="flex-1 min-w-[45%]"
              />
              <Input
                label="Charisma"
                value={cha}
                onChangeText={setCha}
                keyboardType="number-pad"
                containerClassName="flex-1 min-w-[45%]"
              />
            </View>
          </Card>
        )}

        {/* Step 3: Combat Stats */}
        {currentStep === 2 && (
          <Card>
            <H3 className="mb-4 text-bronze-500">Combat Statistics</H3>

            <Text className="text-parchment-200 font-ui text-sm mb-3">
              ARMOR CLASS
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              <Input
                label="Base"
                value={acBase}
                onChangeText={setAcBase}
                keyboardType="number-pad"
                containerClassName="flex-1 min-w-[30%]"
              />
              <Input
                label="Armor"
                value={acArmor}
                onChangeText={setAcArmor}
                keyboardType="number-pad"
                containerClassName="flex-1 min-w-[30%]"
              />
              <Input
                label="Shield"
                value={acShield}
                onChangeText={setAcShield}
                keyboardType="number-pad"
                containerClassName="flex-1 min-w-[30%]"
              />
            </View>

            <Text className="text-parchment-200 font-ui text-sm mb-3">
              HIT POINTS & BAB
            </Text>
            <View className="flex-row gap-2 mb-4">
              <Input
                label="Max HP"
                value={hpMax}
                onChangeText={setHpMax}
                keyboardType="number-pad"
                containerClassName="flex-1"
              />
              <Input
                label="Base Attack"
                value={bab}
                onChangeText={setBab}
                keyboardType="number-pad"
                containerClassName="flex-1"
              />
            </View>

            <Text className="text-parchment-200 font-ui text-sm mb-3">
              SAVING THROWS
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <Input
                label="Fortitude"
                value={fortSave}
                onChangeText={setFortSave}
                keyboardType="number-pad"
                containerClassName="flex-1 min-w-[30%]"
              />
              <Input
                label="Reflex"
                value={refSave}
                onChangeText={setRefSave}
                keyboardType="number-pad"
                containerClassName="flex-1 min-w-[30%]"
              />
              <Input
                label="Will"
                value={willSave}
                onChangeText={setWillSave}
                keyboardType="number-pad"
                containerClassName="flex-1 min-w-[30%]"
              />
            </View>
          </Card>
        )}

        {/* Navigation Buttons */}
        <View className="flex-row gap-3 mt-6">
          <Button variant="outline" onPress={handleBack} className="flex-1">
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          <Button
            onPress={handleNext}
            loading={isPending}
            disabled={!canProceed()}
            className="flex-1"
          >
            {currentStep === STEPS.length - 1 ? 'Create' : 'Next'}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
