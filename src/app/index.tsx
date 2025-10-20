import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950">
      <Text className="text-4xl font-bold text-emerald-500 mb-4">WildWright</Text>
      <Text className="text-lg text-slate-400">Wild Shape Tracker for Pathfinder 1e</Text>
    </View>
  );
}
