/**
 * Home/Dashboard Screen
 *
 * Main dashboard showing active character and quick actions.
 * For now, redirects to character list or shows placeholder.
 */

import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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
    borderRadius: 65,
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

  return (
    <ImageBackground
      source={require('../../../assets/forest-background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.darkOverlay}>
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
  );
}
