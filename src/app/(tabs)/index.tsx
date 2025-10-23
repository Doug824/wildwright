/**
 * Home/Dashboard Screen
 *
 * Main dashboard showing active character and quick actions.
 * For now, redirects to character list or shows placeholder.
 */

import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const styles = StyleSheet.create({
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
    color: '#4A3426', // Deep brown for readability on parchment
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 12,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  buttonSpacing: {
    marginBottom: 14,
  },
});

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#0D1A12', '#1A2A1E', '#0F2419', '#152B1F', '#0A1F15']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0, 0.3, 0.5, 0.7, 1]}
    >
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
    </LinearGradient>
  );
}
