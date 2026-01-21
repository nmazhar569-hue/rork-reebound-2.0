import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Apple, Mail, Lock, User, ChevronRight } from 'lucide-react-native';
import { haptics } from '@/utils/haptics';

const DARK_BG = '#000000';
const NEON_LIME = '#CCFF00';
const SURFACE_DARK = '#111111';
const SURFACE_ELEVATED = '#1A1A1A';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = 'rgba(255, 255, 255, 0.7)';
const TEXT_TERTIARY = 'rgba(255, 255, 255, 0.4)';
const BORDER_COLOR = 'rgba(204, 255, 0, 0.2)';

function GoogleIcon() {
  return (
    <View style={styles.googleIconWrap}>
      <Text style={styles.googleIconText}>G</Text>
    </View>
  );
}

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleSignIn = async () => {
    haptics.medium();
    console.log('Google Sign-In');
    router.replace('/onboarding');
  };

  const handleAppleSignIn = async () => {
    haptics.medium();
    console.log('Apple Sign-In');
    router.replace('/onboarding');
  };

  const handleEmailAuth = async () => {
    haptics.medium();
    console.log(isSignUp ? 'Sign Up' : 'Sign In', { email, password, name });
    router.replace('/onboarding');
  };

  const toggleMode = () => {
    haptics.light();
    setIsSignUp(!isSignUp);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DARK_BG, '#0A0A0A', DARK_BG]}
        style={StyleSheet.absoluteFill}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[NEON_LIME, '#B8E600']}
                style={styles.logoGradient}
              >
                <Text style={styles.logoEmoji}>⚡</Text>
              </LinearGradient>
              <View style={styles.logoGlow} />
            </View>
            <Text style={styles.title}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp 
                ? 'Start your fitness journey today' 
                : 'Sign in to continue your progress'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.socialButtons}>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleAppleSignIn}
                  activeOpacity={0.8}
                >
                  <Apple size={22} color={TEXT_PRIMARY} />
                  <Text style={styles.socialButtonText}>Continue with Apple</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleSignIn}
                activeOpacity={0.8}
              >
                <GoogleIcon />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <User size={20} color={TEXT_TERTIARY} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={TEXT_TERTIARY}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Mail size={20} color={TEXT_TERTIARY} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={TEXT_TERTIARY}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={TEXT_TERTIARY} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={TEXT_TERTIARY}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {!isSignUp && (
              <TouchableOpacity 
                onPress={() => haptics.light()}
                style={styles.forgotBtn}
              >
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleEmailAuth}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[NEON_LIME, '#B8E600']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
                <ChevronRight size={20} color={DARK_BG} />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </Text>
              <TouchableOpacity onPress={toggleMode}>
                <Text style={styles.footerLink}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isSignUp && (
            <Text style={styles.terms}>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 28,
  },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 42,
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 38,
    backgroundColor: NEON_LIME,
    opacity: 0.15,
    zIndex: -1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: TEXT_PRIMARY,
    marginBottom: 10,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    fontWeight: '500' as const,
    paddingHorizontal: 20,
  },
  form: {
    gap: 16,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: SURFACE_ELEVATED,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: TEXT_PRIMARY,
    letterSpacing: -0.1,
  },
  googleIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: TEXT_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: DARK_BG,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: TEXT_TERTIARY,
    fontWeight: '500' as const,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE_DARK,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    height: 58,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: TEXT_PRIMARY,
    fontWeight: '500' as const,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPassword: {
    fontSize: 14,
    color: NEON_LIME,
    fontWeight: '600' as const,
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: NEON_LIME,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: DARK_BG,
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  footerText: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    fontWeight: '500' as const,
  },
  footerLink: {
    fontSize: 15,
    color: NEON_LIME,
    fontWeight: '700' as const,
  },
  terms: {
    fontSize: 12,
    color: TEXT_TERTIARY,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
    lineHeight: 18,
  },
});
