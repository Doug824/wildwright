/**
 * Home/Dashboard Screen
 *
 * Main dashboard showing active character and quick actions.
 * For now, redirects to character list or shows placeholder.
 */

import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-forest-700 px-4 justify-center">
      <Card>
        <View className="items-center py-8">
          <H2 className="mb-4 text-center">WildWright</H2>
          <Text className="font-ui text-parchment-300 text-center mb-6">
            Wild Shape Tracker for Pathfinder 1e
          </Text>

          <Button
            onPress={() => router.push('/character')}
            fullWidth
            className="mb-3"
          >
            View Characters
          </Button>

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
  );
}
