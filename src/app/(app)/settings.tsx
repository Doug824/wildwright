/**
 * Settings Screen
 *
 * App settings: theme, data export/import, account management.
 */

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { BarkCard } from '@/components/ui/BarkCard';
import { MistCard } from '@/components/ui/MistCard';
import { H2 } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks';

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
  title: {
    color: '#F9F5EB',
    fontSize: 28,
    fontWeight: '700',
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    marginBottom: 8,
  },
  subtitle: {
    color: '#D4C5A9',
    fontSize: 14,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A3426',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 115, 85, 0.2)',
  },
  settingLabel: {
    fontSize: 16,
    color: '#4A3426',
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B5344',
  },
  accountInfo: {
    marginBottom: 16,
  },
  accountLabel: {
    fontSize: 12,
    color: '#6B5344',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 16,
    color: '#4A3426',
    fontWeight: '600',
  },
  dangerZone: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: 'rgba(185, 69, 69, 0.3)',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B4545',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: 'rgba(185, 69, 69, 0.1)',
    borderColor: '#B94545',
  },
  buttonSpacing: {
    marginBottom: 12,
  },
  versionText: {
    textAlign: 'center',
    color: '#8B7355',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut: authSignOut } = useAuth();
  const [theme, setTheme] = useState<'day' | 'night'>('night');

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export all your characters and forms as JSON.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // TODO: Implement export
            alert('Export functionality coming soon!');
          },
        },
      ]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'This will import characters and forms from a JSON file. Existing data will be merged.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: () => {
            // TODO: Implement import
            alert('Import functionality coming soon!');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Your characters and forms will remain safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            alert('Cache cleared!');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            alert('Account deletion coming soon!');
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await authSignOut();
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleChangeCharacter = () => {
    router.replace('/character-picker');
  };

  return (
    <View style={styles.container}>
      <LivingForestBg>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>
              Customize your WildWright experience
            </Text>
          </View>

          {/* Account */}
          <BarkCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Account</Text>

            <View style={styles.accountInfo}>
              <Text style={styles.accountLabel}>Email</Text>
              <Text style={styles.accountValue}>
                {user?.email || 'Not signed in'}
              </Text>
            </View>

            <Button
              variant="outline"
              onPress={handleChangeCharacter}
              fullWidth
              style={styles.buttonSpacing}
            >
              Switch Character
            </Button>

            <Button
              variant="outline"
              onPress={handleLogout}
              fullWidth
            >
              Log Out
            </Button>
          </BarkCard>

          {/* Appearance */}
          <BarkCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Appearance</Text>

            <Pressable
              style={styles.settingRow}
              onPress={() => setTheme(theme === 'day' ? 'night' : 'day')}
            >
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingValue}>
                {theme === 'day' ? '☀️ Day' : '🌙 Night'}
              </Text>
            </Pressable>
          </BarkCard>

          {/* Data Management */}
          <BarkCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Data Management</Text>

            <Button
              variant="outline"
              onPress={handleExportData}
              fullWidth
              style={styles.buttonSpacing}
            >
              📦 Export All Data
            </Button>

            <Button
              variant="outline"
              onPress={handleImportData}
              fullWidth
              style={styles.buttonSpacing}
            >
              📥 Import Data
            </Button>

            <Button
              variant="outline"
              onPress={handleClearCache}
              fullWidth
            >
              🗑️ Clear Cache
            </Button>
          </BarkCard>

          {/* About */}
          <BarkCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Edition</Text>
              <Text style={styles.settingValue}>Pathfinder 1e</Text>
            </View>

            {/* Danger Zone */}
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>
              <Button
                variant="outline"
                onPress={handleDeleteAccount}
                fullWidth
                style={styles.dangerButton}
              >
                Delete Account
              </Button>
            </View>
          </BarkCard>

          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 40 }}>
            <Text style={styles.versionText}>
              WildWright • Made with ❤️ for druids
            </Text>
            <Text style={styles.versionText}>
              Built by Doug Hagan
            </Text>
          </View>
        </ScrollView>
      </LivingForestBg>
    </View>
  );
}
