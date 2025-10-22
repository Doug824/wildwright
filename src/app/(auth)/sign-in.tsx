/**
 * Sign In Screen
 *
 * Allows users to sign in with email/password or Google.
 * Includes link to sign up and password reset.
 */

import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks';

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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A4A3A',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#D4C5A9',
    fontFamily: 'System',
    fontSize: 14,
  },
  signUpContainer: {
    marginTop: 32,
  },
  signUpText: {
    color: '#E8DCC8',
    fontFamily: 'System',
    textAlign: 'center',
  },
  signUpLink: {
    color: '#B97A3D',
    fontWeight: '600',
  },
  forgotPassword: {
    color: '#B97A3D',
    fontFamily: 'System',
    textAlign: 'center',
    fontSize: 14,
  },
  buttonMargin: {
    marginBottom: 12,
  },
});

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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <H2>Welcome Back</H2>
          <Text style={styles.subtitle}>
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

          <View style={styles.buttonMargin}>
            <Button
              onPress={handleSignIn}
              loading={loading}
              fullWidth
            >
              Sign In
            </Button>
          </View>

          <Pressable onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotPassword}>
              Forgot password?
            </Text>
          </Pressable>
        </Card>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
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
        <View style={styles.signUpContainer}>
          <Pressable onPress={() => router.push('/sign-up')}>
            <Text style={styles.signUpText}>
              Don't have an account?{' '}
              <Text style={styles.signUpLink}>Sign Up</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
