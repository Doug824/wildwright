/**
 * Character Detail Screen
 *
 * Displays full character stats and allows switching between base form
 * and wildshape forms with real-time stat updates.
 */

import { useState } from 'react';
import { ScrollView, View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { H2, H3 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Stat } from '@/components/ui/Stat';
import { AttackRow } from '@/components/ui/AttackRow';
import { useCharacter, useCharacterForms } from '@/hooks';
import { AbilityScores, NaturalAttack, WildShapeFormWithId } from '@/types/firestore';

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#E8DCC8', // parchment-200
    fontFamily: 'System',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    color: '#EF4444', // red-400
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 16,
  },
  characterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    color: '#1A0F08', // Almost black for readability
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  characterSubtitle: {
    fontFamily: 'System',
    color: '#2C1810', // Dark brown
    fontSize: 16,
    fontWeight: '600',
  },
  dailyUses: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(185, 122, 61, 0.4)', // bronze-500/40
  },
  dailyUsesText: {
    fontFamily: 'System',
    color: '#2C1810', // Dark brown
    fontSize: 14,
    fontWeight: '600',
  },
  formsContainer: {
    marginTop: 12,
    gap: 8,
  },
  formButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  formButtonActive: {
    backgroundColor: 'rgba(127, 201, 192, 0.2)', // cyan-600/20
    borderColor: '#7FC9C0', // cyan-500
  },
  formButtonInactive: {
    backgroundColor: 'rgba(42, 74, 58, 0.5)', // forest-600/50
    borderColor: 'rgba(185, 122, 61, 0.4)', // bronze-500/40
  },
  formButtonTitle: {
    fontFamily: 'System',
    color: '#1A0F08', // Almost black
    fontWeight: '700',
  },
  formButtonSubtitle: {
    fontFamily: 'System',
    color: '#2C1810', // Dark brown
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  noFormsText: {
    fontFamily: 'System',
    color: '#2C1810', // Dark brown
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  attacksContainer: {
    marginTop: 12,
    gap: 8,
  },
  sensesContainer: {
    marginTop: 8,
  },
  senseText: {
    fontFamily: 'System',
    color: '#2C1810', // Dark brown
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});

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
      <LinearGradient
        colors={['#0D1A12', '#1A2A1E', '#0F2419', '#152B1F', '#0A1F15']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.5, 0.7, 1]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7FC9C0" />
          <Text style={styles.loadingText}>
            Loading character...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (error || !character) {
    return (
      <LinearGradient
        colors={['#0D1A12', '#1A2A1E', '#0F2419', '#152B1F', '#0A1F15']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.5, 0.7, 1]}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading character
          </Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </LinearGradient>
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

      <LinearGradient
        colors={['#0D1A12', '#1A2A1E', '#0F2419', '#152B1F', '#0A1F15']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.3, 0.5, 0.7, 1]}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            {/* Character Header */}
            <Card>
              <View style={styles.characterHeader}>
                <View style={styles.characterInfo}>
                  <Text style={styles.characterName}>
                    {character.name}
                  </Text>
                  <Text style={styles.characterSubtitle}>
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
                <View style={styles.dailyUses}>
                  <Text style={styles.dailyUsesText}>
                    Wild Shape Uses: {character.dailyUsesCurrent}/{character.dailyUsesMax}
                  </Text>
                </View>
              )}
            </Card>

            {/* Form Selector */}
            <Card>
              <H3>Current Form</H3>

              <View style={styles.formsContainer}>
                {/* Base Form Button */}
                <Pressable
                  onPress={() => setSelectedFormId(null)}
                  style={[
                    styles.formButton,
                    !selectedFormId ? styles.formButtonActive : styles.formButtonInactive
                  ]}
                >
                  <Text style={styles.formButtonTitle}>
                    Base Form (Humanoid)
                  </Text>
                  <Text style={styles.formButtonSubtitle}>
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
                        style={[
                          styles.formButton,
                          selectedFormId === form.id ? styles.formButtonActive : styles.formButtonInactive
                        ]}
                      >
                        <Text style={styles.formButtonTitle}>
                          {form.name}
                        </Text>
                        <Text style={styles.formButtonSubtitle}>
                          {form.size} • {form.requiredSpellLevel}
                        </Text>
                      </Pressable>
                    ))
                ) : (
                  <Text style={styles.noFormsText}>
                    No wildshape forms yet. Create one to get started!
                  </Text>
                )}
              </View>
            </Card>

            {/* Ability Scores */}
            {currentStats && (
              <Card>
                <H3>Ability Scores</H3>
                <View style={styles.statsRow}>
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
                <View style={styles.statsRow}>
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
                <View style={styles.attacksContainer}>
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
                <View style={styles.sensesContainer}>
                  {currentStats.senses.map((sense, index) => (
                    <Text key={index} style={styles.senseText}>
                      • {sense}
                    </Text>
                  ))}
                </View>
              </Card>
            )}

            {/* Bottom spacing */}
            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}
