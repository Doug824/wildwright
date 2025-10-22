/**
 * Forgot Password Screen
 *
 * Allows users to request a password reset email.
 */

import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks';
import { validateEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();

  const handleResetPassword = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <ScrollView className="flex-1 bg-forest-700 px-4">
        <View className="py-12">
          <View className="items-center mb-8">
            <H2 className="mb-2">Check Your Email</H2>
            <Text className="text-parchment-300 font-ui text-center">
              We've sent password reset instructions to{'\n'}
              <Text className="text-parchment-100 font-semibold">{email}</Text>
            </Text>
          </View>

          <Card>
            <Text className="text-parchment-200 font-ui mb-4 text-center">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </Text>

            <Button
              onPress={() => router.push('/sign-in')}
              fullWidth
            >
              Back to Sign In
            </Button>
          </Card>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-forest-700 px-4">
      <View className="py-12">
        {/* Header */}
        <View className="items-center mb-8">
          <H2 className="mb-2">Reset Password</H2>
          <Text className="text-parchment-300 font-ui text-center">
            Enter your email to receive reset instructions
          </Text>
        </View>

        {/* Reset Form */}
        <Card>
          <Input
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(undefined);
            }}
            placeholder="druid@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={error}
          />

          <Button
            onPress={handleResetPassword}
            loading={loading}
            fullWidth
            className="mb-3"
          >
            Send Reset Link
          </Button>

          <Pressable onPress={() => router.push('/sign-in')}>
            <Text className="text-parchment-200 font-ui text-center text-sm">
              Remember your password?{' '}
              <Text className="text-bronze-500 font-semibold">Sign In</Text>
            </Text>
          </Pressable>
        </Card>
      </View>
    </ScrollView>
  );
}
