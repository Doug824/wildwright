/**
 * Playsheet Screen
 *
 * Full wildshape form details with computed stats.
 * Shows attacks, defense, skills, and active effects.
 */

import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { Card } from '@/components/ui/Card';
import { H2 } from '@/components/ui/Heading';
import { Chip } from '@/components/ui/Chip';
import { RuneProgress } from '@/components/ui/RuneProgress';
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
    padding: 16,
    paddingTop: 60,
  },
  cardMargin: {
    marginBottom: 12,
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
    color: '#2A4A3A', // forest-600
    fontSize: 13,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statsRowSpaced: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tabContent: {
    marginTop: 12,
  },
  sectionTitle: {
    color: '#1A0F08', // Almost black for readability on parchment
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  sectionSpacing: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(185, 122, 61, 0.4)', // bronze-500/40
  },
  infoText: {
    color: '#2C1810', // Dark brown for better readability on parchment
    fontSize: 14,
    marginTop: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(42, 74, 58, 0.9)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#7FD1A8',
    shadowColor: '#7FD1A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 10,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(42, 74, 58, 1)',
    transform: [{ scale: 0.95 }],
  },
  backText: {
    color: '#F9F5EB',
    fontSize: 14,
    fontWeight: '700',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
  },
});

export default function PlaysheetScreen() {
  const router = useRouter();
  const tabs = ['Attacks & Damage', 'Defense', 'Skills', 'Effects'];
  const [active, setActive] = React.useState(tabs[0]);

  const handleRevertForm = () => {
    // Revert to normal form
    router.back();
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
          {/* Header Card - Leopard Form */}
          <Card style={styles.cardMargin}>
            <View style={styles.headerRow}>
              <View style={styles.headerContent}>
                <H2>Leopard</H2>
                <Text style={styles.subtitle}>
                  Large • Beast Shape III
                </Text>
                <View style={styles.chipRow}>
                  <Chip label="Flanking" variant="default" />
                  <Chip label="Planar" variant="default" />
                  <Chip label="Pounce" variant="mist" />
                </View>
              </View>
              <RuneProgress used={2} total={4} label="Uses Left" />
            </View>
          </Card>

          {/* Primary Stats Grid */}
          <Card style={styles.cardMargin}>
            <View style={styles.statsRow}>
              <Stat label="HP" value="64/64" sub="Temp 0" />
              <Stat label="AC" value="19" sub="Touch 13 • FF 16" />
              <Stat label="Saves" value="F+9 R+10 W+6" />
            </View>
            <View style={styles.statsRowSpaced}>
              <Stat label="Speed" value="40 ft" sub="Low-light • Scent" />
              <Stat label="Size/Reach" value="Large / 10 ft" />
              <Stat label="CMB/CMD" value="+14 / 25" />
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
              <AttackRow name="Bite" bonus="+14" damage="1d8+9" trait="Grab" />
              <AttackRow name="Claw" bonus="+14" damage="1d4+9" />
              <AttackRow name="Claw" bonus="+14" damage="1d4+9" />

              <Text style={styles.infoText}>
                Full Attack: Bite +14 (1d8+9 plus grab), 2 claws +14 (1d4+9)
              </Text>
            </Card>
          )}

          {/* Defense Tab */}
          {active === 'Defense' && (
            <Card style={styles.tabContent}>
              <Text style={styles.sectionTitle}>
                Armor Class Breakdown
              </Text>
              <View style={styles.statsRow}>
                <Stat label="Base" value="10" />
                <Stat label="Natural" value="+3" />
                <Stat label="Dex" value="+4" />
                <Stat label="Size" value="-1" />
                <Stat label="Misc" value="+3" />
              </View>

              <View style={styles.sectionSpacing}>
                <Text style={styles.sectionTitle}>
                  Defenses
                </Text>
                <View style={styles.chipRow}>
                  <Chip label="Low-light vision" variant="mist" />
                  <Chip label="Scent" variant="mist" />
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
