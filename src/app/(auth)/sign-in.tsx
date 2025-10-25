/**
 * Sign In Screen
 *
 * Allows users to sign in with email/password or Google.
 * Includes link to sign up and password reset.
 */

import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { H2 } from '@/components/ui/Heading';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LivingForestBg } from '@/components/ui/LivingForestBg';
import { GlowHalo } from '@/components/ui/GlowHalo';
import { useAuth } from '@/hooks';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    paddingVertical: 60,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  appTitle: {
    color: '#F9F5EB',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#7FD1A8',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    letterSpacing: 2,
  },
  subtitle: {
    color: '#E8DCC8',
    fontFamily: 'System',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  divider: {
    flex: 1,
    height: 2,
    backgroundColor: '#3A5A4A',
    shadowColor: '#7FC9C0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dividerText: {
    marginHorizontal: 20,
    color: '#B97A3D',
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  errorText: {
    color: '#FCA5A5', // Red-400
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
});

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError(''); // Clear previous errors

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      // Force navigate after successful sign in
      router.replace('/character-picker');
    } catch (error: any) {
      setError(error.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LivingForestBg>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <GlowHalo color="green" style={styles.logoContainer}>
                <Image
                  source={require('../../../assets/icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </GlowHalo>
              <Text style={styles.appTitle}>WildWright</Text>
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

          {error && (
            <Text style={styles.errorText}>
              {error}
            </Text>
          )}

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
      </LivingForestBg>
    </View>
  );
}
