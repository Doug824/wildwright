/**
 * Playsheet Mock Screen
 *
 * A demonstration of all WildWright UI components styled with the
 * forest/parchment theme. Based on the design reference images.
 */

import React from 'react';
import { ScrollView, View, Text, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { H2 } from '@/components/ui/Heading';
import { Chip } from '@/components/ui/Chip';
import { RuneProgress } from '@/components/ui/RuneProgress';
import { Stat } from '@/components/ui/Stat';
import { Tabs } from '@/components/ui/Tabs';
import { AttackRow } from '@/components/ui/AttackRow';

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
  },
  scrollContent: {
    padding: 16,
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
    height: 32,
  },
});

export default function PlaysheetMock() {
  const tabs = ['Attacks & Damage', 'Defense', 'Skills', 'Effects'];
  const [active, setActive] = React.useState(tabs[0]);

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../assets/forest-background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={{ width: '100%', height: '100%' }}
      >
        <View style={styles.darkOverlay}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Card - Leopard Form (matches reference design) */}
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

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
        </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}
