/**
 * Sign Up Screen
 *
 * Allows new users to create an account with email/password.
 * Includes validation and link to sign in.
 */

import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks';
import { validateEmail, validatePassword } from '@/utils/validation';

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
  signInContainer: {
    marginTop: 32,
  },
  signInText: {
    color: '#E8DCC8',
    fontFamily: 'System',
    textAlign: 'center',
  },
  signInLink: {
    color: '#B97A3D',
    fontWeight: '600',
  },
  errorText: {
    color: '#FCA5A5', // Red-400
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
});

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
  const [generalError, setGeneralError] = useState('');

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
    setGeneralError(''); // Clear previous errors
    if (!validate()) return;

    try {
      setLoading(true);
      await signUp(email, password, displayName || undefined);
      // Navigation will be handled by auth state change
    } catch (error: any) {
      setGeneralError(error.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <H2>Create Account</H2>
          <Text style={styles.subtitle}>
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

          {generalError && (
            <Text style={styles.errorText}>
              {generalError}
            </Text>
          )}
        </Card>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Pressable onPress={() => router.push('/sign-in')}>
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
