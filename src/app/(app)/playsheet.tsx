/**
 * Playsheet Screen
 *
 * Full wildshape form details with computed stats.
 * Shows attacks, defense, skills, and active effects.
 */

import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { Card } from '@/components/ui/Card';
import { H2 } from '@/components/ui/Heading';
import { Chip } from '@/components/ui/Chip';
import { Stat } from '@/components/ui/Stat';
import { Tabs } from '@/components/ui/Tabs';
import { AttackRow } from '@/components/ui/AttackRow';
import { Button } from '@/components/ui/Button';

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
    paddingBottom: 80,
  },
  cardMargin: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  subtitle: {
    color: '#4A3426',
    fontSize: 11,
    marginTop: 1,
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  statsRowSpaced: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
    gap: 4,
  },
  tabContent: {
    marginTop: 6,
  },
  sectionTitle: {
    color: '#4A3426',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  sectionSpacing: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(185, 122, 61, 0.3)',
  },
  infoText: {
    color: '#4A3426',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
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
  footerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
});

export default function PlaysheetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tabs = ['Attacks & Damage', 'Defense', 'Skills', 'Effects'];
  const [active, setActive] = React.useState(tabs[0]);

  // Parse computed data from params
  const computedData = React.useMemo(() => {
    if (params.computedData) {
      try {
        return JSON.parse(params.computedData as string);
      } catch (error) {
        console.error('Error parsing computed data:', error);
        return null;
      }
    }
    return null;
  }, [params.computedData]);

  // Parse form data from params or use default
  const formData = React.useMemo(() => {
    if (params.formData) {
      try {
        return JSON.parse(params.formData as string);
      } catch {
        return null;
      }
    }
    return null;
  }, [params.formData]);

  // Use computed data if available, otherwise fall back to mock
  const form = computedData ? {
    name: formData?.name || 'Wild Shape',
    size: computedData.size,
    spell: formData?.spell || 'Beast Shape',
    movement: `${computedData.movement.land} ft${computedData.movement.climb ? `, Climb ${computedData.movement.climb} ft` : ''}${computedData.movement.swim ? `, Swim ${computedData.movement.swim} ft` : ''}${computedData.movement.fly ? `, Fly ${computedData.movement.fly} ft` : ''}`,
    attacks: computedData.attacks.map((attack: any) => ({
      name: attack.name,
      bonus: attack.attackBonus >= 0 ? `+${attack.attackBonus}` : `${attack.attackBonus}`,
      damage: attack.damageDice,
      trait: attack.traits?.[0],
    })),
    abilities: computedData.traits,
    stats: {
      hp: computedData.hp.max,
      ac: computedData.ac.total,
      touchAC: computedData.ac.touch,
      flatFootedAC: computedData.ac.flatFooted,
      speed: `${computedData.movement.land} ft`,
    },
  } : {
    // Default mock data for development
    name: 'Leopard',
    size: 'Large',
    spell: 'Beast Shape III',
    movement: '40 ft, Climb 20 ft',
    attacks: [
      { name: 'Bite', bonus: '+14', damage: '1d8+9', trait: 'Grab' },
      { name: 'Claw', bonus: '+14', damage: '1d4+9' },
      { name: 'Claw', bonus: '+14', damage: '1d4+9' },
    ],
    abilities: ['Pounce', 'Low-light vision', 'Scent'],
    stats: { hp: 64, ac: 19, speed: '40 ft' },
  };

  const handleRevertForm = () => {
    // Navigate back to home and clear active form
    router.push({
      pathname: '/(app)/home',
      params: { clearActiveForm: 'true' }
    });
  };

  const handleSwitchForm = () => {
    // Navigate to forms to select a different one
    router.push('/(app)/forms');
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
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header Card with Stats */}
          <Card style={styles.cardMargin}>
            {/* Header Section */}
            <View style={styles.headerRow}>
              <View style={styles.headerContent}>
                <H2>{form.name}</H2>
                <Text style={styles.subtitle}>
                  {form.size} • {form.spell}
                </Text>
              </View>
            </View>

            {/* Abilities Row */}
            <View style={styles.chipRow}>
              {form.abilities?.map((ability, idx) => (
                <Chip key={idx} label={ability} variant="mist" />
              ))}
            </View>

            {/* Stats Section */}
            <View style={styles.sectionSpacing}>
              <View style={styles.statsRow}>
                <Stat label="HP" value={`${form.stats?.hp || 0}`} />
                <Stat label="AC" value={String(form.stats?.ac || 0)} />
                <Stat label="Speed" value={form.movement || 'Unknown'} />
              </View>
            </View>
          </Card>

          {/* Tabs */}
          <Tabs tabs={tabs} active={active} onChange={setActive} />

          {/* Attacks & Damage Tab */}
          {active === 'Attacks & Damage' && (
            <Card style={styles.tabContent}>
              <Text style={styles.sectionTitle}>
                Natural Attacks
              </Text>
              {form.attacks?.map((attack, idx) => (
                <AttackRow
                  key={idx}
                  name={attack.name}
                  bonus={attack.bonus}
                  damage={attack.damage}
                  trait={attack.trait}
                />
              ))}

              <Text style={styles.infoText}>
                Full Attack: {form.attacks?.map(a => `${a.name} ${a.bonus} (${a.damage}${a.trait ? ` plus ${a.trait.toLowerCase()}` : ''})`).join(', ')}
              </Text>
            </Card>
          )}

          {/* Defense Tab */}
          {active === 'Defense' && (
            <Card style={styles.tabContent}>
              <Text style={styles.sectionTitle}>
                Armor Class
              </Text>
              <View style={styles.statsRow}>
                <Stat label="Total AC" value={String(form.stats?.ac || 0)} />
                <Stat label="Touch" value={String(form.stats?.touchAC || 0)} sub="Dex + Size" />
                <Stat label="Flat-Footed" value={String(form.stats?.flatFootedAC || 0)} sub="No Dex" />
              </View>

              <View style={styles.sectionSpacing}>
                <Text style={styles.sectionTitle}>
                  Special Abilities
                </Text>
                <View style={styles.chipRow}>
                  {form.abilities?.map((ability, idx) => (
                    <Chip key={idx} label={ability} variant="mist" />
                  ))}
                </View>
              </View>
            </Card>
          )}

          {/* Skills Tab */}
          {active === 'Skills' && (
            <Card style={styles.tabContent}>
              <Text style={styles.sectionTitle}>
                Skill Modifiers
              </Text>
              <View style={styles.statsRow}>
                <Stat label="Perception" value="+15" />
                <Stat label="Stealth" value="+18" sub="(+4 size, +4 Dex)" />
                <Stat label="Acrobatics" value="+12" sub="(+4 Dex)" />
                <Stat label="Climb" value="+13" />
                <Stat label="Swim" value="+9" />
              </View>
            </Card>
          )}

          {/* Effects Tab */}
          {active === 'Effects' && (
            <Card style={styles.tabContent}>
              <Text style={styles.sectionTitle}>
                Active Effects
              </Text>
              <View style={styles.chipRow}>
                <Chip label="Haste" variant="mist" />
                <Chip label="Barkskin" variant="mist" />
                <Chip label="Heroism" variant="mist" />
              </View>

              <Text style={styles.infoText}>
                No temporary effects active. Apply buffs to see stat changes.
              </Text>
            </Card>
          )}

          {/* Footer Actions */}
          <View style={styles.footerActions}>
            <Button variant="outline" onPress={handleRevertForm} style={{ flex: 1 }}>
              Revert Form
            </Button>
            <Button onPress={handleSwitchForm} style={{ flex: 1 }}>
              Switch Form
            </Button>
          </View>

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </LivingForestBg>
    </View>
  );
}
