/**
 * Character Detail Screen
 *
 * Displays full character stats and allows switching between base form
 * and wildshape forms with real-time stat updates.
 */

import { useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { H2, H3 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Stat } from '@/components/ui/Stat';
import { AttackRow } from '@/components/ui/AttackRow';
import { useCharacter, useCharacterForms } from '@/hooks';
import { AbilityScores, NaturalAttack, WildShapeFormWithId } from '@/types/firestore';

export default function CharacterDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: character, isLoading, error } = useCharacter(id);
  const { data: forms } = useCharacterForms(id);

  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  // Calculate ability modifier
  const getModifier = (score: number) => Math.floor((score - 10) / 2);

  // Get current form (base or wildshape)
  const selectedForm = selectedFormId
    ? forms?.find((f) => f.id === selectedFormId)
    : null;

  // Calculate current stats based on form
  const getCurrentStats = () => {
    if (!character) return null;

    const base = character.baseStats;

    if (!selectedForm) {
      // Base form
      return {
        abilityScores: base.abilityScores,
        hp: base.hp,
        ac: base.ac,
        movement: base.movement,
        size: base.size,
        attacks: [] as NaturalAttack[],
        senses: base.senses,
      };
    }

    // Wildshape form - apply modifications
    const mods = selectedForm.statModifications;
    const transformedAbilities: AbilityScores = { ...base.abilityScores };

    // Apply ability deltas (physical stats only for most forms)
    if (mods.abilityDeltas.str) transformedAbilities.str = base.abilityScores.str + mods.abilityDeltas.str;
    if (mods.abilityDeltas.dex) transformedAbilities.dex = base.abilityScores.dex + mods.abilityDeltas.dex;
    if (mods.abilityDeltas.con) transformedAbilities.con = base.abilityScores.con + mods.abilityDeltas.con;
    // Mental stats typically stay the same unless form's is higher
    if (mods.abilityDeltas.int) transformedAbilities.int = Math.max(base.abilityScores.int, mods.abilityDeltas.int);
    if (mods.abilityDeltas.wis) transformedAbilities.wis = Math.max(base.abilityScores.wis, mods.abilityDeltas.wis);
    if (mods.abilityDeltas.cha) transformedAbilities.cha = Math.max(base.abilityScores.cha, mods.abilityDeltas.cha);

    return {
      abilityScores: transformedAbilities,
      hp: base.hp, // TODO: Could adjust based on CON change
      ac: mods.naturalArmor, // Simplified for now
      movement: mods.movement,
      size: mods.size,
      attacks: mods.naturalAttacks,
      senses: Object.entries(mods.senses)
        .filter(([_, value]) => value)
        .map(([key, value]) =>
          typeof value === 'number' ? `${key} ${value}ft` : key
        ),
    };
  };

  const currentStats = getCurrentStats();

  if (isLoading) {
    return (
      <View className="flex-1 bg-forest-700 items-center justify-center">
        <ActivityIndicator size="large" color="#7FC9C0" />
        <Text className="text-parchment-200 font-ui mt-4">
          Loading character...
        </Text>
      </View>
    );
  }

  if (error || !character) {
    return (
      <View className="flex-1 bg-forest-700 items-center justify-center px-4">
        <Text className="text-red-400 font-ui text-center mb-4">
          Error loading character
        </Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: character.name,
          headerStyle: { backgroundColor: '#1A3A2E' },
          headerTintColor: '#F9F5EB',
        }}
      />

      <ScrollView className="flex-1 bg-forest-700">
        <View className="px-4 py-6 gap-4">
          {/* Character Header */}
          <Card>
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="font-display text-parchment-50 text-2xl font-bold">
                  {character.name}
                </Text>
                <Text className="font-ui text-parchment-300 text-base">
                  Level {character.baseStats.level} Druid
                </Text>
              </View>
              <Chip
                label={
                  character.edition === 'pf1e'
                    ? 'PF1e'
                    : character.edition === 'dnd5e'
                    ? 'D&D 5e'
                    : 'PF2e'
                }
              />
            </View>

            {/* Daily Uses */}
            {character.dailyUsesMax !== null && (
              <View className="mt-3 pt-3 border-t border-bronze-500/40">
                <Text className="font-ui text-parchment-300 text-sm">
                  Wild Shape Uses: {character.dailyUsesCurrent}/{character.dailyUsesMax}
                </Text>
              </View>
            )}
          </Card>

          {/* Form Selector */}
          <Card>
            <H3>Current Form</H3>

            <View className="mt-3 gap-2">
              {/* Base Form Button */}
              <Pressable
                onPress={() => setSelectedFormId(null)}
                className={`p-3 rounded border ${
                  !selectedFormId
                    ? 'bg-cyan-600/20 border-cyan-500'
                    : 'bg-forest-600/50 border-bronze-500/40'
                }`}
              >
                <Text className="font-ui text-parchment-50 font-semibold">
                  Base Form (Humanoid)
                </Text>
                <Text className="font-ui text-parchment-300 text-xs mt-1">
                  {currentStats?.size}
                </Text>
              </Pressable>

              {/* Wildshape Forms */}
              {forms && forms.length > 0 ? (
                forms
                  .filter(
                    (form) =>
                      form.requiredDruidLevel <= character.baseStats.level
                  )
                  .map((form) => (
                    <Pressable
                      key={form.id}
                      onPress={() => setSelectedFormId(form.id)}
                      className={`p-3 rounded border ${
                        selectedFormId === form.id
                          ? 'bg-cyan-600/20 border-cyan-500'
                          : 'bg-forest-600/50 border-bronze-500/40'
                      }`}
                    >
                      <Text className="font-ui text-parchment-50 font-semibold">
                        {form.name}
                      </Text>
                      <Text className="font-ui text-parchment-300 text-xs mt-1">
                        {form.size} • {form.requiredSpellLevel}
                      </Text>
                    </Pressable>
                  ))
              ) : (
                <Text className="font-ui text-parchment-400 text-sm italic">
                  No wildshape forms yet. Create one to get started!
                </Text>
              )}
            </View>
          </Card>

          {/* Ability Scores */}
          {currentStats && (
            <Card>
              <H3>Ability Scores</H3>
              <View className="flex-row flex-wrap mt-3">
                <Stat
                  label="STR"
                  value={currentStats.abilityScores.str.toString()}
                  sub={`${getModifier(currentStats.abilityScores.str) >= 0 ? '+' : ''}${getModifier(currentStats.abilityScores.str)}`}
                />
                <Stat
                  label="DEX"
                  value={currentStats.abilityScores.dex.toString()}
                  sub={`${getModifier(currentStats.abilityScores.dex) >= 0 ? '+' : ''}${getModifier(currentStats.abilityScores.dex)}`}
                />
                <Stat
                  label="CON"
                  value={currentStats.abilityScores.con.toString()}
                  sub={`${getModifier(currentStats.abilityScores.con) >= 0 ? '+' : ''}${getModifier(currentStats.abilityScores.con)}`}
                />
                <Stat
                  label="INT"
                  value={currentStats.abilityScores.int.toString()}
                  sub={`${getModifier(currentStats.abilityScores.int) >= 0 ? '+' : ''}${getModifier(currentStats.abilityScores.int)}`}
                />
                <Stat
                  label="WIS"
                  value={currentStats.abilityScores.wis.toString()}
                  sub={`${getModifier(currentStats.abilityScores.wis) >= 0 ? '+' : ''}${getModifier(currentStats.abilityScores.wis)}`}
                />
                <Stat
                  label="CHA"
                  value={currentStats.abilityScores.cha.toString()}
                  sub={`${getModifier(currentStats.abilityScores.cha) >= 0 ? '+' : ''}${getModifier(currentStats.abilityScores.cha)}`}
                />
              </View>
            </Card>
          )}

          {/* Combat Stats */}
          {currentStats && (
            <Card>
              <H3>Combat Stats</H3>
              <View className="flex-row flex-wrap mt-3">
                <Stat
                  label="HP"
                  value={`${currentStats.hp.current}/${currentStats.hp.max}`}
                />
                <Stat label="AC" value={currentStats.ac.toString()} />
                <Stat
                  label="Speed"
                  value={`${currentStats.movement.land || 0}ft`}
                />
                {currentStats.movement.swim && (
                  <Stat label="Swim" value={`${currentStats.movement.swim}ft`} />
                )}
                {currentStats.movement.climb && (
                  <Stat label="Climb" value={`${currentStats.movement.climb}ft`} />
                )}
                {currentStats.movement.fly && (
                  <Stat label="Fly" value={`${currentStats.movement.fly}ft`} />
                )}
              </View>
            </Card>
          )}

          {/* Natural Attacks */}
          {currentStats && currentStats.attacks.length > 0 && (
            <Card>
              <H3>Natural Attacks</H3>
              <View className="mt-3 gap-2">
                {currentStats.attacks.map((attack, index) => (
                  <AttackRow
                    key={`${attack.name}-${index}`}
                    name={attack.name}
                    bonus={attack.attackBonus >= 0 ? `+${attack.attackBonus}` : attack.attackBonus.toString()}
                    damage={attack.damage}
                    type={attack.type}
                  />
                ))}
              </View>
            </Card>
          )}

          {/* Senses */}
          {currentStats && currentStats.senses.length > 0 && (
            <Card>
              <H3>Senses</H3>
              <View className="mt-2">
                {currentStats.senses.map((sense, index) => (
                  <Text key={index} className="font-ui text-parchment-200 text-sm">
                    • {sense}
                  </Text>
                ))}
              </View>
            </Card>
          )}

          {/* Bottom spacing */}
          <View className="h-8" />
        </View>
      </ScrollView>
    </>
  );
}
