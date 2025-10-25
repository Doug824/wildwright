/**
 * Dashboard (Home) Screen
 *
 * Main dashboard showing active wildshape form, daily uses, and quick actions.
 * Entry point after character selection.
 */

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { BarkCard } from '@/components/ui/BarkCard';
import { MistCard } from '@/components/ui/MistCard';
import { GlowHalo } from '@/components/ui/GlowHalo';
import { H2, H3 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { RuneProgress } from '@/components/ui/RuneProgress';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    color: '#D4C5A9',
    fontSize: 16,
    marginBottom: 8,
  },
  characterName: {
    color: '#F9F5EB',
    fontSize: 28,
    fontWeight: '700',
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  activeFormCard: {
    marginBottom: 16,
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  formInfo: {
    flex: 1,
  },
  formName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A0F08',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#4A3426',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 115, 85, 0.3)',
  },
  statQuick: {
    marginRight: 16,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B5344',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A0F08',
  },
  emptyFormCard: {
    marginBottom: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A0F08',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#4A3426',
    textAlign: 'center',
    marginBottom: 20,
  },
  quickActions: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9F5EB',
    marginBottom: 12,
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  favoritesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  favoriteCard: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 12,
    padding: 16,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A0F08',
    marginBottom: 4,
  },
  favoriteSubtitle: {
    fontSize: 12,
    color: '#6B5344',
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
});

export default function DashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeForm, setActiveForm] = useState<any>(null); // Will be populated from DB
  const [dailyUsesLeft, setDailyUsesLeft] = useState(2);
  const [totalDailyUses, setTotalDailyUses] = useState(4);

  // Mock character name - will come from params/context
  const characterName = 'Thornclaw';

  const handleAssumeShape = () => {
    router.push('/(app)/forms');
  };

  const handleViewPlaysheet = () => {
    router.push('/(app)/playsheet');
  };

  const handleRest = () => {
    // Reset daily uses
    setDailyUsesLeft(totalDailyUses);
  };

  const handleBackToCharacterPicker = () => {
    router.back();
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
          onPress={handleBackToCharacterPicker}
        >
          <Text style={styles.backText}>← Characters</Text>
        </Pressable>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.characterName}>{characterName}</Text>
          </View>

          {/* Active Form or Empty State */}
          {activeForm ? (
            <GlowHalo color="green">
              <BarkCard style={styles.activeFormCard}>
                <View style={styles.formHeader}>
                  <View style={styles.formInfo}>
                    <Text style={styles.formName}>{activeForm.name}</Text>
                    <Text style={styles.formSubtitle}>
                      {activeForm.size} • {activeForm.spell}
                    </Text>
                    <View style={styles.chipRow}>
                      <Chip label="Pounce" variant="mist" />
                      <Chip label="Flanking" variant="default" />
                    </View>
                  </View>
                  <RuneProgress used={dailyUsesLeft} total={totalDailyUses} label="Uses Left" />
                </View>

                <View style={styles.statsPreview}>
                  <View style={styles.statQuick}>
                    <Text style={styles.statLabel}>HP</Text>
                    <Text style={styles.statValue}>64</Text>
                  </View>
                  <View style={styles.statQuick}>
                    <Text style={styles.statLabel}>AC</Text>
                    <Text style={styles.statValue}>19</Text>
                  </View>
                  <View style={styles.statQuick}>
                    <Text style={styles.statLabel}>Speed</Text>
                    <Text style={styles.statValue}>40 ft</Text>
                  </View>
                </View>

                <Button onPress={handleViewPlaysheet} fullWidth style={{ marginTop: 16 }}>
                  View Full Playsheet
                </Button>
              </BarkCard>
            </GlowHalo>
          ) : (
            <MistCard intensity="medium">
              <View style={styles.emptyFormCard}>
                <Text style={styles.emptyIcon}>🐺</Text>
                <Text style={styles.emptyTitle}>No Form Assumed</Text>
                <Text style={styles.emptyText}>
                  Choose a wildshape form to begin your transformation
                </Text>
                <Button onPress={handleAssumeShape}>
                  Assume Shape
                </Button>
              </View>
            </MistCard>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <Button
              variant="default"
              onPress={handleAssumeShape}
              fullWidth
              style={styles.actionButton}
            >
              🌿 Assume New Shape
            </Button>

            <Button
              variant="outline"
              onPress={handleRest}
              fullWidth
              style={styles.actionButton}
            >
              ⏰ Rest (Reset Uses)
            </Button>
          </View>

          {/* Favorites */}
          <View>
            <Text style={styles.sectionTitle}>Favorite Forms</Text>
            <View style={styles.favoritesRow}>
              <Pressable onPress={handleAssumeShape}>
                <MistCard intensity="light" style={styles.favoriteCard}>
                  <Text style={styles.favoriteName}>Leopard</Text>
                  <Text style={styles.favoriteSubtitle}>Large • Beast III</Text>
                </MistCard>
              </Pressable>

              <Pressable onPress={handleAssumeShape}>
                <MistCard intensity="light" style={styles.favoriteCard}>
                  <Text style={styles.favoriteName}>Bear</Text>
                  <Text style={styles.favoriteSubtitle}>Large • Beast II</Text>
                </MistCard>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </LivingForestBg>
    </View>
  );
}
