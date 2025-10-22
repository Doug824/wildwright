/**
 * Forgot Password Screen
 *
 * Allows users to request a password reset email.
 */

import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks';
import { validateEmail } from '@/utils/validation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3A2E',
    paddingHorizontal: 16,
  },
  content: {
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    color: '#D4C5A9',
    fontFamily: 'System',
    textAlign: 'center',
    marginTop: 8,
  },
  emailText: {
    color: '#F9F5EB',
    fontWeight: '600',
  },
  messageText: {
    color: '#E8DCC8',
    fontFamily: 'System',
    marginBottom: 16,
    textAlign: 'center',
  },
  signInContainer: {
    marginTop: 12,
  },
  signInText: {
    color: '#E8DCC8',
    fontFamily: 'System',
    textAlign: 'center',
    fontSize: 14,
  },
  signInLink: {
    color: '#B97A3D',
    fontWeight: '600',
  },
  buttonMargin: {
    marginBottom: 12,
  },
});

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
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <H2>Check Your Email</H2>
            <Text style={styles.subtitle}>
              We've sent password reset instructions to{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </View>

          <Card>
            <Text style={styles.messageText}>
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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <H2>Reset Password</H2>
          <Text style={styles.subtitle}>
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

          <View style={styles.buttonMargin}>
            <Button
              onPress={handleResetPassword}
              loading={loading}
              fullWidth
            >
              Send Reset Link
            </Button>
          </View>

          <Pressable onPress={() => router.push('/sign-in')}>
            <Text style={styles.signInText}>
              Remember your password?{' '}
              <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </Pressable>
        </Card>
      </View>
    </ScrollView>
  );
}
