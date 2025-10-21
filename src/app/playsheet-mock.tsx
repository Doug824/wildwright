/**
 * Playsheet Mock Screen
 *
 * A demonstration of all WildWright UI components styled with the
 * forest/parchment theme. Based on the design reference images.
 */

import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import { H2 } from '@/components/ui/Heading';
import { Chip } from '@/components/ui/Chip';
import { RuneProgress } from '@/components/ui/RuneProgress';
import { Stat } from '@/components/ui/Stat';
import { Tabs } from '@/components/ui/Tabs';
import { AttackRow } from '@/components/ui/AttackRow';

export default function PlaysheetMock() {
  const tabs = ['Attacks & Damage', 'Defense', 'Skills', 'Effects'];
  const [active, setActive] = React.useState(tabs[0]);

  return (
    <ScrollView className="flex-1 bg-forest-700 px-4 py-4">
      {/* Header Card - Leopard Form (matches reference design) */}
      <Card className="mb-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <H2>Leopard</H2>
            <Text className="text-forest-600 font-ui text-sm mt-1">
              Large • Beast Shape III
            </Text>
            <View className="flex-row mt-3 flex-wrap">
              <Chip label="Flanking" variant="default" />
              <Chip label="Planar" variant="default" />
              <Chip label="Pounce" variant="mist" />
            </View>
          </View>
          <RuneProgress used={2} total={4} />
        </View>
      </Card>

      {/* Primary Stats Grid */}
      <Card className="mb-4">
        <View className="flex-row flex-wrap">
          <Stat label="HP" value="64/64" sub="Temp 0" />
          <Stat label="AC" value="19" sub="Touch 13 • FF 16" />
          <Stat label="Saves" value="F+9 R+10 W+6" />
        </View>
        <View className="flex-row flex-wrap mt-2">
          <Stat label="Speed" value="40 ft" sub="Low-light • Scent" />
          <Stat label="Size/Reach" value="Large / 10 ft" />
          <Stat label="CMB/CMD" value="+14 / 25" />
        </View>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {/* Attacks & Damage Tab */}
      {active === 'Attacks & Damage' && (
        <Card className="mt-3">
          <Text className="text-parchment-50 font-display text-lg mb-2">
            Natural Attacks
          </Text>
          <AttackRow name="Bite" bonus="+14" damage="1d8+9" trait="Grab" />
          <AttackRow name="Claw" bonus="+14" damage="1d4+9" />
          <AttackRow name="Claw" bonus="+14" damage="1d4+9" />

          <View className="mt-4">
            <Text className="text-parchment-300 font-ui text-sm">
              Full Attack: Bite +14 (1d8+9 plus grab), 2 claws +14 (1d4+9)
            </Text>
          </View>
        </Card>
      )}

      {/* Defense Tab */}
      {active === 'Defense' && (
        <Card className="mt-3">
          <Text className="text-parchment-50 font-display text-lg mb-3">
            Armor Class Breakdown
          </Text>
          <View className="flex-row flex-wrap">
            <Stat label="Base" value="10" />
            <Stat label="Natural" value="+3" />
            <Stat label="Dex" value="+4" />
            <Stat label="Size" value="-1" />
            <Stat label="Misc" value="+3" />
          </View>

          <View className="mt-4 pt-4 border-t border-bronze-500/40">
            <Text className="text-parchment-50 font-display text-lg mb-2">
              Defenses
            </Text>
            <View className="flex-row flex-wrap">
              <Chip label="Low-light vision" variant="mist" />
              <Chip label="Scent" variant="mist" />
            </View>
          </View>
        </Card>
      )}

      {/* Skills Tab */}
      {active === 'Skills' && (
        <Card className="mt-3">
          <Text className="text-parchment-50 font-display text-lg mb-3">
            Skill Modifiers
          </Text>
          <View className="flex-row flex-wrap">
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
        <Card className="mt-3">
          <Text className="text-parchment-50 font-display text-lg mb-3">
            Active Effects
          </Text>
          <View className="flex-row flex-wrap">
            <Chip label="Haste" variant="mist" />
            <Chip label="Barkskin" variant="mist" />
            <Chip label="Heroism" variant="mist" />
          </View>

          <View className="mt-4">
            <Text className="text-parchment-300 font-ui text-sm">
              No temporary effects active. Apply buffs to see stat changes.
            </Text>
          </View>
        </Card>
      )}

      {/* Bottom Padding */}
      <View className="h-8" />
    </ScrollView>
  );
}
