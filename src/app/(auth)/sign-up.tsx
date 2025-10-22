/**
 * Sign Up Screen
 *
 * Allows new users to create an account with email/password.
 * Includes validation and link to sign in.
 */

import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await signUp(email, password, displayName || undefined);
      // Navigation will be handled by auth state change
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-forest-700 px-4">
      <View className="py-12">
        {/* Header */}
        <View className="items-center mb-8">
          <H2 className="mb-2">Create Account</H2>
          <Text className="text-parchment-300 font-ui text-center">
            Join WildWright and track your transformations
          </Text>
        </View>

        {/* Sign Up Form */}
        <Card>
          <Input
            label="Display Name (Optional)"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Moonfire the Druid"
            autoCapitalize="words"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            placeholder="druid@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
            helper="At least 6 characters"
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
            }}
            placeholder="••••••••"
            secureTextEntry
            autoCapitalize="none"
            error={errors.confirmPassword}
          />

          <Button
            onPress={handleSignUp}
            loading={loading}
            fullWidth
          >
            Create Account
          </Button>
        </Card>

        {/* Sign In Link */}
        <View className="mt-8">
          <Pressable onPress={() => router.push('/sign-in')}>
            <Text className="text-parchment-200 font-ui text-center">
              Already have an account?{' '}
              <Text className="text-bronze-500 font-semibold">Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
