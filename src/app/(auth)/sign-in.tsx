/**
 * Sign In Screen
 *
 * Allows users to sign in with email/password or Google.
 * Includes link to sign up and password reset.
 */

import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      // Navigation will be handled by auth state change
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-forest-700 px-4">
      <View className="py-12">
        {/* Header */}
        <View className="items-center mb-8">
          <H2 className="mb-2">Welcome Back</H2>
          <Text className="text-parchment-300 font-ui text-center">
            Sign in to access your wild shapes
          </Text>
        </View>

        {/* Sign In Form */}
        <Card>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="druid@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            onPress={handleSignIn}
            loading={loading}
            fullWidth
            className="mb-3"
          >
            Sign In
          </Button>

          <Pressable onPress={() => router.push('/forgot-password')}>
            <Text className="text-bronze-500 font-ui text-center text-sm">
              Forgot password?
            </Text>
          </Pressable>
        </Card>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-forest-600" />
          <Text className="mx-4 text-parchment-300 font-ui text-sm">OR</Text>
          <View className="flex-1 h-px bg-forest-600" />
        </View>

        {/* Google Sign In */}
        <Card>
          <Button
            variant="outline"
            fullWidth
            onPress={() => Alert.alert('Coming Soon', 'Google sign in will be available soon')}
          >
            Continue with Google
          </Button>
        </Card>

        {/* Sign Up Link */}
        <View className="mt-8">
          <Pressable onPress={() => router.push('/sign-up')}>
            <Text className="text-parchment-200 font-ui text-center">
              Don't have an account?{' '}
              <Text className="text-bronze-500 font-semibold">Sign Up</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
