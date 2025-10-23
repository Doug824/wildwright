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
    width: 120,
    height: 120,
    marginBottom: 16,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#B97A3D', // Bronze border
  },
  subtitle: {
    color: '#D4C5A9', // Parchment-300
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  buttonSpacing: {
    marginBottom: 12,
  },
});

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#0A1F1A', '#1A3A2E', '#234A3E', '#1A3A2E']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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
