/**
 * Home/Dashboard Screen
 *
 * Main dashboard showing active character and quick actions.
 * For now, redirects to character list or shows placeholder.
 */

import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { signOut } from '@/services/auth.service';

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 15, 0.75)', // Dark green overlay to focus on center
  },
  gradient: {
    flex: 1,
  },
  logoutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(42, 74, 58, 0.9)', // Forest green with transparency
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#7FD1A8', // Magical green border
    shadowColor: '#7FD1A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  logoutButtonPressed: {
    backgroundColor: 'rgba(42, 74, 58, 1)', // Darker when pressed
    transform: [{ scale: 0.95 }],
  },
  logoutText: {
    color: '#F9F5EB', // Parchment color for readability
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 20,
    borderRadius: 16, // Rounded square instead of circle
    borderWidth: 4,
    borderColor: '#7FD1A8', // Magical green border
    // Magical glow around logo
    shadowColor: '#7FD1A8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  subtitle: {
    color: '#1A0F08', // Almost black brown for maximum readability
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 12,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  buttonSpacing: {
    marginBottom: 14,
  },
});

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      await signOut();
      console.log('Logged out successfully');
      // Manually navigate to auth screen
      router.replace('/(auth)/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../../assets/forest-background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={{ width: '100%', height: '100%' }}
      >
      <View style={styles.darkOverlay}>
        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <View style={styles.container}>
        <Card>
          <View style={styles.cardContent}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <H2>WildWright</H2>
            <Text style={styles.subtitle}>
              Wild Shape Tracker for Pathfinder 1e
            </Text>

            <View style={styles.buttonSpacing}>
              <Button
                onPress={() => router.push('/character')}
                fullWidth
              >
                View Characters
              </Button>
            </View>

            <Button
              variant="outline"
              onPress={() => router.push('/playsheet-mock')}
              fullWidth
            >
              View Demo (Leopard)
            </Button>
          </View>
        </Card>
        </View>
        </View>
      </ImageBackground>
    </View>
  );
}
